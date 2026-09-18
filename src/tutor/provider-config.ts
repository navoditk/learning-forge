import { z } from 'zod';

export const TutorProviderSchema = z.enum(['fake', 'anthropic']);
export type TutorProvider = z.infer<typeof TutorProviderSchema>;

export type TutorProviderConfig = {
  provider: TutorProvider;
  apiKey?: string;
};

/**
 * Provider selection is explicit. Credentials never select a provider by
 * accident, and unsupported values fail closed to the deterministic adapter.
 */
export function getTutorProviderConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): TutorProviderConfig {
  const provider = TutorProviderSchema.safeParse(environment.TUTOR_MODEL_PROVIDER).data;
  if (provider !== 'anthropic') return { provider: 'fake' };
  return { provider, apiKey: environment.ANTHROPIC_API_KEY };
}
