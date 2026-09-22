import { describe, expect, it } from 'vitest';

import { flagStaleDownstreamEvidence } from '../../src/progression/unlock-relock';

describe('downstream relock policy', () => {
  it('grandfathers in-progress work but flags untouched work as stale', () => {
    expect(
      flagStaleDownstreamEvidence({
        state: { targetStatus: 'IN_PROGRESS', staleEvidence: false, reEvaluationQueued: false },
        prerequisiteEstimate: 0.4,
        relockEstimate: 0.55,
      }),
    ).toMatchObject({
      targetStatus: 'IN_PROGRESS',
      reEvaluationQueued: true,
      staleEvidence: false,
    });
    expect(
      flagStaleDownstreamEvidence({
        state: { targetStatus: 'NOT_STARTED', staleEvidence: false, reEvaluationQueued: false },
        prerequisiteEstimate: 0.4,
        relockEstimate: 0.55,
      }),
    ).toMatchObject({ targetStatus: 'NOT_STARTED', reEvaluationQueued: true, staleEvidence: true });
  });
});
