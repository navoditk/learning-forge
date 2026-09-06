import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/server/prisma';
import { ensureSyntheticIdentity, SYNTHETIC_IDS } from '../../src/identity/synthetic';
import {
  getParentEvidence,
  getPlan,
  getTutorContext,
  getSyntheticSession,
  getWeeklyDigest,
  recordIndependentCheck,
  recordAttempt,
  recordTutorResponse,
} from '../../src/phase1/service';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';
import { POST as postHint } from '../../src/app/api/phase1/hint/route';
import { GET as getPlanRoute } from '../../src/app/api/phase1/plan/route';
import { GET as getDigestRoute } from '../../src/app/api/phase1/digest/route';

describe('Phase 1 synthetic ratios vertical slice', () => {
  beforeAll(async () => {
    await prisma.masteryContribution.deleteMany({
      where: { attempt: { householdId: SYNTHETIC_IDS.household } },
    });
    await prisma.masteryEstimate.deleteMany({ where: { householdId: SYNTHETIC_IDS.household } });
    await prisma.household.deleteMany({ where: { id: SYNTHETIC_IDS.household } });
  });

  afterAll(async () => {
    await prisma.masteryContribution.deleteMany({
      where: { attempt: { householdId: SYNTHETIC_IDS.household } },
    });
    await prisma.masteryEstimate.deleteMany({ where: { householdId: SYNTHETIC_IDS.household } });
    await prisma.household.deleteMany({ where: { id: SYNTHETIC_IDS.household } });
    await prisma.$disconnect();
  });

  it('recommends every unblocked skill with content before any mastery evidence exists', async () => {
    await ensureSyntheticIdentity();
    const plan = await getPlan();

    expect(plan.items.length).toBeGreaterThan(0);
    expect(plan.items.some((item) => item.skillCode === 'ratio-language')).toBe(true);
    for (const item of plan.items) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.skillTitle.length).toBeGreaterThan(0);
      expect(item.reason.length).toBeGreaterThan(0);
    }
    expect(plan.blockedSkills).toContain('unit-rates');
    expect(plan.unavailableSkills).toEqual([]);

    const response = await getPlanRoute();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.totalMinutes).toBeLessThanOrEqual(30);
  });

  it('records an attempt, fake-tutor interaction, and parent evidence', async () => {
    await ensureSyntheticIdentity();
    const session = await getSyntheticSession();
    const attempt = await recordAttempt({ sessionId: session.sessionId, learnerResponse: '15' });
    const forgedRequest = new Request('http://localhost/api/phase1/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: attempt.attemptId,
        learnerMessage: 'I divided 45 by 3.',
        state: 'guided_solution',
        priorHintCount: 0,
        attemptNumber: 1,
      }),
    });
    const forgedResponse = await postHint(forgedRequest);
    const firstTutorResult = await forgedResponse.json();
    expect(forgedResponse.status).toBe(200);
    expect(firstTutorResult.response.move.moveType).toBe('probe_reasoning');
    expect(await getTutorContext(attempt.attemptId)).toMatchObject({
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
    await recordTutorResponse({ attemptId: attempt.attemptId, response: nextResponse });
    expect(await getTutorContext(attempt.attemptId)).toMatchObject({
      state: 'hint_1_strategy',
      priorHintCount: 2,
    });
    const check = await recordIndependentCheck({
      sessionId: session.sessionId,
      learnerResponse: '15',
    });
    const evidence = await getParentEvidence();

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
      where: { learnerProfileId: SYNTHETIC_IDS.learnerProfile },
    });
    expect(trace?.redactedExcerpt).toBe('[redacted learner text]');
    expect(trace?.modelIdentifier).toBe('fake-tutor');
  });

  it('summarizes recorded evidence into a weekly digest', async () => {
    const { digest, notifierResult } = await getWeeklyDigest();
    expect(notifierResult.status).toBe('logged');

    const unitRatesDigest = digest.skills.find((skill) => skill.skillCode === 'unit-rates');
    expect(unitRatesDigest).toBeDefined();
    expect(unitRatesDigest?.attemptCount).toBeGreaterThan(0);
    expect(unitRatesDigest?.correctCount).toBeGreaterThan(0);
    expect(digest.totalAttempts).toBeGreaterThanOrEqual(unitRatesDigest?.attemptCount ?? 0);
    expect(digest.headline.length).toBeGreaterThan(0);

    const response = await getDigestRoute();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.digest.totalAttempts).toBe(digest.totalAttempts);
  });

  it('rejects session and attempt identifiers outside the synthetic household', async () => {
    await expect(recordAttempt({ sessionId: randomUUID(), learnerResponse: '15' })).rejects.toThrow(
      'Synthetic session not found',
    );
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
    await expect(recordTutorResponse({ attemptId: randomUUID(), response })).rejects.toThrow(
      'Synthetic attempt not found',
    );
  });
});
