import type { ActivityData as DomainActivityData } from "../../../domain/entities/ActivityData";
import { ActivityData } from "../../../domain/entities/ActivityData";
import type { ActivityData as PrismaActivityData } from "@prisma/client";

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

export class PrismaActivityDataMapper {
  static toPersistence(item: DomainActivityData): PrismaActivityData {
    const props = item.toObject();
    return {
      id: props.id,
      uploadId: props.uploadId,
      rowNumber: props.rowNumber,
      category: props.category,
      amount: props.amount,
      unit: props.unit,
      date: props.date,
      data: JSON.stringify(props.data),
      createdAt: props.createdAt
    };
  }

  static toDomain(record: PrismaActivityData): DomainActivityData {
    const data: unknown = JSON.parse(record.data);
    if (!isStringRecord(data)) {
      throw new Error(`Invalid activity data stored for record '${record.id}'`);
    }

    return new ActivityData({
      id: record.id,
      uploadId: record.uploadId,
      rowNumber: record.rowNumber,
      category: record.category,
      amount: record.amount,
      unit: record.unit,
      date: record.date,
      data,
      createdAt: record.createdAt ?? new Date()
    });
  }
}
