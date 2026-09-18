import { TutorModel } from '../contracts';
import { AnthropicTutorModel } from './anthropic-model';
import { FakeTutorModel } from './fake-model';
import { getTutorProviderConfig } from './provider-config';

/**
 * Explicit opt-in, not "key present" detection: a developer's .env commonly
 * carries ANTHROPIC_API_KEY for scripts/run-real-eval.ts without meaning to
 * route real learner traffic through it. TUTOR_MODEL_PROVIDER is the only
 * thing that decides that. Defaults to the fake adapter everywhere this
 * isn't explicitly set to 'anthropic', including tests/CI.
 */
export function createTutorModel(): TutorModel {
  const config = getTutorProviderConfig();
  if (config.provider === 'anthropic') {
    return new AnthropicTutorModel(config.apiKey);
  }
  return new FakeTutorModel();
}
