import { z } from 'zod';

import type { ScoringInput, TutorMoveInput } from '../contracts';

const ProviderInputSchema = z
  .object({
    prompt: z.string().trim().min(1).max(2000),
    learnerMessage: z.string().trim().min(1).max(1000),
    redactedSkillContext: z.string().trim().min(1).max(500),
    moveType: z.string().trim().min(1).max(100),
  })
  .strict();

const FORBIDDEN_PROVIDER_DATA = [
  /\b(password|passwordhash|auth[_ -]?secret|api[_ -]?key|token)\b/i,
  /\b(email|phone|address|date[_ -]?of[_ -]?birth|full[_ -]?name)\b/i,
];

function assertNoSensitiveData(value: string, field: string): void {
  if (FORBIDDEN_PROVIDER_DATA.some((pattern) => pattern.test(value))) {
    throw new Error(`Provider input contains disallowed ${field} data`);
  }
}

export function buildProviderInput(input: TutorMoveInput, moveType: string) {
  const providerInput = ProviderInputSchema.parse({
    prompt: input.prompt,
    learnerMessage: input.learnerMessage,
    redactedSkillContext: input.redactedSkillContext,
    moveType,
  });
  assertNoSensitiveData(providerInput.prompt, 'problem');
  assertNoSensitiveData(providerInput.learnerMessage, 'learner message');
  assertNoSensitiveData(providerInput.redactedSkillContext, 'skill context');
  return providerInput;
}

export function buildProviderScoringInput(input: ScoringInput) {
  const providerInput = z
    .object({
      prompt: z.string().trim().min(1).max(2000),
      learnerResponse: z.string().trim().min(1).max(1000),
      rubric: z.string().trim().min(1).max(2000),
    })
    .strict()
    .parse(input);
  assertNoSensitiveData(providerInput.prompt, 'problem');
  assertNoSensitiveData(providerInput.learnerResponse, 'learner response');
  assertNoSensitiveData(providerInput.rubric, 'rubric');
  return providerInput;
}
