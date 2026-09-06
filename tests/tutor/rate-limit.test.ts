import { beforeEach, describe, expect, it } from 'vitest';

import { checkRateLimit, resetRateLimitForTests } from '../../src/tutor';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it('allows calls up to the configured limit within the window', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i += 1) {
      expect(() => checkRateLimit(now, 5)).not.toThrow();
    }
  });

  it('throws once the limit is exceeded within the same window', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i += 1) checkRateLimit(now, 5);
    expect(() => checkRateLimit(now, 5)).toThrow(/rate limit exceeded/);
  });

  it('resets the count once the window has elapsed', () => {
    const start = Date.now();
    for (let i = 0; i < 5; i += 1) checkRateLimit(start, 5);
    expect(() => checkRateLimit(start, 5)).toThrow();

    const later = start + 60 * 60 * 1000 + 1;
    expect(() => checkRateLimit(later, 5)).not.toThrow();
  });
});
