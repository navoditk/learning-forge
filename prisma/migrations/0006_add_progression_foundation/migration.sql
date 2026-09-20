-- Stage C1: additive progression state and evidence foundation.
-- Authorization remains unchanged until the separately reviewed C4 cutover.

CREATE TYPE "public"."ProgressionActivityKind" AS ENUM ('TEACHING', 'PRACTICE', 'PLACEMENT', 'LESSON_ASSESSMENT', 'UNIT_ASSESSMENT', 'DELAYED_CHECK', 'REVIEW', 'REMEDIATION_PRACTICE');
CREATE TYPE "public"."AssessmentKind" AS ENUM ('PLACEMENT', 'LESSON_ASSESSMENT', 'UNIT_ASSESSMENT', 'DELAYED_CHECK', 'REVIEW');
CREATE TYPE "public"."ProgressionTargetKind" AS ENUM ('PROGRAM', 'UNIT', 'LESSON', 'SKILL');
CREATE TYPE "public"."AssessmentRunStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'SCORED', 'EXPIRED', 'ABANDONED');
CREATE TYPE "public"."AssessmentOutcome" AS ENUM ('PASS', 'FAIL', 'INCONCLUSIVE', 'INVALIDATED');
CREATE TYPE "public"."LessonCompletionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'COMPLETE_BY_SKIP', 'SKIPPED_BY_PLACEMENT');
CREATE TYPE "public"."RemediationStatus" AS ENUM ('NONE', 'ACTIVE', 'NEEDS_HELP');
CREATE TYPE "public"."UnitCompletionStatus" AS ENUM ('LOCKED', 'AVAILABLE', 'IN_PROGRESS', 'ASSESSMENT_PENDING', 'COMPLETE', 'COMPLETE_BY_SKIP');
CREATE TYPE "public"."OverrideStatus" AS ENUM ('NONE', 'UNLOCKED_BY_OVERRIDE', 'OVERRIDE_REVOKED');
CREATE TYPE "public"."LearningEventKind" AS ENUM ('TEACHING_VIEWED', 'TEACHING_COMPLETED', 'ASSISTANCE_GIVEN', 'REMEDIATION_DELIVERED', 'INDEPENDENT_PRACTICE_EXPOSURE');
CREATE TYPE "public"."PlacementMethod" AS ENUM ('INITIAL_DEFAULT', 'PLACEMENT_PROBE', 'SKIP', 'OVERRIDE', 'LEGACY_BACKFILL');
CREATE TYPE "public"."SkipMethod" AS ENUM ('LESSON_ASSESSMENT', 'UNIT_ASSESSMENT');
CREATE TYPE "public"."OverrideActorRole" AS ENUM ('PARENT', 'OPERATOR');
CREATE TYPE "public"."ShadowDecisionValue" AS ENUM ('ALLOW', 'DENY');
CREATE TYPE "public"."ShadowActualBehavior" AS ENUM ('ALLOWED', 'DENIED');

ALTER TABLE "public"."Session"
  ADD COLUMN "activityKind" "public"."ProgressionActivityKind",
  ADD COLUMN "targetCode" TEXT,
  ADD COLUMN "targetVersion" TEXT,
  ADD COLUMN "assignmentId" TEXT,
  ADD COLUMN "policyProfileVersion" TEXT;

