-- Reviewed scratch-database rollback for Stage C1. Do not run against
-- production evidence; see docs/course-progression-architecture.md §10.4.
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_assignmentId_fkey";
DROP INDEX "public"."Session_assignmentId_idx";
ALTER TABLE "public"."Session" DROP COLUMN "activityKind", DROP COLUMN "targetCode", DROP COLUMN "targetVersion", DROP COLUMN "assignmentId", DROP COLUMN "policyProfileVersion";

DROP TABLE "public"."ShadowDecision";
DROP TABLE "public"."LearningEvent";
DROP TABLE "public"."ReviewSchedule";
DROP TABLE "public"."OverrideRecord";
DROP TABLE "public"."SkipRecord";
DROP TABLE "public"."UnlockGrant";
DROP TABLE "public"."LearnerLessonState";
DROP TABLE "public"."LearnerUnitState";
DROP TABLE "public"."LearnerPlacement";
DROP TABLE "public"."ActiveAssessmentLease";
DROP TABLE "public"."AssessmentResult";
DROP TABLE "public"."AssessmentRunState";
DROP TABLE "public"."AssessmentAssignment";

DROP TYPE "public"."ShadowActualBehavior";
DROP TYPE "public"."ShadowDecisionValue";
DROP TYPE "public"."OverrideActorRole";
DROP TYPE "public"."SkipMethod";
DROP TYPE "public"."PlacementMethod";
DROP TYPE "public"."LearningEventKind";
DROP TYPE "public"."OverrideStatus";
DROP TYPE "public"."UnitCompletionStatus";
DROP TYPE "public"."RemediationStatus";
DROP TYPE "public"."LessonCompletionStatus";
DROP TYPE "public"."AssessmentOutcome";
DROP TYPE "public"."AssessmentRunStatus";
DROP TYPE "public"."ProgressionTargetKind";
DROP TYPE "public"."AssessmentKind";
DROP TYPE "public"."ProgressionActivityKind";

DELETE FROM "_prisma_migrations" WHERE "migration_name" = '0006_add_progression_foundation';
