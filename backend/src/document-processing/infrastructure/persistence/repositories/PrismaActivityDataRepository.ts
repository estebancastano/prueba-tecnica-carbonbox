import type { PrismaClient } from "@prisma/client";
import type { IActivityDataRepository } from "../../../domain/repositories/IActivityDataRepository";
import type { ActivityData } from "../../../domain/entities/ActivityData";
import { PrismaActivityDataMapper } from "../mappers/PrismaActivityDataMapper";

export class PrismaActivityDataRepository implements IActivityDataRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveMany(items: ActivityData[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    await this.prisma.activityData.createMany({
      data: items.map(PrismaActivityDataMapper.toPersistence)
    });
  }

  async findByUploadId(uploadId: string): Promise<ActivityData[]> {
    const records = await this.prisma.activityData.findMany({
      where: { uploadId },
      orderBy: { rowNumber: "asc" }
    });
    return records.map(PrismaActivityDataMapper.toDomain);
  }
}
