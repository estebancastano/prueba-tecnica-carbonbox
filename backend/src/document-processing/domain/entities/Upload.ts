import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { FileName } from "../value-objects/FileName";
import {
  UploadStatus,
  type UploadStatus as UploadStatusType
} from "../value-objects/UploadStatus";

export interface UploadProps {
  id: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  userId: string;
  status: UploadStatusType;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Upload extends AggregateRoot {
  private constructor(private props: UploadProps) {
    super(props.id);
  }

  static create(
    fileName: FileName,
    storagePath: string,
    userId: string
  ): Upload {
    const now = new Date();
    return new Upload({
      id: crypto.randomUUID(),
      fileName: fileName.value,
      fileUrl: storagePath,
      storagePath,
      userId,
      status: UploadStatus.PENDING,
      totalRows: null,
      processedRows: 0,
      failedRows: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now
    });
  }

  static reconstitute(props: UploadProps): Upload {
    return new Upload(props);
  }

  markProcessing(): void {
    this.props.status = UploadStatus.PROCESSING;
    this.props.errorMessage = null;
    this.props.updatedAt = new Date();
  }

  setTotalRows(totalRows: number): void {
    this.props.totalRows = totalRows;
    this.props.processedRows = 0;
    this.props.failedRows = 0;
    this.props.updatedAt = new Date();
  }

  markCompleted(): void {
    this.props.status = UploadStatus.COMPLETED;
    this.props.processedRows = this.props.totalRows ?? 0;
    this.props.failedRows = 0;
    this.props.errorMessage = null;
    this.props.updatedAt = new Date();
  }

  markFailed(message: string): void {
    this.props.status = UploadStatus.FAILED;
    this.props.failedRows =
      this.props.totalRows === null
        ? null
        : this.props.totalRows - (this.props.processedRows ?? 0);
    this.props.errorMessage = message;
    this.props.updatedAt = new Date();
  }

  toObject(): UploadProps {
    return { ...this.props };
  }
}
