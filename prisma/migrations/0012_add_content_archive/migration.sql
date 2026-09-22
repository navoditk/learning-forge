-- Retain immutable content snapshots independently of the active application catalog.
CREATE TABLE "public"."ContentArchive" (
  "id" TEXT NOT NULL,
  "contentKey" TEXT NOT NULL,
  "contentVersion" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ContentArchive_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentArchive_contentKey_contentVersion_key"
  ON "public"."ContentArchive"("contentKey", "contentVersion");

CREATE INDEX "ContentArchive_contentKey_idx"
  ON "public"."ContentArchive"("contentKey");
