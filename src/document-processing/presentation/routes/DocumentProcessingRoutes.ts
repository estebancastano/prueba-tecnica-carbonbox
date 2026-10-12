import type { FastifyInstance } from "fastify";
import type { CreateUploadController } from "../controllers/CreateUploadController";
import type { GetUploadByIdController } from "../controllers/GetUploadByIdController";
import type { ListUploadsController } from "../controllers/ListUploadsController";

export async function registerDocumentProcessingRoutes(
  app: FastifyInstance,
  controllers: {
    createUpload: CreateUploadController;
    getUploadById: GetUploadByIdController;
    listUploads: ListUploadsController;
  }
): Promise<void> {
  app.post("/api/uploads", async (request, reply) => {
    let uploadFile:
      | { filename: string; mimetype: string; content: Buffer }
      | undefined;
    let userId: string | undefined;

    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (part.fieldname !== "file" || uploadFile) {
          return reply.code(400).send({
            message: "Upload exactly one file using the 'file' field"
          });
        }
        uploadFile = {
          filename: part.filename,
          mimetype: part.mimetype,
          content: await part.toBuffer()
        };
      } else if (part.fieldname === "userId" && typeof part.value === "string") {
        userId = part.value;
      } else {
        return reply.code(400).send({
          message: "The only supported text field is 'userId'"
        });
      }
    }

    const response = await controllers.createUpload.handle({
      userId,
      file: uploadFile
        ? {
            filename: uploadFile.filename,
            mimetype: uploadFile.mimetype,
            toBuffer: async () => uploadFile.content
          }
        : undefined
    });
    return reply.code(response.statusCode).send(response.body);
  });

  app.get("/api/uploads", async (request, reply) => {
    const query = request.query as Record<string, string | undefined>;
    const response = await controllers.listUploads.handle({ query });
    return reply.code(response.statusCode).send(response.body);
  });

  app.get<{ Params: { uploadId: string } }>(
    "/api/uploads/:uploadId",
    async (request, reply) => {
      const response = await controllers.getUploadById.handle({
        params: request.params
      });
      return reply.code(response.statusCode).send(response.body);
    }
  );
}
