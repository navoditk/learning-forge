import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { servableContentCatalog } from '../../src/content/catalog';
import {
  checkClaimedSkillBanks,
  checkItemRefLabels,
  checkPlacementCapacity,
  itemRefLabelCheckBlocks,
  type ItemRecordLookup,
} from '../../src/curriculum/catalog-registration-checks';
import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import {
  COURSE_CATALOG,
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
} from '../../src/curriculum/course-catalog';
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import {
  RATIOS_UNIT_2_LESSONS,
  RATIOS_UNIT_2_PROGRAM_REF,
  RATIOS_UNIT_2_UNIT,
  RATIOS_UNIT_2_UNIT_REF,
} from '../../src/curriculum/ratios-unit-2-catalog';
import {
  STATISTICS_BANK_DIGEST_PENDING,
  STATISTICS_UNIT_2_BANK_DIGESTS,
  STATISTICS_UNIT_2_ASSESSMENT_BANKS,
  STATISTICS_UNIT_2_LESSONS,
  STATISTICS_UNIT_2_PROGRAM,
  STATISTICS_UNIT_2_PROGRAM_REF,
  STATISTICS_UNIT_2_UNIT,
  STATISTICS_UNIT_2_UNIT_REF,
} from '../../src/curriculum/statistics-unit-2-catalog';
import { placementProbeBank, placementProbeBankFor } from '../../src/progression/placement-probe';

/**
 * MATH-ST6: the Statistics 2.0.0 records, successor program grade-6-math@1.2.0
 * (D-334, D-336 U-2..U-5, D-340) and the activation gate. Banks are metadata
 * only; the 72 private items are merged later by the owner.
 */
const ROOT = process.cwd();
const key = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;
const SKILLS = ['statistical-questions', 'distributions', 'center-and-variability'];
const selectedFile = JSON.parse(
  readFileSync(join(ROOT, 'src/curriculum/grade-6-math-active-selection.json'), 'utf8'),
) as { programs: { code: string; version: string }[]; skillBanks: { code: string }[] };

