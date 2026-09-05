import { describe, expect, it } from 'vitest';

import { foundationStatus } from '../src/foundation';

describe('repository foundation', () => {
  it('exposes a stable foundation status for the smoke test', () => {
    expect(foundationStatus).toBe('ready');
  });
});
