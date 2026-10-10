import { NotifierPort } from '../contracts';
import { ConsoleNotifier } from './console-notifier';
import { ResendNotifier } from './resend-notifier';
import { getNotifierProviderConfig } from './provider-config';

/**
 * Mirrors src/tutor/create-model.ts's explicit opt-in: defaults to the
 * log-only console adapter everywhere NOTIFIER_PROVIDER isn't explicitly
 * set to 'resend', including tests/CI, so a flagged safety turn never
 * silently attempts a real send in a synthetic environment.
 */
export function createNotifier(): NotifierPort {
  const config = getNotifierProviderConfig();
  if (config.provider === 'resend') {
    return new ResendNotifier(config.apiKey, config.from, config.to);
  }
  return new ConsoleNotifier();
}
