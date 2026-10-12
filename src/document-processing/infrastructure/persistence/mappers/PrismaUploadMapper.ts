import type { Upload as PrismaUpload } from "@prisma/client";
import { Upload } from "../../../domain/entities/Upload";
import { isUploadStatus } from "../../../domain/value-objects/UploadStatus";

export class PrismaUploadMapper {
  static toDomain(record: PrismaUpload): Upload {
    if (!isUploadStatus(record.status)) {
      throw new Error(`Unsupported upload status '${record.status}'`);
    }

    return Upload.reconstitute({
      id: record.id,
      fileName: record.fileName,
      fileUrl: record.fileUrl || record.storagePath,
      storagePath: record.storagePath,
      userId: record.userId,
      status: record.status,
      totalRows: record.totalRows,
      processedRows: record.processedRows,
      failedRows: record.failedRows,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  }

  static toPersistence(upload: Upload): PrismaUpload {
    const props = upload.toObject();
    return {
      id: props.id,
      fileName: props.fileName,
      fileUrl: props.fileUrl,
      storagePath: props.storagePath,
      userId: props.userId,
      status: props.status,
      totalRows: props.totalRows,
      processedRows: props.processedRows,
      failedRows: props.failedRows,
      errorMessage: props.errorMessage,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt
    };
  }
}
