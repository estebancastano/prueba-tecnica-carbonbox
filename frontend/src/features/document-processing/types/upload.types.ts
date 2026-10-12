export type UploadStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface ActivityData {
  id: string;
  uploadId: string;
  rowNumber: number;
  category: string | null;
  amount: number | null;
  unit: string | null;
  date: string | null;
  data: Record<string, string>;
  createdAt: string;
}

export interface Upload {
  id: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  userId: string;
  status: UploadStatus;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDetail extends Upload {
  activities: ActivityData[];
}

export interface UploadListResponse {
  items: Upload[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListUploadsParams {
  page?: number;
  pageSize?: number;
}
