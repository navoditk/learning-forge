import { describe, expect, it } from 'vitest';

import { parseShadowReviewDispositions } from '../../src/progression/shadow-review-input';

describe('shadow review disposition input', () => {
  it('accepts only redacted terminal dispositions', () => {
    expect(
      parseShadowReviewDispositions([
        { decisionId: 'shadow-1', status: 'EXPLAINED' },
        { decisionId: 'shadow-2', status: 'REQUIRES_REMEDIATION' },
      ]),
    ).toEqual([
      { decisionId: 'shadow-1', status: 'EXPLAINED' },
      { decisionId: 'shadow-2', status: 'REQUIRES_REMEDIATION' },
    ]);
  });

  it('rejects free text or learner identifiers', () => {
    expect(() =>
      parseShadowReviewDispositions([
        {
          decisionId: 'shadow-1',
          status: 'EXPLAINED',
          learnerProfileId: 'should-not-be-accepted',
        },
      ]),
    ).toThrow();
  });
});
