import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { hasScienceEvidence, SCIENCE_EVIDENCE_NOTE } from '../../src/app/parent-claims';
import { programsByCode } from '../../src/curriculum/program-registry';

describe('hasScienceEvidence', () => {
  it('is false for no rows and for Math-only rows', () => {
    expect(hasScienceEvidence([])).toBe(false);
    expect(hasScienceEvidence([{ skillCode: 'unit-rates' }, { skillCode: 'ratio-tables' }])).toBe(
      false,
    );
  });

  it('is true when any row starts with the registry Science prefix', () => {
    const prefix = programsByCode.get('grade-6-science')?.skillCodePrefix;
    expect(prefix).toBe('sci6-');
    expect(hasScienceEvidence([{ skillCode: 'unit-rates' }, { skillCode: `${prefix}x` }])).toBe(
      true,
    );
    expect(hasScienceEvidence([{ skillCode: 'sci6-cells-evidence-of-life' }])).toBe(true);
  });

  it('matches only a leading prefix', () => {
    expect(hasScienceEvidence([{ skillCode: 'not-sci6-skill' }, { skillCode: 'sci6' }])).toBe(
      false,
    );
  });

  it('keeps the exact owner-approved note text (D-191)', () => {
    expect(SCIENCE_EVIDENCE_NOTE).toBe(
      'Grade 6 Science rows come from practice checks on provided cell models, two items per topic. They do not show mastery of a full science standard, investigation skills or building models.',
    );
  });

  it('is wired into the parent page once, with no literal prefix', () => {
    const page = readFileSync('src/app/parent/page.tsx', 'utf8');
    expect(page.match(/SCIENCE_EVIDENCE_NOTE/g)).toHaveLength(2); // import + render
    expect(page).toContain('hasScienceEvidence(evidence.mastery)');
    expect(page).not.toContain('sci6-');
  });
});
