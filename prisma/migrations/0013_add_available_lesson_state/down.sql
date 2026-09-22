DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "public"."LearnerLessonState"
    WHERE "completionStatus" = 'AVAILABLE'
  ) THEN
    RAISE EXCEPTION 'Cannot remove AVAILABLE while available lesson states exist';
  END IF;
END
$$;

ALTER TABLE "public"."LearnerLessonState"
  ALTER COLUMN "completionStatus" TYPE TEXT USING "completionStatus"::TEXT;

CREATE TYPE "public"."LessonCompletionStatus_previous" AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETE',
  'COMPLETE_BY_SKIP',
  'SKIPPED_BY_PLACEMENT'
);

ALTER TABLE "public"."LearnerLessonState"
  ALTER COLUMN "completionStatus" TYPE "public"."LessonCompletionStatus_previous"
  USING "completionStatus"::"public"."LessonCompletionStatus_previous";

DROP TYPE "public"."LessonCompletionStatus";
ALTER TYPE "public"."LessonCompletionStatus_previous" RENAME TO "LessonCompletionStatus";
