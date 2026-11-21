import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { servableContentCatalog } from '../../src/content/catalog';
import { skillCatalog } from '../../src/curriculum/catalog';
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
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import {
  SPELLING_BANK_DIGEST_PENDING,
  SPELLING_UNIT_1_BANK_DIGESTS,
  SPELLING_UNIT_1_ASSESSMENT_BANKS,
  SPELLING_UNIT_1_LESSONS,
  SPELLING_UNIT_1_PROGRAM,
  SPELLING_UNIT_1_PROGRAM_REF,
  SPELLING_UNIT_1_UNIT,
  SPELLING_UNIT_1_UNIT_REF,
} from '../../src/curriculum/spelling-unit-1-catalog';
import { isSkillClaimedByAuthoredUnit } from '../../src/curriculum/unit-claims';
import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import { placementProbeBank, placementProbeBankFor } from '../../src/progression/placement-probe';
import {
  verifyProbeSnapshot,
  type ProbeManifestEntry,
} from '../../src/progression/placement-probe-snapshot';
import { authorizeProgramActivity } from '../../src/progression/policy';

/**
 * SPELL-SP5: the Spelling word-structure unit (unit U-B, D-352), successor
 * program scripps-spelling-bee-6@1.1.0 and the activation gate. REGISTERED,
 * NOT ACTIVATED. Banks are metadata only; the 96 private items are drafted
 * outside the repository and merged later by the owner.
 */
const ROOT = process.cwd();
const key = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;
const SKILLS = [
  'snsb6-morphology-roots',
  'snsb6-orthographic-patterns',
  'snsb6-phoneme-grapheme-mapping',
  'snsb6-etymology-language-origins',
];
const PRACTICE_ONLY_SKILLS = [
  'snsb6-homophones-homographs',
  'snsb6-vocabulary-context',
  'snsb6-variant-dictionary-judgment',
  'snsb6-oral-round-procedure',
];
const selectedFile = JSON.parse(
  readFileSync(join(ROOT, 'src/curriculum/grade-6-math-active-selection.json'), 'utf8'),
) as { programs: { code: string; version: string }[]; skillBanks: { code: string }[] };
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(ROOT, path), 'utf8')) as T;
const sha = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex');