describe('Statistics 2.0.0 records', () => {
  it('three lessons, one skill each, in prerequisite order, all owned by the unit', () => {
    expect(STATISTICS_UNIT_2_LESSONS.map(key)).toEqual([
      'statistical-questions-lesson@2.0.0',
      'distributions-lesson@2.0.0',
      'center-and-variability-lesson@2.0.0',
    ]);
    expect(STATISTICS_UNIT_2_LESSONS.map((l) => l.skillRefs.map(key))).toEqual(
      SKILLS.map((skill) => [`${skill}@1.0.0`]),
    );
    for (const lesson of STATISTICS_UNIT_2_LESSONS) {
      expect(lesson.unitRef).toEqual(STATISTICS_UNIT_2_UNIT_REF);
      expect(lesson.teachingContentRefs).toEqual([]);
      expect(lesson.assessmentBankRef.version).toBe('1.0.0');
    }
    expect(STATISTICS_UNIT_2_UNIT.lessonRefs).toEqual(
      STATISTICS_UNIT_2_LESSONS.map(({ code, version }) => ({ code, version })),
    );
    expect(COURSE_CATALOG_INDEX.unitOfLesson(STATISTICS_UNIT_2_LESSONS[0]!)).toBe(
      STATISTICS_UNIT_2_UNIT,
    );
  });

  it('K-1: program 1.2.0 pins exactly [Ratios 2.0.0, Statistics 2.0.0] and Ratios keeps its introducer 1.1.0', () => {
    expect(STATISTICS_UNIT_2_PROGRAM.unitRefs).toEqual([
      RATIOS_UNIT_2_UNIT_REF,
      STATISTICS_UNIT_2_UNIT_REF,
    ]);
    expect(STATISTICS_UNIT_2_PROGRAM_REF).toEqual({ code: 'grade-6-math', version: '1.2.0' });
    // PV-1: placement `programVersion` is the unit's introducing program version.
    expect(RATIOS_UNIT_2_UNIT.programRef).toEqual(RATIOS_UNIT_2_PROGRAM_REF);
    expect(RATIOS_UNIT_2_UNIT.programRef.version).toBe('1.1.0');
    expect(STATISTICS_UNIT_2_UNIT.programRef.version).toBe('1.2.0');
    for (const unit of COURSE_CATALOG_INDEX.units) {
      const introducer = PROGRAM_REGISTRY.find((p) => key(p) === key(unit.programRef));
      expect(introducer?.unitRefs.map(key), key(unit)).toContain(key(unit));
    }
    // Other policy refs match 1.1.0 so a selection switch changes only the unit list.
    const previous = PROGRAM_REGISTRY.find((p) => key(p) === 'grade-6-math@1.1.0')!;
    expect({ ...STATISTICS_UNIT_2_PROGRAM, version: '1.1.0', unitRefs: previous.unitRefs }).toEqual(
      previous,
    );
  });

  it('V-2: every lesson practice ref pins the raw file bytes of a reviewed, servable record; first ref is the placement source', () => {
    const lookup: ItemRecordLookup = (ref) => {
      const servable = servableContentCatalog.find(
        (item) => item.id === ref.id && item.version === ref.version,
      );
      if (!servable) return undefined;
      const bytes = readFileSync(join(ROOT, 'content/statistics', `${ref.id}.json`));
      return {
        version: servable.version,
        rawSha256: createHash('sha256').update(bytes).digest('hex'),
      };
    };
    const result = checkItemRefLabels(STATISTICS_UNIT_2_LESSONS, lookup, []);
    expect(result.violations).toEqual([]);
    expect(itemRefLabelCheckBlocks(result)).toBe(false);
    expect(STATISTICS_UNIT_2_LESSONS.map((l) => l.practiceContentRefs.map((r) => r.id))).toEqual(
      SKILLS.map((skill) => [`${skill}-1`, `${skill}-2`]),
    );
  });

  it('V-10: three probe items, three skills, within the placement cap', () => {
    const capacity = checkPlacementCapacity(STATISTICS_UNIT_2_UNIT, COURSE_CATALOG_INDEX, 5);
    expect(capacity).toMatchObject({ ok: true, probeItemCount: 3, distinctSkillCount: 3 });
  });

  it('the placement probe composes three reviewed items and the committed snapshot resolves it', () => {
    const live = placementProbeBank(STATISTICS_UNIT_2_UNIT);
    expect(live?.items.map((item) => item.id)).toEqual([
      'statistical-questions-1',
      'distributions-1',
      'center-and-variability-1',
    ]);
    const historical = placementProbeBankFor({
      code: 'statistics-placement-probe',
      version: '2.0.0',
    });
    expect(historical?.items.map((item) => item.id)).toEqual(live?.items.map((item) => item.id));
    expect(historical?.items.map((item) => item.hash)).toEqual(
      STATISTICS_UNIT_2_LESSONS.map((l) => l.practiceContentRefs[0]!.hash),
    );
  });
});

