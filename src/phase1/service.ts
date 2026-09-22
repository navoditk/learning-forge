import { AssistanceLevel, Correctness, Prisma } from '@prisma/client';

import { contentSkillCode, servableContentCatalog } from '../content/catalog';
import {
  CurriculumProgram,
  PlannerContentItem,
  PlannerMasteryRecord,
  PlannerSkill,
  WeeklyDigestAttemptSummary,
  WeeklyDigestSkillInput,
} from '../contracts';
import { skillCatalog, skillsByCode, topologicalSkillOrder } from '../curriculum';
import { programsByCode } from '../curriculum/program-registry';
import { ConsoleNotifier, buildWeeklyDigest } from '../notification';
import { planNextActivities } from '../planner';
import { loadPolicyArtifacts } from '../progression/artifacts';
import { deriveHighestAssistance } from '../progression/assistance';
import { buildShadowDecision, persistShadowNonEnforcing } from '../progression/shadow';
import { policyHash, resolvePolicyProfile } from '../progression/policy';
import type { ActivityKind } from '../contracts/policy';
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
export type SessionActivityKind = Extract<ActivityKind, 'PRACTICE' | 'PLACEMENT' | 'REVIEW'>;
export type Phase1ShadowPersistence = (write: () => Promise<unknown>) => Promise<boolean>;

