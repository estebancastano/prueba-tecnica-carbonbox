import { BaseController } from "../../../shared/infrastructure/http/BaseController";
import type { IHttpRequest } from "../../../shared/infrastructure/http/IHttpRequest";
import type { IHttpResponse } from "../../../shared/infrastructure/http/IHttpResponse";
import type { GetUploadByIdQueryHandler } from "../../application/queries/handlers/GetUploadByIdQueryHandler";

export class GetUploadByIdController extends BaseController {
  constructor(private readonly handler: GetUploadByIdQueryHandler) {
    super();
  }

  override async handle(request: IHttpRequest): Promise<IHttpResponse> {
    const uploadId = request.params?.uploadId;
    if (!uploadId) {
      return { statusCode: 400, body: { message: "uploadId is required" } };
    }

    const result = await this.handler.execute({ uploadId });
    if (result.isLeft) {
      return { statusCode: 404, body: { message: "Upload not found" } };
    }

    return {
      statusCode: 200,
      body: {
        ...result.value.upload.toObject(),
        activities: result.value.activities.map((item) => item.toObject())
      }
    };
  }
}
