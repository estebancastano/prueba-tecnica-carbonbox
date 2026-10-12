import type { Upload } from "../entities/Upload";

export interface IUploadRepository {
  save(upload: Upload): Promise<void>;
  findById(id: string): Promise<Upload | null>;
  findAll(skip: number, take: number): Promise<{ items: Upload[]; total: number }>;
  update(upload: Upload): Promise<void>;
}
