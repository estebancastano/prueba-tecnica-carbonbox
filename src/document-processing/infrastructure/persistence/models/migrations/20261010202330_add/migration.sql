-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivityData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploadId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "category" TEXT,
    "amount" REAL,
    "unit" TEXT,
    "date" DATETIME,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityData_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityData" ("data", "id", "rowNumber", "uploadId") SELECT "data", "id", "rowNumber", "uploadId" FROM "ActivityData";
DROP TABLE "ActivityData";
ALTER TABLE "new_ActivityData" RENAME TO "ActivityData";
CREATE INDEX "ActivityData_uploadId_idx" ON "ActivityData"("uploadId");
CREATE UNIQUE INDEX "ActivityData_uploadId_rowNumber_key" ON "ActivityData"("uploadId", "rowNumber");
CREATE TABLE "new_Upload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL DEFAULT '',
    "storagePath" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'legacy',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalRows" INTEGER,
    "processedRows" INTEGER,
    "failedRows" INTEGER,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Upload" ("createdAt", "errorMessage", "fileName", "id", "status", "storagePath", "updatedAt") SELECT "createdAt", "errorMessage", "fileName", "id", "status", "storagePath", "updatedAt" FROM "Upload";
DROP TABLE "Upload";
ALTER TABLE "new_Upload" RENAME TO "Upload";
CREATE INDEX "Upload_createdAt_idx" ON "Upload"("createdAt");
CREATE INDEX "Upload_userId_idx" ON "Upload"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
