import { NotifierPort, NotifierResult, WeeklyDigestSummary } from '../contracts';

export class ConsoleNotifier implements NotifierPort {
  async sendWeeklyDigest(input: WeeklyDigestSummary): Promise<NotifierResult> {
    console.log('[fake-notifier] weekly digest', JSON.stringify(input));
    return { status: 'logged' };
  }
}
