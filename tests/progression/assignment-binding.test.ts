import { describe, expect, it } from 'vitest';

import {
  ALWAYS_ASSIGNMENT_BOUND_KINDS,
  contentSessionRequiresAssignment,
  UNIT_ASSIGNMENT_BOUND_KINDS,
} from '../../src/progression/assignment-binding';
import { isSkillClaimedByAuthoredUnit } from '../../src/curriculum/unit-claims';

describe('D-62 assignment binding', () => {
  it('derives both kind sets from the shared predicate', () => {
    expect([...ALWAYS_ASSIGNMENT_BOUND_KINDS].sort()).toEqual([
      'DELAYED_CHECK',
      'LESSON_ASSESSMENT',
      'UNIT_ASSESSMENT',
    ]);
    expect([...UNIT_ASSIGNMENT_BOUND_KINDS].sort()).toEqual(['PLACEMENT', 'REVIEW']);
  });

  it('resolves unit claims from authored units only', () => {
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'ratio-language')).toBe(true);
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'gcf-and-lcm')).toBe(false);
    expect(isSkillClaimedByAuthoredUnit('unknown-program', 'ratio-language')).toBe(false);
  });

  it('requires an assignment for placement and review only on unit-claimed content', () => {
    expect(contentSessionRequiresAssignment('REVIEW', 'ratio-language-1')).toBe(true);
    expect(contentSessionRequiresAssignment('PLACEMENT', 'unit-rates-1')).toBe(true);
    expect(contentSessionRequiresAssignment('REVIEW', 'gcf-and-lcm-1')).toBe(false);
    expect(contentSessionRequiresAssignment('PRACTICE', 'ratio-language-1')).toBe(false);
    expect(contentSessionRequiresAssignment('DELAYED_CHECK', 'gcf-and-lcm-1')).toBe(true);
  });

  it('never requires placement or review assignments for skill-graph-only programs', () => {
    for (const contentId of [
      'mk6-multi-step-arithmetic-reasoning-1',
      'moems6-number-and-place-value-1',
      'amc8-counting-probability-1',
      'mc6-number-theory-fundamentals-1',
    ]) {
      expect(contentSessionRequiresAssignment('PLACEMENT', contentId), contentId).toBe(false);
      expect(contentSessionRequiresAssignment('REVIEW', contentId), contentId).toBe(false);
    }
  });

  it('fails closed for a target that no longer resolves', () => {
    expect(contentSessionRequiresAssignment('REVIEW', 'retired-content-id')).toBe(true);
  });
});
