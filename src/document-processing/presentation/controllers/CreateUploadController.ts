import { BaseController } from "../../../shared/infrastructure/http/BaseController";
import type { IHttpRequest } from "../../../shared/infrastructure/http/IHttpRequest";
import type { IHttpResponse } from "../../../shared/infrastructure/http/IHttpResponse";
import type { CreateUploadCommandHandler } from "../../application/commands/handlers/CreateUploadCommandHandler";

export class CreateUploadController extends BaseController {
  constructor(private readonly handler: CreateUploadCommandHandler) {
    super();
  }

  override async handle(request: IHttpRequest): Promise<IHttpResponse> {
    if (!request.file) {
      return {
        statusCode: 400,
        body: { message: "Upload a CSV file using the 'file' field" }
      };
    }

    const userId = request.userId?.trim();
    if (!userId) {
      return {
        statusCode: 400,
        body: { message: "userId is required" }
      };
    }

    const result = await this.handler.execute({
      fileName: request.file.filename,
      userId,
      content: await request.file.toBuffer()
    });

    if (result.isLeft) {
      return {
        statusCode: 400,
        body: { message: result.value.message }
      };
    }

    return {
      statusCode: 202,
      body: result.value.toObject()
    };
  }
}