describe('Statistics 2.0.0 bank metadata', () => {
  const byCode = new Map(STATISTICS_UNIT_2_ASSESSMENT_BANKS.map((bank) => [bank.code, bank]));

  it('ten banks, identities and counts per the design, 72 private items in total', () => {
    expect(STATISTICS_UNIT_2_ASSESSMENT_BANKS.map(key)).toEqual([
      'statistical-questions-lesson-bank@1.0.0',
      'distributions-lesson-bank@1.0.0',
      'center-and-variability-lesson-bank@1.0.0',
      'statistics-unit-bank@1.0.0',
      'statistical-questions-review-bank@1.0.0',
      'statistical-questions-delayed-check-bank@1.0.0',
      'distributions-review-bank@1.0.0',
      'distributions-delayed-check-bank@1.0.0',
      'center-and-variability-review-bank@1.0.0',
      'center-and-variability-delayed-check-bank@1.0.0',
    ]);
    const counts = Object.fromEntries(
      STATISTICS_UNIT_2_ASSESSMENT_BANKS.map((bank) => [bank.code, bank.itemCount]),
    );
    for (const skill of SKILLS) {
      expect(counts[`${skill}-lesson-bank`]).toBe(9);
      expect(counts[`${skill}-review-bank`]).toBe(3);
      expect(counts[`${skill}-delayed-check-bank`]).toBe(6);
    }
    expect(counts['statistics-unit-bank']).toBe(18);
    expect(STATISTICS_UNIT_2_ASSESSMENT_BANKS.reduce((sum, bank) => sum + bank.itemCount, 0)).toBe(
      72,
    );
  });

  it('every bank resolves in the index with the right target and coverage', () => {
    for (const lesson of STATISTICS_UNIT_2_LESSONS) {
      const bank = byCode.get(lesson.assessmentBankRef.code)!;
      expect(COURSE_CATALOG_INDEX.bankByRef(lesson.assessmentBankRef)).toBe(bank);
      expect(bank.targetRef).toEqual({ code: lesson.code, version: lesson.version });
      expect(bank.coveredSkillRefs).toEqual(lesson.skillRefs);
    }
    const unitBank = byCode.get('statistics-unit-bank')!;
    expect(unitBank.targetRef).toEqual(STATISTICS_UNIT_2_UNIT_REF);
    expect(unitBank.coveredSkillRefs.map(key)).toEqual(SKILLS.map((s) => `${s}@1.0.0`));
    for (const skill of SKILLS) {
      for (const suffix of ['review-bank', 'delayed-check-bank']) {
        expect(byCode.get(`${skill}-${suffix}`)!.targetRef).toEqual({
          code: skill,
          version: '1.0.0',
        });
      }
    }
  });

  it('V-11: program 1.2.0 has every required bank; metadata is reviewed (D-343) and ids are public', () => {
    expect(checkClaimedSkillBanks(VERSIONED_COURSE_CATALOG, STATISTICS_UNIT_2_PROGRAM_REF)).toEqual(
      [],
    );
    for (const bank of STATISTICS_UNIT_2_ASSESSMENT_BANKS) {
      expect(bank.review.status).toBe('reviewed');
    }
  });

  it('the committed selection names the six new skill banks (S-4)', () => {
    const named = selectedFile.skillBanks.map((ref) => ref.code);
    for (const skill of SKILLS) {
      expect(named).toContain(`${skill}-review-bank`);
      expect(named).toContain(`${skill}-delayed-check-bank`);
    }
  });
});

/** What still blocks activation once digests are real: stamps and sentinels. */
const flipBlockers = (
  banks: readonly {
    code: string;
    version: string;
    contentHash: string;
    review: { status: string };
  }[],
  unit: { code: string; version: string; review: { status: string } },
  lessons: readonly { code: string; version: string; review: { status: string } }[],
): string[] => [
  ...banks
    .filter(
      (b) => b.review.status !== 'reviewed' || b.contentHash === STATISTICS_BANK_DIGEST_PENDING,
    )
    .map((b) => `bank ${key(b)}`),
  ...(unit.review.status !== 'reviewed' ? [`unit ${key(unit)}`] : []),
  ...lessons.filter((l) => l.review.status !== 'reviewed').map((l) => `lesson ${key(l)}`),
];

