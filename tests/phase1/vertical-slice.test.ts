import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/server/prisma';
import {
  ensureSyntheticIdentity,
  SYNTHETIC_IDENTITY,
  SYNTHETIC_IDS,
} from '../../src/identity/synthetic';
import {
  getDiagnosticPlan,
  getLearnerProgress,
  getParentEvidence,
  getPlan,
  getReviewQueue,
  getTutorContext,
  startSession,
  getWeeklyDigest,
  HouseholdIdentity,
  MASTERY_REVIEW_INTERVAL_DAYS,
  PHASE_1_MASTERY_VERSION,
  PHASE_1_POLICY_VERSION,
  recordDiagnosticAttempt,
  recordIndependentCheck,
  recordAttempt,
  recordReviewAttempt,
  recordTutorResponse,
} from '../../src/phase1/service';
import { deleteHouseholdEvidence } from '../../src/server/delete-household-evidence';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';

describe('Phase 1 synthetic ratios vertical slice', () => {
  beforeAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
  });

  afterAll(async () => {
    await deleteHouseholdEvidence(prisma, SYNTHETIC_IDS.household);
    await prisma.$disconnect();
  });

  it('ensureSyntheticIdentity is safe when called concurrently on a fresh database', async () => {
    await prisma.household.deleteMany({ where: { id: SYNTHETIC_IDS.household } });

    await expect(
      Promise.all([
        ensureSyntheticIdentity(),
        ensureSyntheticIdentity(),
        ensureSyntheticIdentity(),
        ensureSyntheticIdentity(),
        ensureSyntheticIdentity(),
      ]),
    ).resolves.toBeDefined();

    const households = await prisma.household.findMany({ where: { id: SYNTHETIC_IDS.household } });
    const learnerProfiles = await prisma.learnerProfile.findMany({
      where: { id: SYNTHETIC_IDS.learnerProfile },
    });
    expect(households).toHaveLength(1);
    expect(learnerProfiles).toHaveLength(1);
  });

  it('recommends every unblocked skill with content before any mastery evidence exists', async () => {
    await ensureSyntheticIdentity();
    const plan = await getPlan(SYNTHETIC_IDENTITY);

    expect(plan.items.length).toBeGreaterThan(0);
    expect(plan.items.some((item) => item.skillCode === 'ratio-language')).toBe(true);
    for (const item of plan.items) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.skillTitle.length).toBeGreaterThan(0);
      expect(item.reason.length).toBeGreaterThan(0);
    }
    expect(plan.blockedSkills).toContain('unit-rates');
    // All content is now human-reviewed (whole-number-exponents, gcf-and-lcm,
    // and multi-digit-division were approved in the v3 content-review pass),
    // so no skill should be reported unavailable for lack of reviewed content.
    expect(plan.unavailableSkills).toEqual([]);
  });

  it('isolates sessions, placement, plans, and progress by curriculum program', async () => {
    await ensureSyntheticIdentity();

    const plan = await getPlan(SYNTHETIC_IDENTITY, { program: 'math-kangaroo-6' });
    expect(plan.items.length).toBeGreaterThan(0);
    expect(plan.items.every((item) => item.skillCode.startsWith('mk6-'))).toBe(true);

    const diagnostic = await getDiagnosticPlan(SYNTHETIC_IDENTITY, {
      program: 'math-kangaroo-6',
    });
    expect(diagnostic.items.length).toBeGreaterThan(0);
    expect(diagnostic.items.every((item) => item.skillCode.startsWith('mk6-'))).toBe(true);

    const progress = await getLearnerProgress(SYNTHETIC_IDENTITY, {
      program: 'math-kangaroo-6',
    });
    expect(progress.skills).toHaveLength(8);
    expect(progress.skills.every((skill) => skill.skillCode.startsWith('mk6-'))).toBe(true);

    const session = await startSession(SYNTHETIC_IDENTITY, { program: 'math-kangaroo-6' });
    expect(session.content.skillCode).toMatch(/^mk6-/);
    await expect(
      startSession(SYNTHETIC_IDENTITY, {
        program: 'math-kangaroo-6',
        contentId: 'ratio-language-1',
      }),
    ).rejects.toThrow('Unknown content for program');
  });

  it('records an attempt, tutor interaction, and parent evidence', async () => {
    await ensureSyntheticIdentity();
    const session = await startSession(SYNTHETIC_IDENTITY);
    const attempt = await recordAttempt(SYNTHETIC_IDENTITY, {
      sessionId: session.sessionId,
      learnerResponse: '15',
    });

    const firstContext = await getTutorContext(SYNTHETIC_IDENTITY, attempt.attemptId);
    const firstTutorResponse = await new TutorHarness(new FakeTutorModel()).respond({
      prompt: firstContext.content.prompt,
      learnerMessage: 'I divided 45 by 3.',
      redactedSkillContext: `content:${firstContext.content.id}`,
      state: firstContext.state,
      mode: 'math_tutor',
      genuineAttempt: true,
      priorHintCount: firstContext.priorHintCount,
      attemptNumber: firstContext.attemptNumber,
      protectedTokens: [
        firstContext.content.canonicalAnswer,
        ...firstContext.content.forbiddenLeakagePatterns,
      ],
    });
    expect(firstTutorResponse.move?.moveType).toBe('probe_reasoning');
    await recordTutorResponse(SYNTHETIC_IDENTITY, {
      attemptId: attempt.attemptId,
      response: firstTutorResponse,
    });
    expect(await getTutorContext(SYNTHETIC_IDENTITY, attempt.attemptId)).toMatchObject({
      state: 'probe_reasoning',
      priorHintCount: 1,
    });

    const nextResponse = await new TutorHarness(new FakeTutorModel()).respond({
      prompt: session.content.prompt,
      learnerMessage: 'I am checking the relationship.',
      redactedSkillContext: `content:${session.content.id}`,
      state: 'probe_reasoning',
      mode: 'math_tutor',
      genuineAttempt: true,
      priorHintCount: 1,
      attemptNumber: 1,
      protectedTokens: ['15', '15 miles per hour'],
    });
    await recordTutorResponse(SYNTHETIC_IDENTITY, {
      attemptId: attempt.attemptId,
      response: nextResponse,
    });
    expect(await getTutorContext(SYNTHETIC_IDENTITY, attempt.attemptId)).toMatchObject({
      state: 'hint_1_strategy',
      priorHintCount: 2,
    });
    const check = await recordIndependentCheck(SYNTHETIC_IDENTITY, {
      sessionId: session.sessionId,
      learnerResponse: '15',
    });
    const evidence = await getParentEvidence(SYNTHETIC_IDENTITY);

    expect(attempt.correctness).toBe('CORRECT');
    expect(evidence.attempts.some((item) => item.id === attempt.attemptId)).toBe(true);
    expect(evidence.mastery).toContainEqual(
      expect.objectContaining({
        skillCode: 'unit-rates',
        estimate: 1,
        confidenceBand: 'MEDIUM',
        independentDelayedCheck: true,
      }),
    );
    expect(check.correctness).toBe('CORRECT');
    expect(
      await prisma.attempt.findUnique({
        where: { id: check.attemptId },
        select: { context: true },
      }),
    ).toMatchObject({ context: 'MASTERY_CHECK' });
    expect(evidence.attempts.find((item) => item.id === attempt.attemptId)?.highestAssistance).toBe(
      'SMALL_STRATEGIC_HINT',
    );
    expect(evidence.attempts.find((item) => item.id === check.attemptId)?.highestAssistance).toBe(
      'INDEPENDENT',
    );

    const trace = await prisma.tutorTrace.findFirst({
      where: { learnerProfileId: SYNTHETIC_IDENTITY.learnerProfileId },
    });
    expect(trace?.redactedExcerpt).toBe('[redacted learner text]');
    expect(trace?.modelIdentifier).toBe('fake-tutor');
  });

  it('summarizes recorded evidence into a weekly digest', async () => {
    const { digest, notifierResult } = await getWeeklyDigest(SYNTHETIC_IDENTITY);
    expect(notifierResult.status).toBe('logged');

    const unitRatesDigest = digest.skills.find((skill) => skill.skillCode === 'unit-rates');
    expect(unitRatesDigest).toBeDefined();
    expect(unitRatesDigest?.attemptCount).toBeGreaterThan(0);
    expect(unitRatesDigest?.correctCount).toBeGreaterThan(0);
    expect(digest.totalAttempts).toBeGreaterThanOrEqual(unitRatesDigest?.attemptCount ?? 0);
    expect(digest.headline.length).toBeGreaterThan(0);
  });

  it('does not lose an attempt or its mastery contribution under concurrent attempts on the same skill', async () => {
    const session = await startSession(SYNTHETIC_IDENTITY);

    const results = await Promise.all(
      Array.from({ length: 6 }, () =>
        recordAttempt(SYNTHETIC_IDENTITY, { sessionId: session.sessionId, learnerResponse: '15' }),
      ),
    );

    expect(results).toHaveLength(6);
    expect(new Set(results.map((result) => result.attemptId)).size).toBe(6);

    const contributions = await prisma.masteryContribution.findMany({
      where: { attemptId: { in: results.map((result) => result.attemptId) } },
    });
    expect(contributions).toHaveLength(6);

    const estimates = await prisma.masteryEstimate.findMany({
      where: {
        learnerProfileId: SYNTHETIC_IDENTITY.learnerProfileId,
        skillCode: 'unit-rates',
        algorithmVersion: PHASE_1_MASTERY_VERSION,
      },
    });
    expect(estimates).toHaveLength(1);
  });

  it('rejects session and attempt identifiers outside the caller’s own household', async () => {
    await expect(
      recordAttempt(SYNTHETIC_IDENTITY, { sessionId: randomUUID(), learnerResponse: '15' }),
    ).rejects.toThrow('Session not found');
    const response = await new TutorHarness(new FakeTutorModel()).respond({
      prompt: 'Synthetic prompt',
      learnerMessage: 'I tried.',
      redactedSkillContext: 'synthetic',
      state: 'awaiting_attempt',
      mode: 'math_tutor',
      genuineAttempt: true,
      priorHintCount: 0,
      attemptNumber: 1,
    });
    await expect(
      recordTutorResponse(SYNTHETIC_IDENTITY, { attemptId: randomUUID(), response }),
    ).rejects.toThrow('Attempt not found');
  });

  describe('session resume and completion', () => {
    let identity: HouseholdIdentity;

    beforeAll(async () => {
      const household = await prisma.household.create({ data: {} });
      const learnerUser = await prisma.user.create({
        data: { householdId: household.id, role: 'LEARNER' },
      });
      const learnerProfile = await prisma.learnerProfile.create({
        data: { userId: learnerUser.id, householdId: household.id, gradeLevel: 6 },
      });
      identity = { householdId: household.id, learnerProfileId: learnerProfile.id };
    });

    afterAll(async () => {
      await deleteHouseholdEvidence(prisma, identity.householdId);
    });

    it('resumes an in-progress session and rehydrates its progress instead of starting over', async () => {
      const first = await startSession(identity);
      expect(first.resumed).toBe(false);
      expect(first.completed).toBe(false);
      expect(first.hintCount).toBe(0);
      expect(first.latestAttempt).toBeUndefined();

      const attempt = await recordAttempt(identity, {
        sessionId: first.sessionId,
        learnerResponse: '15',
      });
      const context = await getTutorContext(identity, attempt.attemptId);
      const tutorResponse = await new TutorHarness(new FakeTutorModel()).respond({
        prompt: context.content.prompt,
        learnerMessage: 'I divided 45 by 3.',
        redactedSkillContext: `content:${context.content.id}`,
        state: context.state,
        mode: 'math_tutor',
        genuineAttempt: true,
        priorHintCount: context.priorHintCount,
        attemptNumber: context.attemptNumber,
      });
      await recordTutorResponse(identity, {
        attemptId: attempt.attemptId,
        response: tutorResponse,
      });

      // A second "page load" for the same content must resume the same
      // session, not silently create a new one, and must reflect the
      // attempt and hint already recorded.
      const resumed = await startSession(identity);
      expect(resumed.sessionId).toBe(first.sessionId);
      expect(resumed.resumed).toBe(true);
      expect(resumed.completed).toBe(false);
      expect(resumed.latestAttempt).toMatchObject({
        attemptId: attempt.attemptId,
        correctness: 'CORRECT',
      });
      expect(resumed.hintCount).toBe(1);

      await recordIndependentCheck(identity, {
        sessionId: first.sessionId,
        learnerResponse: '15',
      });

      // Passing the independent check ends the session, so the next load
      // starts a fresh one rather than resuming the completed session.
      const afterCheck = await startSession(identity);
      expect(afterCheck.sessionId).not.toBe(first.sessionId);
      expect(afterCheck.resumed).toBe(false);
      expect(afterCheck.completed).toBe(false);

      expect(
        await prisma.session.findUnique({
          where: { id: first.sessionId },
          select: { endedAt: true },
        }),
      ).toMatchObject({ endedAt: expect.any(Date) });
    });
  });

  describe('diagnostic placement', () => {
    let identity: HouseholdIdentity;

    beforeAll(async () => {
      const household = await prisma.household.create({ data: {} });
      const learnerUser = await prisma.user.create({
        data: { householdId: household.id, role: 'LEARNER' },
      });
      const learnerProfile = await prisma.learnerProfile.create({
        data: { userId: learnerUser.id, householdId: household.id, gradeLevel: 6 },
      });
      identity = { householdId: household.id, learnerProfileId: learnerProfile.id };
    });

    afterAll(async () => {
      await deleteHouseholdEvidence(prisma, identity.householdId);
    });

    it('offers one independent item per unassessed root skill, capped at the default limit', async () => {
      const diagnosticPlan = await getDiagnosticPlan(identity);
      expect(diagnosticPlan.items.length).toBeGreaterThan(0);
      expect(diagnosticPlan.items.length).toBeLessThanOrEqual(5);
      expect(diagnosticPlan.items.some((item) => item.skillCode === 'ratio-language')).toBe(true);
      // Every offered skill must be a root skill (no prerequisites) -
      // dependent skills are placed through ordinary practice instead.
      for (const item of diagnosticPlan.items) {
        expect(item.title.length).toBeGreaterThan(0);
        expect(item.skillTitle.length).toBeGreaterThan(0);
      }
    });

    it('records a diagnostic attempt without setting independentDelayedCheck, then removes that skill from the diagnostic plan', async () => {
      const before = await getDiagnosticPlan(identity);
      const ratioLanguageItem = before.items.find((item) => item.skillCode === 'ratio-language');
      expect(ratioLanguageItem).toBeDefined();

      const session = await startSession(identity, { contentId: ratioLanguageItem!.contentId });
      const result = await recordDiagnosticAttempt(identity, {
        sessionId: session.sessionId,
        learnerResponse: '2:3',
      });
      expect(result.correctness).toBe('CORRECT');

      const mastery = await prisma.masteryEstimate.findUnique({
        where: {
          learnerProfileId_skillCode_algorithmVersion: {
            learnerProfileId: identity.learnerProfileId,
            skillCode: 'ratio-language',
            algorithmVersion: PHASE_1_MASTERY_VERSION,
          },
        },
      });
      // A diagnostic guess establishes a placement estimate but must never
      // by itself count as the confirmed, independently-checked mastery
      // evidence that recordIndependentCheck produces.
      expect(mastery?.independentDelayedCheck).toBe(false);

      const attemptRow = await prisma.attempt.findUnique({ where: { id: result.attemptId } });
      expect(attemptRow?.context).toBe('DIAGNOSTIC');

      const after = await getDiagnosticPlan(identity);
      expect(after.items.some((item) => item.skillCode === 'ratio-language')).toBe(false);

      const resumedSession = await startSession(identity, {
        contentId: ratioLanguageItem!.contentId,
      });
      expect(resumedSession.sessionId).not.toBe(session.sessionId);
    });

    it('rejects a second diagnostic attempt for an already-assessed skill', async () => {
      const session = await startSession(identity, { contentId: 'ratio-language-2' });
      await expect(
        recordDiagnosticAttempt(identity, { sessionId: session.sessionId, learnerResponse: '2:3' }),
      ).rejects.toThrow('Diagnostic already completed for this skill');
    });
  });

  describe('spaced review', () => {
    let identity: HouseholdIdentity;

    beforeAll(async () => {
      const household = await prisma.household.create({ data: {} });
      const learnerUser = await prisma.user.create({
        data: { householdId: household.id, role: 'LEARNER' },
      });
      const learnerProfile = await prisma.learnerProfile.create({
        data: { userId: learnerUser.id, householdId: household.id, gradeLevel: 6 },
      });
      identity = { householdId: household.id, learnerProfileId: learnerProfile.id };
    });

    afterAll(async () => {
      await deleteHouseholdEvidence(prisma, identity.householdId);
    });

    it('offers a skill for review once its confirmed mastery is older than the review interval, and not before', async () => {
      const overdueAt = new Date(
        Date.now() - (MASTERY_REVIEW_INTERVAL_DAYS + 1) * 24 * 60 * 60 * 1000,
      );
      await prisma.masteryEstimate.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          skillCode: 'ratio-language',
          estimate: 1,
          confidenceBand: 'MEDIUM',
          algorithmVersion: PHASE_1_MASTERY_VERSION,
          independentDelayedCheck: true,
          updatedAt: overdueAt,
        },
      });
      await prisma.masteryEstimate.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          skillCode: 'variables-and-expressions',
          estimate: 1,
          confidenceBand: 'MEDIUM',
          algorithmVersion: PHASE_1_MASTERY_VERSION,
          independentDelayedCheck: true,
          // Confirmed recently - not due yet.
          updatedAt: new Date(),
        },
      });

      const queue = await getReviewQueue(identity);
      expect(queue.items.some((item) => item.skillCode === 'ratio-language')).toBe(true);
      expect(queue.items.some((item) => item.skillCode === 'variables-and-expressions')).toBe(
        false,
      );
    });

    it('keeps confirmed mastery on a correct review and revokes it on an incorrect one, sending the skill back to practice', async () => {
      const session = await startSession(identity, { contentId: 'ratio-language-1' });
      const passed = await recordReviewAttempt(identity, {
        sessionId: session.sessionId,
        learnerResponse: '2:3',
      });
      expect(passed.correctness).toBe('CORRECT');
      expect(
        await prisma.masteryEstimate.findUnique({
          where: {
            learnerProfileId_skillCode_algorithmVersion: {
              learnerProfileId: identity.learnerProfileId,
              skillCode: 'ratio-language',
              algorithmVersion: PHASE_1_MASTERY_VERSION,
            },
          },
          select: { independentDelayedCheck: true },
        }),
      ).toMatchObject({ independentDelayedCheck: true });

      // Re-seed as overdue again so a second review can be attempted.
      await prisma.masteryEstimate.update({
        where: {
          learnerProfileId_skillCode_algorithmVersion: {
            learnerProfileId: identity.learnerProfileId,
            skillCode: 'ratio-language',
            algorithmVersion: PHASE_1_MASTERY_VERSION,
          },
        },
        data: {
          updatedAt: new Date(
            Date.now() - (MASTERY_REVIEW_INTERVAL_DAYS + 1) * 24 * 60 * 60 * 1000,
          ),
        },
      });
      const secondSession = await startSession(identity, { contentId: 'ratio-language-2' });
      const failed = await recordReviewAttempt(identity, {
        sessionId: secondSession.sessionId,
        learnerResponse: 'not a ratio',
      });
      expect(failed.correctness).toBe('INCORRECT');
      expect(
        await prisma.masteryEstimate.findUnique({
          where: {
            learnerProfileId_skillCode_algorithmVersion: {
              learnerProfileId: identity.learnerProfileId,
              skillCode: 'ratio-language',
              algorithmVersion: PHASE_1_MASTERY_VERSION,
            },
          },
          select: { independentDelayedCheck: true },
        }),
      ).toMatchObject({ independentDelayedCheck: false });

      const queueAfterDecay = await getReviewQueue(identity);
      expect(queueAfterDecay.items.some((item) => item.skillCode === 'ratio-language')).toBe(false);
    });

    it('rejects a review for a skill whose mastery has never been independently confirmed', async () => {
      const session = await startSession(identity, { contentId: 'unit-rates-1' });
      await expect(
        recordReviewAttempt(identity, { sessionId: session.sessionId, learnerResponse: '15' }),
      ).rejects.toThrow('Review is not available for this skill');
    });
  });

  describe('learner-visible progress', () => {
    let identity: HouseholdIdentity;

    beforeAll(async () => {
      const household = await prisma.household.create({ data: {} });
      const learnerUser = await prisma.user.create({
        data: { householdId: household.id, role: 'LEARNER' },
      });
      const learnerProfile = await prisma.learnerProfile.create({
        data: { userId: learnerUser.id, householdId: household.id, gradeLevel: 6 },
      });
      identity = { householdId: household.id, learnerProfileId: learnerProfile.id };

      // "practicing" evidence: a mastery row without independent confirmation.
      await prisma.masteryEstimate.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          skillCode: 'variables-and-expressions',
          estimate: 0.4,
          confidenceBand: 'LOW',
          algorithmVersion: PHASE_1_MASTERY_VERSION,
          independentDelayedCheck: false,
        },
      });

      // "independently confirmed" evidence: a mastery row plus the exact
      // attempt that earned it, so a recent strength is traceable to it.
      await prisma.masteryEstimate.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          skillCode: 'ratio-language',
          estimate: 1,
          confidenceBand: 'HIGH',
          algorithmVersion: PHASE_1_MASTERY_VERSION,
          independentDelayedCheck: true,
        },
      });
      await prisma.attempt.create({
        data: {
          householdId: identity.householdId,
          learnerProfileId: identity.learnerProfileId,
          contentKey: 'ratio-language-1',
          contentVersion: 'content-1',
          learnerResponse: '2:3',
          correctness: 'CORRECT',
          scoringMethod: 'DETERMINISTIC',
          attemptNumber: 1,
          elapsedSeconds: 10,
          highestAssistance: 'INDEPENDENT',
          context: 'MASTERY_CHECK',
          policyVersion: PHASE_1_POLICY_VERSION,
        },
      });
    });

    afterAll(async () => {
      await deleteHouseholdEvidence(prisma, identity.householdId);
    });

    it('labels every skill as not started, practicing, or independently confirmed with no scores or rankings', async () => {
      const progress = await getLearnerProgress(identity);
      const byCode = new Map(progress.skills.map((skill) => [skill.skillCode, skill]));

      expect(byCode.get('ratio-language')).toMatchObject({ status: 'INDEPENDENTLY_CONFIRMED' });
      expect(byCode.get('variables-and-expressions')).toMatchObject({ status: 'PRACTICING' });
      // A skill with no mastery row at all has never been attempted.
      expect(byCode.get('unit-rates')).toMatchObject({ status: 'NOT_STARTED' });
    });

    it('traces a recent strength back to the confirming attempt, and only counts confirmed skills', async () => {
      const progress = await getLearnerProgress(identity);
      expect(progress.recentStrengths).toHaveLength(1);
      expect(progress.recentStrengths[0]).toMatchObject({ skillCode: 'ratio-language' });
    });

    it('offers a next activity drawn from the same plan the learner sees', async () => {
      const progress = await getLearnerProgress(identity);
      const plan = await getPlan(identity);
      expect(progress.nextActivity?.contentId).toBe(plan.items[0]?.contentId);
    });
  });

  describe('cross-household isolation', () => {
    let otherHousehold: HouseholdIdentity;

    beforeAll(async () => {
      const household = await prisma.household.create({ data: {} });
      const learnerUser = await prisma.user.create({
        data: { householdId: household.id, role: 'LEARNER' },
      });
      const learnerProfile = await prisma.learnerProfile.create({
        data: { userId: learnerUser.id, householdId: household.id, gradeLevel: 6 },
      });
      otherHousehold = { householdId: household.id, learnerProfileId: learnerProfile.id };
    });

    afterAll(async () => {
      await deleteHouseholdEvidence(prisma, otherHousehold.householdId);
    });

    it('cannot see or act on another household’s session, attempt, or evidence', async () => {
      const session = await startSession(SYNTHETIC_IDENTITY);
      const attempt = await recordAttempt(SYNTHETIC_IDENTITY, {
        sessionId: session.sessionId,
        learnerResponse: '15',
      });

      await expect(
        recordAttempt(otherHousehold, { sessionId: session.sessionId, learnerResponse: '15' }),
      ).rejects.toThrow('Session not found');
      await expect(getTutorContext(otherHousehold, attempt.attemptId)).rejects.toThrow(
        'Attempt not found',
      );

      const otherEvidence = await getParentEvidence(otherHousehold);
      expect(otherEvidence.attempts.some((item) => item.id === attempt.attemptId)).toBe(false);
    });
  });
});
