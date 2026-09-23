import { describe, expect, it } from 'vitest';

import {
  lessonStatusAfterAssessment,
  unitStatusAfterAssessment,
  unitStatusAfterLessonUpdate,
} from '../../src/progression/learner-state';
import {
  advanceReviewSchedule,
  lapseReviewSchedule,
  preserveReviewScheduleForPractice,
} from '../../src/progression/review-schedule';
import { flagStaleDownstreamEvidence } from '../../src/progression/unlock-relock';

describe('progression learner-state rules', () => {
  it('keeps completion historical and distinguishes a first-run skip', () => {
    expect(
      lessonStatusAfterAssessment({
        current: undefined,
        outcome: 'PASS',
        firstRun: true,
        hadPriorWork: false,
      }),
    ).toEqual({ completionStatus: 'COMPLETE_BY_SKIP', remediationStatus: 'NONE' });
    expect(
      lessonStatusAfterAssessment({
        current: 'COMPLETE',
        outcome: 'FAIL',
        firstRun: false,
        hadPriorWork: true,
      }),
    ).toEqual({ completionStatus: 'COMPLETE', remediationStatus: 'ACTIVE' });
  });

  it('requires every lesson to be complete before a unit assessment', () => {
    expect(unitStatusAfterLessonUpdate(['COMPLETE', 'COMPLETE_BY_SKIP'])).toBe(
      'ASSESSMENT_PENDING',
    );
    expect(unitStatusAfterLessonUpdate(['COMPLETE', 'IN_PROGRESS'])).toBe('IN_PROGRESS');
    expect(unitStatusAfterLessonUpdate(['COMPLETE', 'NOT_STARTED'])).toBe('IN_PROGRESS');
  });

  it('does not turn a first-run assessment into a skip after teaching or practice exposure', () => {
    expect(
      lessonStatusAfterAssessment({
        current: undefined,
        outcome: 'PASS',
        firstRun: true,
        hadPriorWork: true,
      }),
    ).toEqual({ completionStatus: 'COMPLETE', remediationStatus: 'NONE' });
  });

  it('distinguishes a unit skip pass and keeps completed units historical', () => {
    expect(
      unitStatusAfterAssessment({
        current: 'ASSESSMENT_PENDING',
        outcome: 'PASS',
        hadPriorLessonWork: false,
      }),
    ).toBe('COMPLETE_BY_SKIP');
    expect(
      unitStatusAfterAssessment({
        current: 'ASSESSMENT_PENDING',
        outcome: 'PASS',
        hadPriorLessonWork: true,
      }),
    ).toBe('COMPLETE');
    expect(
      unitStatusAfterAssessment({
        current: 'ASSESSMENT_PENDING',
        outcome: 'FAIL',
        hadPriorLessonWork: true,
      }),
    ).toBe('IN_PROGRESS');
    expect(
      unitStatusAfterAssessment({
        current: 'COMPLETE',
        outcome: 'FAIL',
        hadPriorLessonWork: true,
      }),
    ).toBe('COMPLETE');
  });

  it('does not reset review scheduling on ordinary practice and expands intervals on review pass', () => {
    const schedule = {
      dueAt: new Date('2026-01-10T00:00:00Z'),
      intervalIndex: 0,
      lastOutcome: 'PASSED',
    };
    expect(preserveReviewScheduleForPractice(schedule)).toEqual(schedule);
    expect(advanceReviewSchedule(schedule, new Date('2026-01-11T00:00:00Z'), [3, 7])).toEqual({
      dueAt: new Date('2026-01-18T00:00:00Z'),
      intervalIndex: 1,
      lastOutcome: 'PASSED',
    });
    expect(
      advanceReviewSchedule(
        { ...schedule, intervalIndex: 1 },
        new Date('2026-01-11T00:00:00Z'),
        [3, 7],
      ).intervalIndex,
    ).toBe(1);
  });

  it('marks a lapsed review due immediately without changing its interval', () => {
    const now = new Date('2026-01-11T00:00:00Z');
    expect(
      lapseReviewSchedule(
        { dueAt: new Date('2026-01-18T00:00:00Z'), intervalIndex: 1, lastOutcome: 'PASSED' },
        now,
      ),
    ).toEqual({ dueAt: now, intervalIndex: 1, lastOutcome: 'LAPSED' });
  });

  it('grandfathers in-progress work and flags untouched downstream work as stale', () => {
    expect(
      flagStaleDownstreamEvidence({
        state: { targetStatus: 'IN_PROGRESS', staleEvidence: false, reEvaluationQueued: false },
        prerequisiteEstimate: 0.4,
        relockEstimate: 0.55,
      }),
    ).toEqual({ targetStatus: 'IN_PROGRESS', staleEvidence: false, reEvaluationQueued: true });
    expect(
      flagStaleDownstreamEvidence({
        state: { targetStatus: 'NOT_STARTED', staleEvidence: false, reEvaluationQueued: false },
        prerequisiteEstimate: 0.4,
        relockEstimate: 0.55,
      }),
    ).toEqual({ targetStatus: 'NOT_STARTED', staleEvidence: true, reEvaluationQueued: true });
  });

  it('never relocks historical completion or flags healthy prerequisites', () => {
    const complete = {
      targetStatus: 'COMPLETE' as const,
      staleEvidence: false,
      reEvaluationQueued: false,
    };
    expect(
      flagStaleDownstreamEvidence({
        state: complete,
        prerequisiteEstimate: 0.1,
        relockEstimate: 0.55,
      }),
    ).toEqual(complete);
    expect(
      flagStaleDownstreamEvidence({
        state: { targetStatus: 'NOT_STARTED', staleEvidence: false, reEvaluationQueued: false },
        prerequisiteEstimate: 0.8,
        relockEstimate: 0.55,
      }),
    ).toEqual({ targetStatus: 'NOT_STARTED', staleEvidence: false, reEvaluationQueued: false });
  });
});
