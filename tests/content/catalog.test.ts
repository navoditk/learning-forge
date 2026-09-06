import { describe, expect, it } from 'vitest';

import { RatioContentSchema } from '../../src/contracts/content';
import { ratioContentCatalog, validateRatioCatalog } from '../../src/content/catalog';
import { skillCatalog } from '../../src/curriculum/catalog';

describe('ratios content seed', () => {
  it('contains original and llm-drafted problems covering every catalog skill', () => {
    expect(ratioContentCatalog).toHaveLength(38);
    expect(new Set(ratioContentCatalog.map((item) => item.id)).size).toBe(38);
    expect(new Set(ratioContentCatalog.map((item) => item.skillCode))).toEqual(
      new Set(skillCatalog.map((skill) => skill.code)),
    );
    expect(
      ratioContentCatalog.every((item) =>
        ['original', 'llm_drafted'].includes(item.provenance.origin),
      ),
    ).toBe(true);
    expect(ratioContentCatalog.some((item) => item.provenance.origin === 'llm_drafted')).toBe(true);
    expect(ratioContentCatalog.every((item) => item.review.status === 'reviewed')).toBe(true);
    expect(ratioContentCatalog.every((item) => Boolean(item.review.reviewedAt))).toBe(true);
    expect(ratioContentCatalog.every((item) => item.review.reviewer.length > 0)).toBe(true);
  });

  it('has deterministic validators and progressive, non-leaking hint ladders', () => {
    for (const item of ratioContentCatalog) {
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
    const item = ratioContentCatalog[0];
    const withGap = {
      ...item,
      hintSteps: item.hintSteps.map((step, index) => ({ ...step, order: index + 2 })),
    };
    expect(RatioContentSchema.safeParse(withGap).success).toBe(false);

    expect(() =>
      validateRatioCatalog(
        ratioContentCatalog.map((catalogItem) =>
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
    const item = ratioContentCatalog[0];
    expect(() =>
      validateRatioCatalog(
        ratioContentCatalog.map((catalogItem) =>
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
      RatioContentSchema.safeParse({
        ...item,
        review: { ...item.review, status: 'reviewed', reviewedAt: undefined },
      }).success,
    ).toBe(false);
  });
});
