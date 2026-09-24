import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  createInMemoryAssessmentStore,
  type HeldOutAssessmentBank,
} from '../../src/assessment/store';
import {
  createAssessmentAssignment,
  settleAssessmentLease,
} from '../../src/progression/assessment-assignment';
import {
  applyDelayedCheckOutcome,
  applyPilotLessonAssessmentOutcome,
} from '../../src/progression/learner-state';
import { recordReviewAttempt, startSession } from '../../src/phase1/service';
import {
  abandonAssessmentRun,
  submitAssessmentItem,
} from '../../src/progression/assessment-submission';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { policyHash } from '../../src/progression/policy';
import {
  isSkillStranded,
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
    await prisma.masteryContribution.deleteMany({ where: { attempt: { householdId } } });
    await prisma.assistanceEvent.deleteMany({ where: { attempt: { householdId } } });
    await prisma.shadowDecision.deleteMany({ where: { householdId } });
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

  /**
   * A practice session on the skill that ended on a passed same-sitting check
   * (D-28). Options vary one filter at a time for falsifying cases.
   */
  const completePractice = async (
    endedAt: Date,
    options: {
      learner?: string;
      activityKind?: 'PRACTICE' | 'REVIEW';
      contentKey?: string;
      passed?: boolean;
      ended?: boolean;
      context?: 'MASTERY_CHECK' | 'REVIEW';
    } = {},
  ) => {
    const session = await prisma.session.create({
      data: {
        householdId,
        learnerProfileId: options.learner ?? learnerProfileId,
        contentKey: options.contentKey ?? 'ratio-language-1',
        activityKind: options.activityKind ?? 'PRACTICE',
        startedAt: new Date(endedAt.getTime() - HOUR),
        endedAt: options.ended === false ? null : endedAt,
      },
    });
    await prisma.attempt.create({
      data: {
        householdId,
        learnerProfileId: options.learner ?? learnerProfileId,
        sessionId: session.id,
        contentKey: options.contentKey ?? 'ratio-language-1',
        contentVersion: '1.0.0',
        learnerResponse: 'fixture',
        normalizedResponse: 'fixture',
        correctness: options.passed === false ? 'INCORRECT' : 'CORRECT',
        scoringMethod: 'DETERMINISTIC',
        attemptNumber: 1,
        elapsedSeconds: 0,
        highestAssistance: 'INDEPENDENT',
        context: options.context ?? 'MASTERY_CHECK',
        policyVersion: 'fixture',
        createdAt: endedAt,
      },
    });
    return session;
  };

  const otherLearner = async () => {
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    return prisma.learnerProfile.create({ data: { householdId, userId: user.id, gradeLevel: 6 } });
  };

  /**
   * A skill-targeted assignment (and, with an outcome, its scored result)
   * recorded directly, to vary lookup filters and consume bank items.
   */
  const recordDelayedCheckResult = async (
    outcome: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | null,
    scoredAt: Date,
    options: {
      learner?: string;
      skillVersion?: string;
      kind?: 'DELAYED_CHECK' | 'REVIEW';
      itemIndexes?: readonly number[];
    } = {},
  ) => {
    const learner = options.learner ?? learnerProfileId;
    const assignment = await prisma.assessmentAssignment.create({
      data: {
        householdId,
        learnerProfileId: learner,
        kind: options.kind ?? 'DELAYED_CHECK',
        targetKind: 'SKILL',
        targetCode: skillRef.code,
        targetVersion: options.skillVersion ?? skillRef.version,
        bankCode: delayedBank.code,
        bankVersion: delayedBank.version,
        policyProfileCode: reuseProfileRef.code,
        policyProfileVersion: reuseProfileRef.version,
        policyProfileHash: 'sha256:fixture',
        algorithmVersion: 'mastery-phase-1-1',
        curriculumSnapshotHash: delayedBank.contentHash,
        selectedItems: (options.itemIndexes ?? []).map((index, ordinal) => ({
          id: delayedBank.items[index]!.id,
          version: delayedBank.items[index]!.version,
          hash: delayedBank.items[index]!.hash,
          ordinal: ordinal + 1,
        })),
        excludedItems: [],
        attemptOrdinal: 1,
        idempotencyKey: randomUUID(),
      },
    });
    if (outcome) {
      await prisma.assessmentResult.create({
        data: {
          householdId,
          learnerProfileId: learner,
          assignmentId: assignment.id,
          outcome,
          itemResults: [],
          correctCount: 0,
          requiredCount: 2,
          algorithmVersion: 'mastery-phase-1-1',
          policyProfileHash: 'sha256:fixture',
          scoredAt,
        },
      });
    }
    return assignment;
  };

  /** Moves any lapse and failure back past the cooldown. */
  const backdateLapse = async () => {
    await prisma.reviewSchedule.updateMany({
      where: { learnerProfileId, lastOutcome: 'LAPSED' },
      data: { dueAt: new Date(Date.now() - 2 * DAY) },
    });
    await passCooldown();
  };

  /** A lapse whose D-28 remediation (cooldown and a practice session) is done. */
  const lapseRemediated = async () => {
    await scheduleReview(new Date(Date.now() - 2 * DAY), 'LAPSED', 1);
    await passCooldown();
    await completePractice(new Date(Date.now() - DAY));
  };

  const lessonState = (
    lessonCode: string,
    completionStatus: 'COMPLETE' | 'IN_PROGRESS',
    remediationStatus: 'ACTIVE' | 'NONE',
  ) =>
    prisma.learnerLessonState.create({
      data: {
        householdId,
        learnerProfileId,
        lessonCode,
        lessonVersion: '1.0.0',
        completionStatus,
        remediationStatus,
        policyProfileCode: reuseProfileRef.code,
        policyProfileVersion: reuseProfileRef.version,
      },
    });

  const lessonRow = (lessonCode: string) =>
    prisma.learnerLessonState.findFirstOrThrow({ where: { learnerProfileId, lessonCode } });

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

    it('re-confirms after remediation, restarts the schedule, and clears lapse remediation', async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      await lapseRemediated();
      await lessonState('ratio-language-lesson', 'COMPLETE', 'ACTIVE');
      const { outcome } = await assignAndAnswer('DELAYED_CHECK', 'reconfirm', 'fixture-answer');
      expect(outcome).toBe('PASS');
      expect(await reviewSchedule()).toMatchObject({ intervalIndex: 0, lastOutcome: 'CONFIRMED' });
      expect((await lessonRow('ratio-language-lesson')).remediationStatus).toBe('NONE');
    });

    it('leaves remediation from an incomplete lesson for its own reassessment', async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      await lapseRemediated();
      await lessonState('ratio-language-lesson', 'IN_PROGRESS', 'ACTIVE');
      await assignAndAnswer('DELAYED_CHECK', 'reconfirm-incomplete', 'fixture-answer');
      expect((await lessonRow('ratio-language-lesson')).remediationStatus).toBe('ACTIVE');
    });

    it('gates re-confirmation after a lapse on the D-28 cooldown and a practice session', async () => {
      const profile = resolvePinnedPolicyProfile(reuseProfileRef);
      await createMastery(true);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      await scheduleReview(new Date(Date.now() - HOUR), 'CONFIRMED', 1);
      expect(
        (await assignAndAnswer('REVIEW', 'lapse-review', 'wrong', reuseProfileRef)).outcome,
      ).toBe('FAIL');
      expect(await eligibility('DELAYED_CHECK', new Date(), reuseProfileRef)).toEqual({
        eligible: false,
        reasonCode: 'REASSESSMENT_COOLDOWN',
      });
      const afterCooldown = new Date(Date.now() + profile.reassessmentCooldownHours * HOUR + 1000);
      expect(await eligibility('DELAYED_CHECK', afterCooldown, reuseProfileRef)).toEqual({
        eligible: false,
        reasonCode: 'REMEDIATION_PRACTICE_REQUIRED',
      });
      // The practice is itself exposure, so the delay window restarts from it.
      await completePractice(new Date(Date.now() + 1000));
      const afterPracticeDelay = new Date(Date.now() + profile.minDelayHours * HOUR + 2000);
      expect(
        (await eligibility('DELAYED_CHECK', afterPracticeDelay, reuseProfileRef)).eligible,
      ).toBe(true);
    });

    it('never reuses a delayed-check item under the production profile (D-44)', async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      const seen = new Set<string>();
      for (const run of [1, 2, 3]) {
        if (run > 1) await lapseRemediated();
        const { assignment, outcome } = await assignAndAnswer(
          'DELAYED_CHECK',
          `reuse-pass-${run}`,
          'fixture-answer',
          reuseProfileRef,
        );
        expect(outcome).toBe('PASS');
        for (const key of itemKeys(assignment.selectedItems)) {
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      }
      // Passing checks never mark NEEDS_HELP, even with the bank used up.
      expect(
        await prisma.learnerLessonState.count({
          where: { learnerProfileId, remediationStatus: 'NEEDS_HELP' },
        }),
      ).toBe(0);
    });

    it('records NEEDS_HELP once lapses exhaust the delayed-check bank (D-69)', async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      for (const run of [1, 2, 3]) {
        if (run > 1) await lapseRemediated();
        await assignAndAnswer('DELAYED_CHECK', `exhaust-${run}`, 'fixture-answer', reuseProfileRef);
      }
      await scheduleReview(new Date(Date.now() - HOUR), 'PASSED', 1);
      await assignAndAnswer('REVIEW', 'exhaust-review', 'wrong', reuseProfileRef);
      for (const lesson of ['ratio-language-lesson']) {
        expect((await lessonRow(lesson)).remediationStatus).toBe('NEEDS_HELP');
      }
      await backdateLapse();
      await completePractice(new Date());
      expect(await eligibility('DELAYED_CHECK', new Date(), reuseProfileRef)).toEqual({
        eligible: false,
        reasonCode: 'NEEDS_HELP',
      });
    });

    it('never reuses an item (D-44), lapses on failure, and caps reassessment (D-27, D-69)', async () => {
      await createMastery(true);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      const seen = new Set<string>();
      for (const run of [1, 2, 3]) {
        if (run > 1) {
          await passCooldown();
          await completePractice(new Date(Date.now() - DAY));
        }
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
      }
      const mastery = await prisma.masteryEstimate.findFirstOrThrow({
        where: { learnerProfileId, skillCode: skillRef.code },
      });
      expect(mastery.independentDelayedCheck).toBe(false);
      expect((await lessonRow('ratio-language-lesson')).remediationStatus).toBe('NEEDS_HELP');
      expect(await eligibility('DELAYED_CHECK')).toEqual({
        eligible: false,
        reasonCode: 'NEEDS_HELP',
      });
    });

    it("ignores another learner's attempts on the same skill", async () => {
      await exposeAt(new Date(Date.now() - 3 * DAY));
      const otherUser = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
      const other = await prisma.learnerProfile.create({
        data: { householdId, userId: otherUser.id, gradeLevel: 6 },
      });
      await prisma.attempt.create({
        data: {
          householdId,
          learnerProfileId: other.id,
          contentKey: 'ratio-language-1',
          contentVersion: '1.0.0',
          learnerResponse: 'fixture',
          normalizedResponse: 'fixture',
          correctness: 'CORRECT',
          scoringMethod: 'DETERMINISTIC',
          attemptNumber: 1,
          elapsedSeconds: 0,
          highestAssistance: 'INDEPENDENT',
          context: 'PRACTICE',
          policyVersion: 'fixture',
        },
      });
      expect((await eligibility('DELAYED_CHECK')).eligible).toBe(true);
    });
  });

  describe('D-28 re-entry gate and D-69 stranding filters', () => {
    // One fixed lapse time per test, so "exactly at the lapse" is exact.
    let lapseTime: Date;
    const lapsedAt = () => lapseTime;
    const eligibleLater = () => eligibility('DELAYED_CHECK', new Date(), reuseProfileRef);

    beforeEach(async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      lapseTime = new Date(Date.now() - 2 * DAY);
      await scheduleReview(lapseTime, 'LAPSED', 1);
    });

    it('requires a practice session after remediation began', async () => {
      expect(await eligibleLater()).toEqual({
        eligible: false,
        reasonCode: 'REMEDIATION_PRACTICE_REQUIRED',
      });
      await completePractice(new Date(Date.now() - DAY));
      expect((await eligibleLater()).eligible).toBe(true);
    });

    it.each([
      ['ended before the lapse', { ended: true }, -HOUR],
      ['ended exactly at the lapse', { ended: true }, 0],
      ['still open', { ended: false }, HOUR],
      ['a review session', { activityKind: 'REVIEW' as const }, HOUR],
      ['on another skill', { contentKey: 'unit-rates-1' }, HOUR],
      ['ended without a passed check', { passed: false }, HOUR],
    ])('does not count a practice session %s', async (_label, options, offsetFromLapse) => {
      await completePractice(new Date(lapsedAt().getTime() + offsetFromLapse), options);
      expect(await eligibleLater()).toEqual({
        eligible: false,
        reasonCode: 'REMEDIATION_PRACTICE_REQUIRED',
      });
    });

    it("does not count another learner's practice session", async () => {
      const other = await otherLearner();
      await completePractice(new Date(Date.now() - DAY), { learner: other.id });
      expect(await eligibleLater()).toMatchObject({ reasonCode: 'REMEDIATION_PRACTICE_REQUIRED' });
    });

    it('enforces the cooldown up to its exact boundary', async () => {
      const profile = resolvePinnedPolicyProfile(reuseProfileRef);
      const boundary =
        (await reviewSchedule()).dueAt.getTime() + profile.reassessmentCooldownHours * HOUR;
      expect(await eligibility('DELAYED_CHECK', new Date(boundary - 1), reuseProfileRef)).toEqual({
        eligible: false,
        reasonCode: 'REASSESSMENT_COOLDOWN',
      });
      expect(await eligibility('DELAYED_CHECK', new Date(boundary), reuseProfileRef)).toMatchObject(
        { reasonCode: 'REMEDIATION_PRACTICE_REQUIRED' },
      );
    });

    it('starts remediation at the later of the lapse and a failed delayed check', async () => {
      await completePractice(new Date(Date.now() - DAY));
      await recordDelayedCheckResult('FAIL', new Date(Date.now() - HOUR));
      expect(await eligibleLater()).toEqual({
        eligible: false,
        reasonCode: 'REASSESSMENT_COOLDOWN',
      });
    });

    it('starts remediation at a failed delayed check even without a lapse', async () => {
      await prisma.reviewSchedule.deleteMany({ where: { householdId } });
      await recordDelayedCheckResult('FAIL', new Date(Date.now() - 2 * DAY));
      expect(await eligibleLater()).toEqual({
        eligible: false,
        reasonCode: 'REMEDIATION_PRACTICE_REQUIRED',
      });
    });

    it.each([
      ['a passed check', 'PASS' as const, {}],
      ["another learner's failure", 'FAIL' as const, { learner: 'other' }],
      ['a failure on another skill version', 'FAIL' as const, { skillVersion: '2.0.0' }],
    ])('ignores %s when finding remediation start', async (_label, outcome, rawOptions) => {
      const options = rawOptions as { learner?: string; skillVersion?: string };
      await completePractice(new Date(Date.now() - DAY));
      const learner = options.learner === 'other' ? (await otherLearner()).id : undefined;
      await recordDelayedCheckResult(outcome, new Date(Date.now() - HOUR), {
        learner,
        skillVersion: options.skillVersion,
      });
      expect((await eligibleLater()).eligible).toBe(true);
    });

    it("ignores another learner's NEEDS_HELP", async () => {
      await completePractice(new Date(Date.now() - DAY));
      const other = await otherLearner();
      await prisma.learnerLessonState.create({
        data: {
          householdId,
          learnerProfileId: other.id,
          lessonCode: 'ratio-language-lesson',
          lessonVersion: '1.0.0',
          completionStatus: 'COMPLETE',
          remediationStatus: 'NEEDS_HELP',
          policyProfileCode: reuseProfileRef.code,
          policyProfileVersion: reuseProfileRef.version,
        },
      });
      expect((await eligibleLater()).eligible).toBe(true);
    });

    it("ignores another learner's assistance and tutor moves on the skill", async () => {
      await completePractice(new Date(Date.now() - DAY));
      const other = await otherLearner();
      const attempt = await prisma.attempt.create({
        data: {
          householdId,
          learnerProfileId: other.id,
          contentKey: 'ratio-language-1',
          contentVersion: '1.0.0',
          learnerResponse: 'fixture',
          normalizedResponse: 'fixture',
          correctness: 'INCORRECT',
          scoringMethod: 'DETERMINISTIC',
          attemptNumber: 1,
          elapsedSeconds: 0,
          highestAssistance: 'SMALL_STRATEGIC_HINT',
          context: 'PRACTICE',
          policyVersion: 'fixture',
          assistanceEvents: { create: { level: 'SMALL_STRATEGIC_HINT', interactionType: 'HINT' } },
        },
      });
      await prisma.tutorInteraction.create({
        data: {
          householdId,
          learnerProfileId: other.id,
          attemptId: attempt.id,
          moveType: 'hint',
          assistanceLevel: 'SMALL_STRATEGIC_HINT',
          policyVersion: 'fixture',
        },
      });
      expect((await eligibleLater()).eligible).toBe(true);
    });

    it('records NEEDS_HELP when abandoned runs exhaust the bank after a failure (D-69)', async () => {
      await prisma.reviewSchedule.deleteMany({ where: { householdId } });
      const first = await assignAndAnswer(
        'DELAYED_CHECK',
        'abandon-fail',
        'wrong',
        reuseProfileRef,
      );
      expect(first.outcome).toBe('FAIL');
      await passCooldown();
      await completePractice(new Date(Date.now() - DAY));
      for (const run of [1, 2]) {
        const allowed = await eligibleLater();
        if (!allowed.eligible) throw new Error(`not eligible: ${allowed.reasonCode}`);
        const profile = resolvePinnedPolicyProfile(reuseProfileRef);
        const { assignment } = await createAssessmentAssignment(
          {
            householdId,
            learnerProfileId,
            kind: 'DELAYED_CHECK',
            targetKind: 'SKILL',
            targetRef: skillRef,
            bankRef: { code: delayedBank.code, version: delayedBank.version },
            policyProfileRef: reuseProfileRef,
            policyProfileHash: policyHash(profile),
            algorithmVersion: 'mastery-phase-1-1',
            curriculumSnapshotHash: delayedBank.contentHash,
            itemsPerAttempt: profile.delayedCheckItemsPerAttempt,
            requiredCount: profile.delayedCheckPassBar.correct,
            requiredSkillCodes: [skillRef.code],
            previouslySeenItemKeys: allowed.excludedItemKeys,
            expiresAt: new Date(Date.now() + HOUR),
            idempotencyKey: `abandon-${run}`,
          },
          store,
        );
        await abandonAssessmentRun({ householdId, learnerProfileId, assignmentId: assignment.id });
      }
      expect((await lessonRow('ratio-language-lesson')).remediationStatus).toBe('NEEDS_HELP');
      expect(await eligibleLater()).toEqual({ eligible: false, reasonCode: 'NEEDS_HELP' });
    });
  });

  describe('D-69 stranding predicate and records', () => {
    const profile11 = () => resolvePinnedPolicyProfile(reuseProfileRef);
    const stranded = (profile = profile11(), learner = learnerProfileId) =>
      isSkillStranded(prisma, { learnerProfileId: learner, skillRef, profile });
    const needsHelpRows = () =>
      prisma.learnerLessonState.count({
        where: { learnerProfileId, remediationStatus: 'NEEDS_HELP' },
      });

    beforeEach(async () => {
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 3 * DAY));
    });

    it('refuses a stranded skill before any record exists', async () => {
      await recordDelayedCheckResult('FAIL', new Date(Date.now() - 2 * DAY), {
        itemIndexes: [0, 1],
      });
      await recordDelayedCheckResult(null, new Date(), { itemIndexes: [2, 3, 4, 5] });
      expect(await needsHelpRows()).toBe(0);
      expect(await eligibility('DELAYED_CHECK', new Date(), reuseProfileRef)).toEqual({
        eligible: false,
        reasonCode: 'NEEDS_HELP',
      });
    });

    it('is never stranded by exhaustion when delayed-check reuse is enabled', async () => {
      await recordDelayedCheckResult('FAIL', new Date(Date.now() - 2 * DAY), {
        itemIndexes: [0, 1, 2, 3, 4, 5],
      });
      const reuse = {
        ...profile11(),
        delayedCheckReuse: { enabled: true as const, minIntervalsSinceSeen: 2 },
      };
      expect(await stranded(reuse)).toBe(false);
      expect(await stranded()).toBe(true);
    });

    it('counts only consecutive FAILs for this learner since the latest pass', async () => {
      const at = (hoursAgo: number) => new Date(Date.now() - hoursAgo * HOUR);
      for (const hoursAgo of [60, 50, 40]) await recordDelayedCheckResult('FAIL', at(hoursAgo));
      await recordDelayedCheckResult('PASS', at(30));
      expect(await stranded()).toBe(false);
      await recordDelayedCheckResult('FAIL', at(20));
      await recordDelayedCheckResult('INCONCLUSIVE', at(15));
      await recordDelayedCheckResult('INCONCLUSIVE', at(14));
      await recordDelayedCheckResult('FAIL', at(10));
      expect(await stranded()).toBe(false);
      const other = await otherLearner();
      for (const hoursAgo of [9, 8, 7]) {
        await recordDelayedCheckResult('FAIL', at(hoursAgo), { learner: other.id });
      }
      expect(await stranded()).toBe(false);
      await recordDelayedCheckResult('FAIL', at(5));
      expect(await stranded()).toBe(true);
    });

    it('records NEEDS_HELP when a stale run is expired before eligibility', async () => {
      await recordDelayedCheckResult('FAIL', new Date(Date.now() - 2 * DAY), {
        itemIndexes: [0, 1],
      });
      await recordDelayedCheckResult('INCONCLUSIVE', new Date(Date.now() - DAY), {
        itemIndexes: [2, 3],
      });
      const profile = profile11();
      const stale = await createAssessmentAssignment(
        {
          householdId,
          learnerProfileId,
          kind: 'DELAYED_CHECK',
          targetKind: 'SKILL',
          targetRef: skillRef,
          bankRef: { code: delayedBank.code, version: delayedBank.version },
          policyProfileRef: reuseProfileRef,
          policyProfileHash: policyHash(profile),
          algorithmVersion: 'mastery-phase-1-1',
          curriculumSnapshotHash: delayedBank.contentHash,
          itemsPerAttempt: profile.delayedCheckItemsPerAttempt,
          requiredCount: profile.delayedCheckPassBar.correct,
          requiredSkillCodes: [skillRef.code],
          previouslySeenItemKeys: new Set(
            [0, 1, 2, 3].map(
              (index) => `${delayedBank.items[index]!.id}@${delayedBank.items[index]!.version}`,
            ),
          ),
          expiresAt: new Date(Date.now() + HOUR),
          idempotencyKey: 'stale-run',
        },
        store,
      );
      expect(
        await settleAssessmentLease(prisma, {
          learnerProfileId,
          kind: 'DELAYED_CHECK',
          targetRef: skillRef,
          now: new Date(),
        }),
      ).toEqual({ active: true });
      expect(
        await settleAssessmentLease(prisma, {
          learnerProfileId,
          kind: 'DELAYED_CHECK',
          targetRef: skillRef,
          now: new Date(Date.now() + 2 * HOUR),
        }),
      ).toEqual({ active: false });
      expect(
        (
          await prisma.assessmentRunState.findFirstOrThrow({
            where: { assignmentId: stale.assignment.id },
          })
        ).status,
      ).toBe('EXPIRED');
      expect((await lessonRow('ratio-language-lesson')).remediationStatus).toBe('NEEDS_HELP');
    });

    it('does not mark NEEDS_HELP when the last check passes', async () => {
      const fail = await assignAndAnswer('DELAYED_CHECK', 'p19-fail', 'wrong', reuseProfileRef);
      expect(fail.outcome).toBe('FAIL');
      await recordDelayedCheckResult('INCONCLUSIVE', new Date(Date.now() - DAY), {
        itemIndexes: delayedBank.items
          .map((_, index) => index)
          .filter(
            (index) =>
              !itemKeys(fail.assignment.selectedItems).includes(
                `${delayedBank.items[index]!.id}@${delayedBank.items[index]!.version}`,
              ),
          )
          .slice(0, 2),
      });
      await passCooldown();
      await completePractice(new Date(Date.now() - DAY));
      const pass = await assignAndAnswer(
        'DELAYED_CHECK',
        'p19-pass',
        'fixture-answer',
        reuseProfileRef,
      );
      expect(pass.outcome).toBe('PASS');
      expect(await needsHelpRows()).toBe(0);
    });

    it('keeps NEEDS_HELP through a lesson pass and a delayed-check pass', async () => {
      await lessonState('ratio-language-lesson', 'COMPLETE', 'NONE');
      await prisma.learnerLessonState.updateMany({
        where: { learnerProfileId },
        data: { remediationStatus: 'NEEDS_HELP' },
      });
      await prisma.$transaction(async (transaction) => {
        await applyPilotLessonAssessmentOutcome(transaction, {
          householdId,
          learnerProfileId,
          lessonCode: 'ratio-language-lesson',
          lessonVersion: '1.0.0',
          policyProfileCode: reuseProfileRef.code,
          policyProfileVersion: reuseProfileRef.version,
          outcome: 'PASS',
          firstRun: false,
          assessmentRunId: randomUUID(),
          now: new Date(),
        });
        await applyDelayedCheckOutcome(transaction, {
          householdId,
          learnerProfileId,
          skillRef,
          algorithmVersion: 'mastery-phase-1-1',
          policyProfileCode: reuseProfileRef.code,
          policyProfileVersion: reuseProfileRef.version,
          spacingIntervalDays: [3],
          now: new Date(),
          outcome: 'PASS',
        });
      });
      expect((await lessonRow('ratio-language-lesson')).remediationStatus).toBe('NEEDS_HELP');
    });

    it('does not count practice whose passed attempt was not a same-sitting check', async () => {
      await scheduleReview(new Date(Date.now() - 2 * DAY), 'LAPSED', 1);
      await completePractice(new Date(Date.now() - DAY), { context: 'REVIEW' });
      expect(await eligibility('DELAYED_CHECK', new Date(), reuseProfileRef)).toMatchObject({
        reasonCode: 'REMEDIATION_PRACTICE_REQUIRED',
      });
    });

    it('ignores a failed review result when finding remediation start', async () => {
      await scheduleReview(new Date(Date.now() - 2 * DAY), 'LAPSED', 1);
      await completePractice(new Date(Date.now() - DAY));
      await recordDelayedCheckResult('FAIL', new Date(Date.now() - HOUR), { kind: 'REVIEW' });
      expect((await eligibility('DELAYED_CHECK', new Date(), reuseProfileRef)).eligible).toBe(true);
    });

    it("ignores another learner's tutor traces on the skill", async () => {
      const other = await otherLearner();
      const session = await prisma.session.create({
        data: { householdId, learnerProfileId: other.id, contentKey: 'ratio-language-1' },
      });
      await prisma.tutorTrace.create({
        data: {
          householdId,
          learnerProfileId: other.id,
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
      expect((await eligibility('DELAYED_CHECK', new Date(), reuseProfileRef)).eligible).toBe(true);
    });

    it('records NEEDS_HELP when a Phase 1 review lapse strands a pilot skill', async () => {
      await prisma.masteryEstimate.updateMany({
        where: { learnerProfileId },
        data: { independentDelayedCheck: true },
      });
      await scheduleReview(new Date(Date.now() - HOUR), 'CONFIRMED', 1);
      await recordDelayedCheckResult('FAIL', new Date(Date.now() - 3 * DAY), {
        itemIndexes: [0, 1],
      });
      await recordDelayedCheckResult('PASS', new Date(Date.now() - 2 * DAY), {
        itemIndexes: [2, 3, 4, 5],
      });
      const session = await startSession(
        { householdId, learnerProfileId },
        { contentId: 'ratio-language-1', activityKind: 'REVIEW' },
      );
      await recordReviewAttempt(
        { householdId, learnerProfileId },
        { sessionId: session.sessionId, learnerResponse: 'not the answer' },
      );
      expect((await lessonRow('ratio-language-lesson')).remediationStatus).toBe('NEEDS_HELP');
    });
  });

  describe('first-time delayed checks (outside D-69)', () => {
    it('exhausts without reuse under the production profile when runs are abandoned', async () => {
      const profile = resolvePinnedPolicyProfile(reuseProfileRef);
      await createMastery(false);
      await exposeAt(new Date(Date.now() - 3 * DAY));
      const createRun = async (run: number) => {
        const allowed = await eligibility('DELAYED_CHECK', new Date(), reuseProfileRef);
        if (!allowed.eligible) throw new Error(`not eligible: ${allowed.reasonCode}`);
        return createAssessmentAssignment(
          {
            householdId,
            learnerProfileId,
            kind: 'DELAYED_CHECK',
            targetKind: 'SKILL',
            targetRef: skillRef,
            bankRef: { code: delayedBank.code, version: delayedBank.version },
            policyProfileRef: reuseProfileRef,
            policyProfileHash: policyHash(profile),
            algorithmVersion: 'mastery-phase-1-1',
            curriculumSnapshotHash: delayedBank.contentHash,
            itemsPerAttempt: profile.delayedCheckItemsPerAttempt,
            requiredCount: profile.delayedCheckPassBar.correct,
            requiredSkillCodes: [skillRef.code],
            previouslySeenItemKeys: allowed.excludedItemKeys,
            expiresAt: new Date(Date.now() + HOUR),
            idempotencyKey: `first-time-${run}`,
          },
          store,
        );
      };
      for (const run of [1, 2, 3]) {
        const { assignment } = await createRun(run);
        await abandonAssessmentRun({ householdId, learnerProfileId, assignmentId: assignment.id });
      }
      await expect(createRun(4)).rejects.toMatchObject({ code: 'ASSESSMENT_BANK_INSUFFICIENT' });
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