describe('Spelling unit 1.0.0 records', () => {
  it('four one-skill lessons in the D-352 teaching order, all owned by the unit', () => {
    expect(SPELLING_UNIT_1_LESSONS.map(key)).toEqual(SKILLS.map((s) => `${s}-lesson@1.0.0`));
    expect(SPELLING_UNIT_1_LESSONS.map((l) => l.skillRefs.map(key))).toEqual(
      SKILLS.map((skill) => [`${skill}@1.0.0`]),
    );
    for (const lesson of SPELLING_UNIT_1_LESSONS) {
      expect(lesson.unitRef).toEqual(SPELLING_UNIT_1_UNIT_REF);
      expect(lesson.teachingContentRefs).toEqual([]);
      expect(lesson.policyProfileRef).toEqual({
        code: 'scripps-spelling-bee-6-default',
        version: '1.0.0',
      });
    }
    expect(SPELLING_UNIT_1_UNIT.lessonRefs).toEqual(
      SPELLING_UNIT_1_LESSONS.map(({ code, version }) => ({ code, version })),
    );
    expect(COURSE_CATALOG_INDEX.unitOfLesson(SPELLING_UNIT_1_LESSONS[0]!)).toBe(
      SPELLING_UNIT_1_UNIT,
    );
  });

  it('unit, lessons and banks are unstamped (pending_review), exactly like Statistics', () => {
    expect(SPELLING_UNIT_1_UNIT.review.status).toBe('pending_review');
    for (const lesson of SPELLING_UNIT_1_LESSONS)
      expect(lesson.review.status).toBe('pending_review');
    for (const bank of SPELLING_UNIT_1_ASSESSMENT_BANKS) {
      expect(bank.review.status).toBe('pending_review');
      expect(bank.review.reviewedAt).toBeUndefined();
    }
  });

  it('D-127: no new prerequisite edge among the four skills (or any snsb6- skill)', () => {
    const snsb6 = skillCatalog.filter((skill) => skill.program === 'scripps-spelling-bee-6');
    expect(snsb6).toHaveLength(8);
    for (const skill of snsb6) {
      expect(skill.prerequisiteSkillCodes, skill.code).toEqual([]);
      expect((skill as { prerequisiteRefs?: unknown[] }).prerequisiteRefs ?? []).toEqual([]);
    }
  });

  it('D-131: profile 1.0.0 stays pinned unchanged; no 1.1.0 profile exists', () => {
    const { profiles } = loadPolicyArtifacts();
    const spelling = profiles.filter((p) => p.code === 'scripps-spelling-bee-6-default');
    expect(spelling.map((p) => p.version)).toEqual(['1.0.0']);
    // Byte pin of the committed profile (math-pilot values, reviewReuse off, D-132).
    expect(
      sha(
        readFileSync(join(ROOT, 'policy/progression-profiles/scripps-spelling-bee-6-default.json')),
      ),
    ).toBe('a9fe8799a5e10eca190dfd72b377bf65a346c0a5c119451204d50f2dea913183');
    expect(spelling[0]!.reviewReuse).toEqual({ enabled: false });
    for (const record of [
      SPELLING_UNIT_1_UNIT,
      ...SPELLING_UNIT_1_LESSONS,
      ...SPELLING_UNIT_1_ASSESSMENT_BANKS,
      SPELLING_UNIT_1_PROGRAM,
    ]) {
      const ref =
        'policyProfileRef' in record
          ? record.policyProfileRef
          : (record as typeof SPELLING_UNIT_1_PROGRAM).defaultPolicyProfileRef;
      expect(ref).toEqual({ code: 'scripps-spelling-bee-6-default', version: '1.0.0' });
    }
  });

  it('K-1: program 1.1.0 is hybrid, lists exactly the one unit and is its introducer (PV-1, U-2..U-5)', () => {
    expect(SPELLING_UNIT_1_PROGRAM.unitRefs).toEqual([SPELLING_UNIT_1_UNIT_REF]);
    expect(SPELLING_UNIT_1_PROGRAM_REF).toEqual({
      code: 'scripps-spelling-bee-6',
      version: '1.1.0',
    });
    expect(SPELLING_UNIT_1_PROGRAM.progressionMode).toBe('hybrid');
    expect(SPELLING_UNIT_1_PROGRAM.accessPolicyRef).toEqual({
      code: 'scripps-spelling-bee-6-access',
      version: '1.1.0',
    });
    expect(SPELLING_UNIT_1_PROGRAM.legacyCompatibilityPolicyRef).toEqual({
      code: 'scripps-spelling-bee-6-legacy-compatibility',
      version: '1.0.0',
    });
    // PV-1: placement `programVersion` is the unit's introducing program version.
    expect(SPELLING_UNIT_1_UNIT.programRef).toEqual(SPELLING_UNIT_1_PROGRAM_REF);
    for (const unit of COURSE_CATALOG_INDEX.units) {
      const introducer = PROGRAM_REGISTRY.find((p) => key(p) === key(unit.programRef));
      expect(introducer?.unitRefs.map(key), key(unit)).toContain(key(unit));
    }
    // The only differences from 1.0.0 are mode, units and the two policy refs.
    const previous = PROGRAM_REGISTRY.find((p) => key(p) === 'scripps-spelling-bee-6@1.0.0')!;
    expect(previous.progressionMode).toBe('skill-graph-only');
    expect(previous.unitRefs).toEqual([]);
    expect({
      ...SPELLING_UNIT_1_PROGRAM,
      version: '1.0.0',
      progressionMode: previous.progressionMode,
      unitRefs: previous.unitRefs,
      accessPolicyRef: previous.accessPolicyRef,
      legacyCompatibilityPolicyRef: previous.legacyCompatibilityPolicyRef,
    }).toEqual(previous);
    // U-2: another version of the same unit code cannot be listed twice.
    expect(() =>
      createVersionedCourseCatalog({
        records: {
          programs: COURSE_CATALOG_INDEX.programs.map((p) =>
            key(p) === key(SPELLING_UNIT_1_PROGRAM)
              ? {
                  ...p,
                  unitRefs: [
                    SPELLING_UNIT_1_UNIT_REF,
                    { ...SPELLING_UNIT_1_UNIT_REF, version: '9.9.9' },
                  ],
                }
              : p,
          ),
          units: [...COURSE_CATALOG_INDEX.units, { ...SPELLING_UNIT_1_UNIT, version: '9.9.9' }],
          lessons: COURSE_CATALOG_INDEX.lessons,
          banks: COURSE_CATALOG_INDEX.banks,
        },
        selection: VERSIONED_COURSE_CATALOG.selection,
        reservedLabels: undefined,
      }),
    ).toThrow(/lists a unit code more than once/);
  });

  it('V-2: every lesson practice ref pins the raw bytes of a reviewed, servable record', () => {
    const lookup: ItemRecordLookup = (ref) => {
      const servable = servableContentCatalog.find(
        (item) => item.id === ref.id && item.version === ref.version,
      );
      if (!servable) return undefined;
      const bytes = readFileSync(join(ROOT, 'content/scripps-spelling-bee-6', `${ref.id}.json`));
      return { version: servable.version, rawSha256: sha(bytes) };
    };
    const result = checkItemRefLabels(SPELLING_UNIT_1_LESSONS, lookup, []);
    expect(result.violations).toEqual([]);
    expect(itemRefLabelCheckBlocks(result)).toBe(false);
    // Orthography's placement source is contest-2 (F-04); the others lead with core-1.
    expect(SPELLING_UNIT_1_LESSONS.map((l) => l.practiceContentRefs.map((r) => r.id))).toEqual([
      ['snsb6-morphology-roots-core-1', 'snsb6-morphology-roots-contest-2'],
      ['snsb6-orthographic-patterns-contest-2', 'snsb6-orthographic-patterns-core-1'],
      ['snsb6-phoneme-grapheme-mapping-core-1', 'snsb6-phoneme-grapheme-mapping-contest-2'],
      ['snsb6-etymology-language-origins-core-1', 'snsb6-etymology-language-origins-contest-2'],
    ]);
    // The content-2 drafts are not pinned (pending_review, unserved).
    for (const lesson of SPELLING_UNIT_1_LESSONS) {
      for (const ref of lesson.practiceContentRefs) expect(ref.version).toBe('content-1');
    }
  });

  it('V-10: four probe items, four skills, within the D-22 cap of five', () => {
    const capacity = checkPlacementCapacity(SPELLING_UNIT_1_UNIT, COURSE_CATALOG_INDEX, 5);
    expect(capacity).toMatchObject({ ok: true, probeItemCount: 4, distinctSkillCount: 4 });
  });

  it('D-136: the committed placement probe snapshot resolves, verifies and matches the live composition', () => {
    const live = placementProbeBank(SPELLING_UNIT_1_UNIT);
    expect(live?.items.map((item) => item.id)).toEqual([
      'snsb6-morphology-roots-core-1',
      'snsb6-orthographic-patterns-contest-2',
      'snsb6-phoneme-grapheme-mapping-core-1',
      'snsb6-etymology-language-origins-core-1',
    ]);
    const historical = placementProbeBankFor({
      code: 'snsb6-word-structure-placement-probe',
      version: '1.0.0',
    });
    expect(historical?.items.map((item) => item.id)).toEqual(live?.items.map((item) => item.id));
    expect(historical?.contentHash).toBe(live?.contentHash);
    expect(historical?.items.map((item) => item.hash)).toEqual(
      SPELLING_UNIT_1_LESSONS.map((l) => l.practiceContentRefs[0]!.hash),
    );
    const manifest = readJson<{ probeSnapshots: ProbeManifestEntry[] }>(
      'src/curriculum/scripps-spelling-bee-6-structure-manifest.json',
    );
    const snapshot = readJson<unknown>(
      'src/curriculum/probe-snapshots/snsb6-word-structure-placement-probe@1.0.0.json',
    );
    expect(manifest.probeSnapshots).toHaveLength(1);
    expect(verifyProbeSnapshot(snapshot, manifest.probeSnapshots[0]!).ok).toBe(true);
  });
});

