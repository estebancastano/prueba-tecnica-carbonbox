export const UploadStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
} as const;

export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

export function isUploadStatus(value: string): value is UploadStatus {
  return Object.values(UploadStatus).includes(value as UploadStatus);
}
