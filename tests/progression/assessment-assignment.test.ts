import { describe, expect, it } from 'vitest';

import { AssessmentContentItemSchema } from '../../src/contracts/progression';
import {
  AssessmentAssignmentError,
  assessmentKindMatchesTarget,
  selectAssessmentItems,
} from '../../src/progression/assessment-assignment';

const item = (id: string, skillCode = 'ratio-language') =>
  AssessmentContentItemSchema.parse({
    id,
    version: '1.0.0',
    title: id,
    role: 'assessment',
    skillRef: { code: skillCode, version: '1.0.0' },
    mode: 'core',
    difficulty: 'foundational',
    standards: ['6.RP.A.1'],
    observableEvidence: ['States a ratio.'],
    prompt: 'What ratio is shown?',
    assessmentBankRef: { code: 'bank', version: '1.0.0' },
    solutionRepresentation: 'A ratio',
    solutionMethod: 'Read the quantities in order.',
    deterministicValidator: {
      type: 'ratio',
      canonicalAnswer: '2:3',
      acceptedAnswers: ['2:3'],
      equivalenceNotes: 'Equivalent ratio forms are accepted.',
    },
    misconceptionCodes: [],
    forbiddenLeakagePatterns: ['2:3'],
    provenance: { origin: 'original', licenseStatus: 'owned' },
    review: {
      status: 'reviewed',
      reviewer: 'reviewer',
      reviewedAt: '2026-01-01',
      originalityStatement: 'Original.',
    },
    accessibilityNotes: 'Text is sufficient.',
    accessibleAlternative: 'Read the prompt aloud.',
    itemReadinessRefs: [],
  });

describe('assessment assignment selection', () => {
  it('rejects lesson and unit assessment target mismatches', () => {
    expect(assessmentKindMatchesTarget('LESSON_ASSESSMENT', 'UNIT')).toBe(false);
    expect(assessmentKindMatchesTarget('UNIT_ASSESSMENT', 'LESSON')).toBe(false);
    expect(assessmentKindMatchesTarget('LESSON_ASSESSMENT', 'LESSON')).toBe(true);
    expect(assessmentKindMatchesTarget('UNIT_ASSESSMENT', 'UNIT')).toBe(true);
    expect(assessmentKindMatchesTarget('REVIEW', 'LESSON')).toBe(false);
    expect(assessmentKindMatchesTarget('DELAYED_CHECK', 'LESSON')).toBe(false);
  });
  it('selects server-owned items in stable order and excludes prior items', () => {
    const selected = selectAssessmentItems(
      {
        code: 'bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [item('a'), item('b'), item('c')].map((candidate) => ({
          ...candidate,
          hash: `sha256:${candidate.id}`,
        })),
      },
      2,
      new Set(['a@1.0.0']),
    );
    expect(selected).toEqual([
      { id: 'b', version: '1.0.0', hash: 'sha256:b', ordinal: 1 },
      { id: 'c', version: '1.0.0', hash: 'sha256:c', ordinal: 2 },
    ]);
  });

  it('fails closed when the eligible bank is too small', () => {
    expect(() =>
      selectAssessmentItems(
        { code: 'bank', version: '1.0.0', contentHash: 'sha256:bank', items: [] },
        1,
      ),
    ).toThrowError(AssessmentAssignmentError);
  });

  it('selects coverage for every required unit skill before filling remaining slots', () => {
    const selected = selectAssessmentItems(
      {
        code: 'bank',
        version: '1.0.0',
        contentHash: 'sha256:bank',
        items: [
          item('ratio-a'),
          item('ratio-b'),
          item('unit-rate-a', 'unit-rates'),
          item('ratio-tables-a', 'ratio-tables'),
        ].map((candidate) => ({ ...candidate, hash: `sha256:${candidate.id}` })),
      },
      3,
      new Set(),
      ['ratio-language', 'unit-rates', 'ratio-tables'],
    );
    expect(selected.map(({ id }) => id)).toEqual(['ratio-a', 'unit-rate-a', 'ratio-tables-a']);
  });
});
