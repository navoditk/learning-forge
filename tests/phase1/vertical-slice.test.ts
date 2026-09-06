import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/server/prisma';
import {
  ensureSyntheticIdentity,
  SYNTHETIC_IDENTITY,
  SYNTHETIC_IDS,
} from '../../src/identity/synthetic';
import {
  getParentEvidence,
  getPlan,
  getTutorContext,
  startSession,
  getWeeklyDigest,
  HouseholdIdentity,
  PHASE_1_MASTERY_VERSION,
  recordIndependentCheck,
  recordAttempt,
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
    expect(plan.unavailableSkills).toEqual([]);
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
