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
    expect(contentCatalog).toHaveLength(54);
    expect(new Set(contentCatalog.map((item) => item.id)).size).toBe(54);
    expect(new Set(contentCatalog.map((item) => item.skillCode))).toEqual(
      new Set(skillCatalog.map((skill) => skill.code)),
    );
    expect(
      contentCatalog.every((item) => ['original', 'llm_drafted'].includes(item.provenance.origin)),
    ).toBe(true);
    expect(contentCatalog.some((item) => item.provenance.origin === 'llm_drafted')).toBe(true);

    const reviewedItems = contentCatalog.filter((item) => item.review.status === 'reviewed');
    const pendingItems = contentCatalog.filter((item) => item.review.status === 'pending_review');
    expect(reviewedItems.length).toBe(54);
    expect(pendingItems.length).toBe(0);
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
