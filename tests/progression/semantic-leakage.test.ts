import { describe, expect, it } from 'vitest';

import { containsProtectedAnswer } from '../../src/contracts/answer-leakage';

describe('semantic answer leakage detection', () => {
  it('catches equivalent fraction and decimal forms', () => {
    expect(containsProtectedAnswer('The result is about 0.25 miles.', ['1/4'])).toBe(true);
    expect(containsProtectedAnswer('The result is one quarter.', ['1/4'])).toBe(false);
  });

  it('catches scaled ratio forms and embedded numeric answers', () => {
    expect(containsProtectedAnswer('The ratio is 4:6.', ['2:3'])).toBe(true);
    expect(containsProtectedAnswer('The answer is about 15 miles.', ['15'])).toBe(true);
  });

  it('does not treat unrelated text as an answer leak', () => {
    expect(containsProtectedAnswer('Compare the two quantities first.', ['1/4'])).toBe(false);
    expect(containsProtectedAnswer('Try a table before calculating.', ['2:3'])).toBe(false);
  });
});
