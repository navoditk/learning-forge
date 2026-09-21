import { Prisma, PrismaClient } from '@prisma/client';

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

/**
 * A self-service deletion is permanent and removes every learner's evidence
 * in the household, so it requires the caller to type this exact phrase
 * rather than a single click - the same bar as the manual, support-mediated
 * process it replaces.
 */
export const HOUSEHOLD_DELETION_CONFIRMATION_PHRASE = 'DELETE';

/**
 * This is the reviewed model coverage contract for the household export and
 * deletion paths. The companion coverage test compares it with Prisma's
 * generated model list so a new model cannot be added without an explicit
 * privacy review.
 */
export const HOUSEHOLD_DATA_MODEL_COVERAGE = {
  export: [
    'Household',
    'User',
    'LearnerProfile',
    'ConsentRecord',
    'Session',
    'Attempt',
    'AssistanceEvent',
    'TutorInteraction',
    'TutorTrace',
    'MasteryEstimate',
    'MasteryContribution',
    'AssessmentAssignment',
    'AssessmentRunState',
    'AssessmentResult',
    'ActiveAssessmentLease',
    'LearnerPlacement',
    'LearnerUnitState',
    'LearnerLessonState',
    'UnlockGrant',
    'SkipRecord',
    'OverrideRecord',
    'ReviewSchedule',
    'LearningEvent',
    'ShadowDecision',
  ],
  delete: [
    'Household',
    'User',
    'LearnerProfile',
    'ConsentRecord',
    'Session',
    'Attempt',
    'AssistanceEvent',
    'TutorInteraction',
    'TutorTrace',
    'MasteryEstimate',
    'MasteryContribution',
    'AssessmentAssignment',
    'AssessmentRunState',
    'AssessmentResult',
    'ActiveAssessmentLease',
    'LearnerPlacement',
    'LearnerUnitState',
    'LearnerLessonState',
    'UnlockGrant',
    'SkipRecord',
    'OverrideRecord',
    'ReviewSchedule',
    'LearningEvent',
    'ShadowDecision',
  ],
} as const;

export function isHouseholdDeletionConfirmed(confirmation: unknown): boolean {
  return confirmation === HOUSEHOLD_DELETION_CONFIRMATION_PHRASE;
}

const ASSISTANCE_ORDINAL: Record<string, number> = {
  INDEPENDENT: 0,
  CLARIFYING_QUESTION: 1,
  SMALL_STRATEGIC_HINT: 2,
  MULTIPLE_HINTS_REPRESENTATION: 3,
  ANALOGOUS_WORKED_EXAMPLE: 4,
  GUIDED_FULL_SOLUTION: 5,
};

function deriveHighestAssistance(attempt: {
  highestAssistance: string;
  assistanceEvents: Array<{ level: string }>;
}) {
  if (attempt.assistanceEvents.length === 0) return attempt.highestAssistance;
  return attempt.assistanceEvents.reduce(
    (highest, event) =>
      ASSISTANCE_ORDINAL[event.level] > ASSISTANCE_ORDINAL[highest] ? event.level : highest,
    attempt.assistanceEvents[0].level,
  );
}

