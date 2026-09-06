import { AssistanceLevel, Correctness, Prisma } from '@prisma/client';

import { contentCatalog } from '../content/catalog';
import {
  PlannerContentItem,
  PlannerMasteryRecord,
  PlannerSkill,
  WeeklyDigestAttemptSummary,
  WeeklyDigestSkillInput,
} from '../contracts';
import { skillCatalog } from '../curriculum';
import { ConsoleNotifier, buildWeeklyDigest } from '../notification';
import { planNextActivities } from '../planner';
import { prisma } from '../server/prisma';
import { isUniqueConstraintViolation } from '../server/prisma-errors';
import { TutorResponse } from '../tutor';
import { assistanceIndex, TutorState } from '../tutor/policy';

export const PHASE_1_CONTENT_ID = 'unit-rates-1';
export const PHASE_1_POLICY_VERSION = 'math-tutor-policy-1';
export const PHASE_1_MASTERY_VERSION = 'mastery-phase-1-1';

/**
 * Every Phase 1 operation is scoped to one household/learner. Callers
 * resolve this from the real authenticated session (`requireHouseholdContext`,
 * ADR-0010) or, in tests, from the synthetic fixture (`SYNTHETIC_IDENTITY`,
 * ADR-0003). This module has no knowledge of which one it's talking to.
 */
export type HouseholdIdentity = { householdId: string; learnerProfileId: string };

