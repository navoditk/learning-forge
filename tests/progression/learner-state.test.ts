import { describe, expect, it } from 'vitest';

import {
  lessonStatusAfterAssessment,
  unitStatusAfterLessonUpdate,
} from '../../src/progression/learner-state';

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
  });
});
