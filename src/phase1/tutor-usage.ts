import { prisma } from '../server/prisma';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_HOUSEHOLD_DAILY_LIMIT = 100;
const DEFAULT_SESSION_LIMIT = 8;

export class TutorUsageLimitError extends Error {
  constructor(
    public readonly scope: 'household' | 'session',
    public readonly limit: number,
  ) {
    super(
      scope === 'session'
        ? `This session has reached its ${limit}-hint limit. Start another activity to continue.`
        : `This household has reached its ${limit}-hint daily limit. Try again tomorrow.`,
    );
    this.name = 'TutorUsageLimitError';
  }
}

function configuredLimit(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export async function enforceTutorUsageLimits(input: {
  householdId: string;
  sessionId?: string;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  const householdLimit = configuredLimit('TUTOR_DAILY_HINT_LIMIT', DEFAULT_HOUSEHOLD_DAILY_LIMIT);
  const sessionLimit = configuredLimit('TUTOR_SESSION_HINT_LIMIT', DEFAULT_SESSION_LIMIT);
  const since = new Date(now.getTime() - DAY_MS);

  const householdCount = await prisma.tutorTrace.count({
    where: {
      householdId: input.householdId,
      createdAt: { gte: since },
    },
  });
  if (householdCount >= householdLimit) {
    throw new TutorUsageLimitError('household', householdLimit);
  }

  if (input.sessionId) {
    const sessionCount = await prisma.tutorTrace.count({
      where: {
        householdId: input.householdId,
        sessionId: input.sessionId,
      },
    });
    if (sessionCount >= sessionLimit) {
      throw new TutorUsageLimitError('session', sessionLimit);
    }
  }
}
