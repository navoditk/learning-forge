import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { servableContentCatalog } from '../../src/content/catalog';
import {
  canonicalDigest,
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
import {
  GEOMETRY_BANK_DIGEST_PENDING,
  GEOMETRY_UNIT_2_BANK_DIGESTS,
  GEOMETRY_UNIT_2_ASSESSMENT_BANKS,
  GEOMETRY_UNIT_2_LESSONS,
  GEOMETRY_UNIT_2_PROGRAM,
  GEOMETRY_UNIT_2_PROGRAM_REF,
  GEOMETRY_UNIT_2_UNIT,
  GEOMETRY_UNIT_2_UNIT_REF,
} from '../../src/curriculum/geometry-unit-2-catalog';
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import { RATIOS_UNIT_2_UNIT_REF } from '../../src/curriculum/ratios-unit-2-catalog';
import {
  STATISTICS_UNIT_2_PROGRAM,
  STATISTICS_UNIT_2_UNIT_REF,
} from '../../src/curriculum/statistics-unit-2-catalog';
import { placementProbeBank, placementProbeBankFor } from '../../src/progression/placement-probe';
import {
  verifyProbeSnapshot,
  type ProbeManifestEntry,
} from '../../src/progression/placement-probe-snapshot';

/**
 * MATH-GEO-6: Geometry 2.0.0 records, successor program grade-6-math@1.3.0
 * (D-353, D-354, D-355) and the activation gate. REGISTERED, NOT ACTIVATED.
 */
const ROOT = process.cwd();
const key = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;
const SKILLS = [
  'area-of-composite-shapes',
  'surface-area-and-volume',
  'prism-volume',
  'coordinate-geometry',
];
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(ROOT, path), 'utf8')) as T;
const sha = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');
const selectedFile = readJson<{
  programs: { code: string; version: string }[];
  skillBanks: { code: string }[];
}>('src/curriculum/grade-6-math-active-selection.json');

