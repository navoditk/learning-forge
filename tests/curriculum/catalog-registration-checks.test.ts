import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { AssessmentBank, ItemRef, Lesson, Unit } from '../../src/contracts/progression';
import {
  canonicalDigest,
  checkClaimedSkillBanks,
  checkItemRefLabels,
  checkPlacementCapacity,
  itemRefLabelCheckBlocks,
  type ItemRecordLookup,
  type ItemRefException,
} from '../../src/curriculum/catalog-registration-checks';
import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import {
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
  createCourseCatalog,
  type CourseCatalog,
} from '../../src/curriculum/course-catalog';
import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../src/curriculum/pilot-catalog';
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import {
  SV_BANKS,
  SV_LESSONS_V2,
  SV_PROGRAM_CODE,
  SV_PROGRAM_V1,
  SV_PROGRAM_V11_REF,
  SV_PROGRAM_V1_REF,
  SV_UNIT_V1,
  SV_UNIT_V2,
  capacityInput,
  selectionFor,
  sv,
  svSkill,
  syntheticVersionedInput,
} from './fixtures/synthetic-versioned-catalog';

const key = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;
const sha = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex');

// ------------------------------------------------------------------ V-2

type SyntheticLesson = Pick<
  Lesson,
  'code' | 'version' | 'practiceContentRefs' | 'teachingContentRefs'
>;

const ref = (id: string, version: string, rawSha256: string): ItemRef => ({
  id,
  version,
  hash: `sha256:${rawSha256}`,
});
const lessonOf = (
  code: string,
  practice: ItemRef[],
  teaching: ItemRef[] = [],
): SyntheticLesson => ({
  code,
  version: '1.0.0',
  practiceContentRefs: practice,
  teachingContentRefs: teaching,
});
const lookupOf =
  (records: Record<string, { version: string; rawSha256: string }>): ItemRecordLookup =>
  (item) =>
    records[item.id];

const RAW = sha('raw-bytes-a');
const OTHER = sha('raw-bytes-b');

const PILOT_EXCEPTIONS: ItemRefException[] = [
  { lesson: 'unit-rates-lesson@1.0.0', ref: 'unit-rates-2@content-1' },
  { lesson: 'ratio-tables-lesson@1.0.0', ref: 'ratio-tables-2@content-1' },
];

function liveLookup(): ItemRecordLookup {
  return (item) => {
    try {
      const path = join(process.cwd(), 'content', 'ratios', `${item.id}.json`);
      const bytes = readFileSync(path);
      const parsed = JSON.parse(bytes.toString('utf8')) as { version: string };
      return { version: parsed.version, rawSha256: sha(bytes) };
    } catch {
      return undefined;
    }
  };
}

