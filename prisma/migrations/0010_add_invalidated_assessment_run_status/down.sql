-- This rollback is safe only when no invalidated run remains. Invalidated
-- evidence must be retained or explicitly handled before reverting the enum.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "public"."AssessmentRunState"
    WHERE "status" = 'INVALIDATED'
  ) THEN
    RAISE EXCEPTION 'Cannot remove INVALIDATED while invalidated assessment runs exist';
  END IF;
END
$$;

ALTER TABLE "public"."AssessmentRunState"
  ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;

CREATE TYPE "public"."AssessmentRunStatus_previous" AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'SUBMITTED',
  'SCORED',
  'EXPIRED',
  'ABANDONED'
);

ALTER TABLE "public"."AssessmentRunState"
  ALTER COLUMN "status" TYPE "public"."AssessmentRunStatus_previous"
  USING "status"::"public"."AssessmentRunStatus_previous";

DROP TYPE "public"."AssessmentRunStatus";
ALTER TYPE "public"."AssessmentRunStatus_previous" RENAME TO "AssessmentRunStatus";