describe('Geometry 2.0.0 records', () => {
  it('four one-skill lessons in the D-354 order, all owned by the unit', () => {
    expect(GEOMETRY_UNIT_2_LESSONS.map(key)).toEqual(SKILLS.map((s) => `${s}-lesson@2.0.0`));
    expect(GEOMETRY_UNIT_2_LESSONS.map((l) => l.skillRefs.map(key))).toEqual(
      SKILLS.map((s) => [`${s}@1.0.0`]),
    );
    for (const lesson of GEOMETRY_UNIT_2_LESSONS) {
      expect(lesson.unitRef).toEqual(GEOMETRY_UNIT_2_UNIT_REF);
      expect(lesson.teachingContentRefs).toEqual([]);
    }
    expect(GEOMETRY_UNIT_2_UNIT.lessonRefs).toEqual(
      GEOMETRY_UNIT_2_LESSONS.map(({ code, version }) => ({ code, version })),
    );
    expect(COURSE_CATALOG_INDEX.unitOfLesson(GEOMETRY_UNIT_2_LESSONS[0]!)).toBe(
      GEOMETRY_UNIT_2_UNIT,
    );
  });

  it('unit, lessons and banks are unstamped (pending_review)', () => {
    expect(GEOMETRY_UNIT_2_UNIT.review.status).toBe('pending_review');
    for (const lesson of GEOMETRY_UNIT_2_LESSONS) {
      expect(lesson.review.status).toBe('pending_review');
    }
    for (const bank of GEOMETRY_UNIT_2_ASSESSMENT_BANKS) {
      expect(bank.review.status).toBe('pending_review');
      expect(bank.review.reviewedAt).toBeUndefined();
    }
  });

  it('K-1: program 1.3.0 pins exactly [Ratios 2.0.0, Statistics 2.0.0, Geometry 2.0.0] and is the Geometry introducer (PV-1)', () => {
    expect(GEOMETRY_UNIT_2_PROGRAM.unitRefs.map(key)).toEqual([
      'ratios-and-proportional-reasoning@2.0.0',
      'statistics@2.0.0',
      'geometry@2.0.0',
    ]);
    expect(GEOMETRY_UNIT_2_PROGRAM.unitRefs).toEqual([
      RATIOS_UNIT_2_UNIT_REF,
      STATISTICS_UNIT_2_UNIT_REF,
      GEOMETRY_UNIT_2_UNIT_REF,
    ]);
    expect(GEOMETRY_UNIT_2_PROGRAM_REF).toEqual({ code: 'grade-6-math', version: '1.3.0' });
    expect(GEOMETRY_UNIT_2_UNIT.programRef).toEqual(GEOMETRY_UNIT_2_PROGRAM_REF);
    // The registered 1.2.0 membership is unchanged (CX-2, CX-3).
    expect(STATISTICS_UNIT_2_PROGRAM.unitRefs.map(key)).toEqual([
      'ratios-and-proportional-reasoning@2.0.0',
      'statistics@2.0.0',
    ]);
    for (const unit of COURSE_CATALOG_INDEX.units) {
      const introducer = PROGRAM_REGISTRY.find((p) => key(p) === key(unit.programRef));
      expect(introducer?.unitRefs.map(key), key(unit)).toContain(key(unit));
    }
    // Only the unit list differs from 1.2.0.
    expect({
      ...GEOMETRY_UNIT_2_PROGRAM,
      version: '1.2.0',
      unitRefs: STATISTICS_UNIT_2_PROGRAM.unitRefs,
    }).toEqual(STATISTICS_UNIT_2_PROGRAM);
    // The registry holds 1.0.0, 1.1.0, 1.2.0, 1.3.0 in that order.
    expect(PROGRAM_REGISTRY.filter((p) => p.code === 'grade-6-math').map((p) => p.version)).toEqual(
      ['1.0.0', '1.1.0', '1.2.0', '1.3.0'],
    );
  });

  it('V-2: every lesson practice ref pins the raw bytes of a reviewed, servable record; version labels are correct', () => {
    const lookup: ItemRecordLookup = (ref) => {
      const servable = servableContentCatalog.find(
        (item) => item.id === ref.id && item.version === ref.version,
      );
      if (!servable) return undefined;
      const file = ref.version === 'content-3' ? `${ref.id}-content-3.json` : `${ref.id}.json`;
      return {
        version: servable.version,
        rawSha256: sha(readFileSync(join(ROOT, 'content/geometry', file))),
      };
    };
    const result = checkItemRefLabels(GEOMETRY_UNIT_2_LESSONS, lookup, []);
    expect(result.violations).toEqual([]);
    expect(itemRefLabelCheckBlocks(result)).toBe(false);
    expect(
      GEOMETRY_UNIT_2_LESSONS.map((l) => l.practiceContentRefs.map((r) => `${r.id}@${r.version}`)),
    ).toEqual([
      ['area-of-composite-shapes-1@content-1', 'area-of-composite-shapes-2@content-1'],
      ['surface-area-and-volume-2@content-1'],
      ['prism-volume-1@content-1', 'prism-volume-2@content-3'],
      ['coordinate-geometry-2@content-1', 'coordinate-geometry-1@content-1'],
    ]);
    const prism = GEOMETRY_UNIT_2_LESSONS[2]!.practiceContentRefs[1]!;
    expect(prism.hash).toBe(
      'sha256:798b2edf4c821a2c6e008b5e28b87ed6c46213664fec7b11d84a10730ae1f55a',
    );
  });

  it('the 16 pending_review GEO-2 drafts are not pinned anywhere', () => {
    const pinned = GEOMETRY_UNIT_2_LESSONS.flatMap((l) => l.practiceContentRefs.map((r) => r.id));
    expect(pinned.some((id) => /-[3-6]$/.test(id))).toBe(false);
  });

  it('O-7 (D-354): surface-area-and-volume-1 is neither a lesson ref nor a probe source', () => {
    const ids = GEOMETRY_UNIT_2_LESSONS.flatMap((l) => l.practiceContentRefs.map((r) => r.id));
    expect(ids).not.toContain('surface-area-and-volume-1');
    expect(GEOMETRY_UNIT_2_LESSONS[1]!.practiceContentRefs[0]!.id).toBe(
      'surface-area-and-volume-2',
    );
    const live = placementProbeBank(GEOMETRY_UNIT_2_UNIT);
    expect(live?.items.map((item) => item.id)).not.toContain('surface-area-and-volume-1');
    const snapshot = readJson<{ items: { projection: { id: string } }[] }>(
      'src/curriculum/probe-snapshots/geometry-placement-probe@2.0.0.json',
    );
    expect(snapshot.items.map((i) => i.projection.id)).not.toContain('surface-area-and-volume-1');
  });

  it('V-10: four probe items, four skills, within the D-22 cap of five', () => {
    const capacity = checkPlacementCapacity(GEOMETRY_UNIT_2_UNIT, COURSE_CATALOG_INDEX, 5);
    expect(capacity).toMatchObject({ ok: true, probeItemCount: 4, distinctSkillCount: 4 });
  });

  it('D-136: the committed placement probe snapshot resolves, verifies and matches the live composition', () => {
    const live = placementProbeBank(GEOMETRY_UNIT_2_UNIT);
    expect(live?.items.map((item) => item.id)).toEqual([
      'area-of-composite-shapes-1',
      'surface-area-and-volume-2',
      'prism-volume-1',
      'coordinate-geometry-2',
    ]);
    const historical = placementProbeBankFor({
      code: 'geometry-placement-probe',
      version: '2.0.0',
    });
    expect(historical?.items.map((item) => item.id)).toEqual(live?.items.map((item) => item.id));
    expect(historical?.contentHash).toBe(live?.contentHash);
    expect(historical?.items.map((item) => item.hash)).toEqual(
      GEOMETRY_UNIT_2_LESSONS.map((l) => l.practiceContentRefs[0]!.hash),
    );
    const manifest = readJson<{ probeSnapshots: ProbeManifestEntry[] }>(
      'src/curriculum/grade-6-math-structure-manifest.json',
    );
    const entry = manifest.probeSnapshots.find((e) => e.bankCode === 'geometry-placement-probe')!;
    const snapshot = readJson<unknown>(
      'src/curriculum/probe-snapshots/geometry-placement-probe@2.0.0.json',
    );
    expect(verifyProbeSnapshot(snapshot, entry).ok).toBe(true);
  });

  it('cross-domain prerequisite is unchanged: coordinate-geometry still depends on coordinate-distance', () => {
    const skill = readJson<{ prerequisiteSkillCodes: string[] }>(
      'content/skills/coordinate-geometry.json',
    );
    expect(skill.prerequisiteSkillCodes).toEqual(['coordinate-distance']);
    const area = readJson<{ prerequisiteSkillCodes: string[] }>(
      'content/skills/surface-area-and-volume.json',
    );
    expect(area.prerequisiteSkillCodes).toEqual(['area-of-composite-shapes']);
  });
});