describe('V-2 item-ref labels', () => {
  it('V2-1 accepts the two documented pilot label exceptions and nothing else', () => {
    const result = checkItemRefLabels(PILOT_LESSONS, liveLookup(), PILOT_EXCEPTIONS);
    expect(result.violations).toEqual([]);
    expect(result.staleExceptions).toEqual([]);
    expect(result.acceptedExceptions).toEqual([
      {
        lesson: 'unit-rates-lesson@1.0.0',
        ref: 'unit-rates-2@content-1',
        recordVersion: 'content-2',
      },
      {
        lesson: 'ratio-tables-lesson@1.0.0',
        ref: 'ratio-tables-2@content-1',
        recordVersion: 'content-2',
      },
    ]);
    expect(itemRefLabelCheckBlocks(result)).toBe(false);
  });

  it('V2-1n shows the exceptions are load-bearing', () => {
    const result = checkItemRefLabels(PILOT_LESSONS, liveLookup(), []);
    expect(result.violations).toEqual([
      {
        lesson: 'unit-rates-lesson@1.0.0',
        ref: 'unit-rates-2@content-1',
        reason: 'VERSION_MISMATCH',
      },
      {
        lesson: 'ratio-tables-lesson@1.0.0',
        ref: 'ratio-tables-2@content-1',
        reason: 'VERSION_MISMATCH',
      },
    ]);
    expect(result.acceptedExceptions).toEqual([]);
    expect(itemRefLabelCheckBlocks(result)).toBe(true);
  });

  it('V2-0 positive control: equal versions and a matching prefixed hash', () => {
    const result = checkItemRefLabels(
      [lessonOf('l', [ref('p', 'content-1', RAW)], [ref('t', 'content-1', OTHER)])],
      lookupOf({
        p: { version: 'content-1', rawSha256: RAW },
        t: { version: 'content-1', rawSha256: OTHER },
      }),
      [],
    );
    expect(result).toEqual({ violations: [], acceptedExceptions: [], staleExceptions: [] });
    expect(itemRefLabelCheckBlocks(result)).toBe(false);
  });

  it('V2-2 flags a right-hash wrong-version ref and matches exceptions exactly', () => {
    const lesson = lessonOf('l', [ref('p', 'content-1', RAW)]);
    const result = checkItemRefLabels(
      [lesson],
      lookupOf({ p: { version: 'content-2', rawSha256: RAW } }),
      [{ lesson: 'l@2.0.0', ref: 'p@content-1' }],
    );
    expect(result.violations).toEqual([
      { lesson: 'l@1.0.0', ref: 'p@content-1', reason: 'VERSION_MISMATCH' },
    ]);
    expect(result.staleExceptions).toEqual([{ lesson: 'l@2.0.0', ref: 'p@content-1' }]);
    expect(itemRefLabelCheckBlocks(result)).toBe(true);
  });

  it('V2-3 hash-mismatch matrix with an exact exception entry', () => {
    const exception = [{ lesson: 'l@1.0.0', ref: 'p@content-1' }];
    // (a) equal versions + wrong hash
    const a = checkItemRefLabels(
      [lessonOf('l', [ref('p', 'content-1', RAW)])],
      lookupOf({ p: { version: 'content-1', rawSha256: OTHER } }),
      exception,
    );
    expect(a.violations).toEqual([
      { lesson: 'l@1.0.0', ref: 'p@content-1', reason: 'HASH_MISMATCH' },
    ]);
    expect(a.staleExceptions).toEqual(exception);
    expect(a.acceptedExceptions).toEqual([]);
    expect(itemRefLabelCheckBlocks(a)).toBe(true);
    // (b) differing versions + wrong hash: hash precedence, entry consumed
    const b = checkItemRefLabels(
      [lessonOf('l', [ref('p', 'content-1', RAW)])],
      lookupOf({ p: { version: 'content-2', rawSha256: OTHER } }),
      exception,
    );
    expect(b.violations).toEqual([
      { lesson: 'l@1.0.0', ref: 'p@content-1', reason: 'HASH_MISMATCH' },
    ]);
    expect(b.staleExceptions).toEqual([]);
    expect(b.acceptedExceptions).toEqual([]);
    expect(itemRefLabelCheckBlocks(b)).toBe(true);
    // (c) equal versions + correct hash: clean ref, stale entry
    const c = checkItemRefLabels(
      [lessonOf('l', [ref('p', 'content-1', RAW)])],
      lookupOf({ p: { version: 'content-1', rawSha256: RAW } }),
      exception,
    );
    expect(c.violations).toEqual([]);
    expect(c.acceptedExceptions).toEqual([]);
    expect(c.staleExceptions).toEqual(exception);
    expect(itemRefLabelCheckBlocks(c)).toBe(true);
  });

  it('V2-3p a hash given without its sha256: prefix is a mismatch', () => {
    const result = checkItemRefLabels(
      [lessonOf('l', [{ id: 'p', version: 'content-1', hash: RAW }])],
      lookupOf({ p: { version: 'content-1', rawSha256: RAW } }),
      [],
    );
    expect(result.violations.map((v) => v.reason)).toEqual(['HASH_MISMATCH']);
  });

  it('V2-4 flags a ref whose id does not resolve', () => {
    const result = checkItemRefLabels(
      [lessonOf('l', [ref('gone', 'content-1', RAW)])],
      lookupOf({}),
      [],
    );
    expect(result.violations).toEqual([
      { lesson: 'l@1.0.0', ref: 'gone@content-1', reason: 'UNRESOLVED' },
    ]);
    expect(itemRefLabelCheckBlocks(result)).toBe(true);
  });

  it('V2-4b an exception on an unresolved ref stays stale', () => {
    const exception = [{ lesson: 'l@1.0.0', ref: 'gone@content-1' }];
    const result = checkItemRefLabels(
      [lessonOf('l', [ref('gone', 'content-1', RAW)])],
      lookupOf({}),
      exception,
    );
    expect(result.violations.map((v) => v.reason)).toEqual(['UNRESOLVED']);
    expect(result.staleExceptions).toEqual(exception);
  });

  it('V2-5 reports an exception that no longer matches anything as stale', () => {
    const result = checkItemRefLabels(
      [lessonOf('l', [ref('p', 'content-1', RAW)])],
      lookupOf({ p: { version: 'content-1', rawSha256: RAW } }),
      [{ lesson: 'l@1.0.0', ref: 'never-listed@content-1' }],
    );
    expect(result.violations).toEqual([]);
    expect(result.staleExceptions).toEqual([{ lesson: 'l@1.0.0', ref: 'never-listed@content-1' }]);
    expect(itemRefLabelCheckBlocks(result)).toBe(true);
  });

  it('RCI-R8 judges each occurrence of a repeated id@version on its own and still blocks', () => {
    const exception = [{ lesson: 'l@1.0.0', ref: 'p@content-1' }];
    const lookup = lookupOf({ p: { version: 'content-2', rawSha256: RAW } });
    const good = ref('p', 'content-1', RAW);
    const bad = ref('p', 'content-1', OTHER);

    const result = checkItemRefLabels([lessonOf('l', [good, bad])], lookup, exception);
    // Good occurrence: accepted. Bad occurrence: hash violation. Entry is consumed once, not stale.
    expect(result.acceptedExceptions).toEqual([
      { lesson: 'l@1.0.0', ref: 'p@content-1', recordVersion: 'content-2' },
    ]);
    expect(result.violations).toEqual([
      { lesson: 'l@1.0.0', ref: 'p@content-1', reason: 'HASH_MISMATCH' },
    ]);
    expect(result.staleExceptions).toEqual([]);
    expect(itemRefLabelCheckBlocks(result)).toBe(true);

    // Occurrence order does not change the outcome.
    const reversed = checkItemRefLabels([lessonOf('l', [bad, good])], lookup, exception);
    expect(reversed.acceptedExceptions).toEqual(result.acceptedExceptions);
    expect(reversed.violations).toEqual(result.violations);
    expect(itemRefLabelCheckBlocks(reversed)).toBe(true);

    // Across a practice and a teaching occurrence of the same identity.
    const split = checkItemRefLabels([lessonOf('l', [good], [bad])], lookup, exception);
    expect(split.acceptedExceptions).toHaveLength(1);
    expect(split.violations).toHaveLength(1);
    expect(itemRefLabelCheckBlocks(split)).toBe(true);

    // The invariant holds per occurrence: with only the good occurrence nothing overlaps.
    const onlyGood = checkItemRefLabels([lessonOf('l', [good])], lookup, exception);
    expect(onlyGood.violations).toEqual([]);
    expect(onlyGood.acceptedExceptions).toHaveLength(1);
    expect(itemRefLabelCheckBlocks(onlyGood)).toBe(false);
  });
});

