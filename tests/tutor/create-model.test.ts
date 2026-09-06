import { afterEach, describe, expect, it } from 'vitest';

import { AnthropicTutorModel, createTutorModel, FakeTutorModel } from '../../src/tutor';

const ORIGINAL_PROVIDER = process.env.TUTOR_MODEL_PROVIDER;
const ORIGINAL_KEY = process.env.ANTHROPIC_API_KEY;

describe('createTutorModel', () => {
  afterEach(() => {
    process.env.TUTOR_MODEL_PROVIDER = ORIGINAL_PROVIDER;
    process.env.ANTHROPIC_API_KEY = ORIGINAL_KEY;
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
});
