import { NotifierPort, NotifierResult, SafetyAlertInput, WeeklyDigestSummary } from '../contracts';

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Real email delivery via Resend's REST API (no SDK dependency - a single
 * fetch call). Only constructed by createNotifier() when NOTIFIER_PROVIDER
 * is explicitly set to 'resend' with all required config present; see
 * provider-config.ts.
 */
export class ResendNotifier implements NotifierPort {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly to: string,
  ) {}

  async sendSafetyAlert(input: SafetyAlertInput): Promise<NotifierResult> {
    await this.send(
      'Learning Forge: tutor safety flag needs review',
      [
        'A tutor turn was flagged needs_human_review and suppressed before the learner saw it.',
        '',
        `Trace ID: ${input.traceId}`,
        `Household ID: ${input.householdId}`,
        `Policy version: ${input.policyVersion}`,
        `Occurred at: ${input.occurredAt}`,
        '',
        'This alert never includes learner text by design. Review the',
        'TutorTrace row for this trace ID to assess the situation.',
      ].join('\n'),
    );
    return { status: 'sent' };
  }

  async sendWeeklyDigest(input: WeeklyDigestSummary): Promise<NotifierResult> {
    await this.send(`Learning Forge: weekly progress for ${input.learnerName}`, input.headline);
    return { status: 'sent' };
  }

  private async send(subject: string, text: string): Promise<void> {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: this.from, to: this.to, subject, text }),
    });
    if (!response.ok) {
      throw new Error(`Resend send failed with status ${response.status}`);
    }
  }
}