// ----------------------------------------------------------------- V-10

describe('V-10 placement capacity', () => {
  it('V10-1 the live unit fits the pinned profile limit', () => {
    const max = resolvePinnedPolicyProfile({
      code: 'grade-6-math-default',
      version: '1.1.0',
    }).placementProbeMaxItems;
    expect(max).toBe(5);
    const result = checkPlacementCapacity(PILOT_UNITS[0]!, COURSE_CATALOG_INDEX, max);
    expect(result).toMatchObject({
      ok: true,
      probeItemCount: 3,
      distinctSkillCount: 3,
      violations: [],
    });
  });

  it('V10-2 and V10-3 five single-skill lessons pass at the boundary and six fail', () => {
    const five = capacityInput([[1], [2], [3], [4], [5]]);
    expect(checkPlacementCapacity(five.unit, createCourseCatalog(five.input), 5).ok).toBe(true);
    const six = capacityInput([[1], [2], [3], [4], [5], [6]]);
    const result = checkPlacementCapacity(six.unit, createCourseCatalog(six.input), 5);
    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(['PROBE_ITEM_COUNT', 'DISTINCT_SKILL_COUNT']);
  });

  it('V10-4 counts probe items, not distinct skills', () => {
    const shared = capacityInput([
      [1, 2, 3],
      [3, 4, 5],
    ]);
    const result = checkPlacementCapacity(shared.unit, createCourseCatalog(shared.input), 5);
    expect(result).toMatchObject({ ok: false, probeItemCount: 6, distinctSkillCount: 5 });
    expect(result.violations).toEqual(['PROBE_ITEM_COUNT']);
  });
});

