import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildSkillDigest, buildWeeklyDigest, ConsoleNotifier } from '../../src/notification';

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
});
