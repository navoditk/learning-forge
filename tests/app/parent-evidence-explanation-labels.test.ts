import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ParentEvidence } from '../../src/app/components/parent-evidence';
import {
  EXPLANATION_SELECTION_ITEMS,
  selectionLabelsForAttempt,
  SPELLING_EXPLANATION_PARTIAL_LABEL,
  SPELLING_GENERATED_EXPLANATION_LABEL,
  SPELLING_SELECTED_EXPLANATION_LABEL,
} from '../../src/curriculum/evidence-labels';

const KEY = 'snsb6-orthographic-patterns-core-1';
const labels = [
  SPELLING_SELECTED_EXPLANATION_LABEL,
  SPELLING_EXPLANATION_PARTIAL_LABEL,
  SPELLING_GENERATED_EXPLANATION_LABEL,
];

describe('selectionLabelsForAttempt', () => {
  it('labels an exact allowlisted correct attempt', () => {
    expect(
      selectionLabelsForAttempt({
        contentKey: KEY,
        contentVersion: 'content-2',
        correctness: 'CORRECT',
      }),
    ).toEqual(labels);
  });
  it('gives nothing for wrong version, missing version, incorrect or unknown item', () => {
    const base = { contentKey: KEY, contentVersion: 'content-2', correctness: 'CORRECT' };
    expect(selectionLabelsForAttempt({ ...base, contentVersion: 'content-1' })).toBeNull();
    expect(selectionLabelsForAttempt({ ...base, contentVersion: 'content-3' })).toBeNull();
    expect(selectionLabelsForAttempt({ ...base, contentVersion: null })).toBeNull();
    expect(selectionLabelsForAttempt({ ...base, correctness: 'INCORRECT' })).toBeNull();
    expect(selectionLabelsForAttempt({ ...base, correctness: 'PARTIAL' })).toBeNull();
    expect(selectionLabelsForAttempt({ ...base, contentKey: 'ratio-language-1' })).toBeNull();
  });
  it('allowlist is exact id@version', () => {
    expect([...EXPLANATION_SELECTION_ITEMS.keys()]).toEqual([`${KEY}@content-2`]);
  });
});

describe('ParentEvidence explanation labels', () => {
  it('renders labels beside the matching attempt only', () => {
    const html = renderToStaticMarkup(
      React.createElement(ParentEvidence, {
        evidence: {
          learnerName: 'Synthetic',
          mastery: [],
          attempts: [
            {
              id: 'a1',
              contentKey: 'ratio-language-1',
              correctness: 'CORRECT',
              highestAssistance: 'INDEPENDENT',
              explanationLabels: [],
            },
            {
              id: 'a2',
              contentKey: KEY,
              correctness: 'CORRECT',
              highestAssistance: 'INDEPENDENT',
              explanationLabels: labels,
            },
          ],
        },
      }),
    );
    const [first, second] = html.split(`${KEY}:`);
    expect(first).not.toContain(SPELLING_SELECTED_EXPLANATION_LABEL);
    for (const label of labels) expect(second).toContain(label);
    expect(html.split(SPELLING_SELECTED_EXPLANATION_LABEL)).toHaveLength(2);
  });
});
