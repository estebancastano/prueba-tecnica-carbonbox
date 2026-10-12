export interface IHttpRequest {
  params?: Record<string, string>;
  query?: Record<string, string | undefined>;
  userId?: string;
  file?: {
    filename: string;
    mimetype: string;
    toBuffer(): Promise<Buffer>;
  };
}
