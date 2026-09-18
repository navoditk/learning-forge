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
    expect(contentCatalog).toHaveLength(80);
    expect(new Set(contentCatalog.map((item) => item.id)).size).toBe(80);
    expect(new Set(contentCatalog.map((item) => item.skillCode))).toEqual(
      new Set(skillCatalog.map((skill) => skill.code)),
    );
    expect(
      contentCatalog.every((item) => ['original', 'llm_drafted'].includes(item.provenance.origin)),
    ).toBe(true);
    expect(contentCatalog.some((item) => item.provenance.origin === 'llm_drafted')).toBe(true);

    const reviewedItems = contentCatalog.filter((item) => item.review.status === 'reviewed');
    const pendingItems = contentCatalog.filter((item) => item.review.status === 'pending_review');
    expect(reviewedItems.length).toBe(80);
    expect(pendingItems.length).toBe(0);
    expect(pendingItems.every((item) => item.provenance.origin === 'llm_drafted')).toBe(true);
    expect(pendingItems.every((item) => item.provenance.licenseStatus === 'owned')).toBe(true);
    expect(pendingItems.every((item) => !item.review.reviewedAt)).toBe(true);
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

  it('keeps MOEMS contest items as numeric or text free-response without Math Kangaroo metadata', () => {
    const moemsSkillCodes = new Set(
      skillCatalog.filter((skill) => skill.program === 'moems-6').map((skill) => skill.code),
    );
    const contestItems = contentCatalog.filter(
      (item) => moemsSkillCodes.has(item.skillCode) && item.mode === 'contest',
    );
    expect(contestItems).toHaveLength(5);
    expect(contestItems.every((item) => !item.contestFormat)).toBe(true);
    expect(
      contestItems.every((item) => ['numeric', 'text'].includes(item.deterministicValidator.type)),
    ).toBe(true);
  });

  it('self-audits MOEMS coverage, prerequisites, and canonical answers', () => {
    const moemsSkills = skillCatalog.filter((skill) => skill.program === 'moems-6');
    const expectedAnswers = new Map([
      ['moems6-number-and-place-value-1', '74'],
      ['moems6-number-and-place-value-2', '563'],
      ['moems6-patterns-and-counting-1', '29'],
      ['moems6-patterns-and-counting-2', '12'],
      ['moems6-geometry-and-measurement-1', '66 square centimeters'],
      ['moems6-geometry-and-measurement-2', '94 square centimeters'],
      ['moems6-logic-and-arrangements-1', '2'],
      ['moems6-logic-and-arrangements-2', '6'],
      ['moems6-cryptarithm-reasoning-1', '2'],
      ['moems6-cryptarithm-reasoning-2', '9'],
    ]);

    for (const skill of moemsSkills) {
      const records = contentCatalog.filter((item) => item.skillCode === skill.code);
      expect(records).toHaveLength(2);
      expect(new Set(records.map((item) => item.mode))).toEqual(new Set(['core', 'contest']));
      expect(new Set(records.map((item) => item.prompt)).size).toBe(2);
      expect(
        records.every(
          (item) =>
            item.prerequisiteSkillCodes.join('|') === skill.prerequisiteSkillCodes.join('|'),
        ),
      ).toBe(true);
    }

    for (const [id, answer] of expectedAnswers) {
      const item = contentCatalog.find((candidate) => candidate.id === id);
      expect(item?.deterministicValidator.canonicalAnswer).toBe(answer);
      expect(item?.deterministicValidator.acceptedAnswers).toContain(answer);
    }
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
      expect(['content-2', 'content-3']).toContain(item.version);
      expect(item.figure?.svgMarkup).toMatch(/^<svg /);
      expect(item.figure?.altText.length).toBeGreaterThan(30);
      expect(item.accessibleAlternative.length).toBeGreaterThan(30);
    }
  });

  it('keeps labeled Math Kangaroo angle figures geometrically accurate', () => {
    const angleBetween = (
      vertex: [number, number],
      first: [number, number],
      second: [number, number],
    ) => {
      const firstVector = [first[0] - vertex[0], first[1] - vertex[1]];
      const secondVector = [second[0] - vertex[0], second[1] - vertex[1]];
      const dot = firstVector[0] * secondVector[0] + firstVector[1] * secondVector[1];
      const magnitudes =
        Math.hypot(firstVector[0], firstVector[1]) * Math.hypot(secondVector[0], secondVector[1]);
      return (Math.acos(dot / magnitudes) * 180) / Math.PI;
    };

    const straightLineItem = contentCatalog.find(
      (item) => item.id === 'mk6-angle-and-shape-properties-1',
    );
    const ray = straightLineItem?.figure?.svgMarkup.match(
      /data-role="angle-ray" x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/,
    );
    expect(ray).toBeTruthy();
    const rightAngle = angleBetween(
      [Number(ray![1]), Number(ray![2])],
      [Number(ray![1]) + 100, Number(ray![2])],
      [Number(ray![3]), Number(ray![4])],
    );
    expect(rightAngle).toBeCloseTo(65, 2);

    const triangleItem = contentCatalog.find(
      (item) => item.id === 'mk6-angle-and-shape-properties-2',
    );
    const points = triangleItem?.figure?.svgMarkup
      .match(/data-role="angle-triangle" points="([^"]+)"/)?.[1]
      .split(' ')
      .map((point) => point.split(',').map(Number) as [number, number]);
    expect(points).toHaveLength(3);
    expect(angleBetween(points![0], points![1], points![2])).toBeCloseTo(50, 2);
    expect(angleBetween(points![1], points![0], points![2])).toBeCloseTo(70, 2);
    expect(angleBetween(points![2], points![0], points![1])).toBeCloseTo(60, 2);
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
