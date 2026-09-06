import { describe, expect, it } from 'vitest';

import { ContentItemSchema } from '../../src/contracts/content';
import { contentCatalog, validateContentCatalog } from '../../src/content/catalog';
import { skillCatalog } from '../../src/curriculum/catalog';

describe('ratios content seed', () => {
  it('contains original and llm-drafted problems covering every catalog skill', () => {
    expect(contentCatalog).toHaveLength(38);
    expect(new Set(contentCatalog.map((item) => item.id)).size).toBe(38);
    expect(new Set(contentCatalog.map((item) => item.skillCode))).toEqual(
      new Set(skillCatalog.map((skill) => skill.code)),
    );
    expect(
      contentCatalog.every((item) => ['original', 'llm_drafted'].includes(item.provenance.origin)),
    ).toBe(true);
    expect(contentCatalog.some((item) => item.provenance.origin === 'llm_drafted')).toBe(true);
    expect(contentCatalog.every((item) => item.review.status === 'reviewed')).toBe(true);
    expect(contentCatalog.every((item) => Boolean(item.review.reviewedAt))).toBe(true);
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
});
