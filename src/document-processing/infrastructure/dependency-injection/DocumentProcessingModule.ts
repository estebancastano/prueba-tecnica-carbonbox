import type { PrismaClient } from "@prisma/client";
import type { IUploadRepository } from "../../domain/repositories/IUploadRepository";
import type { IActivityDataRepository } from "../../domain/repositories/IActivityDataRepository";
import { CreateUploadCommandHandler } from "../../application/commands/handlers/CreateUploadCommandHandler";
import { ProcessFileCommandHandler } from "../../application/commands/handlers/ProcessFileCommandHandler";
import { GetUploadByIdQueryHandler } from "../../application/queries/handlers/GetUploadByIdQueryHandler";
import { ListUploadsQueryHandler } from "../../application/queries/handlers/ListUploadsQueryHandler";
import { CsvParserService } from "../../application/services/CsvParserService";
import { FileProcessingService } from "../../application/services/FileProcessingService";
import { PrismaActivityDataRepository } from "../persistence/repositories/PrismaActivityDataRepository";
import { PrismaUploadRepository } from "../persistence/repositories/PrismaUploadRepository";
import { MockMessageBus } from "../messaging/MockMessageBus";
import { LocalFileStorage } from "../storage/LocalFileStorage";
import { CreateUploadController } from "../../presentation/controllers/CreateUploadController";
import { GetUploadByIdController } from "../../presentation/controllers/GetUploadByIdController";
import { ListUploadsController } from "../../presentation/controllers/ListUploadsController";

export function createDocumentProcessingModule(
  prisma: PrismaClient,
  uploadDirectory: string
) {
  const uploadRepository: IUploadRepository = new PrismaUploadRepository(prisma);
  const activityDataRepository: IActivityDataRepository =
    new PrismaActivityDataRepository(prisma);
  const storage = new LocalFileStorage(uploadDirectory);
  const messageBus = new MockMessageBus();
  const csvParser = new CsvParserService();
  const fileProcessing = new FileProcessingService(
    uploadRepository,
    activityDataRepository,
    storage,
    csvParser
  );

  const createUploadHandler = new CreateUploadCommandHandler(
    uploadRepository,
    storage,
    messageBus
  );
  const processFileHandler = new ProcessFileCommandHandler(
    fileProcessing,
    uploadRepository
  );

  return {
    messageBus,
    processFileHandler,
    controllers: {
      createUpload: new CreateUploadController(createUploadHandler),
      getUploadById: new GetUploadByIdController(
        new GetUploadByIdQueryHandler(uploadRepository, activityDataRepository)
      ),
      listUploads: new ListUploadsController(
        new ListUploadsQueryHandler(uploadRepository)
      )
    }
  };
}
