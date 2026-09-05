import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildWeeklyDigest, ConsoleNotifier } from '../../src/notification';

describe('weekly digest', () => {
  it('summarizes attempts without inventing unearned claims', () => {
    const digest = buildWeeklyDigest({
      learnerName: 'Synthetic learner',
      skill: 'unit-rates',
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
    expect(digest.headline).toContain('2 attempts');
  });

  it('reports no activity honestly when there are no attempts', () => {
    const digest = buildWeeklyDigest({
      learnerName: 'Synthetic learner',
      skill: 'unit-rates',
      attempts: [],
    });

    expect(digest.attemptCount).toBe(0);
    expect(digest.masteryEstimate).toBe(0);
    expect(digest.confidenceBand).toBe('LOW');
    expect(digest.headline).toContain('has not attempted');
  });
});

describe('ConsoleNotifier', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the digest and never claims a real send', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const digest = buildWeeklyDigest({
      learnerName: 'Synthetic learner',
      skill: 'unit-rates',
      attempts: [],
    });

    const result = await new ConsoleNotifier().sendWeeklyDigest(digest);

    expect(result.status).toBe('logged');
    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});
