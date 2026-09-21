import { describe, expect, it } from 'vitest';

import {
  advanceReviewSchedule,
  lapseReviewSchedule,
  preserveReviewScheduleForPractice,
} from '../../src/progression/review-schedule';

const initial = {
  dueAt: new Date('2026-01-01T00:00:00.000Z'),
  intervalIndex: 0,
  lastOutcome: 'PASSED',
};

describe('review schedule policy', () => {
  it('does not reset or advance a schedule during ordinary practice', () => {
    expect(preserveReviewScheduleForPractice(initial)).toEqual(initial);
  });

  it('advances through the approved spacing intervals and caps at the final one', () => {
    const now = new Date('2026-01-02T00:00:00.000Z');
    const next = advanceReviewSchedule(initial, now, [3, 7, 21]);
    expect(next.intervalIndex).toBe(1);
    expect(next.dueAt).toEqual(new Date('2026-01-09T00:00:00.000Z'));
    const final = advanceReviewSchedule({ ...next, intervalIndex: 2 }, now, [3, 7, 21]);
    expect(final.intervalIndex).toBe(2);
  });

  it('marks a lapsed review due without altering its interval', () => {
    const now = new Date('2026-02-01T00:00:00.000Z');
    expect(lapseReviewSchedule({ ...initial, intervalIndex: 2 }, now)).toEqual({
      ...initial,
      intervalIndex: 2,
      dueAt: now,
      lastOutcome: 'LAPSED',
    });
  });
});
