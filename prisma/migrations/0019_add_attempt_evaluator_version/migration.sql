-- AlterTable
-- Nullable: legacy and structured attempts keep NULL. Only a versioned
-- deterministic evaluator (python-output-1, PYTHON-IMPLEMENT / D-322) records
-- which evaluator scored the attempt. No backfill, no default.
ALTER TABLE "public"."Attempt" ADD COLUMN "evaluatorVersion" TEXT;
