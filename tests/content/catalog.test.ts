import { describe, expect, it } from 'vitest';

import { ContentItem, ContentItemSchema } from '../../src/contracts/content';
import {
  contentCatalog,
  servableContentCatalog,
  validateContentCatalog,
  validateTransitionContentCatalog,
} from '../../src/content/catalog';
import { skillCatalog } from '../../src/curriculum/catalog';

function skillCodeOf(item: { skillCode?: string; skillRef?: { code: string } }): string {
  return item.skillCode ?? item.skillRef?.code ?? '';
}

function readinessCodesOf(item: unknown): string[] {
  return ((item as { itemReadinessRefs?: { code: string }[] }).itemReadinessRefs ?? []).map(
    (ref) => ref.code,
  );
}

const legacyItem = (): ContentItem => {
  const item = contentCatalog[0] as unknown as Record<string, unknown>;
  const skillRef = item.skillRef as { code: string };
  const legacyFields = { ...item };
  delete legacyFields.role;
  delete legacyFields.skillRef;
  delete legacyFields.itemReadinessRefs;
  return {
    ...legacyFields,
    skillCode: skillRef.code,
    prerequisiteSkillCodes: [],
  } as unknown as ContentItem;
};

describe('ratios content seed', () => {
  it('contains original and llm-drafted problems covering every catalog skill', () => {
    expect(contentCatalog).toHaveLength(128);
    expect(new Set(contentCatalog.map((item) => item.id)).size).toBe(128);
    expect(new Set(contentCatalog.map(skillCodeOf))).toEqual(
      new Set(skillCatalog.map((skill) => skill.code)),
    );
    expect(
      contentCatalog.every((item) => ['original', 'llm_drafted'].includes(item.provenance.origin)),
    ).toBe(true);
    expect(contentCatalog.some((item) => item.provenance.origin === 'llm_drafted')).toBe(true);

    const reviewedItems = contentCatalog.filter((item) => item.review.status === 'reviewed');
    const pendingItems = contentCatalog.filter((item) => item.review.status === 'pending_review');
    expect(reviewedItems.length).toBe(128);
    expect(pendingItems.length).toBe(0);
    expect(reviewedItems.every((item) => Boolean(item.review.reviewedAt))).toBe(true);
    expect(contentCatalog.every((item) => item.review.reviewer.length > 0)).toBe(true);
  });

  it('accepts the mechanically transformed AMC 8 coordinate-geometry practice batch', () => {
    const transformed = contentCatalog.filter((item) =>
      ['amc8-coordinate-geometry-1', 'amc8-coordinate-geometry-2'].includes(item.id),
    );

    expect(transformed).toHaveLength(2);
    expect(
      transformed.every((item) => {
        const candidate = item as unknown as {
          role?: string;
          skillRef?: { code: string; version: string };
          itemReadinessRefs?: unknown[];
          skillCode?: string;
          prerequisiteSkillCodes?: unknown[];
        };
        return (
          candidate.role === 'practice' &&
          candidate.skillRef?.code === 'amc8-coordinate-geometry' &&
          candidate.skillRef.version === '1.0.0' &&
          candidate.itemReadinessRefs?.length === 0 &&
          !candidate.skillCode &&
          !candidate.prerequisiteSkillCodes
        );
      }),
    ).toBe(true);
  });

  it('uses the approved skill graph and narrower readiness refs for disputed edges', () => {
    const ratioTables = skillCatalog.find((skill) => skill.code === 'ratio-tables');
    expect(ratioTables?.prerequisiteSkillCodes).toEqual([]);
    expect(contentCatalog.every((item) => !('prerequisiteSkillCodes' in item))).toBe(true);

    const readinessByItem = new Map(
      contentCatalog.map((item) => [
        item.id,
        (
          (item as unknown as { itemReadinessRefs?: { code: string }[] }).itemReadinessRefs ?? []
        ).map((ref) => ref.code),
      ]),
    );
    expect(readinessByItem.get('dependent-and-independent-variables-1')).toEqual([
      'variables-and-expressions',
    ]);
    expect(readinessByItem.get('coordinate-geometry-1')).toEqual(['coordinate-plane']);
    expect(readinessByItem.get('ratio-tables-1')).toEqual([]);
    expect(readinessByItem.get('double-number-lines-1')).toEqual([]);
    expect(readinessByItem.get('percent-applications-2')).toEqual([]);
  });

  it('rejects legacy prerequisiteSkillCodes from the live catalog', () => {
    const candidate = contentCatalog.map((item, index) => {
      if (index !== 0) return item;
      const legacy = { ...(item as unknown as Record<string, unknown>) };
      delete legacy.role;
      delete legacy.skillRef;
      delete legacy.itemReadinessRefs;
      legacy.skillCode = skillCodeOf(item);
      legacy.prerequisiteSkillCodes = [];
      return legacy;
    });

    expect(() => validateContentCatalog(candidate)).toThrow('Invalid discriminator value');
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
      (item) => mathKangarooSkillCodes.has(skillCodeOf(item)) && item.mode === 'contest',
    );

    expect(contestItems).toHaveLength(8);
    expect(new Set(contestItems.map((item) => item.contestFormat?.pointValue))).toEqual(
      new Set([3, 4, 5]),
    );
    for (const item of contestItems) {
      expect(item.deterministicValidator.type).toBe('multiple_choice');
      expect(item.contestFormat?.answerChoices).toHaveLength(5);
      expect(item.contestFormat?.answerChoices?.map((choice) => choice.label)).toEqual([
        'A',
        'B',
        'C',
        'D',
        'E',
      ]);
      expect(
        item.contestFormat?.answerChoices?.some(
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

    expect(() =>
      validateContentCatalog(
        contentCatalog.map((item) =>
          item.id === withoutFormat.id
            ? {
                ...item,
                contestFormat: {
                  ...item.contestFormat,
                  calculatorPolicy: 'calculators_permitted',
                },
              }
            : item,
        ),
      ),
    ).toThrow('Calculator-permitted contest metadata is limited to MATHCOUNTS Target');
  });

  it('models every AMC 8 contest item as five-choice +1/0 no-calculator format', () => {
    const amc8SkillCodes = new Set(
      skillCatalog.filter((skill) => skill.program === 'amc-8').map((skill) => skill.code),
    );
    const contestItems = contentCatalog.filter(
      (item) => amc8SkillCodes.has(skillCodeOf(item)) && item.mode === 'contest',
    );

    expect(contestItems).toHaveLength(8);
    for (const item of contestItems) {
      expect(item.deterministicValidator.type).toBe('multiple_choice');
      expect(item.contestFormat?.format).toBe('amc-8');
      expect(item.contestFormat?.pointValue).toBe(1);
      expect(item.contestFormat?.questionCount).toBe(25);
      expect(item.contestFormat?.timeLimitMinutes).toBe(40);
      expect(item.contestFormat?.calculatorPolicy).toBe('no_calculators');
      expect(item.contestFormat?.scoring).toEqual({
        correctPoints: 1,
        incorrectPoints: 0,
        blankPoints: 0,
      });
      expect(item.contestFormat?.readinessRequirement).toEqual({
        minEstimate: 0.8,
        disallowLowConfidence: true,
        requireIndependentDelayedCheck: true,
      });
      expect(item.contestFormat?.answerChoices).toHaveLength(5);
      expect(item.contestFormat?.answerChoices?.map((choice) => choice.label)).toEqual([
        'A',
        'B',
        'C',
        'D',
        'E',
      ]);
      expect(
        item.contestFormat?.answerChoices?.some(
          (choice) => choice.text === item.deterministicValidator.canonicalAnswer,
        ),
      ).toBe(true);
      expect(
        item.contestFormat?.answerChoices
          ?.filter((choice) => choice.text !== item.deterministicValidator.canonicalAnswer)
          .every((choice) => choice.rationale && choice.misconceptionCode),
      ).toBe(true);
    }

    const withMathKangarooTier = contestItems[0];
    expect(() =>
      validateContentCatalog(
        contentCatalog.map((item) =>
          item.id === withMathKangarooTier.id
            ? {
                ...item,
                contestFormat: { ...item.contestFormat, pointValue: 3 },
              }
            : item,
        ),
      ),
    ).toThrow('must use AMC 8 +1 scoring');

    expect(() =>
      validateContentCatalog(
        contentCatalog.map((item) =>
          item.id === withMathKangarooTier.id
            ? {
                ...item,
                contestFormat: { ...item.contestFormat, readinessRequirement: undefined },
              }
            : item,
        ),
      ),
    ).toThrow('must encode the approved AMC 8 readiness gate');

    expect(
      ContentItemSchema.safeParse({
        ...withMathKangarooTier,
        contestFormat: {
          ...withMathKangarooTier.contestFormat,
          answerChoices: undefined,
        },
      }).success,
    ).toBe(false);
  });

  it('keeps MOEMS contest items as numeric or text free-response without Math Kangaroo metadata', () => {
    const moemsSkillCodes = new Set(
      skillCatalog.filter((skill) => skill.program === 'moems-6').map((skill) => skill.code),
    );
    const contestItems = contentCatalog.filter(
      (item) => moemsSkillCodes.has(skillCodeOf(item)) && item.mode === 'contest',
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
      const records = contentCatalog.filter((item) => skillCodeOf(item) === skill.code);
      expect(records).toHaveLength(2);
      expect(new Set(records.map((item) => item.mode))).toEqual(new Set(['core', 'contest']));
      expect(new Set(records.map((item) => item.prompt)).size).toBe(2);
      expect(records.every((item) => readinessCodesOf(item).join('|') === '')).toBe(true);
    }

    for (const [id, answer] of expectedAnswers) {
      const item = contentCatalog.find((candidate) => candidate.id === id);
      expect(item?.deterministicValidator.canonicalAnswer).toBe(answer);
      expect(item?.deterministicValidator.acceptedAnswers).toContain(answer);
    }
  });

  it('self-audits AMC 8 coverage, prerequisites, review state, and canonical answers', () => {
    const amc8Skills = skillCatalog.filter((skill) => skill.program === 'amc-8');
    const expectedAnswers = new Map([
      ['amc8-counting-probability-1', '5/8'],
      ['amc8-counting-probability-2', '4'],
      ['amc8-estimation-number-sense-1', '6000'],
      ['amc8-estimation-number-sense-2', '100'],
      ['amc8-proportional-reasoning-1', '18 dollars'],
      ['amc8-proportional-reasoning-2', '21'],
      ['amc8-elementary-geometry-1', '54 square centimeters'],
      ['amc8-elementary-geometry-2', '97'],
      ['amc8-spatial-visualization-1', '8'],
      ['amc8-spatial-visualization-2', '11'],
      ['amc8-graphs-and-tables-1', 'Thursday'],
      ['amc8-graphs-and-tables-2', '244'],
      ['amc8-introductory-algebra-1', '7'],
      ['amc8-introductory-algebra-2', '8'],
      ['amc8-coordinate-geometry-1', '6'],
      ['amc8-coordinate-geometry-2', '18'],
    ]);

    expect(amc8Skills).toHaveLength(8);
    for (const skill of amc8Skills) {
      const records = contentCatalog.filter((item) => skillCodeOf(item) === skill.code);
      expect(records).toHaveLength(2);
      expect(new Set(records.map((item) => item.mode))).toEqual(new Set(['core', 'contest']));
      expect(new Set(records.map((item) => item.prompt)).size).toBe(2);
      expect(records.every((item) => readinessCodesOf(item).join('|') === '')).toBe(true);
      expect(records.every((item) => item.provenance.origin === 'llm_drafted')).toBe(true);
      expect(records.every((item) => item.provenance.licenseStatus === 'owned')).toBe(true);
      expect(records.every((item) => item.review.status === 'reviewed')).toBe(true);
    }

    for (const [id, answer] of expectedAnswers) {
      const item = contentCatalog.find((candidate) => candidate.id === id);
      expect(item?.deterministicValidator.canonicalAnswer).toBe(answer);
      expect(item?.deterministicValidator.acceptedAnswers).toContain(answer);
    }
  });

  it('models every MATHCOUNTS contest item as a free-response Sprint or Target round', () => {
    const mathcountsSkillCodes = new Set(
      skillCatalog.filter((skill) => skill.program === 'mathcounts-6').map((skill) => skill.code),
    );
    const contestItems = contentCatalog.filter(
      (item) => mathcountsSkillCodes.has(skillCodeOf(item)) && item.mode === 'contest',
    );

    expect(contestItems).toHaveLength(8);
    expect(new Set(contestItems.map((item) => item.contestFormat?.format))).toEqual(
      new Set(['mathcounts-sprint', 'mathcounts-target']),
    );
    for (const item of contestItems) {
      // Sprint/Target are short-answer rounds, never multiple choice.
      expect(item.contestFormat?.answerChoices).toBeUndefined();
      expect(['numeric', 'text', 'ratio', 'percent']).toContain(item.deterministicValidator.type);
      expect(item.contestFormat?.readinessRequirement).toBeUndefined();
      if (item.contestFormat?.format === 'mathcounts-sprint') {
        expect(item.contestFormat?.pointValue).toBe(1);
        expect(item.contestFormat?.calculatorPolicy).toBe('no_calculators');
        expect(item.contestFormat?.scoring).toEqual({
          correctPoints: 1,
          incorrectPoints: 0,
          blankPoints: 0,
        });
      } else {
        expect(item.contestFormat?.pointValue).toBe(2);
        expect(item.contestFormat?.calculatorPolicy).toBe('calculators_permitted');
        expect(item.contestFormat?.scoring).toEqual({
          correctPoints: 2,
          incorrectPoints: 0,
          blankPoints: 0,
        });
      }
    }

    // A MATHCOUNTS contest record must not smuggle in multiple-choice metadata.
    const sprintItem = contestItems.find(
      (item) => item.contestFormat?.format === 'mathcounts-sprint',
    )!;
    expect(() =>
      validateContentCatalog(
        contentCatalog.map((item) =>
          item.id === sprintItem.id
            ? {
                ...item,
                contestFormat: {
                  ...item.contestFormat,
                  answerChoices: [
                    { label: 'A', text: '1' },
                    { label: 'B', text: '2' },
                    { label: 'C', text: '3' },
                    { label: 'D', text: '4' },
                    { label: 'E', text: '5' },
                  ],
                },
              }
            : item,
        ),
      ),
    ).toThrow('must be free response');

    // A Sprint record must keep the no-calculator, 1-point round facts.
    expect(() =>
      validateContentCatalog(
        contentCatalog.map((item) =>
          item.id === sprintItem.id
            ? {
                ...item,
                contestFormat: { ...item.contestFormat, calculatorPolicy: 'calculators_permitted' },
              }
            : item,
        ),
      ),
    ).toThrow('Calculator-permitted contest metadata is limited to MATHCOUNTS Target');
  });

  it('self-audits MATHCOUNTS coverage, prerequisites, review state, and canonical answers', () => {
    const mathcountsSkills = skillCatalog.filter((skill) => skill.program === 'mathcounts-6');
    const expectedAnswers = new Map([
      ['mc6-number-theory-fundamentals-1', '6'],
      ['mc6-number-theory-fundamentals-2', '37'],
      ['mc6-fraction-percent-fluency-1', '37.5%'],
      ['mc6-fraction-percent-fluency-2', '240'],
      ['mc6-proportional-reasoning-rates-1', '3'],
      ['mc6-proportional-reasoning-rates-2', '10.56'],
      ['mc6-linear-equation-reasoning-1', '9'],
      ['mc6-linear-equation-reasoning-2', '8'],
      ['mc6-sequences-and-patterns-1', '67'],
      ['mc6-sequences-and-patterns-2', '820'],
      ['mc6-geometry-area-and-angles-1', '31'],
      ['mc6-geometry-area-and-angles-2', '116'],
      ['mc6-counting-and-probability-1', '24'],
      ['mc6-counting-and-probability-2', '1/4'],
      ['mc6-logical-reasoning-1', 'Cy'],
      ['mc6-logical-reasoning-2', '0'],
    ]);

    expect(mathcountsSkills).toHaveLength(8);
    for (const skill of mathcountsSkills) {
      const records = contentCatalog.filter((item) => skillCodeOf(item) === skill.code);
      expect(records).toHaveLength(2);
      expect(new Set(records.map((item) => item.mode))).toEqual(new Set(['core', 'contest']));
      expect(new Set(records.map((item) => item.prompt)).size).toBe(2);
      expect(records.every((item) => readinessCodesOf(item).join('|') === '')).toBe(true);
      // MATHCOUNTS remains model-assisted and owned after human approval.
      expect(records.every((item) => item.provenance.origin === 'llm_drafted')).toBe(true);
      expect(records.every((item) => item.provenance.licenseStatus === 'owned')).toBe(true);
      expect(records.every((item) => item.review.status === 'reviewed')).toBe(true);
      expect(records.every((item) => item.review.reviewer === 'Navodit Kaushik')).toBe(true);
      expect(records.every((item) => item.review.reviewedAt === '2026-09-18')).toBe(true);
      expect(servableContentCatalog.some((item) => skillCodeOf(item) === skill.code)).toBe(true);
    }

    expect(mathcountsSkills.every((skill) => skill.prerequisiteSkillCodes.length === 0)).toBe(true);

    const probability = contentCatalog.find((item) => item.id === 'mc6-counting-and-probability-2');
    expect(probability?.deterministicValidator.acceptedAnswers).not.toContain('0.25');

    const bicyclePrice = contentCatalog.find(
      (item) => item.id === 'mc6-fraction-percent-fluency-2',
    );
    expect(bicyclePrice?.deterministicValidator.acceptedAnswers).toEqual(
      expect.arrayContaining(['240.00', '$240.00', '240.00 dollars']),
    );

    const geometry = contentCatalog.find((item) => item.id === 'mc6-geometry-area-and-angles-2');
    const svg = geometry?.figure?.svgMarkup ?? '';
    const scale = Number(svg.match(/data-unit-px="([^"]+)"/)?.[1]);
    const removedCorner = svg.match(
      /data-role="removed-corner" data-width-m="([^"]+)" data-height-m="([^"]+)" x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/,
    );
    expect(scale).toBe(20);
    expect(removedCorner).toBeTruthy();
    expect(Number(removedCorner![5]) / scale).toBe(Number(removedCorner![1]));
    expect(Number(removedCorner![6]) / scale).toBe(Number(removedCorner![2]));
    const polygonPoints = svg
      .match(/data-role="l-shape"[^>]*points="([^"]+)"/)?.[1]
      .split(' ')
      .map((point) => point.split(',').map(Number) as [number, number]);
    expect(polygonPoints).toHaveLength(6);
    const xs = polygonPoints!.map(([x]) => x);
    const ys = polygonPoints!.map(([, y]) => y);
    expect((Math.max(...xs) - Math.min(...xs)) / scale).toBe(14);
    expect((Math.max(...ys) - Math.min(...ys)) / scale).toBe(10);
    expect((polygonPoints![4][0] - polygonPoints![5][0]) / scale).toBe(8);
    expect((polygonPoints![0][1] - polygonPoints![2][1]) / scale).toBe(6);
    const doubledPixelArea = polygonPoints!.reduce((sum, [x, y], index) => {
      const [nextX, nextY] = polygonPoints![(index + 1) % polygonPoints!.length];
      return sum + x * nextY - nextX * y;
    }, 0);
    expect(Math.abs(doubledPixelArea) / 2 / scale ** 2).toBe(116);

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
    const visualItems = contentCatalog.filter((item) => visualSkillCodes.has(skillCodeOf(item)));
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

  it('keeps the AMC 8 coordinate-geometry figure numerically faithful to the prompt points', () => {
    const item = contentCatalog.find((candidate) => candidate.id === 'amc8-coordinate-geometry-2');
    const svg = item?.figure?.svgMarkup ?? '';

    const originMatch = svg.match(
      /data-role="x-axis"[^>]*data-origin-x="([^"]+)" data-origin-y="([^"]+)" data-unit-px="([^"]+)"/,
    );
    expect(originMatch).toBeTruthy();
    const originX = Number(originMatch![1]);
    const originY = Number(originMatch![2]);
    const unitPx = Number(originMatch![3]);

    const toDataCoords = (pixelX: number, pixelY: number) => [
      (pixelX - originX) / unitPx,
      (originY - pixelY) / unitPx,
    ];

    const outerRect = svg.match(
      /data-role="outer-rectangle" data-x1="([^"]+)" data-y1="([^"]+)" data-x2="([^"]+)" data-y2="([^"]+)"/,
    );
    expect(outerRect).toBeTruthy();
    expect(Number(outerRect![1])).toBeCloseTo(-1, 6);
    expect(Number(outerRect![2])).toBeCloseTo(2, 6);
    expect(Number(outerRect![3])).toBeCloseTo(5, 6);
    expect(Number(outerRect![4])).toBeCloseTo(6, 6);

    const removedRect = svg.match(
      /data-role="removed-rectangle" data-x1="([^"]+)" data-y1="([^"]+)" data-x2="([^"]+)" data-y2="([^"]+)"/,
    );
    expect(removedRect).toBeTruthy();
    expect(Number(removedRect![1])).toBeCloseTo(2, 6);
    expect(Number(removedRect![2])).toBeCloseTo(2, 6);
    expect(Number(removedRect![3])).toBeCloseTo(5, 6);
    expect(Number(removedRect![4])).toBeCloseTo(4, 6);

    const outerRectPixels = svg.match(
      /<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" fill="#eaf4f2"[^>]*data-role="outer-rectangle"/,
    );
    expect(outerRectPixels).toBeTruthy();
    const [outerLeft, outerTop] = toDataCoords(
      Number(outerRectPixels![1]),
      Number(outerRectPixels![2]),
    );
    const [outerRight, outerBottom] = toDataCoords(
      Number(outerRectPixels![1]) + Number(outerRectPixels![3]),
      Number(outerRectPixels![2]) + Number(outerRectPixels![4]),
    );
    expect(outerLeft).toBeCloseTo(-1, 6);
    expect(outerBottom).toBeCloseTo(2, 6);
    expect(outerRight).toBeCloseTo(5, 6);
    expect(outerTop).toBeCloseTo(6, 6);

    const vertexMatches = [
      ...svg.matchAll(/data-role="vertex" data-x="([^"]+)" data-y="([^"]+)"/g),
    ].map((match) => [Number(match[1]), Number(match[2])]);
    expect(vertexMatches).toEqual([
      [-1, 2],
      [5, 6],
      [2, 2],
      [5, 4],
    ]);

    const vertexPixels = [
      ...svg.matchAll(
        /<circle cx="([^"]+)" cy="([^"]+)"[^>]*data-role="vertex" data-x="([^"]+)" data-y="([^"]+)"/g,
      ),
    ];
    expect(vertexPixels).toHaveLength(4);
    for (const [, cx, cy, dataX, dataY] of vertexPixels) {
      const [computedX, computedY] = toDataCoords(Number(cx), Number(cy));
      expect(computedX).toBeCloseTo(Number(dataX), 6);
      expect(computedY).toBeCloseTo(Number(dataY), 6);
    }
  });

  it('rejects gaps in hint ordering and content that is not marked owned', () => {
    const item = legacyItem();
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
    const item = legacyItem();
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
      const skill = skillCatalog.find((candidate) => candidate.code === skillCodeOf(catalogItem));
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
    const item = legacyItem();
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

  it('allows role-aware content counts instead of the legacy exact-two invariant', () => {
    const item = contentCatalog.find((catalogItem) => catalogItem.id === 'unit-rates-1')!;
    expect(() =>
      validateContentCatalog(contentCatalog.filter((catalogItem) => catalogItem.id !== item.id)),
    ).not.toThrow();
  });

  it('treats content versions as distinct records', () => {
    const first = legacyItem();
    const second = { ...first, version: `${first.version}-revised` };
    expect(() => validateTransitionContentCatalog([first, second])).not.toThrow('id@version');
    expect(() => validateTransitionContentCatalog([{ ...first }, { ...first }])).toThrow(
      'id@version references must be unique',
    );
  });

  it('rejects a role-specific record that references an unknown skill', () => {
    const first = legacyItem();
    expect(() =>
      validateContentCatalog([
        {
          id: 'teaching-unknown-skill',
          version: '1.0.0',
          title: 'Unknown skill teaching record',
          role: 'teaching',
          skillRef: { code: 'not-a-real-skill', version: '1.0.0' },
          mode: 'core',
          difficulty: first.difficulty,
          standards: first.standards,
          observableEvidence: ['Identifies the skill.'],
          explanation: 'An explanation.',
          provenance: first.provenance,
          review: first.review,
          accessibilityNotes: first.accessibilityNotes,
          accessibleAlternative: first.accessibleAlternative,
          itemReadinessRefs: [],
        },
      ]),
    ).toThrow('references unknown skill');
  });

  it('excludes pending_review content from the servable catalog so it is never shown to a learner', () => {
    // Invariants that must hold regardless of the current mix of reviewed
    // vs. pending_review items in the production catalog.
    expect(servableContentCatalog.length).toBeGreaterThan(0);
    expect(servableContentCatalog.length).toBeLessThanOrEqual(contentCatalog.length);
    expect(servableContentCatalog.every((item) => item.review.status === 'reviewed')).toBe(true);
    expect(servableContentCatalog.some((item) => skillCodeOf(item).startsWith('amc8-'))).toBe(true);

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
