import { afterEach, describe, expect, it } from 'vitest';

import {
  AnthropicTutorModel,
  createTutorModel,
  FakeTutorModel,
  getTutorProviderConfig,
  buildProviderInput,
} from '../../src/tutor';
import { TutorAuthorizationSchema } from '../../src/contracts';

const ORIGINAL_PROVIDER = process.env.TUTOR_MODEL_PROVIDER;
const ORIGINAL_KEY = process.env.ANTHROPIC_API_KEY;

describe('createTutorModel', () => {
  afterEach(() => {
    process.env.TUTOR_MODEL_PROVIDER = ORIGINAL_PROVIDER;
    process.env.ANTHROPIC_API_KEY = ORIGINAL_KEY;
  });

  describe('provider input boundary', () => {
    const authorization = TutorAuthorizationSchema.parse({
      policyVersion: 'policy-1',
      allowedMoveTypes: ['probe_reasoning'],
      maximumAssistance: 'clarifying_question',
      canRevealAnswer: false,
      requiresGenuineAttempt: true,
    });

    it('keeps provider inputs to the approved tutoring fields', () => {
      expect(
        buildProviderInput(
          {
            prompt: 'A car travels 120 miles in 4 hours.',
            learnerMessage: 'I divided 120 by 4.',
            redactedSkillContext: 'content:unit-rates-1; skill:unit-rates',
            authorization,
          },
          'probe_reasoning',
        ),
      ).toEqual({
        prompt: 'A car travels 120 miles in 4 hours.',
        learnerMessage: 'I divided 120 by 4.',
        redactedSkillContext: 'content:unit-rates-1; skill:unit-rates',
        moveType: 'probe_reasoning',
      });
    });

    it('rejects secrets and profile fields before provider calls', () => {
      const base = {
        prompt: 'Solve this ratio problem.',
        learnerMessage: 'I need help.',
        redactedSkillContext: 'content:unit-rates-1; skill:unit-rates',
        authorization,
      };
      expect(() =>
        buildProviderInput({ ...base, learnerMessage: 'my password is secret' }, 'probe_reasoning'),
      ).toThrow(/disallowed learner message data/);
      expect(() =>
        buildProviderInput(
          { ...base, redactedSkillContext: 'email: child@example.com' },
          'probe_reasoning',
        ),
      ).toThrow(/disallowed skill context data/);
    });
  });

  it('defaults to the fake adapter when TUTOR_MODEL_PROVIDER is unset', () => {
    delete process.env.TUTOR_MODEL_PROVIDER;
    expect(createTutorModel()).toBeInstanceOf(FakeTutorModel);
  });

  it('defaults to the fake adapter for any value other than exactly "anthropic"', () => {
    process.env.TUTOR_MODEL_PROVIDER = 'Anthropic';
    expect(createTutorModel()).toBeInstanceOf(FakeTutorModel);
    process.env.TUTOR_MODEL_PROVIDER = 'real';
    expect(createTutorModel()).toBeInstanceOf(FakeTutorModel);
  });

  it('uses the real adapter only when explicitly set to "anthropic"', () => {
    process.env.TUTOR_MODEL_PROVIDER = 'anthropic';
    process.env.ANTHROPIC_API_KEY = 'test-key-not-real';
    expect(createTutorModel()).toBeInstanceOf(AnthropicTutorModel);
  });

  it('fails closed to fake when a provider value is unsupported', () => {
    expect(getTutorProviderConfig({ TUTOR_MODEL_PROVIDER: 'openai' })).toEqual({
      provider: 'fake',
    });
    expect(
      getTutorProviderConfig({
        TUTOR_MODEL_PROVIDER: 'anthropic',
        ANTHROPIC_API_KEY: 'provider-key',
      }),
    ).toEqual({ provider: 'anthropic', apiKey: 'provider-key' });
  });

  it('does not expose unrelated environment variables in provider config', () => {
    expect(
      getTutorProviderConfig({
        TUTOR_MODEL_PROVIDER: 'fake',
        ANTHROPIC_API_KEY: 'secret-that-must-not-be-forwarded',
        DATABASE_URL: 'postgresql://should-not-be-used',
      }),
    ).toEqual({ provider: 'fake' });
  });
});
