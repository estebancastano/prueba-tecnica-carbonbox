import { BaseController } from "../../../shared/infrastructure/http/BaseController";
import type { IHttpRequest } from "../../../shared/infrastructure/http/IHttpRequest";
import type { IHttpResponse } from "../../../shared/infrastructure/http/IHttpResponse";
import type { ListUploadsQueryHandler } from "../../application/queries/handlers/ListUploadsQueryHandler";

function positiveInteger(value: string | undefined, fallback: number): number | null {
  if (value === undefined) {
    return fallback;
  }
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export class ListUploadsController extends BaseController {
  constructor(private readonly handler: ListUploadsQueryHandler) {
    super();
  }

  override async handle(request: IHttpRequest): Promise<IHttpResponse> {
    const page = positiveInteger(request.query?.page, 1);
    const pageSize = positiveInteger(request.query?.pageSize, 20);
    if (page === null || pageSize === null || pageSize > 100) {
      return {
        statusCode: 400,
        body: { message: "page must be positive and pageSize must be between 1 and 100" }
      };
    }

    const result = await this.handler.execute({ page, pageSize });
    return {
      statusCode: 200,
      body: {
        items: result.items.map((upload) => upload.toObject()),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize
      }
    };
  }
}
