import path from "node:path";
import type { Either } from "../../../shared/domain/Either";
import { left, right } from "../../../shared/domain/Either";

export class InvalidFileNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFileNameError";
  }
}

export class FileName {
  private constructor(readonly value: string) {}

  static create(value: string): Either<InvalidFileNameError, FileName> {
    const normalized = value.trim();
    if (
      !normalized ||
      path.basename(normalized) !== normalized ||
      normalized.includes("\\") ||
      path.extname(normalized).toLowerCase() !== ".csv"
    ) {
      return left(new InvalidFileNameError("Only files with a .csv name are accepted"));
    }

    return right(new FileName(normalized));
  }
}
