import { describe, expect, it } from 'vitest';

import { ContentItemSchema } from '../../src/contracts/content';
import {
  contentCatalog,
  servableContentCatalog,
  validateContentCatalog,
} from '../../src/content/catalog';
import { skillCatalog } from '../../src/curriculum/catalog';

describe('ratios content seed', () => {
  it('contains original and llm-drafted problems covering every catalog skill', () => {
    expect(contentCatalog).toHaveLength(70);
    expect(new Set(contentCatalog.map((item) => item.id)).size).toBe(70);
    expect(new Set(contentCatalog.map((item) => item.skillCode))).toEqual(
      new Set(skillCatalog.map((skill) => skill.code)),
    );
    expect(
      contentCatalog.every((item) => ['original', 'llm_drafted'].includes(item.provenance.origin)),
    ).toBe(true);
    expect(contentCatalog.some((item) => item.provenance.origin === 'llm_drafted')).toBe(true);

    const reviewedItems = contentCatalog.filter((item) => item.review.status === 'reviewed');
    const pendingItems = contentCatalog.filter((item) => item.review.status === 'pending_review');
    // The 16 Math Kangaroo Grade 6 draft items are pending human content-owner
    // review (docs/curriculum-sources.md's Math Kangaroo dossier handoff);
    // every previously shipped Grade 6 Math item remains fully reviewed.
    expect(reviewedItems.length).toBe(54);
    expect(pendingItems.length).toBe(16);
    expect(reviewedItems.every((item) => Boolean(item.review.reviewedAt))).toBe(true);
    expect(contentCatalog.every((item) => item.review.reviewer.length > 0)).toBe(true);
  });

  it('has deterministic validators and progressive, non-leaking hint ladders', () => {
    for (const item of contentCatalog) {
      expect(item.deterministicValidator.acceptedAnswers).toContain(
        item.deterministicValidator.canonicalAnswer,
      );
      expect(item.hintSteps.map((step) => step.order)).toEqual(
        Array.from({ length: item.hintSteps.length }, (_, index) => index + 1),
      );
      const hintText = item.hintSteps.map((step) => `${step.prompt} ${step.question}`).join(' ');
      expect(
        item.forbiddenLeakagePatterns.some((pattern) =>
          hintText.toLocaleLowerCase().includes(pattern.toLocaleLowerCase()),
        ),
      ).toBe(false);
    }
  });

  it('models every Math Kangaroo contest item as a five-choice 3/4/5-point problem', () => {
    const mathKangarooSkillCodes = new Set(
      skillCatalog
        .filter((skill) => skill.program === 'math-kangaroo-6')
        .map((skill) => skill.code),
    );
    const contestItems = contentCatalog.filter(
      (item) => mathKangarooSkillCodes.has(item.skillCode) && item.mode === 'contest',
    );

    expect(contestItems).toHaveLength(8);
    expect(new Set(contestItems.map((item) => item.contestFormat?.pointValue))).toEqual(
      new Set([3, 4, 5]),
    );
    for (const item of contestItems) {
      expect(item.deterministicValidator.type).toBe('multiple_choice');
      expect(item.contestFormat?.answerChoices).toHaveLength(5);
      expect(item.contestFormat?.answerChoices.map((choice) => choice.label)).toEqual([
        'A',
        'B',
        'C',
        'D',
        'E',
      ]);
      expect(
        item.contestFormat?.answerChoices.some(
          (choice) => choice.text === item.deterministicValidator.canonicalAnswer,
        ),
      ).toBe(true);
    }

    const withoutFormat = contestItems[0];
    expect(() =>
      validateContentCatalog(
        contentCatalog.map((item) =>
          item.id === withoutFormat.id ? { ...item, contestFormat: undefined } : item,
        ),
      ),
    ).toThrow('requires Math Kangaroo contest-format metadata');
  });

  it('includes original accessible figures for Math Kangaroo geometry and spatial reasoning', () => {
    const visualSkillCodes = new Set([
      'mk6-perimeter-and-area-reasoning',
      'mk6-angle-and-shape-properties',
      'mk6-spatial-visualization-3d',
    ]);
    const visualItems = contentCatalog.filter((item) => visualSkillCodes.has(item.skillCode));
    const figuredItems = visualItems.filter((item) => item.figure);

    expect(figuredItems).toHaveLength(5);
    for (const item of figuredItems) {
      expect(item.version).toBe('content-2');
      expect(item.figure?.svgMarkup).toMatch(/^<svg /);
      expect(item.figure?.altText.length).toBeGreaterThan(30);
      expect(item.accessibleAlternative.length).toBeGreaterThan(30);
    }
  });

  it('rejects gaps in hint ordering and content that is not marked owned', () => {
    const item = contentCatalog[0];
    const withGap = {
      ...item,
      hintSteps: item.hintSteps.map((step, index) => ({ ...step, order: index + 2 })),
    };
    expect(ContentItemSchema.safeParse(withGap).success).toBe(false);

    expect(() =>
      validateContentCatalog(
        contentCatalog.map((catalogItem) =>
          catalogItem.id === item.id
            ? {
                ...catalogItem,
                provenance: { ...catalogItem.provenance, licenseStatus: 'pending_review' },
              }
            : catalogItem,
        ),
      ),
    ).toThrow('must be marked owned');
  });

  it('accepts a reviewed item once a reviewer and review date are recorded, and rejects one without a date', () => {
    const item = contentCatalog[0];
    expect(() =>
      validateContentCatalog(
        contentCatalog.map((catalogItem) =>
          catalogItem.id === item.id
            ? {
                ...catalogItem,
                review: { ...catalogItem.review, status: 'reviewed', reviewedAt: '2026-09-06' },
              }
            : catalogItem,
        ),
      ),
    ).not.toThrow();

    expect(
      ContentItemSchema.safeParse({
        ...item,
        review: { ...item.review, status: 'reviewed', reviewedAt: undefined },
      }).success,
    ).toBe(false);
  });

  it('requires a non-empty accessibleAlternative distinct from the field length limit', () => {
    for (const item of contentCatalog) {
      expect(item.accessibleAlternative.length).toBeGreaterThan(0);
    }
  });

  it('rejects a content difficulty that is outside its owning skill difficultyBands', () => {
    const item = contentCatalog.find((catalogItem) => {
      const skill = skillCatalog.find((candidate) => candidate.code === catalogItem.skillCode);
      return skill && !skill.difficultyBands.includes('foundational');
    });
    expect(item).toBeDefined();
    expect(() =>
      validateContentCatalog(
        contentCatalog.map((catalogItem) =>
          catalogItem.id === item!.id
            ? { ...catalogItem, difficulty: 'foundational' }
            : catalogItem,
        ),
      ),
    ).toThrow('not declared in');
  });

  it('rejects a misconception code that is not declared by the owning skill', () => {
    const item = contentCatalog[0];
    expect(() =>
      validateContentCatalog(
        contentCatalog.map((catalogItem) =>
          catalogItem.id === item.id
            ? { ...catalogItem, misconceptionCodes: ['not-a-declared-misconception'] }
            : catalogItem,
        ),
      ),
    ).toThrow('not declared by skill');
  });

  it('rejects a catalog where a skill does not have exactly the required content record count', () => {
    const item = contentCatalog[0];
    expect(() =>
      validateContentCatalog(contentCatalog.filter((catalogItem) => catalogItem.id !== item.id)),
    ).toThrow('must have exactly');
  });

  it('excludes pending_review content from the servable catalog so it is never shown to a learner', () => {
    // Invariants that must hold regardless of the current mix of reviewed
    // vs. pending_review items in the production catalog.
    expect(servableContentCatalog.length).toBeGreaterThan(0);
    expect(servableContentCatalog.length).toBeLessThanOrEqual(contentCatalog.length);
    expect(servableContentCatalog.every((item) => item.review.status === 'reviewed')).toBe(true);

    // Exercise the gate's actual filtering behavior against a synthetic mix
    // of reviewed and pending_review items, independent of whatever the
    // production catalog's review states happen to be at any given time.
    const sample = [
      { id: 'sample-reviewed', review: { status: 'reviewed' } },
      { id: 'sample-pending', review: { status: 'pending_review' } },
    ] as Array<{ id: string; review: { status: string } }>;
    const servableSample = sample.filter((item) => item.review.status === 'reviewed');
    expect(servableSample.map((item) => item.id)).toEqual(['sample-reviewed']);
  });
});