function resolveContent(contentId?: string) {
  const id = contentId ?? PHASE_1_CONTENT_ID;
  const item = contentCatalog.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown content: ${id}`);
  return item;
}

export const phase1Content = resolveContent();

const assistanceWeights = [1, 0.9, 0.75, 0.55, 0.35, 0.1];

function normalizeAnswer(answer: string): string {
  return answer.trim().toLocaleLowerCase().replace(/\s+/gu, ' ');
}

function scoreAnswer(content: typeof phase1Content, answer: string): Correctness {
  return content.deterministicValidator.acceptedAnswers.some(
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

async function upsertMasteryEstimate(
  where: Prisma.MasteryEstimateWhereUniqueInput,
  update: Prisma.MasteryEstimateUpdateInput,
  create: Prisma.MasteryEstimateUncheckedCreateInput,
) {
  try {
    return await prisma.masteryEstimate.upsert({ where, update, create });
  } catch (error) {
    if (!isUniqueConstraintViolation(error)) throw error;
    // A concurrent attempt on the same skill created this row first; apply
    // this attempt's evidence as an update instead of losing it.
    return await prisma.masteryEstimate.update({ where, data: update });
  }
}

export async function startSession(
  identity: HouseholdIdentity,
  input: { contentId?: string } = {},
) {
  const content = resolveContent(input.contentId);
  const session = await prisma.session.create({
    data: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      contentKey: content.id,
    },
  });
  return {
    sessionId: session.id,
    learner: { id: identity.learnerProfileId, displayName: 'Learner' },
    content: {
      id: content.id,
      version: content.version,
      title: content.title,
      skillCode: content.skillCode,
      prompt: content.prompt,
      accessibilityNotes: content.accessibilityNotes,
    },
  };
}

async function createAttempt(
  identity: HouseholdIdentity,
  input: {
    sessionId: string;
    learnerResponse: string;
    context: 'PRACTICE' | 'MASTERY_CHECK';
    independentDelayedCheck: boolean;
  },
) {
  const session = await prisma.session.findFirst({
    where: {
      id: input.sessionId,
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
    },
  });
  if (!session) throw new Error('Session not found');
  const content = resolveContent(session.contentKey);
  const attemptNumber = (await prisma.attempt.count({ where: { sessionId: input.sessionId } })) + 1;
  const correctness = scoreAnswer(content, input.learnerResponse);
  const independentCheckPassed = input.independentDelayedCheck && correctness === 'CORRECT';
  const attempt = await prisma.attempt.create({
    data: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      sessionId: input.sessionId,
      contentKey: content.id,
      contentVersion: content.version,
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
        learnerProfileId: identity.learnerProfileId,
        skillCode: content.skillCode,
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    select: { independentDelayedCheck: true },
  });
  const mastery = await upsertMasteryEstimate(
    {
      learnerProfileId_skillCode_algorithmVersion: {
        learnerProfileId: identity.learnerProfileId,
        skillCode: content.skillCode,
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    {
      estimate: weight,
      confidenceBand: confidenceBand(weight),
      independentDelayedCheck: existingMastery?.independentDelayedCheck || independentCheckPassed,
    },
    {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      skillCode: content.skillCode,
      estimate: weight,
      confidenceBand: confidenceBand(weight),
      algorithmVersion: PHASE_1_MASTERY_VERSION,
      independentDelayedCheck: independentCheckPassed,
    },
  );
  await prisma.masteryContribution.upsert({
    where: {
      masteryEstimateId_attemptId: { masteryEstimateId: mastery.id, attemptId: attempt.id },
    },
    update: { evidenceWeight: weight },
    create: { masteryEstimateId: mastery.id, attemptId: attempt.id, evidenceWeight: weight },
  });
  return { attemptId: attempt.id, correctness, evidenceWeight: weight };
}

export async function recordAttempt(
  identity: HouseholdIdentity,
  input: { sessionId: string; learnerResponse: string },
) {
  return createAttempt(identity, { ...input, context: 'PRACTICE', independentDelayedCheck: false });
}

async function findAttempt(identity: HouseholdIdentity, attemptId: string) {
  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
    },
  });
  if (!attempt) throw new Error('Attempt not found');
  return attempt;
}

export async function getTutorContext(identity: HouseholdIdentity, attemptId: string) {
  const attempt = await findAttempt(identity, attemptId);
  const content = resolveContent(attempt.contentKey);
  const interactions = await prisma.tutorInteraction.findMany({
    where: {
      attemptId: attempt.id,
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
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
    content: {
      id: content.id,
      prompt: content.prompt,
      skillCode: content.skillCode,
      canonicalAnswer: content.deterministicValidator.canonicalAnswer,
      forbiddenLeakagePatterns: content.forbiddenLeakagePatterns,
    },
  };
}

export async function recordIndependentCheck(
  identity: HouseholdIdentity,
  input: { sessionId: string; learnerResponse: string },
) {
  const session = await prisma.session.findFirst({
    where: {
      id: input.sessionId,
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
    },
  });
  if (!session) throw new Error('Session not found');
  const hasTutorInteraction = await prisma.tutorInteraction.findFirst({
    where: {
      attempt: { sessionId: session.id },
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
    },
    select: { id: true },
  });
  if (!hasTutorInteraction) throw new Error('Independent check requires tutoring');
  return createAttempt(identity, {
    ...input,
    context: 'MASTERY_CHECK',
    independentDelayedCheck: true,
  });
}

export async function recordTutorResponse(
  identity: HouseholdIdentity,
  input: { attemptId?: string; response: TutorResponse },
) {
  if (input.attemptId) {
    await findAttempt(identity, input.attemptId);
  }
  const metadata = input.response.trace.metadata;
  const trace = await prisma.tutorTrace.create({
    data: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
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
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
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

export async function getParentEvidence(identity: HouseholdIdentity) {
  const [attempts, mastery] = await Promise.all([
    prisma.attempt.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
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
    prisma.masteryEstimate.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
      select: {
        skillCode: true,
        estimate: true,
        confidenceBand: true,
        independentDelayedCheck: true,
      },
    }),
  ]);
  return {
    learnerName: 'Learner',
    attempts: attempts.map(({ assistanceEvents, ...attempt }) => ({
      ...attempt,
      highestAssistance: assistanceEvents[0]?.level ?? 'INDEPENDENT',
    })),
    mastery,
  };
}

export async function getWeeklyDigest(identity: HouseholdIdentity) {
  const evidence = await getParentEvidence(identity);

  const attemptsBySkill = new Map<string, WeeklyDigestAttemptSummary[]>();
  for (const attempt of evidence.attempts) {
    const skillCode = resolveContent(attempt.contentKey).skillCode;
    const list = attemptsBySkill.get(skillCode) ?? [];
    list.push({ correctness: attempt.correctness, highestAssistance: attempt.highestAssistance });
    attemptsBySkill.set(skillCode, list);
  }

  const masteryBySkill = new Map(evidence.mastery.map((row) => [row.skillCode, row]));
  const skillCodes = new Set([...attemptsBySkill.keys(), ...masteryBySkill.keys()]);
  const skills: WeeklyDigestSkillInput[] = Array.from(skillCodes).map((skillCode) => ({
    skillCode,
    attempts: attemptsBySkill.get(skillCode) ?? [],
    mastery: masteryBySkill.get(skillCode),
  }));

  const digest = buildWeeklyDigest({ learnerName: evidence.learnerName, skills });
  const notifierResult = await new ConsoleNotifier().sendWeeklyDigest(digest);
  return { digest, notifierResult };
}

const PHASE_1_DEFAULT_TIME_BUDGET_MINUTES = 30;

export async function getPlan(
  identity: HouseholdIdentity,
  input: { timeBudgetMinutes?: number } = {},
) {
  const masteryRows = await prisma.masteryEstimate.findMany({
    where: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      algorithmVersion: PHASE_1_MASTERY_VERSION,
    },
    select: {
      skillCode: true,
      estimate: true,
      confidenceBand: true,
      independentDelayedCheck: true,
    },
  });
  const masteryBySkillCode: Record<string, PlannerMasteryRecord> = {};
  for (const row of masteryRows) {
    masteryBySkillCode[row.skillCode] = {
      estimate: row.estimate,
      confidenceBand: row.confidenceBand,
      independentDelayedCheck: row.independentDelayedCheck,
    };
  }

  const content: PlannerContentItem[] = contentCatalog.map((item) => ({
    id: item.id,
    skillCode: item.skillCode,
    mode: item.mode,
    difficulty: item.difficulty,
  }));
  const skills: PlannerSkill[] = skillCatalog.map((skill) => ({
    code: skill.code,
    prerequisiteSkillCodes: skill.prerequisiteSkillCodes,
  }));

  const plan = planNextActivities({
    skills,
    content,
    masteryBySkillCode,
    timeBudgetMinutes: input.timeBudgetMinutes ?? PHASE_1_DEFAULT_TIME_BUDGET_MINUTES,
  });

  const contentById = new Map(contentCatalog.map((item) => [item.id, item]));
  const skillByCode = new Map(skillCatalog.map((skill) => [skill.code, skill]));

  return {
    ...plan,
    items: plan.items.map((item) => ({
      ...item,
      title: contentById.get(item.contentId)?.title ?? item.contentId,
      skillTitle: skillByCode.get(item.skillCode)?.title ?? item.skillCode,
    })),
  };
}

export type Phase1TutorState = TutorState;