export async function exportHouseholdData(prisma: DatabaseClient, householdId: string) {
  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      users: { select: { id: true, role: true, email: true, createdAt: true } },
      learners: {
        select: {
          id: true,
          userId: true,
          gradeLevel: true,
          createdAt: true,
          updatedAt: true,
          consentRecords: {
            select: {
              id: true,
              type: true,
              status: true,
              policyVersion: true,
              grantedAt: true,
              revokedAt: true,
              createdAt: true,
            },
          },
        },
      },
      sessions: {
        select: {
          id: true,
          learnerProfileId: true,
          contentKey: true,
          startedAt: true,
          endedAt: true,
        },
      },
      attempts: {
        select: {
          id: true,
          learnerProfileId: true,
          sessionId: true,
          contentKey: true,
          contentVersion: true,
          learnerResponse: true,
          normalizedResponse: true,
          correctness: true,
          scoringMethod: true,
          attemptNumber: true,
          elapsedSeconds: true,
          highestAssistance: true,
          context: true,
          policyVersion: true,
          createdAt: true,
          assistanceEvents: {
            select: { id: true, occurredAt: true, level: true, interactionType: true },
          },
        },
      },
      tutorInteractions: {
        select: {
          id: true,
          learnerProfileId: true,
          attemptId: true,
          redactedExcerpt: true,
          moveType: true,
          assistanceLevel: true,
          policyVersion: true,
          createdAt: true,
        },
      },
      traces: {
        select: {
          id: true,
          learnerProfileId: true,
          sessionId: true,
          policyVersion: true,
          promptTemplateVersion: true,
          modelIdentifier: true,
          latencyMs: true,
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
          validationResult: true,
          outcome: true,
          redactedExcerpt: true,
          createdAt: true,
        },
      },
      masteryEstimates: {
        select: {
          id: true,
          learnerProfileId: true,
          skillCode: true,
          estimate: true,
          confidenceBand: true,
          algorithmVersion: true,
          policyProfileCode: true,
          policyProfileVersion: true,
          policyProfileHash: true,
          curriculumSnapshotHash: true,
          independentDelayedCheck: true,
          createdAt: true,
          updatedAt: true,
          contributions: {
            select: { id: true, attemptId: true, evidenceWeight: true, createdAt: true },
          },
        },
      },
      assessmentAssignments: { include: { runState: true } },
      assessmentResults: true,
      activeAssessmentLeases: true,
      learnerPlacements: true,
      learnerUnitStates: true,
      learnerLessonStates: true,
      unlockGrants: true,
      skipRecords: true,
      overrideRecords: true,
      reviewSchedules: true,
      learningEvents: true,
      shadowDecisions: true,
    },
  });
  if (!household) throw new Error('Household not found');
  return {
    ...household,
    attempts: household.attempts.map((attempt) => ({
      ...attempt,
      highestAssistance: deriveHighestAssistance(attempt),
    })),
  };
}

export async function deleteHouseholdData(prisma: PrismaClient, householdId: string) {
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.household.findUnique({
      where: { id: householdId },
      select: { id: true },
    });
    if (!existing) return false;

    await transaction.masteryContribution.deleteMany({ where: { attempt: { householdId } } });
    await transaction.masteryEstimate.deleteMany({ where: { householdId } });
    await transaction.assessmentResult.deleteMany({ where: { householdId } });
    await transaction.assessmentRunState.deleteMany({ where: { assignment: { householdId } } });
    await transaction.activeAssessmentLease.deleteMany({ where: { householdId } });
    await transaction.assessmentAssignment.deleteMany({ where: { householdId } });
    await transaction.shadowDecision.deleteMany({ where: { householdId } });
    await transaction.learningEvent.deleteMany({ where: { householdId } });
    await transaction.reviewSchedule.deleteMany({ where: { householdId } });
    await transaction.overrideRecord.deleteMany({ where: { householdId } });
    await transaction.skipRecord.deleteMany({ where: { householdId } });
    await transaction.unlockGrant.deleteMany({ where: { householdId } });
    await transaction.learnerLessonState.deleteMany({ where: { householdId } });
    await transaction.learnerUnitState.deleteMany({ where: { householdId } });
    await transaction.learnerPlacement.deleteMany({ where: { householdId } });
    await transaction.assistanceEvent.deleteMany({ where: { attempt: { householdId } } });
    await transaction.tutorInteraction.deleteMany({ where: { householdId } });
    await transaction.attempt.deleteMany({ where: { householdId } });
    await transaction.tutorTrace.deleteMany({ where: { householdId } });
    await transaction.session.deleteMany({ where: { householdId } });
    await transaction.consentRecord.deleteMany({ where: { householdId } });
    await transaction.learnerProfile.deleteMany({ where: { householdId } });
    await transaction.user.deleteMany({ where: { householdId } });
    await transaction.household.delete({ where: { id: householdId } });
    return true;
  });
}
