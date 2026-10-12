import Fastify, { type FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "../config";
import { createDocumentProcessingModule } from "../document-processing/infrastructure/dependency-injection/DocumentProcessingModule";
import { registerDocumentProcessingRoutes } from "../document-processing/presentation/routes/DocumentProcessingRoutes";
import { FileProcessingWorker } from "../workers/FileProcessingWorker";
import { InvalidFileNameError } from "../document-processing/domain/value-objects/FileName";

export class App {
  private readonly server: FastifyInstance;
  private readonly prisma: PrismaClient;
  private readonly worker: FileProcessingWorker;

  constructor() {
    this.server = Fastify({ logger: true });
    const adapter = new PrismaPg({
      connectionString: config.get("databaseUrl")
    });
    this.prisma = new PrismaClient({ adapter });

    const module = createDocumentProcessingModule(
      this.prisma,
      config.get("uploadDirectory")
    );
    this.worker = new FileProcessingWorker(
      module.messageBus,
      module.processFileHandler
    );

    this.server.register(multipart, {
      limits: {
        fileSize: config.get("maxFileSizeBytes"),
        files: 1,
        fields: 1
      }
    });
    this.server.get("/health", async () => ({ status: "ok" }));
    this.server.register(async (instance) => {
      await registerDocumentProcessingRoutes(instance, module.controllers);
    });
    this.server.setErrorHandler((error, _request, reply) => {
      if (error instanceof InvalidFileNameError) {
        return reply.code(400).send({ message: error.message });
      }

      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        typeof error.statusCode === "number" &&
        error.statusCode >= 400 &&
        error.statusCode < 600
          ? error.statusCode
          : 500;
      this.server.log.error(error);
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return reply.code(statusCode).send({
        message: statusCode === 500 ? "Internal server error" : message
      });
    });
  }

  async start(): Promise<void> {
    await this.prisma.$connect();
    this.worker.start();
    await this.server.listen({
      host: config.get("host"),
      port: config.get("port")
    });
  }

  async stop(): Promise<void> {
    this.worker.stop();
    await this.server.close();
    await this.prisma.$disconnect();
  }
}
