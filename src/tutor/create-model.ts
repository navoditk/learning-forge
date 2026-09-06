import { TutorModel } from '../contracts';
import { AnthropicTutorModel } from './anthropic-model';
import { FakeTutorModel } from './fake-model';

/**
 * Explicit opt-in, not "key present" detection: a developer's .env commonly
 * carries ANTHROPIC_API_KEY for scripts/run-real-eval.ts without meaning to
 * route real learner traffic through it. TUTOR_MODEL_PROVIDER is the only
 * thing that decides that. Defaults to the fake adapter everywhere this
 * isn't explicitly set to 'anthropic', including tests/CI.
 */
export function createTutorModel(): TutorModel {
  if (process.env.TUTOR_MODEL_PROVIDER === 'anthropic') {
    return new AnthropicTutorModel();
  }
  return new FakeTutorModel();
}