describe('activation gate: program 1.2.0 is registered but selected only by the owner switch', () => {
  const selectionWith = (version: string) => ({
    ...VERSIONED_COURSE_CATALOG.selection,
    programs: VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
      ref.code === 'grade-6-math' ? { code: ref.code, version } : ref,
    ),
  });
  const withSelection = (version: string) =>
    createVersionedCourseCatalog({
      records: {
        programs: COURSE_CATALOG_INDEX.programs,
        units: COURSE_CATALOG_INDEX.units,
        lessons: COURSE_CATALOG_INDEX.lessons,
        banks: COURSE_CATALOG_INDEX.banks,
      },
      selection: selectionWith(version),
      reservedLabels: undefined,
    });

  it('LIVE GATE (digests replaced, D-360): the committed selection stays on 1.1.0 while stamps are pending', () => {
    const selected = selectedFile.programs.find((ref) => ref.code === 'grade-6-math')!;
    expect(selected.version).toBe('1.1.0');
    expect(COURSE_CATALOG.programByCode('grade-6-math')?.version).toBe('1.1.0');
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(STATISTICS_UNIT_2_UNIT_REF)).toBe(false);
    for (const lesson of STATISTICS_UNIT_2_LESSONS) {
      expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson)).toBe(false);
    }
    // What still blocks activation is the stamp state, not the digests.
    const blockers = flipBlockers(
      STATISTICS_UNIT_2_ASSESSMENT_BANKS,
      STATISTICS_UNIT_2_UNIT,
      STATISTICS_UNIT_2_LESSONS,
    );
    expect(blockers.length).toBeGreaterThan(0);
    expect(STATISTICS_UNIT_2_UNIT.review.status).toBe('pending_review');
    for (const lesson of STATISTICS_UNIT_2_LESSONS)
      expect(lesson.review.status).toBe('pending_review');
    // Whoever names 1.2.0 while any blocker stands must fail this gate.
    expect(selected.version === '1.2.0' && blockers.length > 0).toBe(false);
  });

  it('negative controls: the blocker predicate is sensitive to each stamp and to nothing else', () => {
    const stamp = {
      status: 'reviewed' as const,
      reviewer: 'synthetic reviewer (test only)',
      reviewedAt: '2026-11-17',
      originalityStatement: 'synthetic',
    };
    const unit = { ...STATISTICS_UNIT_2_UNIT, review: stamp };
    const lessons = STATISTICS_UNIT_2_LESSONS.map((l) => ({ ...l, review: stamp }));
    const banks = STATISTICS_UNIT_2_ASSESSMENT_BANKS.map((b) => ({ ...b, review: stamp }));
    expect(flipBlockers(banks, unit, lessons)).toEqual([]);
    expect(flipBlockers(banks.slice(1), unit, lessons)).toEqual([]);
    expect(
      flipBlockers(
        [
          { ...banks[0]!, review: STATISTICS_UNIT_2_ASSESSMENT_BANKS[0]!.review },
          ...banks.slice(1),
        ],
        unit,
        lessons,
      ),
    ).toEqual(
      STATISTICS_UNIT_2_ASSESSMENT_BANKS[0]!.review.status === 'pending_review'
        ? [`bank ${key(banks[0]!)}`]
        : [],
    );
    expect(
      flipBlockers(banks, { ...unit, review: STATISTICS_UNIT_2_UNIT.review }, lessons),
    ).toEqual(
      STATISTICS_UNIT_2_UNIT.review.status === 'pending_review' ? [`unit ${key(unit)}`] : [],
    );
    expect(
      flipBlockers(banks, unit, [
        { ...lessons[0]!, review: STATISTICS_UNIT_2_LESSONS[0]!.review },
        ...lessons.slice(1),
      ]),
    ).toEqual([`lesson ${key(lessons[0]!)}`]);
    // A sentinel digest on a stamped bank is also a blocker.
    expect(
      flipBlockers(
        [{ ...banks[0]!, contentHash: STATISTICS_BANK_DIGEST_PENDING }, ...banks.slice(1)],
        unit,
        lessons,
      ),
    ).toEqual([`bank ${key(banks[0]!)}`]);
  });

  it('with the committed selection (1.1.0) older Ratios-only learners are unaffected and Statistics is inactive', () => {
    const versioned = withSelection('1.1.0');
    expect(versioned.activeProgram('grade-6-math')?.version).toBe('1.1.0');
    expect(versioned.activeView().unitsOfProgram('grade-6-math')).toEqual([RATIOS_UNIT_2_UNIT]);
    expect(versioned.isActiveUnit(RATIOS_UNIT_2_UNIT_REF)).toBe(true);
    expect(versioned.isActiveUnit(STATISTICS_UNIT_2_UNIT_REF)).toBe(false);
    for (const lesson of RATIOS_UNIT_2_LESSONS) expect(versioned.isActiveLesson(lesson)).toBe(true);
    for (const lesson of STATISTICS_UNIT_2_LESSONS) {
      expect(versioned.isActiveLesson(lesson)).toBe(false);
    }
    // The live catalog is exactly this selection.
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(STATISTICS_UNIT_2_UNIT_REF)).toBe(false);
    expect(COURSE_CATALOG.unitsOfProgram('grade-6-math')).toEqual([RATIOS_UNIT_2_UNIT]);
  });

  it('with selection 1.2.0 (the switch) Ratios stays active, unchanged and unmoved, and Statistics activates', () => {
    const versioned = withSelection('1.2.0');
    expect(versioned.activeProgram('grade-6-math')).toBe(
      COURSE_CATALOG_INDEX.programs.find((p) => key(p) === 'grade-6-math@1.2.0'),
    );
    expect(versioned.activeView().unitsOfProgram('grade-6-math').map(key)).toEqual([
      'ratios-and-proportional-reasoning@2.0.0',
      'statistics@2.0.0',
    ]);
    // A Ratios unit state or placement keyed code@version resolves to the same records.
    expect(versioned.index.unitByRef(RATIOS_UNIT_2_UNIT_REF)).toBe(RATIOS_UNIT_2_UNIT);
    expect(RATIOS_UNIT_2_UNIT.programRef.version).toBe('1.1.0');
    for (const lesson of RATIOS_UNIT_2_LESSONS) {
      expect(versioned.isActiveLesson(lesson)).toBe(true);
      expect(versioned.index.lessonByRef(lesson)).toBe(lesson);
    }
    expect(versioned.isActiveUnit(STATISTICS_UNIT_2_UNIT_REF)).toBe(true);
    for (const lesson of STATISTICS_UNIT_2_LESSONS)
      expect(versioned.isActiveLesson(lesson)).toBe(true);
    expect(checkClaimedSkillBanks(versioned, STATISTICS_UNIT_2_PROGRAM_REF)).toEqual([]);
    expect(checkClaimedSkillBanks(versioned, RATIOS_UNIT_2_PROGRAM_REF)).toEqual([]);
  });

  it('rolling the selection back from 1.2.0 to 1.1.0 deactivates only Statistics', () => {
    const forward = withSelection('1.2.0');
    const back = withSelection('1.1.0');
    for (const lesson of RATIOS_UNIT_2_LESSONS) {
      expect(forward.isActiveLesson(lesson)).toBe(back.isActiveLesson(lesson));
    }
    expect(forward.isActiveUnit(STATISTICS_UNIT_2_UNIT_REF)).not.toBe(
      back.isActiveUnit(STATISTICS_UNIT_2_UNIT_REF),
    );
  });

  it('the raw index still resolves the first-listed 1.0.0 program (AS-1 control) and all three versions', () => {
    expect(COURSE_CATALOG_INDEX.programByCode('grade-6-math')?.version).toBe('1.0.0');
    for (const version of ['1.0.0', '1.1.0', '1.2.0']) {
      expect(
        VERSIONED_COURSE_CATALOG.programByRef({ code: 'grade-6-math', version }),
      ).toBeDefined();
    }
  });

  it('reserved labels: the unit and lesson 1.0.0 stub labels are not indexed', () => {
    expect(
      COURSE_CATALOG_INDEX.unitByRef({ code: 'statistics', version: '1.0.0' }),
    ).toBeUndefined();
    for (const skill of SKILLS) {
      expect(
        COURSE_CATALOG_INDEX.lessonByRef({ code: `${skill}-lesson`, version: '1.0.0' }),
      ).toBeUndefined();
    }
  });
});

