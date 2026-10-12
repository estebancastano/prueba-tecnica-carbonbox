export class UploadNotFoundError extends Error {
  constructor(uploadId: string) {
    super(`Upload '${uploadId}' was not found`);
    this.name = "UploadNotFoundError";
  }
}
