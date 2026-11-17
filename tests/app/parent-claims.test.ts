import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  hasScienceEvidence,
  hasSpellingEvidence,
  SCIENCE_EVIDENCE_NOTE,
  SPELLING_EVIDENCE_NOTE,
} from '../../src/app/parent-claims';
import { ParentEvidence, type ParentEvidenceData } from '../../src/app/components/parent-evidence';
import { programsByCode } from '../../src/curriculum/program-registry';

const h = React.createElement;

const syntheticEvidence = (skillCode: string): ParentEvidenceData => ({
  learnerName: 'Synthetic learner',
  attempts: [],
  mastery: [
    {
      skillCode,
      estimate: 0.5,
      confidenceBand: 'LOW',
      independentDelayedCheck: false,
    },
  ],
});

const renderParentEvidence = (evidence: ParentEvidenceData) =>
  renderToStaticMarkup(h(ParentEvidence, { evidence }));

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

  it('has a practice-only Spelling note keyed on the program prefix', () => {
    expect(hasSpellingEvidence([{ skillCode: 'unit-rates' }, { skillCode: 'sci6-x' }])).toBe(false);
    expect(hasSpellingEvidence([{ skillCode: 'snsb6-orthography-x' }])).toBe(true);
    expect(SPELLING_EVIDENCE_NOTE).toContain('practice only');
  });

  it('renders the Spelling note for a synthetic Spelling row only', () => {
    const spellingMarkup = renderParentEvidence(syntheticEvidence('snsb6-orthography-x'));
    const mathMarkup = renderParentEvidence(syntheticEvidence('unit-rates'));

    expect(spellingMarkup).toContain(SPELLING_EVIDENCE_NOTE);
    expect(mathMarkup).not.toContain(SPELLING_EVIDENCE_NOTE);
  });

  it('is wired into the parent page once, with no literal prefix', () => {
    const page = readFileSync('src/app/parent/page.tsx', 'utf8');
    const component = readFileSync('src/app/components/parent-evidence.tsx', 'utf8');
    expect(page).toContain('<ParentEvidence evidence={evidence} />');
    expect(component.match(/SCIENCE_EVIDENCE_NOTE/g)).toHaveLength(2); // import + render
    expect(component).toContain('hasScienceEvidence(evidence.mastery)');
    expect(page).not.toContain('sci6-');
    expect(component).not.toContain('sci6-');
    expect(component).not.toContain('snsb6-');
  });
});
