export interface CreateUploadCommand {
  fileName: string;
  userId: string;
  content: Buffer;
}
