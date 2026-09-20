import { describe, expect, it } from 'vitest';

import { evaluatePlacementProbe } from '../../src/progression/placement';

const refs = {
  programRef: { code: 'grade-6-math', version: '1.0.0' },
  unitRef: { code: 'ratios-and-proportional-reasoning', version: '1.0.0' },
  lessonRef: { code: 'unit-rates-lesson', version: '1.0.0' },
};

describe('placement probe semantics', () => {
  it('sets position but never delayed confirmation or high confidence', () => {
    expect(evaluatePlacementProbe({ ...refs, outcome: 'PASS' })).toEqual({
      method: 'PLACEMENT_PROBE',
      outcome: 'PASS',
      position: refs,
      confidenceBand: 'LOW',
      delayedCheckStatus: 'UNTOUCHED',
      masteryContext: 'PLACEMENT',
    });
  });

  it('does not move position after a failed probe', () => {
    expect(evaluatePlacementProbe({ ...refs, outcome: 'FAIL' })).toMatchObject({
      outcome: 'FAIL',
      position: null,
      confidenceBand: 'LOW',
      delayedCheckStatus: 'UNTOUCHED',
    });
  });
});
