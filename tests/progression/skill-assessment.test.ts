import { describe, expect, it } from 'vitest';

import { assessmentKindMatchesTarget } from '../../src/progression/assessment-assignment';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { pilotSkillRef, skillAssessmentBank } from '../../src/progression/skill-assessment';

describe('skill-targeted assessment metadata', () => {
  const profile = resolvePinnedPolicyProfile({ code: 'grade-6-math-default', version: '1.0.0' });

  it('matches delayed checks and reviews only to skill targets', () => {
    expect(assessmentKindMatchesTarget('DELAYED_CHECK', 'SKILL')).toBe(true);
    expect(assessmentKindMatchesTarget('REVIEW', 'SKILL')).toBe(true);
    expect(assessmentKindMatchesTarget('DELAYED_CHECK', 'LESSON')).toBe(false);
    expect(assessmentKindMatchesTarget('LESSON_ASSESSMENT', 'SKILL')).toBe(false);
    expect(assessmentKindMatchesTarget('PLACEMENT', 'SKILL')).toBe(false);
  });

  it('resolves only pilot skills at their pinned version', () => {
    expect(pilotSkillRef('unit-rates', '1.0.0')).toEqual({ code: 'unit-rates', version: '1.0.0' });
    expect(pilotSkillRef('unit-rates', '9.9.9')).toBeUndefined();
    expect(pilotSkillRef('gcf-and-lcm', '1.0.0')).toBeUndefined();
  });

  it('sizes each pilot skill bank from the approved decisions', () => {
    for (const code of ['ratio-language', 'unit-rates', 'ratio-tables']) {
      const skillRef = { code, version: '1.0.0' };
      const review = skillAssessmentBank('REVIEW', skillRef);
      const delayed = skillAssessmentBank('DELAYED_CHECK', skillRef);
      // D-50: review records per skill.
      expect(review).toMatchObject({ code: `${code}-review-bank`, itemCount: 2 });
      // D-63: itemsPerAttempt × (1 + maxReassessments), arithmetic from D-43/D-27.
      expect(delayed).toMatchObject({
        code: `${code}-delayed-check-bank`,
        itemCount: profile.delayedCheckItemsPerAttempt * (1 + profile.maxReassessments),
      });
      expect(review?.coveredSkillRefs).toEqual([skillRef]);
      expect(delayed?.targetRef).toEqual(skillRef);
    }
  });
});
