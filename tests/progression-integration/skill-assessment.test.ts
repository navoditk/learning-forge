import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  createInMemoryAssessmentStore,
  type HeldOutAssessmentBank,
} from '../../src/assessment/store';
import { createAssessmentAssignment } from '../../src/progression/assessment-assignment';
import { submitAssessmentItem } from '../../src/progression/assessment-submission';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { policyHash } from '../../src/progression/policy';
import {
  reassessmentLimitsFor,
  skillAssessmentEligibility,
} from '../../src/progression/skill-assessment';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

const skillRef = { code: 'ratio-language', version: '1.0.0' };
// 1.0.0 disables review reuse; 1.1.0 enables it after two runs (D-67).
const noReuseProfileRef = { code: 'grade-6-math-default', version: '1.0.0' };
const reuseProfileRef = { code: 'grade-6-math-default', version: '1.1.0' };
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

const itemKeys = (selected: unknown) =>
  (selected as { id: string; version: string }[]).map(({ id, version }) => `${id}@${version}`);

describe('skill-targeted delayed checks and reviews', () => {
  const delayedBank = syntheticBank('delayed-check', 6);
  const reviewBank = syntheticBank('review', 3);
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
    await prisma.tutorInteraction.deleteMany({ where: { householdId } });
    await prisma.tutorTrace.deleteMany({ where: { householdId } });
    await prisma.attempt.deleteMany({ where: { householdId } });
    await prisma.session.deleteMany({ where: { householdId } });
    await prisma.assessmentRunState.deleteMany({
      where: { assignmentId: { in: assignments.map(({ id }) => id) } },
    });
    await prisma.assessmentAssignment.deleteMany({ where: { householdId } });
    await prisma.learningEvent.deleteMany({ where: { householdId } });
    await prisma.reviewSchedule.deleteMany({ where: { householdId } });
    await prisma.masteryEstimate.deleteMany({ where: { householdId } });
    await prisma.learnerLessonState.deleteMany({ where: { householdId } });
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const eligibility = (
    kind: 'DELAYED_CHECK' | 'REVIEW',
    now = new Date(),
    profileRef = noReuseProfileRef,
  ) =>
    skillAssessmentEligibility(prisma, {
      learnerProfileId,
      kind,
      skillRef,
      profile: resolvePinnedPolicyProfile(profileRef),
      now,
    });

  const exposeAt = (occurredAt: Date, skillCode = skillRef.code) =>
    prisma.learningEvent.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode,
        skillVersion: '1.0.0',
        kind: 'INDEPENDENT_PRACTICE_EXPOSURE',
        occurredAt,
      },
    });

  const createMastery = (independentDelayedCheck: boolean) =>
    prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: skillRef.code,
        estimate: 0.9,
        confidenceBand: 'MEDIUM',
        algorithmVersion: 'mastery-phase-1-1',
        independentDelayedCheck,
      },
    });

  const scheduleReview = (dueAt: Date, lastOutcome = 'CONFIRMED', intervalIndex = 0) =>
    prisma.reviewSchedule.upsert({
      where: {
        learnerProfileId_skillCode_skillVersion: {
          learnerProfileId,
          skillCode: skillRef.code,
          skillVersion: skillRef.version,
        },
      },
      create: {
        householdId,
        learnerProfileId,
        skillCode: skillRef.code,
        skillVersion: skillRef.version,
        dueAt,
        intervalIndex,
        lastOutcome,
        policyProfileCode: reuseProfileRef.code,
        policyProfileVersion: reuseProfileRef.version,
        scheduleVersion: 'fixture',
      },
      update: { dueAt, lastOutcome, intervalIndex },
    });

  const reviewSchedule = () =>
    prisma.reviewSchedule.findFirstOrThrow({
      where: { learnerProfileId, skillCode: skillRef.code },
    });

  /** Backdates every scored result so the reassessment cooldown has passed. */
  const passCooldown = () =>
    prisma.assessmentResult.updateMany({
      where: { householdId },
      data: { scoredAt: new Date(Date.now() - 2 * DAY) },
    });

  async function assignAndAnswer(
    kind: 'DELAYED_CHECK' | 'REVIEW',
    idempotencyKey: string,
    answer: string,
    profileRef = noReuseProfileRef,
  ) {
    const profile = resolvePinnedPolicyProfile(profileRef);
    const bank = kind === 'DELAYED_CHECK' ? delayedBank : reviewBank;
    const allowed = await eligibility(kind, new Date(), profileRef);
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
        ...reassessmentLimitsFor(kind, profile),
        expiresAt: new Date(Date.now() + HOUR),
        idempotencyKey,
      },
      store,
    );
    const session = assignment.sessions[0]!;
    let result;
    for (const { ordinal } of assignment.selectedItems as { ordinal: number }[]) {
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
    return { assignment, outcome: result?.result?.outcome };
  }

  describe('delayed-check eligibility (§9.1–9.2)', () => {
    it('refuses with no exposure, then enforces the delay window boundary', async () => {
      const profile = resolvePinnedPolicyProfile(noReuseProfileRef);
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

    it('ignores exposure to a different skill', async () => {
      await exposeAt(new Date(Date.now() - 3 * DAY));
      await exposeAt(new Date(), 'unit-rates');
      expect((await eligibility('DELAYED_CHECK')).eligible).toBe(true);
    });

    it('resets the window on a later tutor trace for the skill', async () => {
      await exposeAt(new Date(Date.now() - 3 * DAY));
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

    it.each(['MASTERY_CHECK', 'DIAGNOSTIC', 'REVIEW'] as const)(
      'resets the window on a later %s attempt, which is also exposure',
      async (context) => {
        await exposeAt(new Date(Date.now() - 3 * DAY));
        await prisma.attempt.create({
          data: {
            householdId,
            learnerProfileId,
            contentKey: 'ratio-language-1',
            contentVersion: '1.0.0',
            learnerResponse: 'fixture',
            normalizedResponse: 'fixture',
            correctness: 'CORRECT',
            scoringMethod: 'DETERMINISTIC',
            attemptNumber: 1,
            elapsedSeconds: 0,
            highestAssistance: 'INDEPENDENT',
            context,
            policyVersion: 'fixture',
          },
        });
        expect(await eligibility('DELAYED_CHECK')).toEqual({
          eligible: false,
          reasonCode: 'LOCKED_DELAY_WINDOW',
        });
      },
    );
  });

  describe('delayed-check outcomes', () => {
    it('confirms the skill and schedules the first review on a pass', async () => {
      const profile = resolvePinnedPolicyProfile(noReuseProfileRef);
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 2 * DAY));
      const before = Date.now();
      const { outcome } = await assignAndAnswer('DELAYED_CHECK', 'delayed-pass', 'fixture-answer');
      expect(outcome).toBe('PASS');
      const mastery = await prisma.masteryEstimate.findFirstOrThrow({
        where: { learnerProfileId, skillCode: skillRef.code },
      });
      expect(mastery.independentDelayedCheck).toBe(true);
      const schedule = await reviewSchedule();
      expect(schedule).toMatchObject({ intervalIndex: 0, lastOutcome: 'CONFIRMED' });
      const expectedDue = before + profile.spacingIntervalDays[0]! * DAY;
      expect(Math.abs(schedule.dueAt.getTime() - expectedDue)).toBeLessThan(60_000);
    });

    it('refuses a delayed check once the skill is confirmed and not lapsed', async () => {
      await exposeAt(new Date(Date.now() - 2 * DAY));
      await scheduleReview(new Date(Date.now() + 40 * DAY), 'PASSED', 3);
      expect(await eligibility('DELAYED_CHECK')).toEqual({
        eligible: false,
        reasonCode: 'ALREADY_CONFIRMED',
      });
    });

    it('re-confirms after a lapse, restarts the schedule, and clears lapse remediation', async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 2 * DAY));
      await scheduleReview(new Date(), 'LAPSED', 2);
      await prisma.learnerLessonState.create({
        data: {
          householdId,
          learnerProfileId,
          lessonCode: 'ratio-language-lesson',
          lessonVersion: '1.0.0',
          completionStatus: 'COMPLETE',
          remediationStatus: 'ACTIVE',
          policyProfileCode: reuseProfileRef.code,
          policyProfileVersion: reuseProfileRef.version,
        },
      });
      const { outcome } = await assignAndAnswer('DELAYED_CHECK', 'reconfirm', 'fixture-answer');
      expect(outcome).toBe('PASS');
      expect(await reviewSchedule()).toMatchObject({ intervalIndex: 0, lastOutcome: 'CONFIRMED' });
      const lesson = await prisma.learnerLessonState.findFirstOrThrow({
        where: { learnerProfileId, lessonCode: 'ratio-language-lesson' },
      });
      expect(lesson.remediationStatus).toBe('NONE');
    });

    it('never reuses an item from a passed run after a lapse (D-44)', async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 2 * DAY));
      const first = await assignAndAnswer('DELAYED_CHECK', 'reuse-pass', 'fixture-answer');
      expect(first.outcome).toBe('PASS');
      await scheduleReview(new Date(), 'LAPSED', 1);
      const second = await assignAndAnswer('DELAYED_CHECK', 'reuse-after-lapse', 'fixture-answer');
      const firstKeys = new Set(itemKeys(first.assignment.selectedItems));
      expect(itemKeys(second.assignment.selectedItems).some((key) => firstKeys.has(key))).toBe(
        false,
      );
    });

    it('never reuses an item (D-44), lapses on failure, and caps reassessment (D-27)', async () => {
      await createMastery(true);
      await exposeAt(new Date(Date.now() - 2 * DAY));
      const seen = new Set<string>();
      for (const run of [1, 2, 3]) {
        const { assignment, outcome } = await assignAndAnswer(
          'DELAYED_CHECK',
          `delayed-fail-${run}`,
          'wrong',
        );
        expect(outcome).toBe('FAIL');
        for (const key of itemKeys(assignment.selectedItems)) {
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
        await passCooldown();
      }
      const mastery = await prisma.masteryEstimate.findFirstOrThrow({
        where: { learnerProfileId, skillCode: skillRef.code },
      });
      expect(mastery.independentDelayedCheck).toBe(false);
      await expect(
        assignAndAnswer('DELAYED_CHECK', 'delayed-fail-4', 'wrong'),
      ).rejects.toMatchObject({ code: 'MAX_REASSESSMENTS_REACHED' });
    });
  });

  describe('review eligibility and outcomes (§6.8)', () => {
    it('is eligible exactly when the schedule falls due', async () => {
      const now = new Date();
      expect(await eligibility('REVIEW', now)).toEqual({
        eligible: false,
        reasonCode: 'REVIEW_NOT_DUE',
      });
      await scheduleReview(new Date(now.getTime() + 1000));
      expect(await eligibility('REVIEW', now)).toEqual({
        eligible: false,
        reasonCode: 'REVIEW_NOT_DUE',
      });
      await scheduleReview(now);
      expect((await eligibility('REVIEW', now)).eligible).toBe(true);
    });

    it('advances the schedule on a pass', async () => {
      const profile = resolvePinnedPolicyProfile(noReuseProfileRef);
      await scheduleReview(new Date(Date.now() - HOUR));
      const { outcome } = await assignAndAnswer('REVIEW', 'review-pass', 'fixture-answer');
      expect(outcome).toBe('PASS');
      const schedule = await reviewSchedule();
      expect(schedule).toMatchObject({ intervalIndex: 1, lastOutcome: 'PASSED' });
      expect(schedule.dueAt.getTime()).toBeGreaterThan(
        Date.now() + (profile.spacingIntervalDays[1]! - 1) * DAY,
      );
    });

    it('routes a lapse to remediation instead of re-serving review', async () => {
      await createMastery(true);
      await scheduleReview(new Date(Date.now() - HOUR), 'CONFIRMED', 2);
      const { outcome } = await assignAndAnswer('REVIEW', 'review-fail', 'wrong');
      expect(outcome).toBe('FAIL');
      expect(await reviewSchedule()).toMatchObject({ lastOutcome: 'LAPSED', intervalIndex: 2 });
      expect(await eligibility('REVIEW')).toEqual({
        eligible: false,
        reasonCode: 'REVIEW_LAPSED_REMEDIATION',
      });
    });

    it('rotates items, never repeating one from the last two runs (D-67)', async () => {
      const runs: string[][] = [];
      for (const run of [1, 2, 3, 4]) {
        await scheduleReview(new Date(Date.now() - HOUR), 'PASSED', run - 1);
        const { assignment, outcome } = await assignAndAnswer(
          'REVIEW',
          `review-rotate-${run}`,
          'fixture-answer',
          reuseProfileRef,
        );
        expect(outcome).toBe('PASS');
        runs.push(itemKeys(assignment.selectedItems));
      }
      for (let index = 2; index < runs.length; index += 1) {
        const recent = new Set([...runs[index - 1]!, ...runs[index - 2]!]);
        expect(runs[index]!.some((key) => recent.has(key))).toBe(false);
      }
      expect(runs[3]).toEqual(runs[0]);
    });

    it('exhausts the review pool when reuse is disabled', async () => {
      for (const run of [1, 2, 3]) {
        await scheduleReview(new Date(Date.now() - HOUR), 'PASSED', run - 1);
        await assignAndAnswer('REVIEW', `review-noreuse-${run}`, 'fixture-answer');
      }
      await scheduleReview(new Date(Date.now() - HOUR), 'PASSED', 3);
      await expect(
        assignAndAnswer('REVIEW', 'review-noreuse-4', 'fixture-answer'),
      ).rejects.toMatchObject({ code: 'ASSESSMENT_BANK_INSUFFICIENT' });
    });
  });
});
