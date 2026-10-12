import type { IQueryHandler } from "../../../../shared/application/IQueryHandler";
import type { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import type { Upload } from "../../../domain/entities/Upload";
import type { ListUploadsQuery } from "../objects/ListUploadsQuery";

export interface ListUploadsResult {
  items: Upload[];
  total: number;
  page: number;
  pageSize: number;
}

export class ListUploadsQueryHandler
  implements IQueryHandler<ListUploadsQuery, ListUploadsResult>
{
  constructor(private readonly uploads: IUploadRepository) {}

  async execute(query: ListUploadsQuery): Promise<ListUploadsResult> {
    const skip = (query.page - 1) * query.pageSize;
    const result = await this.uploads.findAll(skip, query.pageSize);
    return {
      ...result,
      page: query.page,
      pageSize: query.pageSize
    };
  }
}
