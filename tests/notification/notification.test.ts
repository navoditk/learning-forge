import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildSkillDigest,
  buildWeeklyDigest,
  ConsoleNotifier,
  createNotifier,
  getNotifierProviderConfig,
  ResendNotifier,
} from '../../src/notification';

describe('buildSkillDigest', () => {
  it('summarizes one skill without inventing unearned claims', () => {
    const digest = buildSkillDigest({
      skillCode: 'unit-rates',
      attempts: [
        { correctness: 'CORRECT', highestAssistance: 'INDEPENDENT' },
        { correctness: 'INCORRECT', highestAssistance: 'SMALL_STRATEGIC_HINT' },
      ],
      mastery: { estimate: 0.75, confidenceBand: 'MEDIUM', independentDelayedCheck: false },
    });

    expect(digest.attemptCount).toBe(2);
    expect(digest.correctCount).toBe(1);
    expect(digest.independentAttemptCount).toBe(1);
    expect(digest.masteryEstimate).toBe(0.75);
    expect(digest.confidenceBand).toBe('MEDIUM');
    expect(digest.independentDelayedCheckComplete).toBe(false);
  });

  it('reports no activity honestly when there are no attempts or mastery', () => {
    const digest = buildSkillDigest({ skillCode: 'unit-rates', attempts: [] });

    expect(digest.attemptCount).toBe(0);
    expect(digest.masteryEstimate).toBe(0);
    expect(digest.confidenceBand).toBe('LOW');
    expect(digest.independentDelayedCheckComplete).toBe(false);
  });
});

describe('buildWeeklyDigest', () => {
  it('aggregates multiple skills into totals and a headline', () => {
    const digest = buildWeeklyDigest({
      learnerName: 'Synthetic learner',
      skills: [
        {
          skillCode: 'unit-rates',
          attempts: [{ correctness: 'CORRECT', highestAssistance: 'INDEPENDENT' }],
        },
        {
          skillCode: 'ratio-language',
          attempts: [
            { correctness: 'CORRECT', highestAssistance: 'INDEPENDENT' },
            { correctness: 'INCORRECT', highestAssistance: 'SMALL_STRATEGIC_HINT' },
          ],
        },
      ],
    });

    expect(digest.skills).toHaveLength(2);
    expect(digest.totalAttempts).toBe(3);
    expect(digest.totalCorrect).toBe(2);
    expect(digest.headline).toContain('3 attempts');
    expect(digest.headline).toContain('2 skills');
  });

  it('reports no activity honestly when no skills have any evidence', () => {
    const digest = buildWeeklyDigest({ learnerName: 'Synthetic learner', skills: [] });

    expect(digest.skills).toHaveLength(0);
    expect(digest.totalAttempts).toBe(0);
    expect(digest.totalCorrect).toBe(0);
    expect(digest.headline).toContain('has not attempted any skills');
  });
});

describe('ConsoleNotifier', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the digest and never claims a real send', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const digest = buildWeeklyDigest({ learnerName: 'Synthetic learner', skills: [] });

    const result = await new ConsoleNotifier().sendWeeklyDigest(digest);

    expect(result.status).toBe('logged');
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('logs a safety alert loudly and never claims a real send', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await new ConsoleNotifier().sendSafetyAlert({
      traceId: 'trace-1',
      householdId: 'household-1',
      policyVersion: 'policy-1',
      occurredAt: '2026-10-10T00:00:00.000Z',
    });

    expect(result.status).toBe('logged');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0]?.join(' ')).toContain('SAFETY ALERT');
  });
});

describe('getNotifierProviderConfig', () => {
  it('fails closed to console when NOTIFIER_PROVIDER is unset', () => {
    expect(getNotifierProviderConfig({})).toEqual({ provider: 'console' });
  });

  it('fails closed to console for an unsupported value', () => {
    expect(getNotifierProviderConfig({ NOTIFIER_PROVIDER: 'sendgrid' })).toEqual({
      provider: 'console',
    });
  });

  it('throws if resend is selected without all required config', () => {
    expect(() => getNotifierProviderConfig({ NOTIFIER_PROVIDER: 'resend' })).toThrow(
      /RESEND_API_KEY/,
    );
  });

  it('returns resend config when explicitly selected with all required values', () => {
    expect(
      getNotifierProviderConfig({
        NOTIFIER_PROVIDER: 'resend',
        RESEND_API_KEY: 'key-1',
        SAFETY_ALERT_EMAIL_FROM: 'from@example.com',
        SAFETY_ALERT_EMAIL_TO: 'to@example.com',
      }),
    ).toEqual({
      provider: 'resend',
      apiKey: 'key-1',
      from: 'from@example.com',
      to: 'to@example.com',
    });
  });
});

describe('createNotifier', () => {
  afterEach(() => {
    delete process.env.NOTIFIER_PROVIDER;
    delete process.env.RESEND_API_KEY;
    delete process.env.SAFETY_ALERT_EMAIL_FROM;
    delete process.env.SAFETY_ALERT_EMAIL_TO;
  });

  it('returns a ConsoleNotifier by default', () => {
    expect(createNotifier()).toBeInstanceOf(ConsoleNotifier);
  });

  it('returns a ResendNotifier when explicitly configured', () => {
    process.env.NOTIFIER_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 'key-1';
    process.env.SAFETY_ALERT_EMAIL_FROM = 'from@example.com';
    process.env.SAFETY_ALERT_EMAIL_TO = 'to@example.com';

    expect(createNotifier()).toBeInstanceOf(ResendNotifier);
  });
});

describe('ResendNotifier', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a safety alert containing no learner text, only trace metadata', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    const result = await new ResendNotifier(
      'key-1',
      'from@example.com',
      'to@example.com',
    ).sendSafetyAlert({
      traceId: 'trace-1',
      householdId: 'household-1',
      policyVersion: 'policy-1',
      occurredAt: '2026-10-10T00:00:00.000Z',
    });

    expect(result.status).toBe('sent');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(options.headers).toMatchObject({ Authorization: 'Bearer key-1' });
    const body = JSON.parse(options.body as string);
    expect(body.from).toBe('from@example.com');
    expect(body.to).toBe('to@example.com');
    expect(body.text).toContain('trace-1');
    expect(body.text).not.toContain('learnerMessage');
  });

  it('throws if Resend responds with a non-2xx status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      new ResendNotifier('key-1', 'from@example.com', 'to@example.com').sendSafetyAlert({
        traceId: 'trace-1',
        householdId: 'household-1',
        policyVersion: 'policy-1',
        occurredAt: '2026-10-10T00:00:00.000Z',
      }),
    ).rejects.toThrow(/500/);
  });
});