// ----------------------------------------------------------------- V-11

const PILOT_SKILL_BANKS = ['ratio-language', 'unit-rates', 'ratio-tables'].flatMap((skill) =>
  ['review-bank', 'delayed-check-bank'].map((suffix) => ({
    code: `${skill}-${suffix}`,
    version: '1.0.0',
  })),
);

const svVersioned = (
  mutate: (banks: readonly AssessmentBank[]) => AssessmentBank[] = (banks) => [...banks],
  selectionBanks?: (
    selected: { code: string; version: string }[],
  ) => { code: string; version: string }[],
  units: readonly Unit[] = [SV_UNIT_V1, SV_UNIT_V2],
) => {
  const records = { ...syntheticVersionedInput(), banks: mutate(SV_BANKS), units };
  const base = selectionFor();
  return createVersionedCourseCatalog({
    records,
    selection: {
      ...base,
      skillBanks: selectionBanks ? selectionBanks(base.skillBanks) : base.skillBanks,
    },
  });
};

const withBank =
  (code: string, version: string, change: (bank: AssessmentBank) => AssessmentBank) =>
  (banks: readonly AssessmentBank[]) =>
    banks.map((bank) => (bank.code === code && bank.version === version ? change(bank) : bank));

describe('V-11 claimed skill banks', () => {
  it('V11-1 the live catalog has every required bank for program 1.0.0 and 1.1.0 (RI-5)', () => {
    // Zero violations on grade-6-math@1.1.0 against the committed active selection.
    expect(
      checkClaimedSkillBanks(VERSIONED_COURSE_CATALOG, { code: 'grade-6-math', version: '1.1.0' }),
    ).toEqual([]);
    // Program 1.0.0 claims only the three pilot skills, whose banks stay selected.
    expect(
      checkClaimedSkillBanks(VERSIONED_COURSE_CATALOG, { code: 'grade-6-math', version: '1.0.0' }),
    ).toEqual([]);
    // Negative control: without the four new skill banks the 1.1.0 program is flagged.
    const withoutNew = createVersionedCourseCatalog({
      records: {
        programs: PROGRAM_REGISTRY,
        units: COURSE_CATALOG_INDEX.units,
        lessons: COURSE_CATALOG_INDEX.lessons,
        banks: COURSE_CATALOG_INDEX.banks.filter(
          (bank) =>
            !/^(double-number-lines|percent-applications)-(review|delayed-check)-bank$/u.test(
              bank.code,
            ),
        ),
      },
      selection: {
        version: 'test-only-selection',
        programs: VERSIONED_COURSE_CATALOG.selection.programs,
        skillBanks: PILOT_SKILL_BANKS,
      },
    });
    expect(
      checkClaimedSkillBanks(withoutNew, { code: 'grade-6-math', version: '1.1.0' }).map(
        (entry) => `${entry.role}:${entry.skill}:${entry.reason}`,
      ),
    ).toEqual([
      'REVIEW:double-number-lines@1.0.0:MISSING',
      'DELAYED_CHECK:double-number-lines@1.0.0:MISSING',
      'REVIEW:percent-applications@1.0.0:MISSING',
      'DELAYED_CHECK:percent-applications@1.0.0:MISSING',
    ]);
  });

  it('V5-real retention: every pilot 1.0.0 record still resolves to the same object (CE-8)', () => {
    for (const unit of PILOT_UNITS) expect(COURSE_CATALOG_INDEX.unitByRef(unit)).toBe(unit);
    for (const lesson of PILOT_LESSONS)
      expect(COURSE_CATALOG_INDEX.lessonByRef(lesson)).toBe(lesson);
    for (const bank of PILOT_ASSESSMENT_BANKS)
      expect(COURSE_CATALOG_INDEX.bankByRef(bank)).toBe(bank);
    expect(
      VERSIONED_COURSE_CATALOG.programByRef({ code: 'grade-6-math', version: '1.0.0' }),
    ).toBeDefined();
    expect(VERSIONED_COURSE_CATALOG.activeProgram('grade-6-math')?.version).toBe('1.1.0');
  });

  it('V11-0 the synthetic family passes for both program versions', () => {
    const versioned = svVersioned();
    expect(checkClaimedSkillBanks(versioned, SV_PROGRAM_V11_REF)).toEqual([]);
    expect(checkClaimedSkillBanks(versioned, SV_PROGRAM_V1_REF)).toEqual([]);
    expect(() =>
      checkClaimedSkillBanks(versioned, { code: SV_PROGRAM_CODE, version: '9.9.9' }),
    ).toThrow();
  });

  it('V11-2 flags a claimed skill missing its delayed-check bank', () => {
    const versioned = svVersioned(
      (banks) => banks.filter((bank) => bank.code !== sv('s3-delayed-check-bank')),
      (selected) => selected.filter((entry) => entry.code !== sv('s3-delayed-check-bank')),
    );
    expect(checkClaimedSkillBanks(versioned, SV_PROGRAM_V11_REF)).toEqual([
      { unit: key(SV_UNIT_V2), role: 'DELAYED_CHECK', reason: 'MISSING', skill: key(svSkill(3)) },
    ]);
  });

  it('V11-3 flags a bank that is not reviewed', () => {
    const pending = (bank: AssessmentBank): AssessmentBank => ({
      ...bank,
      review: {
        status: 'pending_review',
        reviewer: 'Synthetic',
        originalityStatement: 'Synthetic.',
      },
    });
    const skill = checkClaimedSkillBanks(
      svVersioned(withBank(sv('s2-review-bank'), '1.0.0', pending)),
      SV_PROGRAM_V11_REF,
    );
    expect(skill).toEqual([
      {
        unit: key(SV_UNIT_V2),
        role: 'REVIEW',
        reason: 'NOT_REVIEWED',
        skill: key(svSkill(2)),
        bank: `${sv('s2-review-bank')}@1.0.0`,
      },
    ]);
    const lesson = checkClaimedSkillBanks(
      svVersioned(withBank(sv('l2-bank'), '2.0.0', pending)),
      SV_PROGRAM_V11_REF,
    );
    expect(lesson).toEqual([
      {
        unit: key(SV_UNIT_V2),
        role: 'LESSON',
        reason: 'NOT_REVIEWED',
        lesson: key(SV_LESSONS_V2[1]!),
        bank: `${sv('l2-bank')}@2.0.0`,
      },
    ]);
    const unit = checkClaimedSkillBanks(
      svVersioned(withBank(sv('unit-bank'), '2.0.0', pending)),
      SV_PROGRAM_V11_REF,
    );
    expect(unit.map((entry) => [entry.role, entry.reason])).toEqual([['UNIT', 'NOT_REVIEWED']]);
  });

  it('V11-4 flags a unit without an assessment bank', () => {
    const copy: Record<string, unknown> = { ...SV_UNIT_V2 };
    delete copy.assessmentBankRef;
    const versioned = svVersioned(undefined, undefined, [SV_UNIT_V1, copy as Unit]);
    expect(checkClaimedSkillBanks(versioned, SV_PROGRAM_V11_REF)).toEqual([
      { unit: key(SV_UNIT_V2), role: 'UNIT', reason: 'MISSING' },
    ]);
  });

  it('V11-5 flags a skill bank that covers an extra skill', () => {
    const versioned = svVersioned(
      withBank(sv('s4-delayed-check-bank'), '1.0.0', (bank) => ({
        ...bank,
        coveredSkillRefs: [svSkill(4), svSkill(5)],
      })),
    );
    expect(checkClaimedSkillBanks(versioned, SV_PROGRAM_V11_REF)).toEqual([
      {
        unit: key(SV_UNIT_V2),
        role: 'DELAYED_CHECK',
        reason: 'COVERAGE',
        skill: key(svSkill(4)),
        bank: `${sv('s4-delayed-check-bank')}@1.0.0`,
      },
    ]);
  });

  it('V11-6 does not inspect skills that no unit of the program claims', () => {
    const unclaimed = (code: string) =>
      code === sv('s4-review-bank') ||
      code === sv('s5-review-bank') ||
      code === sv('s4-delayed-check-bank') ||
      code === sv('s5-delayed-check-bank');
    const versioned = svVersioned(
      (banks) => banks.filter((bank) => !unclaimed(bank.code)),
      (selected) => selected.filter((entry) => !unclaimed(entry.code)),
    );
    // Program 1.0.0 claims s1..s3 only; s4 and s5 have no banks at all.
    expect(checkClaimedSkillBanks(versioned, SV_PROGRAM_V1_REF)).toEqual([]);
    // Program 1.1.0 does claim them, so the same index is flagged there.
    expect(
      checkClaimedSkillBanks(versioned, SV_PROGRAM_V11_REF).map((entry) => entry.skill),
    ).toEqual([key(svSkill(4)), key(svSkill(4)), key(svSkill(5)), key(svSkill(5))]);
  });
});

