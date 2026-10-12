import type { PrismaClient } from "@prisma/client";
import type { IUploadRepository } from "../../../domain/repositories/IUploadRepository";
import type { Upload } from "../../../domain/entities/Upload";
import { PrismaUploadMapper } from "../mappers/PrismaUploadMapper";

export class PrismaUploadRepository implements IUploadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(upload: Upload): Promise<void> {
    await this.prisma.upload.create({
      data: PrismaUploadMapper.toPersistence(upload)
    });
  }

  async findById(id: string): Promise<Upload | null> {
    const record = await this.prisma.upload.findUnique({ where: { id } });
    return record ? PrismaUploadMapper.toDomain(record) : null;
  }

  async findAll(
    skip: number,
    take: number
  ): Promise<{ items: Upload[]; total: number }> {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.upload.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.upload.count()
    ]);

    return {
      items: records.map(PrismaUploadMapper.toDomain),
      total
    };
  }

  async update(upload: Upload): Promise<void> {
    const props = upload.toObject();
    await this.prisma.upload.update({
      where: { id: props.id },
      data: {
        fileName: props.fileName,
        fileUrl: props.fileUrl,
        storagePath: props.storagePath,
        userId: props.userId,
        status: props.status,
        totalRows: props.totalRows,
        processedRows: props.processedRows,
        failedRows: props.failedRows,
        errorMessage: props.errorMessage,
        updatedAt: props.updatedAt
      }
    });
  }
}
