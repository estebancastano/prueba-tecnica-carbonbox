import type { IActivityDataRepository } from "../../domain/repositories/IActivityDataRepository";
import type { IUploadRepository } from "../../domain/repositories/IUploadRepository";
import { ActivityData } from "../../domain/entities/ActivityData";
import type { FileStorage } from "../../infrastructure/storage/FileStorage";
import type { Either } from "../../../shared/domain/Either";
import { left, right } from "../../../shared/domain/Either";
import { UploadNotFoundError } from "../errors/UploadNotFoundError";
import { CsvParserService, InvalidCsvError } from "./CsvParserService";

export type FileProcessingError = UploadNotFoundError | InvalidCsvError;

export class FileProcessingService {
  constructor(
    private readonly uploads: IUploadRepository,
    private readonly activityData: IActivityDataRepository,
    private readonly storage: FileStorage,
    private readonly csvParser: CsvParserService
  ) {}

  async process(
    uploadId: string
  ): Promise<Either<FileProcessingError, void>> {
    const upload = await this.uploads.findById(uploadId);
    if (!upload) {
      return left(new UploadNotFoundError(uploadId));
    }

    upload.markProcessing();
    await this.uploads.update(upload);

    const content = await this.storage.read(upload.toObject().storagePath);
    const parsedRecords = this.csvParser.parse(content);
    if (parsedRecords.isLeft) {
      return parsedRecords;
    }

    const records = parsedRecords.value.records;
    upload.setTotalRows(records.length);
    await this.uploads.update(upload);

    const requiredHeaders = ["category", "amount", "unit", "date"];
    const normalizedHeaders = new Set(
      parsedRecords.value.headers.map((header) => header.trim().toLowerCase())
    );
    const missingHeaders = requiredHeaders.filter(
      (header) => !normalizedHeaders.has(header)
    );
    if (missingHeaders.length > 0) {
      return left(
        new InvalidCsvError(
          `CSV is missing required columns: ${missingHeaders.join(", ")}`
        )
      );
    }

    const items: ActivityData[] = [];

    for (const [index, data] of records.entries()) {
      const values = new Map(
        Object.entries(data).map(([key, value]) => [
          key.trim().toLowerCase(),
          value.trim()
        ])
      );
      const category = values.get("category");
      const amountValue = values.get("amount");
      const unit = values.get("unit");
      const dateValue = values.get("date");
      const rowNumber = index + 1;

      if (!category) {
        return left(
          new InvalidCsvError(`CSV row ${rowNumber} has an empty category`)
        );
      }
      if (!unit) {
        return left(
          new InvalidCsvError(`CSV row ${rowNumber} has an empty unit`)
        );
      }
      if (!amountValue) {
        return left(
          new InvalidCsvError(`CSV row ${rowNumber} has an empty amount`)
        );
      }

      const amount = Number(amountValue);
      if (!Number.isFinite(amount)) {
        return left(
          new InvalidCsvError(`CSV row ${rowNumber} has an invalid amount`)
        );
      }

      if (!dateValue) {
        return left(
          new InvalidCsvError(`CSV row ${rowNumber} has an empty date`)
        );
      }
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) {
        return left(
          new InvalidCsvError(`CSV row ${rowNumber} has an invalid date`)
        );
      }

      items.push(
        new ActivityData({
          id: crypto.randomUUID(),
          uploadId,
          rowNumber,
          category,
          amount,
          unit,
          date,
          data,
          createdAt: new Date()
        })
      );
    }

    await this.activityData.saveMany(items);
    upload.markCompleted();
    await this.uploads.update(upload);
    return right(undefined);
  }
}
