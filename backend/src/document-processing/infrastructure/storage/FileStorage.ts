export interface FileStorage {
  save(originalName: string, content: Buffer): Promise<string>;
  read(storagePath: string): Promise<Buffer>;
}