describe('Spelling unit 1.0.0 bank metadata', () => {
  const byCode = new Map(SPELLING_UNIT_1_ASSESSMENT_BANKS.map((bank) => [bank.code, bank]));
  const EXPECTED = [
    ...SKILLS.map((s) => `${s}-lesson-bank@1.0.0`),
    'snsb6-word-structure-unit-bank@1.0.0',
    ...SKILLS.flatMap((s) => [`${s}-review-bank@1.0.0`, `${s}-delayed-check-bank@1.0.0`]),
  ];

  it('exact membership: thirteen banks, identities and counts per D-352, 96 private items', () => {
    expect(SPELLING_UNIT_1_ASSESSMENT_BANKS.map(key)).toEqual(EXPECTED);
    expect(EXPECTED).toHaveLength(13);
    const counts = Object.fromEntries(
      SPELLING_UNIT_1_ASSESSMENT_BANKS.map((bank) => [bank.code, bank.itemCount]),
    );
    for (const skill of SKILLS) {
      expect(counts[`${skill}-lesson-bank`]).toBe(9);
      expect(counts[`${skill}-review-bank`]).toBe(3);
      expect(counts[`${skill}-delayed-check-bank`]).toBe(6);
    }
    expect(counts['snsb6-word-structure-unit-bank']).toBe(24);
    expect(SPELLING_UNIT_1_ASSESSMENT_BANKS.reduce((sum, bank) => sum + bank.itemCount, 0)).toBe(
      96,
    );
    // Registered in the index in this order and nothing else carries the prefix.
    expect(COURSE_CATALOG_INDEX.banks.filter((b) => b.code.startsWith('snsb6-')).map(key)).toEqual(
      EXPECTED,
    );
  });

  it('every bank resolves in the index with the right target and coverage', () => {
    for (const lesson of SPELLING_UNIT_1_LESSONS) {
      const bank = byCode.get(lesson.assessmentBankRef.code)!;
      expect(COURSE_CATALOG_INDEX.bankByRef(lesson.assessmentBankRef)).toBe(bank);
      expect(bank.targetRef).toEqual({ code: lesson.code, version: lesson.version });
      expect(bank.coveredSkillRefs).toEqual(lesson.skillRefs);
    }
    const unitBank = byCode.get('snsb6-word-structure-unit-bank')!;
    expect(unitBank.targetRef).toEqual(SPELLING_UNIT_1_UNIT_REF);
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

  it('S-4: the committed selection names the eight new skill banks and nothing flips programs', () => {
    const named = selectedFile.skillBanks.map((ref) => ref.code);
    for (const skill of SKILLS) {
      expect(named).toContain(`${skill}-review-bank`);
      expect(named).toContain(`${skill}-delayed-check-bank`);
    }
    // Only the four unit-claimed skills have banks; the practice-only skills have none.
    for (const skill of PRACTICE_ONLY_SKILLS) {
      expect(named.some((code) => code.startsWith(skill))).toBe(false);
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
    .filter((b) => b.review.status !== 'reviewed' || b.contentHash === SPELLING_BANK_DIGEST_PENDING)
    .map((b) => `bank ${key(b)}`),
  ...(unit.review.status !== 'reviewed' ? [`unit ${key(unit)}`] : []),
  ...lessons.filter((l) => l.review.status !== 'reviewed').map((l) => `lesson ${key(l)}`),
];

describe('activation gate: program 1.1.0 is registered but selected only by the owner switch', () => {
  const selectionWith = (version: string) => ({
    ...VERSIONED_COURSE_CATALOG.selection,
    programs: VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
      ref.code === 'scripps-spelling-bee-6' ? { code: ref.code, version } : ref,
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

  it('LIVE GATE (digests replaced, D-360): the committed selection stays on 1.0.0 while stamps are pending', () => {
    const selected = selectedFile.programs.find((ref) => ref.code === 'scripps-spelling-bee-6')!;
    expect(selected.version).toBe('1.0.0');
    expect(COURSE_CATALOG.programByCode('scripps-spelling-bee-6')?.version).toBe('1.0.0');
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(SPELLING_UNIT_1_UNIT_REF)).toBe(false);
    for (const lesson of SPELLING_UNIT_1_LESSONS) {
      expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson)).toBe(false);
    }
    // What still blocks activation is the stamp state, not the digests.
    const blockers = flipBlockers(
      SPELLING_UNIT_1_ASSESSMENT_BANKS,
      SPELLING_UNIT_1_UNIT,
      SPELLING_UNIT_1_LESSONS,
    );
    expect(blockers.length).toBeGreaterThan(0);
    expect(SPELLING_UNIT_1_UNIT.review.status).toBe('pending_review');
    for (const lesson of SPELLING_UNIT_1_LESSONS)
      expect(lesson.review.status).toBe('pending_review');
    // Whoever names 1.1.0 while any blocker stands must fail this gate.
    expect(selected.version === '1.1.0' && blockers.length > 0).toBe(false);
    // A flip today is blocked by V-11: every bank is NOT_REVIEWED.
    const flipped = withSelection('1.1.0');
    expect(checkClaimedSkillBanks(flipped, SPELLING_UNIT_1_PROGRAM_REF)).toHaveLength(13);
  });

  it('negative controls: the blocker predicate is sensitive to each stamp and to nothing else', () => {
    const stamp = {
      status: 'reviewed' as const,
      reviewer: 'synthetic reviewer (test only)',
      reviewedAt: '2026-11-17',
      originalityStatement: 'synthetic',
    };
    const unit = { ...SPELLING_UNIT_1_UNIT, review: stamp };
    const lessons = SPELLING_UNIT_1_LESSONS.map((l) => ({ ...l, review: stamp }));
    const banks = SPELLING_UNIT_1_ASSESSMENT_BANKS.map((b) => ({ ...b, review: stamp }));
    expect(flipBlockers(banks, unit, lessons)).toEqual([]);
    expect(flipBlockers(banks.slice(1), unit, lessons)).toEqual([]);
    expect(
      flipBlockers(
        [{ ...banks[0]!, review: SPELLING_UNIT_1_ASSESSMENT_BANKS[0]!.review }, ...banks.slice(1)],
        unit,
        lessons,
      ),
    ).toEqual(
      SPELLING_UNIT_1_ASSESSMENT_BANKS[0]!.review.status === 'pending_review'
        ? [`bank ${key(banks[0]!)}`]
        : [],
    );
    expect(flipBlockers(banks, { ...unit, review: SPELLING_UNIT_1_UNIT.review }, lessons)).toEqual(
      SPELLING_UNIT_1_UNIT.review.status === 'pending_review' ? [`unit ${key(unit)}`] : [],
    );
    expect(
      flipBlockers(banks, unit, [
        { ...lessons[0]!, review: SPELLING_UNIT_1_LESSONS[0]!.review },
        ...lessons.slice(1),
      ]),
    ).toEqual([`lesson ${key(lessons[0]!)}`]);
    // A sentinel digest on a stamped bank is also a blocker.
    expect(
      flipBlockers(
        [{ ...banks[0]!, contentHash: SPELLING_BANK_DIGEST_PENDING }, ...banks.slice(1)],
        unit,
        lessons,
      ),
    ).toEqual([`bank ${key(banks[0]!)}`]);
  });

  it('with the committed selection (1.0.0) Spelling serves practice only: no unit, no lesson is active', () => {
    const versioned = withSelection('1.0.0');
    expect(versioned.activeProgram('scripps-spelling-bee-6')?.version).toBe('1.0.0');
    expect(versioned.activeProgram('scripps-spelling-bee-6')?.progressionMode).toBe(
      'skill-graph-only',
    );
    expect(versioned.activeView().unitsOfProgram('scripps-spelling-bee-6')).toEqual([]);
    expect(versioned.isActiveUnit(SPELLING_UNIT_1_UNIT_REF)).toBe(false);
    for (const lesson of SPELLING_UNIT_1_LESSONS) {
      expect(versioned.isActiveLesson(lesson)).toBe(false);
    }
    // The live catalog is exactly this selection; no snsb6 skill is claimed by a unit.
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(SPELLING_UNIT_1_UNIT_REF)).toBe(false);
    expect(COURSE_CATALOG.unitsOfProgram('scripps-spelling-bee-6')).toEqual([]);
    for (const skill of [...SKILLS, ...PRACTICE_ONLY_SKILLS]) {
      expect(isSkillClaimedByAuthoredUnit('scripps-spelling-bee-6', skill), skill).toBe(false);
    }
  });

  it('with selection 1.1.0 (the switch) only the unit and its four lessons activate', () => {
    const versioned = withSelection('1.1.0');
    expect(versioned.activeProgram('scripps-spelling-bee-6')).toBe(
      COURSE_CATALOG_INDEX.programs.find((p) => key(p) === 'scripps-spelling-bee-6@1.1.0'),
    );
    expect(versioned.activeView().unitsOfProgram('scripps-spelling-bee-6')).toEqual([
      SPELLING_UNIT_1_UNIT,
    ]);
    expect(versioned.isActiveUnit(SPELLING_UNIT_1_UNIT_REF)).toBe(true);
    for (const lesson of SPELLING_UNIT_1_LESSONS)
      expect(versioned.isActiveLesson(lesson)).toBe(true);
    for (const skill of SKILLS) {
      expect(
        isSkillClaimedByAuthoredUnit('scripps-spelling-bee-6', skill, versioned.activeView()),
        skill,
      ).toBe(true);
    }
    for (const skill of PRACTICE_ONLY_SKILLS) {
      expect(
        isSkillClaimedByAuthoredUnit('scripps-spelling-bee-6', skill, versioned.activeView()),
        skill,
      ).toBe(false);
    }
  });

  it('COUNTEREXAMPLE (activation order): flipping first leaves 13 V-11 violations; digests, then review stamps, then the flip', () => {
    // Step 0, today: selecting 1.1.0 straight away is blocked by every bank being pending_review.
    const flipped = withSelection('1.1.0');
    const violations = checkClaimedSkillBanks(flipped, SPELLING_UNIT_1_PROGRAM_REF);
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
    // Digests are real (D-360); only the review stamps still block the flip.
    expect(
      SPELLING_UNIT_1_ASSESSMENT_BANKS.some((b) => b.contentHash === SPELLING_BANK_DIGEST_PENDING),
    ).toBe(false);
    expect(
      SPELLING_UNIT_1_ASSESSMENT_BANKS.every((b) => b.review.status === 'pending_review'),
    ).toBe(true);

    // Step 1 and 2 (owner digests, delegated review stamp), shown on a synthetic copy only:
    // the same flip is then clean. The committed records are not touched.
    const stamped = SPELLING_UNIT_1_ASSESSMENT_BANKS.map((bank, i) => ({
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
      (b) => !SPELLING_UNIT_1_ASSESSMENT_BANKS.some((s) => key(s) === key(b)),
    );
    const ready = withSelection('1.1.0', [...others, ...stamped]);
    expect(checkClaimedSkillBanks(ready, SPELLING_UNIT_1_PROGRAM_REF)).toEqual([]);

    // Step 3: only one stamp missing re-blocks the flip, on exactly that bank.
    const oneShort = withSelection('1.1.0', [
      ...others,
      ...stamped.map((bank) =>
        bank.code === 'snsb6-word-structure-unit-bank'
          ? { ...bank, review: SPELLING_UNIT_1_ASSESSMENT_BANKS[4]!.review }
          : bank,
      ),
    ]);
    expect(checkClaimedSkillBanks(oneShort, SPELLING_UNIT_1_PROGRAM_REF)).toEqual([
      expect.objectContaining({ role: 'UNIT', reason: 'NOT_REVIEWED' }),
    ]);
  });

  it('the raw index still resolves 1.0.0 first (AS-1 control) and both versions', () => {
    expect(COURSE_CATALOG_INDEX.programByCode('scripps-spelling-bee-6')?.version).toBe('1.0.0');
    for (const version of ['1.0.0', '1.1.0']) {
      expect(
        VERSIONED_COURSE_CATALOG.programByRef({ code: 'scripps-spelling-bee-6', version }),
      ).toBeDefined();
    }
  });
});

describe('policies: access 1.1.0 and legacy compatibility 1.0.0', () => {
  const { accessPolicies } = loadPolicyArtifacts();
  const find = (ref: { code: string; version: string }) =>
    accessPolicies.find((p) => p.code === ref.code && p.version === ref.version);
  const access = find(SPELLING_UNIT_1_PROGRAM.accessPolicyRef)!;
  const legacy = find(SPELLING_UNIT_1_PROGRAM.legacyCompatibilityPolicyRef!)!;
  const base = {
    prerequisiteSkillCodes: [] as string[],
    masteredSkillCodes: new Set<string>(),
    accessPolicy: access,
    legacyCompatibilityPolicy: legacy,
  };

  it('both resolve; 1.0.0 stays as it was; access 1.1.0 mirrors the Math 1.1.0 shape', () => {
    expect(access).toBeDefined();
    expect(legacy).toBeDefined();
    expect(find({ code: 'scripps-spelling-bee-6-access', version: '1.0.0' })).toMatchObject({
      grantsActivityKinds: ['PRACTICE', 'PLACEMENT', 'REVIEW'],
      appliesToSkillsClaimedByNoUnit: true,
    });
    const math = find({ code: 'grade-6-math-access', version: '1.1.0' })!;
    expect({ ...access, code: math.code, version: math.version }).toEqual(math);
    expect(access.appliesToSkillsClaimedByNoUnit).toBe(false);
    expect(legacy).toMatchObject({
      grantsActivityKinds: ['PRACTICE', 'PLACEMENT', 'REVIEW'],
      deniesActivityKinds: ['LESSON_ASSESSMENT', 'UNIT_ASSESSMENT', 'DELAYED_CHECK'],
      appliesToSkillsClaimedByNoUnit: true,
    });
  });

  it('the four practice-only skills stay practice-only under the legacy policy (assessments denied)', () => {
    for (const skillCode of PRACTICE_ONLY_SKILLS) {
      for (const activityKind of ['PRACTICE', 'PLACEMENT', 'REVIEW'] as const) {
        expect(
          authorizeProgramActivity({
            ...base,
            skillCode,
            activityKind,
            skillClaimedByUnit: false,
            claimedByAuthoredUnit: false,
            assignmentBound: false,
          }).allowed,
          `${skillCode} ${activityKind}`,
        ).toBe(true);
      }
      for (const activityKind of [
        'LESSON_ASSESSMENT',
        'UNIT_ASSESSMENT',
        'DELAYED_CHECK',
      ] as const) {
        expect(
          authorizeProgramActivity({
            ...base,
            skillCode,
            activityKind,
            skillClaimedByUnit: false,
            claimedByAuthoredUnit: false,
            assignmentBound: true,
          }),
          `${skillCode} ${activityKind}`,
        ).toMatchObject({ allowed: false, reasonCode: 'ACTIVITY_NOT_GRANTED' });
      }
    }
  });

  it('the four unit skills gain assessments only with an assignment (D-62) and never without a policy', () => {
    const claimed = {
      ...base,
      skillCode: SKILLS[0]!,
      skillClaimedByUnit: true,
      claimedByAuthoredUnit: true,
    };
    expect(
      authorizeProgramActivity({
        ...claimed,
        activityKind: 'LESSON_ASSESSMENT',
        assignmentBound: true,
      }).allowed,
    ).toBe(true);
    expect(
      authorizeProgramActivity({
        ...claimed,
        activityKind: 'LESSON_ASSESSMENT',
        assignmentBound: false,
      }).reasonCode,
    ).toBe('RUN_NOT_ACTIVE');
    // A missing legacy policy is never permission for an unclaimed skill.
    expect(
      authorizeProgramActivity({
        ...base,
        legacyCompatibilityPolicy: undefined,
        skillCode: PRACTICE_ONLY_SKILLS[0]!,
        activityKind: 'PRACTICE',
        skillClaimedByUnit: false,
        claimedByAuthoredUnit: false,
        assignmentBound: false,
      }).allowed,
    ).toBe(false);
  });
});

describe('reserved labels and structure manifest', () => {
  const manifest = readJson<{
    schemaVersion: number;
    records: { kind: string; code: string; version: string; sha256: string }[];
  }>('src/curriculum/scripps-spelling-bee-6-structure-manifest.json');
  const entryKey = (e: { kind: string; code: string; version: string }) =>
    `${e.kind}:${e.code}@${e.version}`;

  it('no spelling stub label exists to reserve, and none of the new labels is reserved', () => {
    const reserved = readJson<{ code: string }[]>(
      'src/curriculum/grade-6-math-reserved-labels.json',
    );
    const codes = new Set(reserved.map((l) => l.code));
    for (const record of [
      SPELLING_UNIT_1_UNIT,
      ...SPELLING_UNIT_1_LESSONS,
      ...SPELLING_UNIT_1_ASSESSMENT_BANKS,
    ]) {
      expect(codes.has(record.code), record.code).toBe(false);
    }
    expect(reserved.some((l) => l.code.startsWith('snsb6-'))).toBe(false);
  });

  it('MF-1 pins the canonical digest of every registered Spelling record', () => {
    expect(manifest.schemaVersion).toBe(1);
    for (const entry of manifest.records) {
      const record =
        entry.kind === 'program'
          ? COURSE_CATALOG_INDEX.programs.find((p) => key(p) === key(entry))
          : entry.kind === 'unit'
            ? COURSE_CATALOG_INDEX.unitByRef(entry)
            : entry.kind === 'lesson'
              ? COURSE_CATALOG_INDEX.lessonByRef(entry)
              : COURSE_CATALOG_INDEX.bankByRef(entry);
      expect(record, entryKey(entry)).toBeDefined();
      expect(canonicalDigest(record)).toBe(entry.sha256);
    }
    // Sensitivity: an in-place edit changes the digest.
    const lessonEntry = manifest.records.find((e) => e.kind === 'lesson')!;
    expect(canonicalDigest({ ...SPELLING_UNIT_1_LESSONS[0]!, title: 'edited in place' })).not.toBe(
      lessonEntry.sha256,
    );
  });

  it('MF-2 exactly the Spelling membership closure: 2 programs, 1 unit, 4 lessons, 13 banks', () => {
    const expected = [
      'program:scripps-spelling-bee-6@1.0.0',
      'program:scripps-spelling-bee-6@1.1.0',
      'unit:snsb6-word-structure@1.0.0',
      ...SPELLING_UNIT_1_LESSONS.map((l) => `lesson:${key(l)}`),
      ...SPELLING_UNIT_1_ASSESSMENT_BANKS.map((b) => `bank:${key(b)}`),
    ];
    expect(manifest.records.map(entryKey)).toEqual(expected);
    expect(expected).toHaveLength(20);
    // The Math manifest never records a Spelling label and this one never a Math label.
    const math = readJson<{ records: { code: string }[] }>(
      'src/curriculum/grade-6-math-structure-manifest.json',
    );
    expect(
      math.records.some((e) => e.code.startsWith('snsb6-') || e.code.startsWith('scripps')),
    ).toBe(false);
    expect(manifest.records.some((e) => e.code.startsWith('grade-6-'))).toBe(false);
  });
});

describe('Spelling bank metadata file for scripts/private-bank-merge.ts --bank-metadata', () => {
  const path = join(ROOT, 'src/curriculum/spelling-bank-metadata.json');
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
    expect(metadata.unit).toEqual(SPELLING_UNIT_1_UNIT_REF);
    expect(metadata.includeBaselineRequired).toBe(true);
    expect(metadata.banks.map(key)).toEqual(SPELLING_UNIT_1_ASSESSMENT_BANKS.map(key));
    for (const [i, bank] of SPELLING_UNIT_1_ASSESSMENT_BANKS.entries()) {
      const entry = metadata.banks[i]!;
      expect(entry.minimumItems).toBe(bank.itemCount);
      expect(entry.digest).toBe(bank.contentHash);
      expect(entry.requiredSkillRefs).toEqual(bank.coveredSkillRefs);
      const skill = /-(review|delayed-check)-bank$/.test(bank.code);
      expect(entry.optional === true).toBe(skill);
      expect(entry.exclusiveSkills === true).toBe(skill);
      expect(entry.itemRole).toBe(bank.code.endsWith('-review-bank') ? 'review' : undefined);
    }
    // D-360: no digest is the sentinel any more; the reviewed digests are committed.
    expect(metadata.banks.some((b) => b.digest === SPELLING_BANK_DIGEST_PENDING)).toBe(false);
  });

  it('loads through the reviewed merge tooling without overlapping the baseline', async () => {
    const { loadBankMetadata } = await import('../../scripts/private-bank-merge');
    const loaded = loadBankMetadata(path);
    expect(Object.keys(loaded.expectedDigests)).toHaveLength(13);
    // 20 baseline (Ratios) descriptors + 13 Spelling descriptors.
    expect(loaded.requiredBanks).toHaveLength(33);
    for (const code of Object.keys(loaded.expectedDigests)) {
      expect(code.startsWith('snsb6-')).toBe(true);
    }
  });
});

describe('reviewed bank digests (D-360): spelling', () => {
  const metadata = JSON.parse(
    readFileSync(join(ROOT, 'src/curriculum/spelling-bank-metadata.json'), 'utf8'),
  ) as { banks: { code: string; version: string; digest: string }[] };
  const SHA = /^sha256:[0-9a-f]{64}$/;
  const digests = SPELLING_UNIT_1_ASSESSMENT_BANKS.map((b) => b.contentHash);

  /** Defects a digest set can have: sentinel, malformed, duplicate. */
  const defects = (values: readonly string[]): string[] => [
    ...values.filter((v) => v === SPELLING_BANK_DIGEST_PENDING).map(() => 'sentinel'),
    ...values.filter((v) => !SHA.test(v)).map(() => 'malformed'),
    ...values.filter((v, i) => values.indexOf(v) !== i).map(() => 'duplicate'),
  ];

  it('all 13 digests are real sha256 values: none is the sentinel, all distinct 64-hex', () => {
    expect(digests).toHaveLength(13);
    expect(defects(digests)).toEqual([]);
    expect(new Set(digests).size).toBe(13);
    expect(Object.values(SPELLING_UNIT_1_BANK_DIGESTS)).toHaveLength(13);
    expect(new Set(Object.values(SPELLING_UNIT_1_BANK_DIGESTS)).size).toBe(13);
    // Negative controls: each defect kind is detected.
    expect(defects([SPELLING_BANK_DIGEST_PENDING, ...digests.slice(1)])).toEqual(['sentinel']);
    expect(defects(['sha256:abc', ...digests.slice(1)])).toEqual(['malformed']);
    expect(defects([digests[1]!, ...digests.slice(1)])).toEqual(['duplicate']);
    expect(defects([digests[0]!.toUpperCase(), ...digests.slice(1)])).toEqual(['malformed']);
  });

  it('catalog, digest map and committed metadata JSON agree bank by bank', () => {
    expect(Object.keys(SPELLING_UNIT_1_BANK_DIGESTS).sort()).toEqual(
      SPELLING_UNIT_1_ASSESSMENT_BANKS.map(key).sort(),
    );
    for (const bank of SPELLING_UNIT_1_ASSESSMENT_BANKS) {
      const entry = metadata.banks.find((b) => key(b) === key(bank));
      expect(entry, key(bank)).toBeDefined();
      expect(entry!.digest, key(bank)).toBe(bank.contentHash);
      expect(SPELLING_UNIT_1_BANK_DIGESTS[key(bank)], key(bank)).toBe(bank.contentHash);
    }
    // Negative control: a swapped pair is detected as disagreement.
    const [a, b] = SPELLING_UNIT_1_ASSESSMENT_BANKS;
    expect(SPELLING_UNIT_1_BANK_DIGESTS[key(a!)]).not.toBe(b!.contentHash);
  });
});