CREATE TABLE "public"."AssessmentAssignment" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "kind" "public"."AssessmentKind" NOT NULL,
  "targetKind" "public"."ProgressionTargetKind" NOT NULL,
  "targetCode" TEXT NOT NULL,
  "targetVersion" TEXT NOT NULL,
  "bankCode" TEXT NOT NULL,
  "bankVersion" TEXT NOT NULL,
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "policyProfileHash" TEXT NOT NULL,
  "algorithmVersion" TEXT NOT NULL,
  "curriculumSnapshotHash" TEXT NOT NULL,
  "selectedItems" JSONB NOT NULL,
  "excludedItems" JSONB NOT NULL,
  "attemptOrdinal" INTEGER NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."AssessmentRunState" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "status" "public"."AssessmentRunStatus" NOT NULL,
  "currentOrdinal" INTEGER NOT NULL,
  "submittedOrdinals" JSONB NOT NULL,
  "startedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastActivityAt" TIMESTAMP(3) NOT NULL,
  "submittedAt" TIMESTAMP(3),
  CONSTRAINT "AssessmentRunState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."AssessmentResult" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "outcome" "public"."AssessmentOutcome" NOT NULL,
  "itemResults" JSONB NOT NULL,
  "correctCount" INTEGER NOT NULL,
  "requiredCount" INTEGER NOT NULL,
  "algorithmVersion" TEXT NOT NULL,
  "policyProfileHash" TEXT NOT NULL,
  "invalidationReason" TEXT,
  "invalidatedByUserId" TEXT,
  "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ActiveAssessmentLease" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "kind" "public"."AssessmentKind" NOT NULL,
  "targetCode" TEXT NOT NULL,
  "targetVersion" TEXT NOT NULL,
  "bankVersion" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "releasedAt" TIMESTAMP(3),
  CONSTRAINT "ActiveAssessmentLease_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."LearnerPlacement" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "programCode" TEXT NOT NULL,
  "programVersion" TEXT NOT NULL,
  "unitCode" TEXT NOT NULL,
  "unitVersion" TEXT NOT NULL,
  "lessonCode" TEXT NOT NULL,
  "lessonVersion" TEXT NOT NULL,
  "method" "public"."PlacementMethod" NOT NULL,
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "evidenceRefs" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LearnerPlacement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."LearnerUnitState" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "unitCode" TEXT NOT NULL,
  "unitVersion" TEXT NOT NULL,
  "completionStatus" "public"."UnitCompletionStatus" NOT NULL,
  "overrideStatus" "public"."OverrideStatus" NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "enteredAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "LearnerUnitState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."LearnerLessonState" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "lessonCode" TEXT NOT NULL,
  "lessonVersion" TEXT NOT NULL,
  "completionStatus" "public"."LessonCompletionStatus" NOT NULL,
  "remediationStatus" "public"."RemediationStatus" NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "teachingViewedAt" TIMESTAMP(3),
  "practiceCount" INTEGER NOT NULL DEFAULT 0,
  "assessmentPassedAt" TIMESTAMP(3),
  CONSTRAINT "LearnerLessonState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."UnlockGrant" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "targetKind" "public"."ProgressionTargetKind" NOT NULL,
  "targetCode" TEXT NOT NULL,
  "targetVersion" TEXT NOT NULL,
  "requirementVersion" TEXT NOT NULL,
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "algorithmVersion" TEXT NOT NULL,
  "evidenceRefs" JSONB NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "UnlockGrant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."SkipRecord" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "targetKind" "public"."ProgressionTargetKind" NOT NULL,
  "targetCode" TEXT NOT NULL,
  "targetVersion" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "method" "public"."SkipMethod" NOT NULL,
  "evidenceRefs" JSONB NOT NULL,
  "requirementVersion" TEXT NOT NULL,
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "SkipRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."OverrideRecord" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "targetKind" "public"."ProgressionTargetKind" NOT NULL,
  "targetCode" TEXT NOT NULL,
  "targetVersion" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "actorRole" "public"."OverrideActorRole" NOT NULL,
  "reason" TEXT NOT NULL,
  "reauthAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  CONSTRAINT "OverrideRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ReviewSchedule" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "skillCode" TEXT NOT NULL,
  "skillVersion" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "intervalIndex" INTEGER NOT NULL,
  "lastOutcome" TEXT NOT NULL,
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "scheduleVersion" TEXT NOT NULL,
  CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."LearningEvent" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "skillCode" TEXT NOT NULL,
  "skillVersion" TEXT NOT NULL,
  "contentId" TEXT,
  "contentVersion" TEXT,
  "kind" "public"."LearningEventKind" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LearningEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."ShadowDecision" (
  "id" TEXT NOT NULL,
  "householdId" TEXT NOT NULL,
  "learnerProfileId" TEXT NOT NULL,
  "requestKind" TEXT NOT NULL,
  "targetCode" TEXT NOT NULL,
  "targetVersion" TEXT NOT NULL,
  "activityKind" "public"."ProgressionActivityKind" NOT NULL,
  "shadowDecision" "public"."ShadowDecisionValue" NOT NULL,
  "shadowReasonCode" TEXT NOT NULL,
  "actualBehavior" "public"."ShadowActualBehavior" NOT NULL,
  "divergent" BOOLEAN NOT NULL,
  "policyProfileCode" TEXT NOT NULL,
  "policyProfileVersion" TEXT NOT NULL,
  "policyProfileHash" TEXT NOT NULL,
  "algorithmVersion" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShadowDecision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssessmentAssignment_learnerProfileId_idempotencyKey_key" ON "public"."AssessmentAssignment"("learnerProfileId", "idempotencyKey");
CREATE UNIQUE INDEX "AssessmentRunState_assignmentId_key" ON "public"."AssessmentRunState"("assignmentId");
CREATE UNIQUE INDEX "AssessmentResult_assignmentId_key" ON "public"."AssessmentResult"("assignmentId");
CREATE UNIQUE INDEX "ActiveAssessmentLease_assignmentId_key" ON "public"."ActiveAssessmentLease"("assignmentId");
CREATE UNIQUE INDEX "LearnerUnitState_learnerProfileId_unitCode_unitVersion_key" ON "public"."LearnerUnitState"("learnerProfileId", "unitCode", "unitVersion");
CREATE UNIQUE INDEX "LearnerLessonState_learnerProfileId_lessonCode_lessonVersion_key" ON "public"."LearnerLessonState"("learnerProfileId", "lessonCode", "lessonVersion");
CREATE UNIQUE INDEX "ReviewSchedule_learnerProfileId_skillCode_skillVersion_key" ON "public"."ReviewSchedule"("learnerProfileId", "skillCode", "skillVersion");
CREATE UNIQUE INDEX "ActiveAssessmentLease_active_key" ON "public"."ActiveAssessmentLease"("learnerProfileId", "kind", "targetCode", "targetVersion", "bankVersion") WHERE "releasedAt" IS NULL;
CREATE INDEX "Session_assignmentId_idx" ON "public"."Session"("assignmentId");
CREATE INDEX "AssessmentAssignment_householdId_createdAt_idx" ON "public"."AssessmentAssignment"("householdId", "createdAt");
CREATE INDEX "AssessmentAssignment_learnerProfileId_target_idx" ON "public"."AssessmentAssignment"("learnerProfileId", "targetCode", "targetVersion");
CREATE INDEX "AssessmentResult_householdId_scoredAt_idx" ON "public"."AssessmentResult"("householdId", "scoredAt");
CREATE INDEX "AssessmentResult_learnerProfileId_scoredAt_idx" ON "public"."AssessmentResult"("learnerProfileId", "scoredAt");
CREATE INDEX "ActiveAssessmentLease_target_idx" ON "public"."ActiveAssessmentLease"("learnerProfileId", "kind", "targetCode", "targetVersion", "bankVersion");
CREATE INDEX "LearnerPlacement_program_idx" ON "public"."LearnerPlacement"("learnerProfileId", "programCode", "createdAt");
CREATE INDEX "UnlockGrant_target_idx" ON "public"."UnlockGrant"("learnerProfileId", "targetKind", "targetCode", "targetVersion");
CREATE INDEX "SkipRecord_target_idx" ON "public"."SkipRecord"("learnerProfileId", "targetCode", "targetVersion");
CREATE INDEX "OverrideRecord_target_idx" ON "public"."OverrideRecord"("learnerProfileId", "targetCode", "targetVersion");
CREATE INDEX "LearningEvent_skill_idx" ON "public"."LearningEvent"("learnerProfileId", "skillCode", "occurredAt");
CREATE INDEX "ShadowDecision_household_idx" ON "public"."ShadowDecision"("householdId", "occurredAt");
CREATE INDEX "ShadowDecision_divergence_idx" ON "public"."ShadowDecision"("learnerProfileId", "divergent", "occurredAt");

ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."AssessmentAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."AssessmentRunState" ADD CONSTRAINT "AssessmentRunState_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."AssessmentAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."AssessmentResult" ADD CONSTRAINT "AssessmentResult_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."AssessmentResult" ADD CONSTRAINT "AssessmentResult_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."AssessmentResult" ADD CONSTRAINT "AssessmentResult_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."AssessmentAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."ActiveAssessmentLease" ADD CONSTRAINT "ActiveAssessmentLease_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ActiveAssessmentLease" ADD CONSTRAINT "ActiveAssessmentLease_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ActiveAssessmentLease" ADD CONSTRAINT "ActiveAssessmentLease_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."AssessmentAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearnerPlacement" ADD CONSTRAINT "LearnerPlacement_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearnerPlacement" ADD CONSTRAINT "LearnerPlacement_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearnerUnitState" ADD CONSTRAINT "LearnerUnitState_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearnerUnitState" ADD CONSTRAINT "LearnerUnitState_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearnerLessonState" ADD CONSTRAINT "LearnerLessonState_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearnerLessonState" ADD CONSTRAINT "LearnerLessonState_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."UnlockGrant" ADD CONSTRAINT "UnlockGrant_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."UnlockGrant" ADD CONSTRAINT "UnlockGrant_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."SkipRecord" ADD CONSTRAINT "SkipRecord_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."SkipRecord" ADD CONSTRAINT "SkipRecord_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."OverrideRecord" ADD CONSTRAINT "OverrideRecord_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."OverrideRecord" ADD CONSTRAINT "OverrideRecord_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearningEvent" ADD CONSTRAINT "LearningEvent_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."LearningEvent" ADD CONSTRAINT "LearningEvent_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ShadowDecision" ADD CONSTRAINT "ShadowDecision_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ShadowDecision" ADD CONSTRAINT "ShadowDecision_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
