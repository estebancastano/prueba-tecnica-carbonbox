import type { ICommandHandler } from "../../../../shared/application/ICommandHandler";
import type { Either } from "../../../../shared/domain/Either";
import type { ProcessFileCommand } from "../objects/ProcessFileCommand";
import type {
  FileProcessingError,
  FileProcessingService
} from "../../services/FileProcessingService";
import type { IUploadRepository } from "../../../domain/repositories/IUploadRepository";

export class ProcessFileCommandHandler
  implements
    ICommandHandler<ProcessFileCommand, Either<FileProcessingError, void>>
{
  constructor(
    private readonly processing: FileProcessingService,
    private readonly uploads: IUploadRepository
  ) {}

  async execute(
    command: ProcessFileCommand
  ): Promise<Either<FileProcessingError, void>> {
    try {
      const result = await this.processing.process(command.uploadId);
      if (result.isLeft) {
        await this.markFailed(command.uploadId, result.value.message);
      }
      return result;
    } catch (error) {
      await this.markFailed(
        command.uploadId,
        error instanceof Error ? error.message : "Unknown processing error"
      );
      throw error;
    }
  }

  private async markFailed(uploadId: string, message: string): Promise<void> {
    const upload = await this.uploads.findById(uploadId);
    if (upload) {
      upload.markFailed(message);
      await this.uploads.update(upload);
    }
  }
}
