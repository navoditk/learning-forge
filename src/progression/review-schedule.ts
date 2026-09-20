export type ReviewScheduleState = {
  dueAt: Date;
  intervalIndex: number;
  lastOutcome: string;
};

/** Ordinary practice is evidence, but it never advances or resets review. */
export function preserveReviewScheduleForPractice(
  schedule: ReviewScheduleState,
): ReviewScheduleState {
  return { ...schedule };
}

/**
 * A passed review advances one position in the approved spacing vector. Once
 * the final interval is reached, later passes remain on that final interval.
 */
export function advanceReviewSchedule(
  schedule: ReviewScheduleState,
  now: Date,
  spacingIntervalDays: readonly number[],
): ReviewScheduleState {
  if (spacingIntervalDays.length === 0) {
    throw new Error('REVIEW_INTERVALS_REQUIRED');
  }
  const intervalIndex = Math.min(
    Math.max(schedule.intervalIndex + 1, 0),
    spacingIntervalDays.length - 1,
  );
  return {
    ...schedule,
    dueAt: new Date(now.getTime() + spacingIntervalDays[intervalIndex]! * 86_400_000),
    intervalIndex,
    lastOutcome: 'PASSED',
  };
}

/** A lapsed review is immediately due for remediation without changing mastery. */
export function lapseReviewSchedule(schedule: ReviewScheduleState, now: Date): ReviewScheduleState {
  return { ...schedule, dueAt: now, lastOutcome: 'LAPSED' };
}
