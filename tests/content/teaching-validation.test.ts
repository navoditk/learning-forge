import { describe, expect, it } from 'vitest';

import { contentCatalog, validateContentCatalog } from '../../src/content/catalog';
import { practiceIds, validateTeachingRecords } from '../../src/content/teaching-validation';
import { syntheticRatioTeaching as record } from './fixtures/synthetic-ratio-teaching';

describe('dormant teaching-content validation (synthetic fixtures)', () => {
  it('accepts a valid synthetic record', () => {
    const [parsed] = validateTeachingRecords([record()]);
    expect(parsed?.role).toBe('teaching');
  });

  it('accepts an empty batch', () => {
    expect(validateTeachingRecords([])).toEqual([]);
  });

  it('rejects schema violations with the record id', () => {
    expect(() => validateTeachingRecords([record({ explanation: '' })])).toThrow(
      /ratio-language-teaching-1 is not a valid teaching record/,
    );
    expect(() => validateTeachingRecords([record({ role: 'practice' })])).toThrow(
      /not a valid teaching record/,
    );
    expect(() => validateTeachingRecords([record({ extra: true })])).toThrow(
      /not a valid teaching record/,
    );
    expect(() => validateTeachingRecords(['nope'])).toThrow(/#0 is not a valid teaching record/);
  });

  it('rejects an unknown skill', () => {
    expect(() =>
      validateTeachingRecords([
        record({
          id: 'no-such-skill-teaching-1',
          skillRef: { code: 'no-such-skill', version: '1' },
        }),
      ]),
    ).toThrow(/references unknown skill: no-such-skill/);
  });

  it('rejects difficulty not declared by the skill', () => {
    expect(() => validateTeachingRecords([record({ difficulty: 'challenging' })])).toThrow(
      /not declared in ratio-language's difficultyBands/,
    );
  });

  it('rejects invalid readiness references', () => {
    expect(() =>
      validateTeachingRecords([
        record({ itemReadinessRefs: [{ code: 'ratio-language', version: '1.0.0' }] }),
      ]),
    ).toThrow(/cannot declare its owning skill as item readiness/);
    expect(() =>
      validateTeachingRecords([
        record({ itemReadinessRefs: [{ code: 'no-such-skill', version: '1' }] }),
      ]),
    ).toThrow(/unknown item readiness skill/);
  });

  it('rejects licensed or unowned provenance', () => {
    expect(() =>
      validateTeachingRecords([
        record({
          provenance: { origin: 'licensed', licenseStatus: 'licensed', sourceReference: 'x' },
        }),
      ]),
    ).toThrow(/licensed content is not yet supported/);
    expect(() =>
      validateTeachingRecords([
        record({ provenance: { origin: 'llm_drafted', licenseStatus: 'pending_review' } }),
      ]),
    ).toThrow(/must be marked owned/);
    expect(() =>
      validateTeachingRecords([
        record({ provenance: { origin: 'licensed', licenseStatus: 'owned' } }),
      ]),
    ).toThrow(/not a valid teaching record/);
  });

  it('rejects incomplete review metadata', () => {
    const base = record().review;
    expect(() =>
      validateTeachingRecords([record({ review: { ...base, reviewedAt: undefined } })]),
    ).toThrow(/Completed review requires a review date/);
    expect(() =>
      validateTeachingRecords([record({ review: { ...base, originalityStatement: '' } })]),
    ).toThrow(/not a valid teaching record/);
    expect(() => validateTeachingRecords([record({ review: undefined })])).toThrow(
      /not a valid teaching record/,
    );
  });

  it('rejects an id that collides with a practice id', () => {
    const practiceId = contentCatalog[0]!.id;
    expect(practiceIds().has(practiceId)).toBe(true);
    expect(() =>
      validateTeachingRecords([record()], new Set(['ratio-language-teaching-1'])),
    ).toThrow(/collides with a practice content id/);
    // Live catalog default: a record borrowing a real practice id is rejected.
    expect(() => validateTeachingRecords([record({ id: practiceId })])).toThrow(
      /collides with a practice content id/,
    );
  });

  it('rejects malformed ids and versions', () => {
    for (const id of [
      'ratio-language-teaching',
      'ratio-language-teaching-0',
      'unit-rates-teaching-1',
    ]) {
      expect(() => validateTeachingRecords([record({ id })])).toThrow(
        /must be named <skill-code>-teaching-<n>/,
      );
    }
    for (const version of ['1.0.0', 'content-0', 'content-', 'v1']) {
      expect(() => validateTeachingRecords([record({ version })])).toThrow(
        /must match content-<n>/,
      );
    }
  });

  it('rejects duplicate id@version', () => {
    expect(() => validateTeachingRecords([record(), record()])).toThrow(/must be unique/);
  });

  it('leaves the live practice catalog practice-only', () => {
    expect(contentCatalog.every((item) => item.role === 'practice')).toBe(true);
  });

  // Drift detection: the difficulty and provenance rules are copies of the live
  // practice loader's, so run identical inputs through both boundaries.
  describe('conformance with the live practice validation path', () => {
    const livePractice = contentCatalog.find((item) => item.skillRef.code === 'ratio-language')!;
    const asPractice = (overrides: Record<string, unknown>) => ({
      ...JSON.parse(JSON.stringify(livePractice)),
      id: 'ratio-language-conformance-probe',
      ...overrides,
    });
    const live = (overrides: Record<string, unknown>) => () =>
      validateContentCatalog([...contentCatalog, asPractice(overrides)] as unknown[]);
    const teaching = (overrides: Record<string, unknown>) => () =>
      validateTeachingRecords([record(overrides)]);

    it('agree on an acceptable difficulty and owned original provenance', () => {
      expect(live({ difficulty: 'foundational' })).not.toThrow();
      expect(teaching({ difficulty: 'foundational' })).not.toThrow();
    });

    const rejected: [string, Record<string, unknown>, RegExp][] = [
      [
        'undeclared difficulty',
        { difficulty: 'challenging' },
        /has difficulty "challenging" not declared in ratio-language's difficultyBands/,
      ],
      [
        'licensed origin',
        { provenance: { origin: 'licensed', licenseStatus: 'licensed', sourceReference: 'x' } },
        /licensed content is not yet supported by this catalog/,
      ],
      [
        'unowned license status',
        { provenance: { origin: 'llm_drafted', licenseStatus: 'pending_review' } },
        /must be marked owned for the Phase 0 seed/,
      ],
    ];
    for (const [name, overrides, pattern] of rejected) {
      it(`agree on rejecting ${name}`, () => {
        expect(live(overrides)).toThrow(pattern);
        expect(teaching(overrides)).toThrow(pattern);
      });
    }
  });
});