// ------------------------------------------------- canonical digest, manifest

type ManifestEntry = {
  kind: 'program' | 'unit' | 'lesson' | 'bank';
  code: string;
  version: string;
  sha256: string;
};
const manifest = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src', 'curriculum', 'grade-6-math-structure-manifest.json'),
    'utf8',
  ),
) as { schemaVersion: number; records: ManifestEntry[]; probeSnapshots: unknown[] };

/** Membership closure (R-3): selected by program code, never by an inventory list. */
function membership(
  catalog: CourseCatalog,
  programCode: string,
): { kind: ManifestEntry['kind']; code: string; version: string }[] {
  const programs = catalog.programs.filter((p) => p.code === programCode);
  const units = catalog.units.filter((u) => u.programRef.code === programCode);
  const lessons = catalog.lessons.filter((l) =>
    units.some((u) => u.lessonRefs.some((r) => key(r) === key(l))),
  );
  const skills = new Set(lessons.flatMap((l) => l.skillRefs.map(key)));
  const referenced = new Set([
    ...lessons.map((l) => key(l.assessmentBankRef)),
    ...units.flatMap((u) => (u.assessmentBankRef ? [key(u.assessmentBankRef)] : [])),
  ]);
  const banks = catalog.banks.filter(
    (b) =>
      referenced.has(key(b)) ||
      (skills.has(key(b.targetRef)) &&
        (b.code === `${b.targetRef.code}-review-bank` ||
          b.code === `${b.targetRef.code}-delayed-check-bank`)),
  );
  const tag = <K extends ManifestEntry['kind']>(
    kind: K,
    records: { code: string; version: string }[],
  ) => records.map(({ code, version }) => ({ kind, code, version }));
  return [
    ...tag('program', programs),
    ...tag('unit', units),
    ...tag('lesson', lessons),
    ...tag('bank', banks),
  ];
}

