import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  createInMemoryAssessmentStore,
  type HeldOutAssessmentBank,
} from '../../src/assessment/store';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { submitAssessmentItem } from '../../src/progression/assessment-submission';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { policyHash } from '../../src/progression/policy';
import { skillAssessmentEligibility } from '../../src/progression/skill-assessment';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

const skillRef = { code: 'ratio-language', version: '1.0.0' };
const profileRef = { code: 'grade-6-math-default', version: '1.0.0' };
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Synthetic fixture items only; real held-out items never enter this repository. */
function syntheticBank(kind: 'delayed-check' | 'review', size: number): HeldOutAssessmentBank {
  const bankRef = { code: `fixture-${kind}-bank`, version: '1.0.0' };
  return {
    ...bankRef,
    contentHash: `sha256:fixture-${kind}`,
    items: Array.from({ length: size }, (_, index) => ({
      id: `fixture-${kind}-${index + 1}`,
      version: '1.0.0',
      hash: `sha256:fixture-${kind}-${index + 1}`,
      title: `Fixture ${kind} item ${index + 1}`,
      role: kind === 'review' ? ('review' as const) : ('assessment' as const),
      skillRef,
      mode: 'core' as const,
      difficulty: 'foundational' as const,
      standards: ['6.RP.A.1'],
      observableEvidence: ['States a ratio.'],
      prompt: `Synthetic prompt ${index + 1}`,
      assessmentBankRef: bankRef,
      solutionRepresentation: 'fixture',
      solutionMethod: 'Fixture method.',
      deterministicValidator: {
        type: 'text' as const,
        canonicalAnswer: 'fixture-answer',
        acceptedAnswers: ['fixture-answer'],
        equivalenceNotes: 'Fixture.',
      },
      misconceptionCodes: [],
      forbiddenLeakagePatterns: ['fixture-answer'],
      provenance: { origin: 'original' as const, licenseStatus: 'owned' as const },
      review: {
        status: 'reviewed' as const,
        reviewer: 'fixture',
        reviewedAt: '2026-01-01',
        originalityStatement: 'Fixture.',
      },
      accessibilityNotes: 'Text only.',
      accessibleAlternative: 'Read aloud.',
      itemReadinessRefs: [],
    })),
  };
}

