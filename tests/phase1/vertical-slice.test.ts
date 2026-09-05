import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/server/prisma';
import { ensureSyntheticIdentity, SYNTHETIC_IDS } from '../../src/identity/synthetic';
import {
  getParentEvidence,
  getSyntheticSession,
  recordAttempt,
  recordTutorResponse,
} from '../../src/phase1/service';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';

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

  it('records an attempt, fake-tutor interaction, and parent evidence', async () => {
    await ensureSyntheticIdentity();
    const session = await getSyntheticSession();
    const attempt = await recordAttempt({ sessionId: session.sessionId, learnerResponse: '15' });
    const response = await new TutorHarness(new FakeTutorModel()).respond({
      prompt: session.content.prompt,
      learnerMessage: 'I divided 45 by 3.',
      redactedSkillContext: `content:${session.content.id}`,
      state: 'awaiting_attempt',
      mode: 'math_tutor',
      genuineAttempt: true,
      priorHintCount: 0,
      attemptNumber: 1,
      protectedTokens: ['15', '15 miles per hour'],
    });
    await recordTutorResponse({ attemptId: attempt.attemptId, response });
    const evidence = await getParentEvidence();

    expect(attempt.correctness).toBe('CORRECT');
    expect(evidence.attempts.some((item) => item.id === attempt.attemptId)).toBe(true);
    expect(evidence.mastery).toMatchObject({
      estimate: 0.9,
      confidenceBand: 'MEDIUM',
      independentDelayedCheck: false,
    });
    expect(evidence.attempts[0]?.highestAssistance).toBe('CLARIFYING_QUESTION');

    const trace = await prisma.tutorTrace.findFirst({
      where: { learnerProfileId: SYNTHETIC_IDS.learnerProfile },
    });
    expect(trace?.redactedExcerpt).toBe('[redacted learner text]');
    expect(trace?.modelIdentifier).toBe('fake-tutor');
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
