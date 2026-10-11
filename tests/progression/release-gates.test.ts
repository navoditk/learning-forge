import { describe, expect, it } from 'vitest';

import {
  isC4SessionBindingEnforced,
  isProgressionReleaseGateOpen,
} from '../../src/progression/release-gates';

describe('progression release gate', () => {
  it('is closed unless explicitly opened', () => {
    expect(isProgressionReleaseGateOpen(undefined)).toBe(false);
    expect(isProgressionReleaseGateOpen('false')).toBe(false);
    expect(isProgressionReleaseGateOpen('true')).toBe(true);
  });
});

describe('C4 session-binding enforcement', () => {
  it('is off unless explicitly enforced, independent of the release gate', () => {
    expect(isC4SessionBindingEnforced(undefined)).toBe(false);
    expect(isC4SessionBindingEnforced('false')).toBe(false);
    expect(isC4SessionBindingEnforced('true')).toBe(true);
  });
});
