import { describe, expect, it } from 'vitest';

import { deriveHighestAssistance } from '../../src/progression/assistance';

describe('assistance evidence derivation', () => {
  it('retains the maximum immutable assistance level when later help is lighter', () => {
    expect(
      deriveHighestAssistance([
        { level: 'GUIDED_FULL_SOLUTION' },
        { level: 'CLARIFYING_QUESTION' },
      ]),
    ).toBe('GUIDED_FULL_SOLUTION');
  });

  it('uses the stored summary only when no immutable events exist', () => {
    expect(deriveHighestAssistance([], 'SMALL_STRATEGIC_HINT')).toBe('SMALL_STRATEGIC_HINT');
  });
});