describe('skill-targeted delayed checks and reviews', () => {
  const profile = resolvePinnedPolicyProfile(profileRef);
  const delayedBank = syntheticBank('delayed-check', 6);
  const reviewBank = syntheticBank('review', 2);
  const store = createInMemoryAssessmentStore([delayedBank, reviewBank]);
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
  });

  beforeEach(async () => {
    const assignments = await prisma.assessmentAssignment.findMany({
      where: { householdId },
      select: { id: true },
    });
    await prisma.assessmentResult.deleteMany({ where: { householdId } });
    await prisma.activeAssessmentLease.deleteMany({ where: { householdId } });
    await prisma.attempt.deleteMany({ where: { householdId } });
    await prisma.session.deleteMany({ where: { householdId } });
    await prisma.assessmentRunState.deleteMany({
      where: { assignmentId: { in: assignments.map(({ id }) => id) } },
    });
    await prisma.assessmentAssignment.deleteMany({ where: { householdId } });
    await prisma.learningEvent.deleteMany({ where: { householdId } });
    await prisma.reviewSchedule.deleteMany({ where: { householdId } });
    await prisma.masteryEstimate.deleteMany({ where: { householdId } });
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const eligibility = (kind: 'DELAYED_CHECK' | 'REVIEW', now = new Date()) =>
    skillAssessmentEligibility(prisma, { learnerProfileId, kind, skillRef, profile, now });

  const exposeAt = (occurredAt: Date) =>
    prisma.learningEvent.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: skillRef.code,
        skillVersion: skillRef.version,
        kind: 'INDEPENDENT_PRACTICE_EXPOSURE',
        occurredAt,
      },
    });

  async function assignAndAnswer(
    kind: 'DELAYED_CHECK' | 'REVIEW',
    idempotencyKey: string,
    answer: string,
  ) {
    const bank = kind === 'DELAYED_CHECK' ? delayedBank : reviewBank;
    const allowed = await eligibility(kind);
    if (!allowed.eligible) throw new Error(`not eligible: ${allowed.reasonCode}`);
    const { assignment } = await createAssessmentAssignment(
      {
        householdId,
        learnerProfileId,
        kind,
        targetKind: 'SKILL',
        targetRef: skillRef,
        bankRef: { code: bank.code, version: bank.version },
        policyProfileRef: profileRef,
        policyProfileHash: policyHash(profile),
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: bank.contentHash,
        itemsPerAttempt:
          kind === 'DELAYED_CHECK'
            ? profile.delayedCheckItemsPerAttempt
            : profile.reviewItemsPerAttempt,
        requiredCount:
          kind === 'DELAYED_CHECK'
            ? profile.delayedCheckPassBar.correct
            : profile.reviewPassBar.correct,
        requiredSkillCodes: [skillRef.code],
        previouslySeenItemKeys: allowed.excludedItemKeys,
        expiresAt: new Date(Date.now() + HOUR),
        idempotencyKey,
      },
      store,
    );
    const session = assignment.sessions[0]!;
    let result;
    const items = assignment.selectedItems as { ordinal: number }[];
    for (const { ordinal } of items) {
      result = await submitAssessmentItem(
        {
          householdId,
          learnerProfileId,
          assignmentId: assignment.id,
          sessionId: session.id,
          ordinal,
          learnerResponse: answer,
        },
        store,
      );
    }
    return { assignment, result };
  }

  it('refuses a delayed check with no exposure, then enforces the delay window (§9.2)', async () => {
    expect(await eligibility('DELAYED_CHECK')).toEqual({
      eligible: false,
      reasonCode: 'NO_PRIOR_EXPOSURE',
    });
    const now = new Date();
    await exposeAt(new Date(now.getTime() - (profile.minDelayHours * HOUR - 1000)));
    expect(await eligibility('DELAYED_CHECK', now)).toEqual({
      eligible: false,
      reasonCode: 'LOCKED_DELAY_WINDOW',
    });
    expect((await eligibility('DELAYED_CHECK', new Date(now.getTime() + 1000))).eligible).toBe(
      true,
    );
  });

  it('resets the window when later assistance is given on the skill', async () => {
    await exposeAt(new Date(Date.now() - 3 * DAY));
    expect((await eligibility('DELAYED_CHECK')).eligible).toBe(true);
    const session = await prisma.session.create({
      data: { householdId, learnerProfileId, contentKey: 'ratio-language-1' },
    });
    await prisma.tutorTrace.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: session.id,
        policyVersion: 'fixture',
        promptTemplateVersion: 'fixture',
        modelIdentifier: 'fixture',
        latencyMs: 1,
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
        validationResult: 'VALIDATED',
        outcome: 'MOVE_RETURNED',
      },
    });
    expect(await eligibility('DELAYED_CHECK')).toEqual({
      eligible: false,
      reasonCode: 'LOCKED_DELAY_WINDOW',
    });
  });

  it('confirms the skill and schedules the first review on a passed delayed check', async () => {
    await prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: skillRef.code,
        estimate: 0.8,
        confidenceBand: 'MEDIUM',
        algorithmVersion: 'mastery-phase-1-1',
        independentDelayedCheck: false,
      },
    });
    await exposeAt(new Date(Date.now() - 2 * DAY));
    const before = Date.now();
    const { result } = await assignAndAnswer('DELAYED_CHECK', 'delayed-pass-key', 'fixture-answer');
    expect(result?.result?.outcome).toBe('PASS');
    const mastery = await prisma.masteryEstimate.findFirstOrThrow({
      where: { learnerProfileId, skillCode: skillRef.code },
    });
    expect(mastery.independentDelayedCheck).toBe(true);
    const schedule = await prisma.reviewSchedule.findFirstOrThrow({
      where: { learnerProfileId, skillCode: skillRef.code },
    });
    expect(schedule.intervalIndex).toBe(0);
    expect(schedule.lastOutcome).toBe('CONFIRMED');
    const expectedDue = before + profile.spacingIntervalDays[0]! * DAY;
    expect(Math.abs(schedule.dueAt.getTime() - expectedDue)).toBeLessThan(60_000);
  });

  it('never reuses a delayed-check item (D-44) and lapses on failure', async () => {
    await prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: skillRef.code,
        estimate: 0.9,
        confidenceBand: 'MEDIUM',
        algorithmVersion: 'mastery-phase-1-1',
        independentDelayedCheck: true,
      },
    });
    await exposeAt(new Date(Date.now() - 2 * DAY));
    const first = await assignAndAnswer('DELAYED_CHECK', 'delayed-fail-key-1', 'wrong');
    expect(first.result?.result?.outcome).toBe('FAIL');
    const mastery = await prisma.masteryEstimate.findFirstOrThrow({
      where: { learnerProfileId, skillCode: skillRef.code },
    });
    expect(mastery.independentDelayedCheck).toBe(false);

    const allowed = await eligibility('DELAYED_CHECK');
    if (!allowed.eligible) throw new Error('expected eligibility');
    const firstKeys = (first.assignment.selectedItems as { id: string; version: string }[]).map(
      ({ id, version }) => `${id}@${version}`,
    );
    expect(firstKeys.every((key) => allowed.excludedItemKeys.has(key))).toBe(true);
  });

  it('requires a due schedule for review and advances it on a pass', async () => {
    expect(await eligibility('REVIEW')).toEqual({ eligible: false, reasonCode: 'REVIEW_NOT_DUE' });
    await prisma.reviewSchedule.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: skillRef.code,
        skillVersion: skillRef.version,
        dueAt: new Date(Date.now() + DAY),
        intervalIndex: 0,
        lastOutcome: 'CONFIRMED',
        policyProfileCode: profileRef.code,
        policyProfileVersion: profileRef.version,
        scheduleVersion: 'fixture',
      },
    });
    expect(await eligibility('REVIEW')).toEqual({ eligible: false, reasonCode: 'REVIEW_NOT_DUE' });
    await prisma.reviewSchedule.updateMany({
      where: { learnerProfileId },
      data: { dueAt: new Date(Date.now() - HOUR) },
    });
    const { result } = await assignAndAnswer('REVIEW', 'review-pass-key', 'fixture-answer');
    expect(result?.result?.outcome).toBe('PASS');
    const schedule = await prisma.reviewSchedule.findFirstOrThrow({
      where: { learnerProfileId, skillCode: skillRef.code },
    });
    expect(schedule.intervalIndex).toBe(1);
    expect(schedule.lastOutcome).toBe('PASSED');
    expect(schedule.dueAt.getTime()).toBeGreaterThan(
      Date.now() + (profile.spacingIntervalDays[1]! - 1) * DAY,
    );
  });
});