const entryKey = (entry: { kind: string; code: string; version: string }): string =>
  `${entry.kind}:${key(entry)}`;

describe('canonicalDigest', () => {
  it('CD-1 is stable under key order and whitespace and sensitive to values and array order', () => {
    const a = JSON.parse('{"b":1,"a":{"y":[1,2],"x":"s"}}');
    const b = JSON.parse('{\n  "a": { "x": "s", "y": [1, 2] },\n  "b": 1\n}');
    expect(canonicalDigest(a)).toBe(canonicalDigest(b));
    expect(canonicalDigest(a)).toMatch(/^[0-9a-f]{64}$/);
    expect(canonicalDigest({ ...a, b: 2 })).not.toBe(canonicalDigest(a));
    expect(canonicalDigest({ b: 1, a: { x: 's', y: [2, 1] } })).not.toBe(canonicalDigest(a));
    expect(canonicalDigest({ a: 1, skipped: undefined })).toBe(canonicalDigest({ a: 1 }));
    expect(canonicalDigest({})).toBe(sha('{}'));
    expect(canonicalDigest({ b: [1], a: 'é' })).toBe(sha('{"a":"é","b":[1]}'));
  });

  it('CD-2 serializes array holes as null, like JSON.stringify', () => {
    // eslint-disable-next-line no-sparse-arrays
    const holeThenOne = [, 1];
    expect(canonicalDigest(holeThenOne)).toBe(canonicalDigest([null, 1]));
    expect(canonicalDigest(holeThenOne)).toBe(sha('[null,1]'));
    expect(canonicalDigest(new Array(1))).toBe(sha('[null]'));
    expect(canonicalDigest(new Array(1))).not.toBe(canonicalDigest([]));
    expect(canonicalDigest(new Array(2))).toBe(sha('[null,null]'));
    expect(canonicalDigest({ a: new Array(1) })).toBe(canonicalDigest({ a: [null] }));
  });
});

