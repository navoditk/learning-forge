-- Add the profile code alongside existing version pins. Nullable preserves
-- legacy rows; all new progression writers populate both fields.
ALTER TABLE "public"."Session"
  ADD COLUMN "policyProfileCode" TEXT;

ALTER TABLE "public"."LearnerUnitState"
  ADD COLUMN "policyProfileCode" TEXT;

ALTER TABLE "public"."LearnerLessonState"
  ADD COLUMN "policyProfileCode" TEXT;
