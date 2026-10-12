import type { IHttpRequest } from "./IHttpRequest";
import type { IHttpResponse } from "./IHttpResponse";

export abstract class BaseController {
  abstract handle(request: IHttpRequest): Promise<IHttpResponse>;
}
