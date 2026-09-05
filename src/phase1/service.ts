import { AssistanceLevel, Correctness } from '@prisma/client';

import { ratioContentCatalog } from '../content/catalog';
import { ensureSyntheticIdentity, SYNTHETIC_IDS } from '../identity/synthetic';
import { prisma } from '../server/prisma';
import { TutorResponse } from '../tutor';
import { assistanceIndex, TutorState } from '../tutor/policy';

export const PHASE_1_CONTENT_ID = 'unit-rates-1';
export const PHASE_1_POLICY_VERSION = 'math-tutor-policy-1';
export const PHASE_1_MASTERY_VERSION = 'mastery-phase-1-1';

export const phase1Content = (() => {
  const item = ratioContentCatalog.find((candidate) => candidate.id === PHASE_1_CONTENT_ID);
  if (!item) throw new Error(`Missing Phase 1 content: ${PHASE_1_CONTENT_ID}`);
  return item;
})();

const assistanceWeights = [1, 0.9, 0.75, 0.55, 0.35, 0.1];

function normalizeAnswer(answer: string): string {
  return answer.trim().toLocaleLowerCase().replace(/\s+/gu, ' ');
}

function scoreAnswer(answer: string): Correctness {
  return phase1Content.deterministicValidator.acceptedAnswers.some(
    (accepted) => normalizeAnswer(accepted) === normalizeAnswer(answer),
  )
    ? 'CORRECT'
    : 'INCORRECT';
}

function assistanceIndexFromDatabase(level: AssistanceLevel): number {
  return assistanceIndex(level.toLocaleLowerCase() as Parameters<typeof assistanceIndex>[0]);
}

function evidenceWeight(correctness: Correctness, assistance: AssistanceLevel): number {
  return correctness === 'CORRECT' ? assistanceWeights[assistanceIndexFromDatabase(assistance)] : 0;
}

function confidenceBand(weight: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  return weight >= 0.9 ? 'MEDIUM' : 'LOW';
}

export async function getSyntheticSession() {
  await ensureSyntheticIdentity();
  const session = await prisma.session.create({
    data: { householdId: SYNTHETIC_IDS.household, learnerProfileId: SYNTHETIC_IDS.learnerProfile },
  });
  return {
    sessionId: session.id,
    learner: { id: SYNTHETIC_IDS.learnerProfile, displayName: 'Synthetic learner' },
    content: {
      id: phase1Content.id,
      version: phase1Content.version,
      title: phase1Content.title,
      skillCode: phase1Content.skillCode,
      prompt: phase1Content.prompt,
      accessibilityNotes: phase1Content.accessibilityNotes,
    },
  };
}

