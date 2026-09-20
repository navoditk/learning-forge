import { describe, expect, it } from 'vitest';

import { assessmentPasses } from '../../src/progression/assessment-scoring';

describe('assessment scoring', () => {
  it('requires a correct item for every covered lesson skill', () => {
    expect(
      assessmentPasses({
        kind: 'LESSON_ASSESSMENT',
        items: [
          { correctness: 'CORRECT', skillCode: 'skill-a' },
          { correctness: 'CORRECT', skillCode: 'skill-a' },
          { correctness: 'CORRECT', skillCode: 'skill-a' },
        ],
        requiredCorrect: 3,
        coveredSkillCodes: ['skill-a', 'skill-b'],
      }),
    ).toBe(false);
    expect(
      assessmentPasses({
        kind: 'LESSON_ASSESSMENT',
        items: [
          { correctness: 'CORRECT', skillCode: 'skill-a' },
          { correctness: 'CORRECT', skillCode: 'skill-a' },
          { correctness: 'CORRECT', skillCode: 'skill-b' },
        ],
        requiredCorrect: 3,
        coveredSkillCodes: ['skill-a', 'skill-b'],
      }),
    ).toBe(true);
  });

  it('keeps the ordinary pass bar for non-lesson assessments', () => {
    expect(
      assessmentPasses({
        kind: 'UNIT_ASSESSMENT',
        items: [{ correctness: 'CORRECT', skillCode: 'skill-a' }],
        requiredCorrect: 1,
        coveredSkillCodes: ['skill-a', 'skill-b'],
      }),
    ).toBe(true);
  });
});
