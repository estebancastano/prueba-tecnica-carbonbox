import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FileStorage } from "./FileStorage";

export class LocalFileStorage implements FileStorage {
  constructor(private readonly directory: string) {}

  async save(_originalName: string, content: Buffer): Promise<string> {
    await mkdir(this.directory, { recursive: true });
    const storagePath = `${crypto.randomUUID()}.csv`;
    await writeFile(path.join(this.directory, storagePath), content, {
      flag: "wx"
    });
    return storagePath;
  }

  async read(storagePath: string): Promise<Buffer> {
    if (path.basename(storagePath) !== storagePath) {
      throw new Error("Invalid stored file path");
    }
    return readFile(path.join(this.directory, storagePath));
  }
}
