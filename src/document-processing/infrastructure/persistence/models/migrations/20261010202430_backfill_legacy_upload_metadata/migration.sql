UPDATE "Upload"
SET "fileUrl" = "storagePath"
WHERE "fileUrl" = '';

UPDATE "Upload"
SET
  "totalRows" = (
    SELECT COUNT(*)
    FROM "ActivityData"
    WHERE "ActivityData"."uploadId" = "Upload"."id"
  ),
  "processedRows" = (
    SELECT COUNT(*)
    FROM "ActivityData"
    WHERE "ActivityData"."uploadId" = "Upload"."id"
  )
WHERE "totalRows" IS NULL;
