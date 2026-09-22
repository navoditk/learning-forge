import { describe, expect, it } from 'vitest';

import {
  lessonStatusAfterAssessment,
  lessonStateAfterReviewLapse,
  unitStatusAfterAssessment,
  unitStatusAfterLessonUpdate,
} from '../../src/progression/learner-state';

describe('lesson and unit progression state machines', () => {
  it('allows completion with assistance while keeping remediation separate', () => {
    expect(
      lessonStatusAfterAssessment({
        current: undefined,
        outcome: 'PASS',
        firstRun: false,
        hadPriorWork: true,
      }),
    ).toEqual({ completionStatus: 'COMPLETE', remediationStatus: 'NONE' });
    expect(
      lessonStatusAfterAssessment({
        current: 'COMPLETE',
        outcome: 'FAIL',
        firstRun: false,
        hadPriorWork: true,
      }),
    ).toEqual({ completionStatus: 'COMPLETE', remediationStatus: 'ACTIVE' });
  });

  it('requires every lesson to be complete before a unit becomes assessment-pending', () => {
    expect(unitStatusAfterLessonUpdate(['COMPLETE', 'COMPLETE_BY_SKIP'])).toBe(
      'ASSESSMENT_PENDING',
    );
    expect(unitStatusAfterLessonUpdate(['COMPLETE', 'IN_PROGRESS'])).toBe('IN_PROGRESS');
  });

  it('keeps a completed unit historical after a later failed assessment', () => {
    expect(
      unitStatusAfterAssessment({
        current: 'COMPLETE',
        outcome: 'FAIL',
        hadPriorLessonWork: true,
      }),
    ).toBe('COMPLETE');
  });

  it('activates remediation after a lapsed review without changing completion', () => {
    expect(
      lessonStateAfterReviewLapse({ completionStatus: 'COMPLETE', remediationStatus: 'NONE' }),
    ).toEqual({ completionStatus: 'COMPLETE', remediationStatus: 'ACTIVE' });
    expect(
      lessonStateAfterReviewLapse({
        completionStatus: 'COMPLETE_BY_SKIP',
        remediationStatus: 'NONE',
      }),
    ).toEqual({ completionStatus: 'COMPLETE_BY_SKIP', remediationStatus: 'ACTIVE' });
  });
});
