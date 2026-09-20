-- Pin the required correct-item count used to score each assignment.
ALTER TABLE "public"."AssessmentAssignment"
  ADD COLUMN "requiredCount" INTEGER;
