import "dotenv/config";
import convict from "convict";
import path from "node:path";
import type { IConvictProps } from "./IConvictProps";

const config = convict<IConvictProps>({
  host: {
    doc: "Address on which the HTTP server listens",
    format: String,
    default: "0.0.0.0",
    env: "HOST"
  },
  port: {
    doc: "HTTP server port",
    format: "port",
    default: 3000,
    env: "PORT"
  },
  databaseUrl: {
    doc: "Prisma database connection URL",
    format: String,
    default:
      "postgresql://carbonbox:carbonbox@localhost:5432/carbonbox?schema=public",
    env: "DATABASE_URL"
  },
  uploadDirectory: {
    doc: "Directory used to persist uploaded files",
    format: String,
    default: path.resolve(process.cwd(), "uploads"),
    env: "UPLOAD_DIRECTORY"
  },
  maxFileSizeBytes: {
    doc: "Maximum accepted upload size in bytes",
    format: "nat",
    default: 10 * 1024 * 1024,
    env: "MAX_FILE_SIZE_BYTES"
  }
});

config.validate({ allowed: "strict" });

export default config;