function resolveContent(contentId?: string) {
  const id = contentId ?? PHASE_1_CONTENT_ID;
  const item = servableContentCatalog.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown content: ${id}`);
  return item;
}

const DEFAULT_PROGRAM: CurriculumProgram = 'grade-6-math';

function programCatalog(program: CurriculumProgram) {
  const skills = skillCatalog.filter((skill) => skill.program === program);
  const skillCodes = new Set(skills.map((skill) => skill.code));
  return {
    skills,
    skillCodes,
    content: servableContentCatalog.filter((item) => skillCodes.has(contentSkillCode(item))),
  };
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

/**
 * Attempts recorded for a session, oldest first, used to describe a
 * resumed session's progress to the caller.
 */
async function getSessionState(identity: HouseholdIdentity, sessionId: string) {
  const attempts = await prisma.attempt.findMany({
    where: {
      sessionId,
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
    },
    orderBy: { attemptNumber: 'asc' },
    select: { id: true, correctness: true, context: true },
  });
  const latestAttempt = [...attempts]
    .reverse()
    .find((candidate) => candidate.context === 'PRACTICE');
  const latestCheck = [...attempts]
    .reverse()
    .find((candidate) => candidate.context === 'MASTERY_CHECK');
  const hintCount = latestAttempt
    ? await prisma.tutorInteraction.count({ where: { attemptId: latestAttempt.id } })
    : 0;
  return {
    completed: Boolean(latestCheck && latestCheck.correctness === 'CORRECT'),
    latestAttempt: latestAttempt
      ? { attemptId: latestAttempt.id, correctness: latestAttempt.correctness }
      : undefined,
    hintCount,
    latestCheck: latestCheck
      ? { attemptId: latestCheck.id, correctness: latestCheck.correctness }
      : undefined,
  };
}

export async function startSession(
  identity: HouseholdIdentity,
  input: {
    contentId?: string;
    program?: CurriculumProgram;
    activityKind?: SessionActivityKind;
  } = {},
) {
  const program = input.program ?? DEFAULT_PROGRAM;
  const activityKind = input.activityKind ?? 'PRACTICE';
  const catalog = programCatalog(program);
  const content = input.contentId
    ? resolveContent(input.contentId)
    : program === DEFAULT_PROGRAM
      ? resolveContent()
      : (catalog.content.find((item) => item.mode === 'core') ?? catalog.content[0]);
  if (!content || !catalog.skillCodes.has(contentSkillCode(content))) {
    throw new Error(`Unknown content for program: ${input.contentId ?? program}`);
  }
  // Resume an in-progress session for this content instead of creating a
  // duplicate one on every page load/refresh - a session only ends once its
  // independent check passes (see recordIndependentCheck).
  const existing = await prisma.session.findFirst({
    where: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      contentKey: content.id,
      endedAt: null,
      activityKind,
    },
    orderBy: { startedAt: 'desc' },
  });
  const session =
    existing ??
    (await prisma.session.create({
      data: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        contentKey: content.id,
        activityKind,
        targetCode: content.id,
        targetVersion: content.version,
        policyProfileCode: programsByCode.get(program)?.defaultPolicyProfileRef.code,
        policyProfileVersion: programsByCode.get(program)?.defaultPolicyProfileRef.version,
      },
    }));
  // Record every authorization-relevant request, including a resumed session.
  // Shadow mode is diagnostic only and must never affect the learner response.
  await persistShadowNonEnforcing(() =>
    writeShadowDecision(identity, program, content.id, content.version, activityKind),
  );
  const state = await getSessionState(identity, session.id);
  return {
    sessionId: session.id,
    resumed: Boolean(existing),
    learner: { id: identity.learnerProfileId, displayName: 'Learner' },
    content: {
      id: content.id,
      version: content.version,
      title: content.title,
      skillCode: contentSkillCode(content),
      prompt: content.prompt,
      accessibilityNotes: content.accessibilityNotes,
      figure: content.figure,
    },
    ...state,
  };
}

async function writeShadowDecision(
  identity: HouseholdIdentity,
  programCode: CurriculumProgram,
  targetCode: string,
  targetVersion: string,
  activityKind: 'PRACTICE' | 'PLACEMENT' | 'DELAYED_CHECK' | 'REVIEW',
): Promise<void> {
  const program = programsByCode.get(programCode);
  const skill = skillsByCode.get(contentSkillCode(resolveContent(targetCode)));
  if (!program || !skill) return;
  const artifacts = loadPolicyArtifacts();
  const profile = artifacts.profiles.find(
    (candidate) =>
      candidate.code === program.defaultPolicyProfileRef.code &&
      candidate.version === program.defaultPolicyProfileRef.version,
  );
  if (!profile) return;
  const resolvedProfile = resolvePolicyProfile(
    profile,
    new Map(
      artifacts.profiles.map((candidate) => [`${candidate.code}@${candidate.version}`, candidate]),
    ),
  );
  const accessPolicy = artifacts.accessPolicies.find(
    (candidate) =>
      candidate.code === program.accessPolicyRef.code &&
      candidate.version === program.accessPolicyRef.version,
  );
  const prerequisiteCodes = skill.prerequisiteSkillCodes;
  const priorMastery = await prisma.masteryEstimate.findMany({
    where: {
      learnerProfileId: identity.learnerProfileId,
      skillCode: { in: prerequisiteCodes },
      estimate: { gte: resolvedProfile.minEstimateGate },
    },
    select: { skillCode: true },
  });
  const shadow = buildShadowDecision({
    requestKind: 'start-session',
    targetCode,
    targetVersion,
    activityKind,
    prerequisiteSkillCodes: prerequisiteCodes,
    masteredSkillCodes: new Set(priorMastery.map((record) => record.skillCode)),
    accessPolicy,
    policyProfile: resolvedProfile,
    actualBehavior: 'ALLOWED',
    algorithmVersion: PHASE_1_MASTERY_VERSION,
  });
  await prisma.shadowDecision.create({
    data: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      ...shadow,
      policyProfileHash: policyHash(resolvedProfile),
    },
  });
}

const MAX_ATTEMPT_NUMBER_RETRIES = 10;

async function createAttempt(
  identity: HouseholdIdentity,
  input: {
    sessionId: string;
    learnerResponse: string;
    context: 'PRACTICE' | 'MASTERY_CHECK' | 'DIAGNOSTIC';
    independentDelayedCheck: boolean;
    // A spaced review of already-confirmed mastery: unlike an initial
    // independent check (which only ever adds confirmation), a failed
    // review can revoke a previously confirmed independentDelayedCheck,
    // sending the skill back into ordinary practice. Ordinary attempts
    // must never regress a confirmed skill just because of one lower-
    // assistance slip, so this defaults to false everywhere else.
    reviewDecay?: boolean;
  },
  persistShadow: Phase1ShadowPersistence = persistShadowNonEnforcing,
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
  const correctness = scoreAnswer(content, input.learnerResponse);
  const independentCheckPassed = input.independentDelayedCheck && correctness === 'CORRECT';
  // attemptNumber is derived from a count-then-create, which races under
  // concurrent/duplicate submissions (e.g. a double-clicked submit button).
  // The unique (sessionId, attemptNumber) constraint rejects the collision
  // instead of silently creating two "attempt 1" rows; retry with a fresh
  // count rather than surfacing the race to the learner.
  let attempt;
  for (let remainingRetries = MAX_ATTEMPT_NUMBER_RETRIES; ; remainingRetries -= 1) {
    const attemptNumber =
      (await prisma.attempt.count({ where: { sessionId: input.sessionId } })) + 1;
    try {
      attempt = await prisma.attempt.create({
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
      break;
    } catch (error) {
      if (!isUniqueConstraintViolation(error) || remainingRetries <= 0) throw error;
    }
  }
  if (independentCheckPassed) {
    await prisma.session.update({ where: { id: session.id }, data: { endedAt: new Date() } });
  }
  const activityKind =
    input.context === 'DIAGNOSTIC'
      ? 'PLACEMENT'
      : input.reviewDecay
        ? 'REVIEW'
        : input.independentDelayedCheck
          ? 'DELAYED_CHECK'
          : 'PRACTICE';
  await persistShadow(() =>
    writeShadowDecision(
      identity,
      skillsByCode.get(contentSkillCode(content))?.program ?? DEFAULT_PROGRAM,
      content.id,
      content.version,
      activityKind,
    ),
  );
  if (input.context === 'PRACTICE') {
    await prisma.learningEvent.create({
      data: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        skillCode: contentSkillCode(content),
        skillVersion: '1.0.0',
        contentId: content.id,
        contentVersion: content.version,
        kind: 'INDEPENDENT_PRACTICE_EXPOSURE',
        occurredAt: new Date(),
      },
    });
  }
  const weight = evidenceWeight(correctness, 'INDEPENDENT');
  const existingMastery = await prisma.masteryEstimate.findUnique({
    where: {
      learnerProfileId_skillCode_algorithmVersion: {
        learnerProfileId: identity.learnerProfileId,
        skillCode: contentSkillCode(content),
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    select: { independentDelayedCheck: true },
  });
  const mastery = await upsertMasteryEstimate(
    {
      learnerProfileId_skillCode_algorithmVersion: {
        learnerProfileId: identity.learnerProfileId,
        skillCode: contentSkillCode(content),
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    {
      estimate: weight,
      confidenceBand: confidenceBand(weight),
      independentDelayedCheck: input.reviewDecay
        ? independentCheckPassed
        : existingMastery?.independentDelayedCheck || independentCheckPassed,
    },
    {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      skillCode: contentSkillCode(content),
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
  persistShadow: Phase1ShadowPersistence = persistShadowNonEnforcing,
) {
  return createAttempt(
    identity,
    { ...input, context: 'PRACTICE', independentDelayedCheck: false },
    persistShadow,
  );
}

const DEFAULT_DIAGNOSTIC_MAX_ITEMS = 5;

/**
 * A short, deterministic placement pass: one independent item per root
 * skill (no prerequisites) that this learner has no mastery evidence for
 * yet. Purely derived from current skill/content catalogs and the
 * learner's existing MasteryEstimate rows, so it is safe to call
 * repeatedly (e.g. after a diagnostic attempt) - it never persists a
 * "diagnostic plan" of its own and never alters historical evidence.
 */
export async function getDiagnosticPlan(
  identity: HouseholdIdentity,
  input: { maxItems?: number; program?: CurriculumProgram } = {},
) {
  const catalog = programCatalog(input.program ?? DEFAULT_PROGRAM);
  const maxItems = input.maxItems ?? DEFAULT_DIAGNOSTIC_MAX_ITEMS;
  const masteryRows = await prisma.masteryEstimate.findMany({
    where: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      algorithmVersion: PHASE_1_MASTERY_VERSION,
    },
    select: { skillCode: true },
  });
  const assessedSkillCodes = new Set(masteryRows.map((row) => row.skillCode));

  const contentBySkill = new Map<string, (typeof servableContentCatalog)[number][]>();
  for (const item of catalog.content) {
    const skillCode = contentSkillCode(item);
    const items = contentBySkill.get(skillCode) ?? [];
    items.push(item);
    contentBySkill.set(skillCode, items);
  }

  const items: {
    contentId: string;
    skillCode: string;
    title: string;
    skillTitle: string;
  }[] = [];
  for (const skillCode of topologicalSkillOrder(catalog.skills)) {
    if (items.length >= maxItems) break;
    const skill = skillsByCode.get(skillCode);
    // Only root skills (no prerequisites) are diagnosed directly - a
    // learner's grasp of a dependent skill is assessed through ordinary
    // practice and independent checks once its prerequisites are placed.
    if (!skill || skill.prerequisiteSkillCodes.length > 0) continue;
    if (assessedSkillCodes.has(skillCode)) continue;
    const available = contentBySkill.get(skillCode) ?? [];
    const pick = available.find((item) => item.mode === 'core') ?? available[0];
    if (!pick) continue;
    items.push({
      contentId: pick.id,
      skillCode,
      title: pick.title,
      skillTitle: skill.title,
    });
  }
  return { items };
}

export async function recordDiagnosticAttempt(
  identity: HouseholdIdentity,
  input: { sessionId: string; learnerResponse: string },
  persistShadow: Phase1ShadowPersistence = persistShadowNonEnforcing,
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
  const existingMastery = await prisma.masteryEstimate.findUnique({
    where: {
      learnerProfileId_skillCode_algorithmVersion: {
        learnerProfileId: identity.learnerProfileId,
        skillCode: contentSkillCode(content),
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    select: { id: true },
  });
  // A diagnostic item is a one-shot placement probe: once this skill has
  // any mastery evidence (from a prior diagnostic or from practice), it is
  // no longer "unassessed" and must go through ordinary practice/independent
  // checks rather than being re-probed.
  if (existingMastery) throw new Error('Diagnostic already completed for this skill');
  const result = await createAttempt(
    identity,
    {
      ...input,
      context: 'DIAGNOSTIC',
      independentDelayedCheck: false,
    },
    persistShadow,
  );
  // A diagnostic session is a single independent attempt with no tutoring
  // loop, so it ends as soon as it is answered.
  await prisma.session.update({ where: { id: session.id }, data: { endedAt: new Date() } });
  return result;
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
    sessionId: attempt.sessionId ?? undefined,
    state: states.includes(lastMove as TutorState) ? (lastMove as TutorState) : 'awaiting_attempt',
    priorHintCount: interactions.length,
    attemptNumber: attempt.attemptNumber,
    content: {
      id: content.id,
      prompt: content.prompt,
      skillCode: contentSkillCode(content),
      canonicalAnswer: content.deterministicValidator.canonicalAnswer,
      forbiddenLeakagePatterns: content.forbiddenLeakagePatterns,
    },
  };
}

export async function recordIndependentCheck(
  identity: HouseholdIdentity,
  input: { sessionId: string; learnerResponse: string },
  persistShadow: Phase1ShadowPersistence = persistShadowNonEnforcing,
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
  return createAttempt(
    identity,
    {
      ...input,
      context: 'MASTERY_CHECK',
      independentDelayedCheck: true,
    },
    persistShadow,
  );
}

export const MASTERY_REVIEW_INTERVAL_DAYS = 14;
const DEFAULT_REVIEW_MAX_ITEMS = 5;

/**
 * Skills whose mastery was independently confirmed a while ago and are due
 * for a spaced retrieval check. Purely derived from existing MasteryEstimate
 * rows and the content catalog, so - like the diagnostic plan - it is safe
 * to recompute on every load rather than persisting its own schedule.
 */
export async function getReviewQueue(
  identity: HouseholdIdentity,
  input: { maxItems?: number; program?: CurriculumProgram } = {},
) {
  const catalog = programCatalog(input.program ?? DEFAULT_PROGRAM);
  const maxItems = input.maxItems ?? DEFAULT_REVIEW_MAX_ITEMS;
  const dueBefore = new Date(Date.now() - MASTERY_REVIEW_INTERVAL_DAYS * 24 * 60 * 60 * 1000);
  const dueMastery = await prisma.masteryEstimate.findMany({
    where: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      algorithmVersion: PHASE_1_MASTERY_VERSION,
      independentDelayedCheck: true,
      skillCode: { in: [...catalog.skillCodes] },
      updatedAt: { lte: dueBefore },
    },
    orderBy: { updatedAt: 'asc' },
    take: maxItems,
    select: { skillCode: true, updatedAt: true },
  });

  const contentBySkill = new Map<string, (typeof servableContentCatalog)[number][]>();
  for (const item of catalog.content) {
    const skillCode = contentSkillCode(item);
    const items = contentBySkill.get(skillCode) ?? [];
    items.push(item);
    contentBySkill.set(skillCode, items);
  }

  const items: {
    contentId: string;
    skillCode: string;
    title: string;
    skillTitle: string;
    dueSince: Date;
  }[] = [];
  for (const row of dueMastery) {
    const skill = skillsByCode.get(row.skillCode);
    const available = contentBySkill.get(row.skillCode) ?? [];
    const pick = available.find((item) => item.mode === 'core') ?? available[0];
    if (!skill || !pick) continue;
    items.push({
      contentId: pick.id,
      skillCode: row.skillCode,
      title: pick.title,
      skillTitle: skill.title,
      dueSince: row.updatedAt,
    });
  }
  return { items };
}

export async function recordReviewAttempt(
  identity: HouseholdIdentity,
  input: { sessionId: string; learnerResponse: string },
  persistShadow: Phase1ShadowPersistence = persistShadowNonEnforcing,
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
  const mastery = await prisma.masteryEstimate.findUnique({
    where: {
      learnerProfileId_skillCode_algorithmVersion: {
        learnerProfileId: identity.learnerProfileId,
        skillCode: contentSkillCode(content),
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    },
    select: { independentDelayedCheck: true },
  });
  // Review only applies to a skill whose mastery was already independently
  // confirmed - anything else belongs to ordinary practice or the initial
  // independent check, not a review.
  if (!mastery?.independentDelayedCheck) throw new Error('Review is not available for this skill');
  const result = await createAttempt(
    identity,
    {
      ...input,
      context: 'MASTERY_CHECK',
      independentDelayedCheck: true,
      reviewDecay: true,
    },
    persistShadow,
  );
  // A review is a single one-shot probe with no tutoring loop, so it ends
  // the session whether or not the learner still remembers the skill -
  // unlike recordIndependentCheck's session, which only ends on success.
  await prisma.session.update({ where: { id: session.id }, data: { endedAt: new Date() } });
  return result;
}

export async function recordTutorResponse(
  identity: HouseholdIdentity,
  input: { attemptId?: string; sessionId?: string; response: TutorResponse },
) {
  let sessionId = input.sessionId;
  if (input.attemptId) {
    const attempt = await findAttempt(identity, input.attemptId);
    sessionId ??= attempt.sessionId ?? undefined;
  }
  const metadata = input.response.trace.metadata;
  const trace = await prisma.tutorTrace.create({
    data: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      sessionId,
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
        assistanceEvents: { select: { level: true }, orderBy: { occurredAt: 'asc' } },
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
      highestAssistance: deriveHighestAssistance(assistanceEvents),
    })),
    mastery,
  };
}

export async function getWeeklyDigest(identity: HouseholdIdentity) {
  const evidence = await getParentEvidence(identity);

  const attemptsBySkill = new Map<string, WeeklyDigestAttemptSummary[]>();
  for (const attempt of evidence.attempts) {
    const skillCode = contentSkillCode(resolveContent(attempt.contentKey));
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
  input: { timeBudgetMinutes?: number; program?: CurriculumProgram } = {},
) {
  const catalog = programCatalog(input.program ?? DEFAULT_PROGRAM);
  const program = programsByCode.get(input.program ?? DEFAULT_PROGRAM);
  const profile = loadPolicyArtifacts().profiles.find(
    (candidate) =>
      candidate.code === program?.defaultPolicyProfileRef.code &&
      candidate.version === program?.defaultPolicyProfileRef.version,
  );
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

  const content: PlannerContentItem[] = catalog.content.map((item) => ({
    id: item.id,
    skillCode: contentSkillCode(item),
    mode: item.mode,
    difficulty: item.difficulty,
    contestReadinessRequirement:
      item.mode !== 'core' ? profile?.contestReadinessRequirement : undefined,
  }));
  const skills: PlannerSkill[] = catalog.skills.map((skill) => ({
    code: skill.code,
    prerequisiteSkillCodes: skill.prerequisiteSkillCodes,
  }));

  const plan = planNextActivities({
    skills,
    content,
    masteryBySkillCode,
    timeBudgetMinutes: input.timeBudgetMinutes ?? PHASE_1_DEFAULT_TIME_BUDGET_MINUTES,
  });

  const contentById = new Map(servableContentCatalog.map((item) => [item.id, item]));
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

export type SkillProgressStatus = 'NOT_STARTED' | 'PRACTICING' | 'INDEPENDENTLY_CONFIRMED';

const SKILL_PROGRESS_SUMMARY: Record<SkillProgressStatus, string> = {
  NOT_STARTED: 'Not started yet.',
  PRACTICING: 'Practicing — some evidence recorded, not yet independently confirmed.',
  INDEPENDENTLY_CONFIRMED: 'Independently confirmed on an unassisted check.',
};

const RECENT_STRENGTHS_MAX_ITEMS = 5;

// Learner-facing progress view. Every claim here must be directly traceable
// to a persisted MasteryEstimate or Attempt row - no derived scores, grades,
// or rankings are shown, only qualitative status backed by real evidence.
export async function getLearnerProgress(
  identity: HouseholdIdentity,
  input: { program?: CurriculumProgram } = {},
) {
  const program = input.program ?? DEFAULT_PROGRAM;
  const catalog = programCatalog(program);
  const masteryRows = await prisma.masteryEstimate.findMany({
    where: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      algorithmVersion: PHASE_1_MASTERY_VERSION,
    },
    select: { skillCode: true, independentDelayedCheck: true },
  });
  const masteryBySkillCode = new Map(masteryRows.map((row) => [row.skillCode, row]));

  const skills = catalog.skills.map((skill) => {
    const mastery = masteryBySkillCode.get(skill.code);
    const status: SkillProgressStatus = !mastery
      ? 'NOT_STARTED'
      : mastery.independentDelayedCheck
        ? 'INDEPENDENTLY_CONFIRMED'
        : 'PRACTICING';
    return {
      skillCode: skill.code,
      title: skill.title,
      domain: skill.domain,
      status,
      summary: SKILL_PROGRESS_SUMMARY[status],
    };
  });

  // A "recent strength" is a confirmed independent-check pass - the only
  // event type that is allowed to move a skill's status to confirmed - so
  // every strength shown is traceable to the exact attempt that earned it.
  const confirmingAttempts = await prisma.attempt.findMany({
    where: {
      householdId: identity.householdId,
      learnerProfileId: identity.learnerProfileId,
      context: { in: ['MASTERY_CHECK'] },
      correctness: 'CORRECT',
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, contentKey: true, createdAt: true },
  });
  const seenSkills = new Set<string>();
  const recentStrengths: {
    attemptId: string;
    skillCode: string;
    skillTitle: string;
    achievedAt: Date;
  }[] = [];
  for (const attempt of confirmingAttempts) {
    const skillCode = contentSkillCode(resolveContent(attempt.contentKey));
    if (!catalog.skillCodes.has(skillCode)) continue;
    if (seenSkills.has(skillCode)) continue;
    seenSkills.add(skillCode);
    recentStrengths.push({
      attemptId: attempt.id,
      skillCode,
      skillTitle: skillsByCode.get(skillCode)?.title ?? skillCode,
      achievedAt: attempt.createdAt,
    });
    if (recentStrengths.length >= RECENT_STRENGTHS_MAX_ITEMS) break;
  }

  const plan = await getPlan(identity, { program });
  const nextActivity = plan.items[0]
    ? {
        contentId: plan.items[0].contentId,
        title: plan.items[0].title,
        skillTitle: plan.items[0].skillTitle,
        reason: plan.items[0].reason,
      }
    : null;

  return { skills, recentStrengths, nextActivity };
}

export type Phase1TutorState = TutorState;
