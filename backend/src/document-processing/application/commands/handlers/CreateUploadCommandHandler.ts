import type { ICommandHandler } from "../../../../shared/application/ICommandHandler";
import type { Either } from "../../../../shared/domain/Either";
import { right } from "../../../../shared/domain/Either";
import type { IMessagePublisher } from "../../../../shared/infrastructure/messaging/IMessagePublisher";
import type { CreateUploadCommand } from "../objects/CreateUploadCommand";
import type { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import { Upload } from "../../../domain/entities/Upload";
import {
  FileName,
  InvalidFileNameError
} from "../../../domain/value-objects/FileName";
import type { FileStorage } from "../../../infrastructure/storage/FileStorage";
import type { ProcessFileMessage } from "../../../infrastructure/messaging/ProcessFileMessage";

export class CreateUploadCommandHandler
  implements
    ICommandHandler<
      CreateUploadCommand,
      Either<InvalidFileNameError, Upload>
    >
{
  constructor(
    private readonly uploads: IUploadRepository,
    private readonly storage: FileStorage,
    private readonly publisher: IMessagePublisher<ProcessFileMessage>
  ) {}

  async execute(
    command: CreateUploadCommand
  ): Promise<Either<InvalidFileNameError, Upload>> {
    const fileName = FileName.create(command.fileName);
    if (fileName.isLeft) {
      return fileName;
    }

    const storedPath = await this.storage.save(
      fileName.value.value,
      command.content
    );
    const upload = Upload.create(
      fileName.value,
      storedPath,
      command.userId
    );
    await this.uploads.save(upload);

    try {
      await this.publisher.publish({
        type: "PROCESS_FILE",
        uploadId: upload.id
      });
    } catch (error) {
      upload.markFailed("Unable to queue the file for processing");
      await this.uploads.update(upload);
      throw error;
    }

    return right(upload);
  }
}
