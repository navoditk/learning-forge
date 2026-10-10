import { NotifierPort, NotifierResult, SafetyAlertInput, WeeklyDigestSummary } from '../contracts';

export class ConsoleNotifier implements NotifierPort {
  async sendWeeklyDigest(input: WeeklyDigestSummary): Promise<NotifierResult> {
    console.log('[fake-notifier] weekly digest', JSON.stringify(input));
    return { status: 'logged' };
  }

  async sendSafetyAlert(input: SafetyAlertInput): Promise<NotifierResult> {
    // This logs only - it does not reach anyone outside this process. Real
    // deployments must set NOTIFIER_PROVIDER=resend (see create-notifier.ts)
    // so a flagged turn actually pages a human instead of waiting for
    // someone to read server logs.
    console.error('[fake-notifier] SAFETY ALERT - needs human review', JSON.stringify(input));
    return { status: 'logged' };
  }
}