async function createAttempt(input: {
  sessionId: string;
  learnerResponse: string;
  context: 'PRACTICE' | 'MASTERY_CHECK';
  independentDelayedCheck: boolean;
}) {
  await ensureSyntheticIdentity();
  const session = await prisma.session.findFirst({
    where: {
      id: input.sessionId,
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
    },
  });
  if (!session) throw new Error('Synthetic session not found');
  const attemptNumber = (await prisma.attempt.count({ where: { sessionId: input.sessionId } })) + 1;
  const correctness = scoreAnswer(input.learnerResponse);
  const independentCheckPassed = input.independentDelayedCheck && correctness === 'CORRECT';
  const attempt = await prisma.attempt.create({
    data: {
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
      sessionId: input.sessionId,
      contentKey: phase1Content.id,
      contentVersion: phase1Content.version,
      learnerResponse: input.learnerResponse,
      normalizedResponse: normalizeAnswer(input.learnerResponse),
      correctness,
      scoringMethod: 'DETERMINISTIC',
      attemptNumber,
      elapsedSeconds: 0,
      highestAssistance: 'INDEPENDENT',
      context: input.context,
      policyVersion: PHASE_1_POLICY_VERSION,
      assistanceEvents: { create: { level: 'INDEPENDENT', interactionType: 'QUESTION' } },
    },
  });
  const weight = evidenceWeight(correctness, 'INDEPENDENT');
  const existingMastery = await prisma.masteryEstimate.findUnique({
    where: {
      learnerProfileId_skillCode_algorithmVersion: {
        learnerProfileId: SYNTHETIC_IDS.learnerProfile,
        skillCode: phase1Content.skillCode,
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    select: { independentDelayedCheck: true },
  });
  const mastery = await prisma.masteryEstimate.upsert({
    where: {
      learnerProfileId_skillCode_algorithmVersion: {
        learnerProfileId: SYNTHETIC_IDS.learnerProfile,
        skillCode: phase1Content.skillCode,
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    update: {
      estimate: weight,
      confidenceBand: confidenceBand(weight),
      independentDelayedCheck: existingMastery?.independentDelayedCheck || independentCheckPassed,
    },
    create: {
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
      skillCode: phase1Content.skillCode,
      estimate: weight,
      confidenceBand: confidenceBand(weight),
      algorithmVersion: PHASE_1_MASTERY_VERSION,
      independentDelayedCheck: independentCheckPassed,
    },
  });
  await prisma.masteryContribution.upsert({
    where: {
      masteryEstimateId_attemptId: { masteryEstimateId: mastery.id, attemptId: attempt.id },
    },
    update: { evidenceWeight: weight },
    create: { masteryEstimateId: mastery.id, attemptId: attempt.id, evidenceWeight: weight },
  });
  return { attemptId: attempt.id, correctness, evidenceWeight: weight };
}

export async function recordAttempt(input: { sessionId: string; learnerResponse: string }) {
  return createAttempt({ ...input, context: 'PRACTICE', independentDelayedCheck: false });
}

async function findSyntheticAttempt(attemptId: string) {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
    },
  });
  if (!attempt) throw new Error('Synthetic attempt not found');
  return attempt;
}

export async function getTutorContext(attemptId: string) {
  const attempt = await findSyntheticAttempt(attemptId);
  const interactions = await prisma.tutorInteraction.findMany({
    where: {
      attemptId: attempt.id,
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
    },
    orderBy: { createdAt: 'asc' },
    select: { moveType: true },
  });
  const states: TutorState[] = [
    'awaiting_attempt',
    'clarify_problem',
    'probe_reasoning',
    'hint_1_strategy',
    'hint_2_representation',
    'hint_3_subproblem',
    'analogous_example',
    'guided_solution',
    'explain_and_reflect',
  ];
  const lastMove = interactions.at(-1)?.moveType;
  return {
    attemptId: attempt.id,
    state: states.includes(lastMove as TutorState) ? (lastMove as TutorState) : 'awaiting_attempt',
    priorHintCount: interactions.length,
    attemptNumber: attempt.attemptNumber,
  };
}

export async function recordIndependentCheck(input: {
  sessionId: string;
  learnerResponse: string;
}) {
  await ensureSyntheticIdentity();
  const session = await prisma.session.findFirst({
    where: {
      id: input.sessionId,
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
    },
  });
  if (!session) throw new Error('Synthetic session not found');
  const hasTutorInteraction = await prisma.tutorInteraction.findFirst({
    where: {
      attempt: { sessionId: session.id },
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
    },
    select: { id: true },
  });
  if (!hasTutorInteraction) throw new Error('Independent check requires tutoring');
  return createAttempt({ ...input, context: 'MASTERY_CHECK', independentDelayedCheck: true });
}

export async function recordTutorResponse(input: { attemptId?: string; response: TutorResponse }) {
  await ensureSyntheticIdentity();
  if (input.attemptId) {
    await findSyntheticAttempt(input.attemptId);
  }
  const metadata = input.response.trace.metadata;
  const trace = await prisma.tutorTrace.create({
    data: {
      householdId: SYNTHETIC_IDS.household,
      learnerProfileId: SYNTHETIC_IDS.learnerProfile,
      policyVersion: metadata.policyVersion,
      promptTemplateVersion: metadata.promptTemplateVersion,
      modelIdentifier: metadata.modelIdentifier,
      latencyMs: metadata.latencyMs,
      inputTokens: metadata.tokenUsage.input,
      outputTokens: metadata.tokenUsage.output,
      totalTokens: metadata.tokenUsage.total,
      validationResult: metadata.validationResult.toUpperCase() as
        'VALIDATED' | 'REPAIRED' | 'FALLBACK' | 'REJECTED',
      outcome: metadata.outcome.toUpperCase() as 'MOVE_RETURNED' | 'FALLBACK_RETURNED' | 'ERROR',
      redactedExcerpt: input.response.trace.redactedExcerpt,
    },
  });
  if (input.response.move) {
    const move = input.response.move;
    await prisma.tutorInteraction.create({
      data: {
        householdId: SYNTHETIC_IDS.household,
        learnerProfileId: SYNTHETIC_IDS.learnerProfile,
        attemptId: input.attemptId,
        redactedExcerpt: input.response.trace.redactedExcerpt,
        moveType: move.moveType,
        assistanceLevel: move.assistanceLevel.toUpperCase() as AssistanceLevel,
        policyVersion: metadata.policyVersion,
      },
    });
    if (input.attemptId) {
      await prisma.assistanceEvent.create({
        data: {
          attemptId: input.attemptId,
          level: move.assistanceLevel.toUpperCase() as AssistanceLevel,
          interactionType: 'HINT',
        },
      });
      const contribution = await prisma.masteryContribution.findFirst({
        where: { attemptId: input.attemptId },
        include: { attempt: true },
      });
      if (contribution) {
        const weight = evidenceWeight(
          contribution.attempt.correctness,
          move.assistanceLevel.toUpperCase() as AssistanceLevel,
        );
        await prisma.masteryContribution.update({
          where: { id: contribution.id },
          data: { evidenceWeight: weight },
        });
        await prisma.masteryEstimate.update({
          where: { id: contribution.masteryEstimateId },
          data: { estimate: weight, confidenceBand: confidenceBand(weight) },
        });
      }
    }
  }
  return { traceId: trace.id, nextState: input.response.nextState };
}

export async function getParentEvidence() {
  await ensureSyntheticIdentity();
  const [attempts, mastery] = await Promise.all([
    prisma.attempt.findMany({
      where: {
        householdId: SYNTHETIC_IDS.household,
        learnerProfileId: SYNTHETIC_IDS.learnerProfile,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        contentKey: true,
        correctness: true,
        createdAt: true,
        assistanceEvents: { select: { level: true }, orderBy: { occurredAt: 'desc' }, take: 1 },
      },
    }),
    prisma.masteryEstimate.findUnique({
      where: {
        learnerProfileId_skillCode_algorithmVersion: {
          learnerProfileId: SYNTHETIC_IDS.learnerProfile,
          skillCode: phase1Content.skillCode,
          algorithmVersion: PHASE_1_MASTERY_VERSION,
        },
      },
      select: { estimate: true, confidenceBand: true, independentDelayedCheck: true },
    }),
  ]);
  return {
    learnerName: 'Synthetic learner',
    skill: phase1Content.skillCode,
    attempts: attempts.map(({ assistanceEvents, ...attempt }) => ({
      ...attempt,
      highestAssistance: assistanceEvents[0]?.level ?? 'INDEPENDENT',
    })),
    mastery,
  };
}

export type Phase1TutorState = TutorState;
