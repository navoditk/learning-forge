-- AlterTable
-- Backfill existing rows with the content item Phase 1 used exclusively before
-- this migration (unit-rates-1), then require every future row to specify it.
ALTER TABLE "public"."Session" ADD COLUMN "contentKey" TEXT NOT NULL DEFAULT 'unit-rates-1';
ALTER TABLE "public"."Session" ALTER COLUMN "contentKey" DROP DEFAULT;