describe('Statistics bank metadata file for scripts/private-bank-merge.ts --bank-metadata', () => {
  const path = join(ROOT, 'src/curriculum/statistics-bank-metadata.json');
  const metadata = JSON.parse(readFileSync(path, 'utf8')) as {
    unit: { code: string; version: string };
    includeBaselineRequired: boolean;
    banks: {
      code: string;
      version: string;
      digest: string;
      minimumItems: number;
      optional?: boolean;
      itemRole?: string;
      exclusiveSkills?: boolean;
      requiredSkillRefs: { code: string; version: string }[];
    }[];
  };

  it('lists exactly the ten registered banks with catalog counts, coverage and the derived rules, ids only', () => {
    expect(metadata.unit).toEqual(STATISTICS_UNIT_2_UNIT_REF);
    expect(metadata.includeBaselineRequired).toBe(true);
    expect(metadata.banks.map(key)).toEqual(STATISTICS_UNIT_2_ASSESSMENT_BANKS.map(key));
    for (const [i, bank] of STATISTICS_UNIT_2_ASSESSMENT_BANKS.entries()) {
      const entry = metadata.banks[i]!;
      expect(entry.minimumItems).toBe(bank.itemCount);
      expect(entry.digest).toBe(bank.contentHash);
      expect(entry.requiredSkillRefs).toEqual(bank.coveredSkillRefs);
      const skill = /-(review|delayed-check)-bank$/.test(bank.code);
      expect(entry.optional === true).toBe(skill);
      expect(entry.exclusiveSkills === true).toBe(skill);
      expect(entry.itemRole).toBe(bank.code.endsWith('-review-bank') ? 'review' : undefined);
    }
  });

  it('loads through the reviewed merge tooling without overlapping the baseline', async () => {
    const { loadBankMetadata } = await import('../../scripts/private-bank-merge');
    const loaded = loadBankMetadata(path);
    expect(Object.keys(loaded.expectedDigests)).toHaveLength(10);
    expect(loaded.requiredBanks).toHaveLength(30);
  });
});

