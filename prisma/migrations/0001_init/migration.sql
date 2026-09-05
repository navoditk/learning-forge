-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('PARENT', 'LEARNER');

-- CreateEnum
CREATE TYPE "public"."ConsentType" AS ENUM ('DATA_PROCESSING', 'TUTORING');

-- CreateEnum
CREATE TYPE "public"."ConsentStatus" AS ENUM ('PENDING', 'GRANTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "public"."AttemptContext" AS ENUM ('DIAGNOSTIC', 'PRACTICE', 'MASTERY_CHECK');

-- CreateEnum
CREATE TYPE "public"."Correctness" AS ENUM ('CORRECT', 'INCORRECT', 'PARTIAL', 'UNSCORED');

-- CreateEnum
CREATE TYPE "public"."ScoringMethod" AS ENUM ('DETERMINISTIC', 'RUBRIC', 'UNSCORED');

-- CreateEnum
CREATE TYPE "public"."AssistanceLevel" AS ENUM ('INDEPENDENT', 'CLARIFYING_QUESTION', 'SMALL_STRATEGIC_HINT', 'MULTIPLE_HINTS_REPRESENTATION', 'ANALOGOUS_WORKED_EXAMPLE', 'GUIDED_FULL_SOLUTION');

-- CreateEnum
CREATE TYPE "public"."TutorInteractionType" AS ENUM ('QUESTION', 'HINT', 'REPRESENTATION', 'EXAMPLE', 'SOLUTION');

-- CreateEnum
CREATE TYPE "public"."TraceValidationResult" AS ENUM ('VALIDATED', 'REPAIRED', 'FALLBACK', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."TraceOutcome" AS ENUM ('MOVE_RETURNED', 'FALLBACK_RETURNED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."ConfidenceBand" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "public"."Household" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsentRecord" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "type" "public"."ConsentType" NOT NULL,
    "status" "public"."ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "policyVersion" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attempt" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "sessionId" TEXT,
    "contentKey" TEXT NOT NULL,
    "contentVersion" TEXT NOT NULL,
    "learnerResponse" TEXT NOT NULL,
    "normalizedResponse" TEXT,
    "correctness" "public"."Correctness" NOT NULL,
    "scoringMethod" "public"."ScoringMethod" NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "elapsedSeconds" DOUBLE PRECISION NOT NULL,
    "highestAssistance" "public"."AssistanceLevel" NOT NULL,
    "context" "public"."AttemptContext" NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssistanceEvent" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "public"."AssistanceLevel" NOT NULL,
    "interactionType" "public"."TutorInteractionType" NOT NULL,

    CONSTRAINT "AssistanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TutorInteraction" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "attemptId" TEXT,
    "redactedExcerpt" TEXT,
    "moveType" TEXT NOT NULL,
    "assistanceLevel" "public"."AssistanceLevel" NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TutorTrace" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "promptTemplateVersion" TEXT NOT NULL,
    "modelIdentifier" TEXT NOT NULL,
    "latencyMs" DOUBLE PRECISION NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "validationResult" "public"."TraceValidationResult" NOT NULL,
    "outcome" "public"."TraceOutcome" NOT NULL,
    "redactedExcerpt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorTrace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MasteryEstimate" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "learnerProfileId" TEXT NOT NULL,
    "skillCode" TEXT NOT NULL,
    "estimate" DOUBLE PRECISION NOT NULL,
    "confidenceBand" "public"."ConfidenceBand" NOT NULL,
    "algorithmVersion" TEXT NOT NULL,
    "independentDelayedCheck" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasteryEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MasteryContribution" (
    "id" TEXT NOT NULL,
    "masteryEstimateId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "evidenceWeight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasteryContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_householdId_role_idx" ON "public"."User"("householdId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_userId_key" ON "public"."LearnerProfile"("userId");

-- CreateIndex
CREATE INDEX "ConsentRecord_householdId_learnerProfileId_type_idx" ON "public"."ConsentRecord"("householdId", "learnerProfileId", "type");

-- CreateIndex
CREATE INDEX "Session_learnerProfileId_startedAt_idx" ON "public"."Session"("learnerProfileId", "startedAt");

-- CreateIndex
CREATE INDEX "Attempt_learnerProfileId_contentKey_createdAt_idx" ON "public"."Attempt"("learnerProfileId", "contentKey", "createdAt");

-- CreateIndex
CREATE INDEX "Attempt_householdId_createdAt_idx" ON "public"."Attempt"("householdId", "createdAt");

-- CreateIndex
CREATE INDEX "AssistanceEvent_attemptId_occurredAt_idx" ON "public"."AssistanceEvent"("attemptId", "occurredAt");

-- CreateIndex
CREATE INDEX "TutorInteraction_learnerProfileId_createdAt_idx" ON "public"."TutorInteraction"("learnerProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "TutorTrace_learnerProfileId_createdAt_idx" ON "public"."TutorTrace"("learnerProfileId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MasteryEstimate_learnerProfileId_skillCode_algorithmVersion_key" ON "public"."MasteryEstimate"("learnerProfileId", "skillCode", "algorithmVersion");

-- CreateIndex
CREATE UNIQUE INDEX "MasteryContribution_masteryEstimateId_attemptId_key" ON "public"."MasteryContribution"("masteryEstimateId", "attemptId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearnerProfile" ADD CONSTRAINT "LearnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearnerProfile" ADD CONSTRAINT "LearnerProfile_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsentRecord" ADD CONSTRAINT "ConsentRecord_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsentRecord" ADD CONSTRAINT "ConsentRecord_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssistanceEvent" ADD CONSTRAINT "AssistanceEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorInteraction" ADD CONSTRAINT "TutorInteraction_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorInteraction" ADD CONSTRAINT "TutorInteraction_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorInteraction" ADD CONSTRAINT "TutorInteraction_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."Attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorTrace" ADD CONSTRAINT "TutorTrace_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorTrace" ADD CONSTRAINT "TutorTrace_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasteryEstimate" ADD CONSTRAINT "MasteryEstimate_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "public"."Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasteryEstimate" ADD CONSTRAINT "MasteryEstimate_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasteryContribution" ADD CONSTRAINT "MasteryContribution_masteryEstimateId_fkey" FOREIGN KEY ("masteryEstimateId") REFERENCES "public"."MasteryEstimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasteryContribution" ADD CONSTRAINT "MasteryContribution_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Attempt evidence is immutable; corrections require a new attempt record.
CREATE FUNCTION "public"."prevent_attempt_update"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Attempt evidence is immutable';
END;
$$;

CREATE TRIGGER "Attempt_immutable"
BEFORE UPDATE ON "public"."Attempt"
FOR EACH ROW EXECUTE FUNCTION "public"."prevent_attempt_update"();
