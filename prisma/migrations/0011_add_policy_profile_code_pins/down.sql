ALTER TABLE "public"."LearnerLessonState"
  DROP COLUMN "policyProfileCode";

ALTER TABLE "public"."LearnerUnitState"
  DROP COLUMN "policyProfileCode";

ALTER TABLE "public"."Session"
  DROP COLUMN "policyProfileCode";
