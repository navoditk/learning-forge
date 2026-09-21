import { describe, expect, it } from 'vitest';

import { isUnboundSession } from '../../src/progression/legacy-session-drain';

describe('legacy session drain guard', () => {
  it('recognizes a legacy session with any missing immutable binding', () => {
    expect(
      isUnboundSession({
        activityKind: 'PRACTICE',
        targetCode: 'ratio-language-1',
        targetVersion: 'content-1',
        assignmentId: null,
        policyProfileCode: null,
        policyProfileVersion: '1.0.0',
      }),
    ).toBe(true);
  });

  it('does not classify a fully bound session as legacy', () => {
    expect(
      isUnboundSession({
        activityKind: 'LESSON_ASSESSMENT',
        targetCode: 'ratio-language-lesson',
        targetVersion: '1.0.0',
        assignmentId: 'assignment-1',
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
      }),
    ).toBe(false);
  });

  it('does not classify ordinary practice without an assignment as legacy', () => {
    expect(
      isUnboundSession({
        activityKind: 'PRACTICE',
        targetCode: 'ratio-language-1',
        targetVersion: 'content-1',
        assignmentId: null,
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
      }),
    ).toBe(false);
  });

  it('still requires an assignment for assessment activities', () => {
    expect(
      isUnboundSession({
        activityKind: 'LESSON_ASSESSMENT',
        targetCode: 'ratio-language-lesson',
        targetVersion: '1.0.0',
        assignmentId: null,
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
      }),
    ).toBe(true);
  });
});
