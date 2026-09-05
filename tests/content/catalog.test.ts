import { describe, expect, it } from 'vitest';

import { RatioContentSchema } from '../../src/contracts/content';
import { ratioContentCatalog, validateRatioCatalog } from '../../src/content/catalog';

describe('ratios content seed', () => {
  it('contains ten original problems awaiting educator review with complete skill coverage', () => {
    expect(ratioContentCatalog).toHaveLength(10);
    expect(new Set(ratioContentCatalog.map((item) => item.id)).size).toBe(10);
    expect(new Set(ratioContentCatalog.map((item) => item.skillCode))).toEqual(
      new Set([
        'ratio-language',
        'unit-rates',
        'ratio-tables',
        'double-number-lines',
        'percent-applications',
      ]),
    );
    expect(ratioContentCatalog.every((item) => item.provenance.origin === 'original')).toBe(true);
    expect(ratioContentCatalog.every((item) => item.review.status === 'pending_review')).toBe(true);
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

  it('rejects gaps in hint ordering and an unapproved completed review', () => {
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
                review: { ...catalogItem.review, status: 'reviewed', reviewedAt: '2026-09-05' },
              }
            : catalogItem,
        ),
      ),
    ).toThrow('must remain pending educator review');
  });
});
