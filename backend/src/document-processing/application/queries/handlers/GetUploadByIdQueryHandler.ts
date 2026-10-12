import type { IQueryHandler } from "../../../../shared/application/IQueryHandler";
import type { Either } from "../../../../shared/domain/Either";
import { left, right } from "../../../../shared/domain/Either";
import type { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import type { Upload } from "../../../domain/entities/Upload";
import type { IActivityDataRepository } from "../../../domain/repositories/IActivityDataRepository";
import type { ActivityData } from "../../../domain/entities/ActivityData";
import { UploadNotFoundError } from "../../errors/UploadNotFoundError";
import type { GetUploadByIdQuery } from "../objects/GetUploadByIdQuery";

export interface GetUploadByIdResult {
  upload: Upload;
  activities: ActivityData[];
}

export class GetUploadByIdQueryHandler
  implements
    IQueryHandler<
      GetUploadByIdQuery,
      Either<UploadNotFoundError, GetUploadByIdResult>
    >
{
  constructor(
    private readonly uploads: IUploadRepository,
    private readonly activities: IActivityDataRepository
  ) {}

  async execute(
    query: GetUploadByIdQuery
  ): Promise<Either<UploadNotFoundError, GetUploadByIdResult>> {
    const upload = await this.uploads.findById(query.uploadId);
    if (!upload) {
      return left(new UploadNotFoundError(query.uploadId));
    }

    return right({
      upload,
      activities: await this.activities.findByUploadId(query.uploadId)
    });
  }
}
