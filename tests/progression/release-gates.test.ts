import { describe, expect, it } from 'vitest';

import { isProgressionReleaseGateOpen } from '../../src/progression/release-gates';

describe('progression release gate', () => {
  it('is closed unless explicitly opened', () => {
    expect(isProgressionReleaseGateOpen(undefined)).toBe(false);
    expect(isProgressionReleaseGateOpen('false')).toBe(false);
    expect(isProgressionReleaseGateOpen('true')).toBe(true);
  });
});