describe('reviewed bank digests (D-360): statistics', () => {
  const metadata = JSON.parse(
    readFileSync(join(ROOT, 'src/curriculum/statistics-bank-metadata.json'), 'utf8'),
  ) as { banks: { code: string; version: string; digest: string }[] };
  const SHA = /^sha256:[0-9a-f]{64}$/;
  const digests = STATISTICS_UNIT_2_ASSESSMENT_BANKS.map((b) => b.contentHash);

  /** Defects a digest set can have: sentinel, malformed, duplicate. */
  const defects = (values: readonly string[]): string[] => [
    ...values.filter((v) => v === STATISTICS_BANK_DIGEST_PENDING).map(() => 'sentinel'),
    ...values.filter((v) => !SHA.test(v)).map(() => 'malformed'),
    ...values.filter((v, i) => values.indexOf(v) !== i).map(() => 'duplicate'),
  ];

  it('all 10 digests are real sha256 values: none is the sentinel, all distinct 64-hex', () => {
    expect(digests).toHaveLength(10);
    expect(defects(digests)).toEqual([]);
    expect(new Set(digests).size).toBe(10);
    expect(Object.values(STATISTICS_UNIT_2_BANK_DIGESTS)).toHaveLength(10);
    expect(new Set(Object.values(STATISTICS_UNIT_2_BANK_DIGESTS)).size).toBe(10);
    // Negative controls: each defect kind is detected.
    expect(defects([STATISTICS_BANK_DIGEST_PENDING, ...digests.slice(1)])).toEqual(['sentinel']);
    expect(defects(['sha256:abc', ...digests.slice(1)])).toEqual(['malformed']);
    expect(defects([digests[1]!, ...digests.slice(1)])).toEqual(['duplicate']);
    expect(defects([digests[0]!.toUpperCase(), ...digests.slice(1)])).toEqual(['malformed']);
  });

  it('catalog, digest map and committed metadata JSON agree bank by bank', () => {
    expect(Object.keys(STATISTICS_UNIT_2_BANK_DIGESTS).sort()).toEqual(
      STATISTICS_UNIT_2_ASSESSMENT_BANKS.map(key).sort(),
    );
    for (const bank of STATISTICS_UNIT_2_ASSESSMENT_BANKS) {
      const entry = metadata.banks.find((b) => key(b) === key(bank));
      expect(entry, key(bank)).toBeDefined();
      expect(entry!.digest, key(bank)).toBe(bank.contentHash);
      expect(STATISTICS_UNIT_2_BANK_DIGESTS[key(bank)], key(bank)).toBe(bank.contentHash);
    }
    // Negative control: a swapped pair is detected as disagreement.
    const [a, b] = STATISTICS_UNIT_2_ASSESSMENT_BANKS;
    expect(STATISTICS_UNIT_2_BANK_DIGESTS[key(a!)]).not.toBe(b!.contentHash);
  });
});
