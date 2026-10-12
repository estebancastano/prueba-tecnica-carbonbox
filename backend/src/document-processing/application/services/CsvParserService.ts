import { CsvError } from "csv-parse";
import { parse } from "csv-parse/sync";
import type { Either } from "../../../shared/domain/Either";
import { left, right } from "../../../shared/domain/Either";

export class InvalidCsvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCsvError";
  }
}

export interface CsvParseResult {
  headers: string[];
  records: Record<string, string>[];
}

export class CsvParserService {
  parse(
    content: Buffer
  ): Either<InvalidCsvError, CsvParseResult> {
    if (content.length === 0) {
      return left(new InvalidCsvError("The CSV file is empty"));
    }

    let hasValidHeaders = false;
    let parsedHeaders: string[] = [];
    let records: Record<string, string>[];
    try {
      records = parse(content, {
        bom: true,
        columns: (headers: string[]) => {
          const normalizedHeaders = headers.map((header) => header.trim());
          if (
            normalizedHeaders.length === 0 ||
            normalizedHeaders.some((header) => header.length === 0)
          ) {
            throw new InvalidCsvError("CSV headers must not be empty");
          }
          hasValidHeaders = true;
          parsedHeaders = normalizedHeaders;
          return normalizedHeaders;
        },
        skip_empty_lines: true,
        trim: true
      }) as Record<string, string>[];
    } catch (error) {
      if (error instanceof InvalidCsvError) {
        return left(error);
      }
      if (error instanceof CsvError) {
        return left(new InvalidCsvError(error.message));
      }
      throw error;
    }

    if (!hasValidHeaders) {
      return left(new InvalidCsvError("The CSV file must include a header row"));
    }

    return right({ headers: parsedHeaders, records });
  }
}