describe('Geometry 2.0.0 bank metadata', () => {
  const byCode = new Map(GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map((bank) => [bank.code, bank]));
  const EXPECTED = [
    ...SKILLS.map((s) => `${s}-lesson-bank@1.0.0`),
    'geometry-unit-bank@1.0.0',
    ...SKILLS.flatMap((s) => [`${s}-review-bank@1.0.0`, `${s}-delayed-check-bank@1.0.0`]),
  ];

  it('exact membership: thirteen banks, identities and counts, 96 planned private items', () => {
    expect(GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map(key)).toEqual(EXPECTED);
    const counts = Object.fromEntries(
      GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map((bank) => [bank.code, bank.itemCount]),
    );
    for (const skill of SKILLS) {
      expect(counts[`${skill}-lesson-bank`]).toBe(9);
      expect(counts[`${skill}-review-bank`]).toBe(3);
      expect(counts[`${skill}-delayed-check-bank`]).toBe(6);
    }
    expect(counts['geometry-unit-bank']).toBe(24);
    expect(GEOMETRY_UNIT_2_ASSESSMENT_BANKS.reduce((sum, bank) => sum + bank.itemCount, 0)).toBe(
      96,
    );
  });

  it('every bank resolves in the index with the right target and coverage', () => {
    for (const lesson of GEOMETRY_UNIT_2_LESSONS) {
      const bank = byCode.get(lesson.assessmentBankRef.code)!;
      expect(COURSE_CATALOG_INDEX.bankByRef(lesson.assessmentBankRef)).toBe(bank);
      expect(bank.targetRef).toEqual({ code: lesson.code, version: lesson.version });
      expect(bank.coveredSkillRefs).toEqual(lesson.skillRefs);
    }
    const unitBank = byCode.get('geometry-unit-bank')!;
    expect(unitBank.targetRef).toEqual(GEOMETRY_UNIT_2_UNIT_REF);
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

  it('S-4: the committed selection names the eight new skill banks', () => {
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
    .filter((b) => b.review.status !== 'reviewed' || b.contentHash === GEOMETRY_BANK_DIGEST_PENDING)
    .map((b) => `bank ${key(b)}`),
  ...(unit.review.status !== 'reviewed' ? [`unit ${key(unit)}`] : []),
  ...lessons.filter((l) => l.review.status !== 'reviewed').map((l) => `lesson ${key(l)}`),
];

describe('activation gate: program 1.3.0 is registered but selected only by the owner switch', () => {
  const selectionWith = (version: string) => ({
    ...VERSIONED_COURSE_CATALOG.selection,
    programs: VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
      ref.code === 'grade-6-math' ? { code: ref.code, version } : ref,
    ),
  });
  const withSelection = (version: string, banks = COURSE_CATALOG_INDEX.banks) =>
    createVersionedCourseCatalog({
      records: {
        programs: COURSE_CATALOG_INDEX.programs,
        units: COURSE_CATALOG_INDEX.units,
        lessons: COURSE_CATALOG_INDEX.lessons,
        banks: [...banks],
      },
      selection: selectionWith(version),
      reservedLabels: undefined,
    });

  it('LIVE GATE (digests replaced, D-360): the committed selection stays on 1.1.0 while stamps are pending', () => {
    const selected = selectedFile.programs.find((ref) => ref.code === 'grade-6-math')!;
    expect(selected.version).toBe('1.1.0');
    expect(COURSE_CATALOG.programByCode('grade-6-math')?.version).toBe('1.1.0');
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(GEOMETRY_UNIT_2_UNIT_REF)).toBe(false);
    for (const lesson of GEOMETRY_UNIT_2_LESSONS) {
      expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson)).toBe(false);
    }
    // What still blocks activation is the stamp state, not the digests.
    const blockers = flipBlockers(
      GEOMETRY_UNIT_2_ASSESSMENT_BANKS,
      GEOMETRY_UNIT_2_UNIT,
      GEOMETRY_UNIT_2_LESSONS,
    );
    expect(blockers.length).toBeGreaterThan(0);
    expect(GEOMETRY_UNIT_2_UNIT.review.status).toBe('pending_review');
    for (const lesson of GEOMETRY_UNIT_2_LESSONS)
      expect(lesson.review.status).toBe('pending_review');
    // Whoever names 1.3.0 while any blocker stands must fail this gate.
    expect(selected.version === '1.3.0' && blockers.length > 0).toBe(false);
    // A flip today is blocked by V-11: every bank is NOT_REVIEWED.
    const flipped = withSelection('1.3.0');
    expect(checkClaimedSkillBanks(flipped, GEOMETRY_UNIT_2_PROGRAM_REF)).toHaveLength(13);
  });

  it('negative controls: the blocker predicate is sensitive to each stamp and to nothing else', () => {
    const stamp = {
      status: 'reviewed' as const,
      reviewer: 'synthetic reviewer (test only)',
      reviewedAt: '2026-11-17',
      originalityStatement: 'synthetic',
    };
    const unit = { ...GEOMETRY_UNIT_2_UNIT, review: stamp };
    const lessons = GEOMETRY_UNIT_2_LESSONS.map((l) => ({ ...l, review: stamp }));
    const banks = GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map((b) => ({ ...b, review: stamp }));
    expect(flipBlockers(banks, unit, lessons)).toEqual([]);
    expect(flipBlockers(banks.slice(1), unit, lessons)).toEqual([]);
    expect(
      flipBlockers(
        [{ ...banks[0]!, review: GEOMETRY_UNIT_2_ASSESSMENT_BANKS[0]!.review }, ...banks.slice(1)],
        unit,
        lessons,
      ),
    ).toEqual(
      GEOMETRY_UNIT_2_ASSESSMENT_BANKS[0]!.review.status === 'pending_review'
        ? [`bank ${key(banks[0]!)}`]
        : [],
    );
    expect(flipBlockers(banks, { ...unit, review: GEOMETRY_UNIT_2_UNIT.review }, lessons)).toEqual(
      GEOMETRY_UNIT_2_UNIT.review.status === 'pending_review' ? [`unit ${key(unit)}`] : [],
    );
    expect(
      flipBlockers(banks, unit, [
        { ...lessons[0]!, review: GEOMETRY_UNIT_2_LESSONS[0]!.review },
        ...lessons.slice(1),
      ]),
    ).toEqual([`lesson ${key(lessons[0]!)}`]);
    // A sentinel digest on a stamped bank is also a blocker.
    expect(
      flipBlockers(
        [{ ...banks[0]!, contentHash: GEOMETRY_BANK_DIGEST_PENDING }, ...banks.slice(1)],
        unit,
        lessons,
      ),
    ).toEqual([`bank ${key(banks[0]!)}`]);
  });

  it('with selection 1.3.0 (the switch) Ratios, Statistics and Geometry are active in order', () => {
    const versioned = withSelection('1.3.0');
    expect(versioned.activeView().unitsOfProgram('grade-6-math').map(key)).toEqual([
      'ratios-and-proportional-reasoning@2.0.0',
      'statistics@2.0.0',
      'geometry@2.0.0',
    ]);
    for (const lesson of GEOMETRY_UNIT_2_LESSONS)
      expect(versioned.isActiveLesson(lesson)).toBe(true);
  });

  it('COUNTEREXAMPLE U-4: 1.3.0 registered before 1.2.0 (reordered registry) fails the introducer check', () => {
    // Geometry's unit points at 1.3.0; without 1.2.0 listing Statistics, Statistics' introducer
    // (programRef 1.2.0) is missing, so the validator fails (CX-1).
    const withoutStatisticsProgram = COURSE_CATALOG_INDEX.programs.filter(
      (p) => key(p) !== 'grade-6-math@1.2.0',
    );
    expect(() =>
      createVersionedCourseCatalog({
        records: {
          programs: withoutStatisticsProgram,
          units: COURSE_CATALOG_INDEX.units,
          lessons: COURSE_CATALOG_INDEX.lessons,
          banks: COURSE_CATALOG_INDEX.banks,
        },
        selection: VERSIONED_COURSE_CATALOG.selection,
        reservedLabels: undefined,
      }),
    ).toThrow();
    // CX-4: listing the retired stub unit geometry@1.0.0 does not resolve either.
    expect(() =>
      createVersionedCourseCatalog({
        records: {
          programs: COURSE_CATALOG_INDEX.programs.map((p) =>
            key(p) === 'grade-6-math@1.3.0'
              ? {
                  ...p,
                  unitRefs: [...p.unitRefs.slice(0, 2), { code: 'geometry', version: '1.0.0' }],
                }
              : p,
          ),
          units: COURSE_CATALOG_INDEX.units,
          lessons: COURSE_CATALOG_INDEX.lessons,
          banks: COURSE_CATALOG_INDEX.banks,
        },
        selection: VERSIONED_COURSE_CATALOG.selection,
        reservedLabels: undefined,
      }),
    ).toThrow();
  });

  it('COUNTEREXAMPLE (activation order): flipping first leaves 13 V-11 NOT_REVIEWED violations; digests, then stamps, then the flip', () => {
    const flipped = withSelection('1.3.0');
    const violations = checkClaimedSkillBanks(flipped, GEOMETRY_UNIT_2_PROGRAM_REF);
    expect(violations).toHaveLength(13);
    expect(new Set(violations.map((v) => v.reason))).toEqual(new Set(['NOT_REVIEWED']));
    expect(violations.map((v) => v.role).sort()).toEqual(
      [
        ...SKILLS.map(() => 'LESSON'),
        'UNIT',
        ...SKILLS.map(() => 'REVIEW'),
        ...SKILLS.map(() => 'DELAYED_CHECK'),
      ].sort(),
    );
    const stamped = GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map((bank, i) => ({
      ...bank,
      contentHash: `sha256:${(i + 1).toString(16).padStart(64, '1')}`,
      review: {
        status: 'reviewed' as const,
        reviewer: 'synthetic reviewer (test only)',
        reviewedAt: '2026-11-17',
        originalityStatement: bank.review.originalityStatement,
      },
    }));
    const others = COURSE_CATALOG_INDEX.banks.filter(
      (b) => !GEOMETRY_UNIT_2_ASSESSMENT_BANKS.some((g) => key(g) === key(b)),
    );
    expect(
      checkClaimedSkillBanks(
        withSelection('1.3.0', [...others, ...stamped]),
        GEOMETRY_UNIT_2_PROGRAM_REF,
      ),
    ).toEqual([]);
    const oneShort = withSelection('1.3.0', [
      ...others,
      ...stamped.map((bank) =>
        bank.code === 'geometry-unit-bank'
          ? { ...bank, review: GEOMETRY_UNIT_2_ASSESSMENT_BANKS[4]!.review }
          : bank,
      ),
    ]);
    expect(checkClaimedSkillBanks(oneShort, GEOMETRY_UNIT_2_PROGRAM_REF)).toEqual([
      expect.objectContaining({ role: 'UNIT', reason: 'NOT_REVIEWED' }),
    ]);
  });

  it('the raw index still resolves the first-listed 1.0.0 program (AS-1 control) and all four versions', () => {
    expect(COURSE_CATALOG_INDEX.programByCode('grade-6-math')?.version).toBe('1.0.0');
    for (const version of ['1.0.0', '1.1.0', '1.2.0', '1.3.0']) {
      expect(
        VERSIONED_COURSE_CATALOG.programByRef({ code: 'grade-6-math', version }),
      ).toBeDefined();
    }
  });
});

describe('reserved labels and structure manifest', () => {
  const manifest = readJson<{
    records: { kind: string; code: string; version: string; sha256: string }[];
  }>('src/curriculum/grade-6-math-structure-manifest.json');

  it('the retired geometry@1.0.0 stub labels are reserved and not indexed', () => {
    const reserved = readJson<{ kind: string; code: string; version: string }[]>(
      'src/curriculum/grade-6-math-reserved-labels.json',
    );
    expect(
      reserved.filter((l) => l.version === '1.0.0' && SKILLS.some((s) => l.code === `${s}-lesson`)),
    ).toHaveLength(4);
    expect(reserved).toContainEqual({ kind: 'unit', code: 'geometry', version: '1.0.0' });
    expect(COURSE_CATALOG_INDEX.unitByRef({ code: 'geometry', version: '1.0.0' })).toBeUndefined();
    for (const skill of SKILLS) {
      expect(
        COURSE_CATALOG_INDEX.lessonByRef({ code: `${skill}-lesson`, version: '1.0.0' }),
      ).toBeUndefined();
    }
  });

  it('MF-1 pins the canonical digest of every Geometry record (19 records)', () => {
    const records = [
      GEOMETRY_UNIT_2_PROGRAM,
      GEOMETRY_UNIT_2_UNIT,
      ...GEOMETRY_UNIT_2_LESSONS,
      ...GEOMETRY_UNIT_2_ASSESSMENT_BANKS,
    ];
    expect(records).toHaveLength(19);
    for (const record of records) {
      const entry = manifest.records.find(
        (e) =>
          e.code === record.code &&
          e.version === record.version &&
          (e.kind !== 'program' || e.kind === 'program'),
      );
      expect(entry, key(record)).toBeDefined();
      expect(canonicalDigest(record)).toBe(entry!.sha256);
    }
    expect(canonicalDigest({ ...GEOMETRY_UNIT_2_LESSONS[0]!, title: 'edited in place' })).not.toBe(
      manifest.records.find((e) => e.code === GEOMETRY_UNIT_2_LESSONS[0]!.code)!.sha256,
    );
  });
});

describe('Geometry bank metadata file for scripts/private-bank-merge.ts --bank-metadata', () => {
  const path = join(ROOT, 'src/curriculum/geometry-bank-metadata.json');
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

  it('lists exactly the thirteen registered banks with catalog counts, coverage and derived rules, ids only', () => {
    expect(metadata.unit).toEqual(GEOMETRY_UNIT_2_UNIT_REF);
    expect(metadata.includeBaselineRequired).toBe(true);
    expect(metadata.banks.map(key)).toEqual(GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map(key));
    for (const [i, bank] of GEOMETRY_UNIT_2_ASSESSMENT_BANKS.entries()) {
      const entry = metadata.banks[i]!;
      expect(entry.minimumItems).toBe(bank.itemCount);
      expect(entry.digest).toBe(bank.contentHash);
      expect(entry.requiredSkillRefs).toEqual(bank.coveredSkillRefs);
      const skill = /-(review|delayed-check)-bank$/.test(bank.code);
      expect(entry.optional === true).toBe(skill);
      expect(entry.exclusiveSkills === true).toBe(skill);
      expect(entry.itemRole).toBe(bank.code.endsWith('-review-bank') ? 'review' : undefined);
    }
    expect(metadata.banks.some((b) => b.digest === GEOMETRY_BANK_DIGEST_PENDING)).toBe(false);
  });

  it('loads through the reviewed merge tooling without overlapping the baseline', async () => {
    const { loadBankMetadata } = await import('../../scripts/private-bank-merge');
    const loaded = loadBankMetadata(path);
    expect(Object.keys(loaded.expectedDigests)).toHaveLength(13);
    expect(loaded.requiredBanks.length).toBeGreaterThanOrEqual(33);
  });
});

describe('reviewed bank digests (D-360): geometry', () => {
  const metadata = JSON.parse(
    readFileSync(join(ROOT, 'src/curriculum/geometry-bank-metadata.json'), 'utf8'),
  ) as { banks: { code: string; version: string; digest: string }[] };
  const SHA = /^sha256:[0-9a-f]{64}$/;
  const digests = GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map((b) => b.contentHash);

  /** Defects a digest set can have: sentinel, malformed, duplicate. */
  const defects = (values: readonly string[]): string[] => [
    ...values.filter((v) => v === GEOMETRY_BANK_DIGEST_PENDING).map(() => 'sentinel'),
    ...values.filter((v) => !SHA.test(v)).map(() => 'malformed'),
    ...values.filter((v, i) => values.indexOf(v) !== i).map(() => 'duplicate'),
  ];

  it('all 13 digests are real sha256 values: none is the sentinel, all distinct 64-hex', () => {
    expect(digests).toHaveLength(13);
    expect(defects(digests)).toEqual([]);
    expect(new Set(digests).size).toBe(13);
    expect(Object.values(GEOMETRY_UNIT_2_BANK_DIGESTS)).toHaveLength(13);
    expect(new Set(Object.values(GEOMETRY_UNIT_2_BANK_DIGESTS)).size).toBe(13);
    // Negative controls: each defect kind is detected.
    expect(defects([GEOMETRY_BANK_DIGEST_PENDING, ...digests.slice(1)])).toEqual(['sentinel']);
    expect(defects(['sha256:abc', ...digests.slice(1)])).toEqual(['malformed']);
    expect(defects([digests[1]!, ...digests.slice(1)])).toEqual(['duplicate']);
    expect(defects([digests[0]!.toUpperCase(), ...digests.slice(1)])).toEqual(['malformed']);
  });

  it('catalog, digest map and committed metadata JSON agree bank by bank', () => {
    expect(Object.keys(GEOMETRY_UNIT_2_BANK_DIGESTS).sort()).toEqual(
      GEOMETRY_UNIT_2_ASSESSMENT_BANKS.map(key).sort(),
    );
    for (const bank of GEOMETRY_UNIT_2_ASSESSMENT_BANKS) {
      const entry = metadata.banks.find((b) => key(b) === key(bank));
      expect(entry, key(bank)).toBeDefined();
      expect(entry!.digest, key(bank)).toBe(bank.contentHash);
      expect(GEOMETRY_UNIT_2_BANK_DIGESTS[key(bank)], key(bank)).toBe(bank.contentHash);
    }
    // Negative control: a swapped pair is detected as disagreement.
    const [a, b] = GEOMETRY_UNIT_2_ASSESSMENT_BANKS;
    expect(GEOMETRY_UNIT_2_BANK_DIGESTS[key(a!)]).not.toBe(b!.contentHash);
  });
});
