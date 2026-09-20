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
        policyProfileVersion: '1.0.0',
      }),
    ).toBe(false);
  });
});
