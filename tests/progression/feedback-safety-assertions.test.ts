import { describe, expect, it } from 'vitest';

import { containsSensitiveFeedback } from '../progression-integration/feedback-safety-assertions';

describe('feedback safety assertions', () => {
  it('detects an answer embedded in prose', () => {
    expect(containsSensitiveFeedback({ message: 'The answer is 2:3.' })).toBe(true);
  });

  it('does not treat ISO timestamps as answer leakage', () => {
    expect(containsSensitiveFeedback({ scoredAt: '2026-09-22T01:03:44.000Z' })).toBe(false);
    expect(containsSensitiveFeedback({ scoredAt: '2026-09-22T01:03:44.000-07:00' })).toBe(false);
  });

  it('still scans non-timestamp values under temporal-looking keys', () => {
    expect(containsSensitiveFeedback({ scoredAt: 'The answer is 2:3.' })).toBe(true);
  });
});