describe('grade-6-math structure manifest', () => {
  it('MF-1 pins the digest of every registered record and detects an in-place edit', () => {
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
    const lesson = PILOT_LESSONS[0]!;
    const lessonEntry = manifest.records.find(
      (entry) => entry.kind === 'lesson' && entry.code === lesson.code,
    )!;
    expect(canonicalDigest({ ...lesson, title: `${lesson.title} (edited in place)` })).not.toBe(
      lessonEntry.sha256,
    );
  });

  it('MF-2 equals the Grade 6 Math membership closure and flags an unrecorded registration', () => {
    // RI-5 closure: 15 + program 1.1.0 + unit 2.0.0 + 5 lessons + 10 banks.
    const live = membership(COURSE_CATALOG_INDEX, 'grade-6-math').map(entryKey).sort();
    expect(live).toHaveLength(32);
    expect(manifest.records.map(entryKey).sort()).toEqual(live);

    // Unrecorded registration, shown on the synthetic family so no real label gets a new version.
    const full = createCourseCatalog(syntheticVersionedInput());
    const subset = createCourseCatalog({
      programs: [SV_PROGRAM_V1],
      units: [SV_UNIT_V1],
      lessons: syntheticVersionedInput().lessons.filter((l) => l.unitRef.version === '1.0.0'),
      banks: SV_BANKS,
    });
    const recorded = membership(subset, SV_PROGRAM_CODE).map(entryKey).sort();
    const closure = membership(full, SV_PROGRAM_CODE).map(entryKey).sort();
    expect(closure).not.toEqual(recorded);
    expect(closure.filter((entry) => !recorded.includes(entry)).length).toBeGreaterThan(0);
  });

  it('MF-3 pins the frozen 15-entry prefix', () => {
    expect(manifest.records.length).toBeGreaterThanOrEqual(15);
    expect(canonicalDigest(manifest.records.slice(0, 15))).toBe(
      '6e58cc9490fc918e2c125782ef3f932a576aa4d4be2925c780fd609c0c6fec03',
    );
  });

  it('MF-4 has no duplicate entries and exactly the unit 1.0.0 and 2.0.0 probe snapshots (RI-5)', () => {
    const keys = manifest.records.map(entryKey);
    expect(new Set(keys).size).toBe(keys.length);
    expect(manifest.probeSnapshots).toEqual([
      {
        bankCode: 'ratios-and-proportional-reasoning-placement-probe',
        bankVersion: '1.0.0',
        unitCode: 'ratios-and-proportional-reasoning',
        unitVersion: '1.0.0',
        sha256: 'ccf3bf56c544196d2f98c0526b591c62945cf9b56eab716775c4d4eb0d14be43',
      },
      {
        bankCode: 'ratios-and-proportional-reasoning-placement-probe',
        bankVersion: '2.0.0',
        unitCode: 'ratios-and-proportional-reasoning',
        unitVersion: '2.0.0',
        sha256: 'fd096bd178cc72c58cfc2c13c94d152bf1b0265a9f7afec547bea5e897e351a0',
      },
    ]);
  });

  it('MF-5 excludes other programs and the disconnected domain catalogs', () => {
    const others = PROGRAM_REGISTRY.filter((p) => p.code !== 'grade-6-math').map((p) => p.code);
    expect(others).toContain('grade-6-science');
    for (const entry of manifest.records) {
      expect(others).not.toContain(entry.code);
      expect(entry.code.startsWith('sci6-')).toBe(false);
      expect(entry.code.startsWith('number-system')).toBe(false);
    }
    expect(manifest.records.filter((entry) => entry.kind === 'program')).toHaveLength(2);
    expect(membership(COURSE_CATALOG_INDEX, 'grade-6-science').map(entryKey)).toEqual([
      'program:grade-6-science@1.0.0',
    ]);
  });
});
