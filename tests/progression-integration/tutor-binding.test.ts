import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ensureSyntheticIdentity, SYNTHETIC_IDENTITY } from '../../src/identity/synthetic';
import { recordTutorResponse } from '../../src/phase1/service';
import { prisma } from '../../src/server/prisma';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';

describe('tutor binding', () => {
  beforeAll(async () => {
    await ensureSyntheticIdentity();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects a tutor move that has neither a resolvable attempt nor session', async () => {
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
    await expect(recordTutorResponse(SYNTHETIC_IDENTITY, { response })).rejects.toThrow(
      'TUTOR_BINDING_REQUIRED',
    );
  });
});
