import { describe, expect, it } from 'vitest';

import { AttemptContextSchema } from '../../src/contracts/common';

describe('progression attempt contexts', () => {
  it('keeps assessment evidence distinct from legacy practice contexts', () => {
    expect(AttemptContextSchema.parse('placement')).toBe('placement');
    expect(AttemptContextSchema.parse('lesson_assessment')).toBe('lesson_assessment');
    expect(AttemptContextSchema.parse('unit_assessment')).toBe('unit_assessment');
    expect(AttemptContextSchema.parse('delayed_check')).toBe('delayed_check');
    expect(AttemptContextSchema.parse('review')).toBe('review');
  });
});
