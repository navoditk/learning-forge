-- Add provenance pins needed for auditable mastery recalculation.
-- Nullable preserves existing legacy phase-1 rows without fabricating their
-- policy or curriculum provenance. New progression writers must populate them.
ALTER TABLE "public"."MasteryEstimate"
  ADD COLUMN "policyProfileCode" TEXT,
  ADD COLUMN "policyProfileVersion" TEXT,
  ADD COLUMN "policyProfileHash" TEXT,
  ADD COLUMN "curriculumSnapshotHash" TEXT;
