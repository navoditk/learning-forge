import { z } from 'zod';

export const NotifierProviderSchema = z.enum(['console', 'resend']);
export type NotifierProvider = z.infer<typeof NotifierProviderSchema>;

export type NotifierProviderConfig =
  { provider: 'console' } | { provider: 'resend'; apiKey: string; from: string; to: string };

/**
 * Provider selection is explicit, mirroring src/tutor/provider-config.ts:
 * an unset or unrecognized value fails closed to the console (log-only)
 * adapter rather than silently attempting a real send. Setting
 * NOTIFIER_PROVIDER=resend without all three required values throws, so a
 * misconfigured deployment fails loudly instead of quietly never alerting.
 */
export function getNotifierProviderConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): NotifierProviderConfig {
  const provider = NotifierProviderSchema.safeParse(environment.NOTIFIER_PROVIDER).data;
  if (provider !== 'resend') return { provider: 'console' };

  const apiKey = environment.RESEND_API_KEY;
  const from = environment.SAFETY_ALERT_EMAIL_FROM;
  const to = environment.SAFETY_ALERT_EMAIL_TO;
  if (!apiKey || !from || !to) {
    throw new Error(
      'NOTIFIER_PROVIDER=resend requires RESEND_API_KEY, SAFETY_ALERT_EMAIL_FROM, and SAFETY_ALERT_EMAIL_TO',
    );
  }
  return { provider, apiKey, from, to };
}
