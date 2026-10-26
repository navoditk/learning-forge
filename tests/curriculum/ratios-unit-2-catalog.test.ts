import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { servableContentCatalog } from '../../src/content/catalog';
import type { ItemRef } from '../../src/contracts/progression';
import {
  checkClaimedSkillBanks,
  checkItemRefLabels,
  checkPlacementCapacity,
  itemRefLabelCheckBlocks,
  type ItemRecordLookup,
} from '../../src/curriculum/catalog-registration-checks';
import {
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
  createCourseCatalog,
} from '../../src/curriculum/course-catalog';
import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../src/curriculum/pilot-catalog';
import { PROGRAM_REGISTRY } from '../../src/curriculum/program-registry';
import {
  RATIOS_UNIT_2_ASSESSMENT_BANKS,
  RATIOS_UNIT_2_LESSONS,
  RATIOS_UNIT_2_PROGRAM,
  RATIOS_UNIT_2_PROGRAM_REF,
  RATIOS_UNIT_2_UNIT,
  RATIOS_UNIT_2_UNIT_REF,
} from '../../src/curriculum/ratios-unit-2-catalog';
import {
  buildPlacementProbeSnapshot,
  type ProbeLookup,
} from '../../src/progression/placement-probe-snapshot';
import { placementProbeBank } from '../../src/progression/placement-probe';

/**
 * RAT-INTEGRATE RI-4: the staged Ratios 2.0.0 records (lesson x5, unit,
 * program 1.1.0). They are not registered; their banks are intentionally
 * unresolved until RI-5 (D-228, D-236).
 */
const ROOT = resolve(__dirname, '../..');
const refKey = (ref: { code: string; version: string }) => `${ref.code}@${ref.version}`;

// CE-6: an `id@version` -> path map. An id-only path would resolve the
// `-2@content-3` refs to the unregistered `content-2` files.
const PRACTICE_PATH_EXCEPTIONS: Record<string, string> = {
  'unit-rates-2@content-3': 'content/ratios/unit-rates-2-content-3.json',
  'ratio-tables-2@content-3': 'content/ratios/ratio-tables-2-content-3.json',
};
function pathOf(ref: ItemRef, role: 'practice' | 'teaching'): string {
  const key = `${ref.id}@${ref.version}`;
  if (role === 'teaching') return `content/teaching/ratios/${ref.id}.json`;
  return PRACTICE_PATH_EXCEPTIONS[key] ?? `content/ratios/${ref.id}.json`;
}
const teachingIds = new Set(
  RATIOS_UNIT_2_LESSONS.flatMap((lesson) => lesson.teachingContentRefs.map((ref) => ref.id)),
);
const readRecord = (ref: ItemRef) => {
  const path = pathOf(ref, teachingIds.has(ref.id) ? 'teaching' : 'practice');
  const bytes = readFileSync(resolve(ROOT, path));
  const parsed = JSON.parse(bytes.toString('utf8')) as { id: string; version: string };
  return { parsed, bytes };
};
const lookup: ItemRecordLookup = (ref) => {
  const { parsed, bytes } = readRecord(ref);
  if (parsed.id !== ref.id) return undefined;
  return { version: parsed.version, rawSha256: createHash('sha256').update(bytes).digest('hex') };
};

const STRUCTURE_REVIEWER =
  'Codex gpt-6.1-sol delegated sign-off (RAT-INTEGRATE RI-4 structure, D-256)';

const SKILLS = [
  'ratio-language',
  'unit-rates',
  'ratio-tables',
  'double-number-lines',
  'percent-applications',
];

describe('staged Ratios unit 2.0.0 records', () => {
  it('has five lessons @2.0.0 in plan order with D-237 labels and the D-256 reviewed stamp', () => {
    expect(RATIOS_UNIT_2_LESSONS.map(refKey)).toEqual(
      SKILLS.map((skill) => `${skill}-lesson@2.0.0`),
    );
    for (const [index, lesson] of RATIOS_UNIT_2_LESSONS.entries()) {
      expect(lesson.unitRef).toEqual({
        code: 'ratios-and-proportional-reasoning',
        version: '2.0.0',
      });
      expect(lesson.skillRefs).toEqual([{ code: SKILLS[index], version: '1.0.0' }]);
      expect(lesson.policyProfileRef).toEqual({ code: 'grade-6-math-default', version: '1.1.0' });
      expect(lesson.provenance).toEqual({ origin: 'original', licenseStatus: 'owned' });
      expect(lesson.review).toMatchObject({
        status: 'reviewed',
        reviewer: STRUCTURE_REVIEWER,
        reviewedAt: '2026-10-23',
      });
      expect(lesson.practiceContentRefs).toHaveLength(6);
      expect(lesson.teachingContentRefs).toHaveLength(1);
    }
    expect(RATIOS_UNIT_2_LESSONS.map((lesson) => refKey(lesson.assessmentBankRef))).toEqual([
      'ratio-language-lesson-bank@2.0.0',
      'unit-rates-lesson-bank@2.0.0',
      'ratio-tables-lesson-bank@2.0.0',
      'double-number-lines-lesson-bank@1.0.0',
      'percent-applications-lesson-bank@1.0.0',
    ]);
    expect(RATIOS_UNIT_2_UNIT.review).toMatchObject({
      status: 'reviewed',
      reviewer: STRUCTURE_REVIEWER,
      reviewedAt: '2026-10-23',
    });
  });

  it('reuses the pilot titles and objectives for the three pilot lessons', () => {
    for (const pilot of PILOT_LESSONS) {
      const next = RATIOS_UNIT_2_LESSONS.find((lesson) => lesson.code === pilot.code)!;
      expect(next.title).toBe(pilot.title);
      expect(next.objectives).toEqual(pilot.objectives);
    }
  });

  it('D-248: no lesson 2.0.0 ref names a pilot @1.0.0 bank (CE-4 unreachable)', () => {
    for (const lesson of RATIOS_UNIT_2_LESSONS) {
      const ref = lesson.assessmentBankRef;
      // RI-5: the ref resolves to a registered new bank, never to a pilot @1.0.0 bank.
      expect(COURSE_CATALOG_INDEX.bankByRef(ref), refKey(ref)).toBeDefined();
      expect(PILOT_ASSESSMENT_BANKS.some((bank) => refKey(bank) === refKey(ref))).toBe(false);
    }
    const pilotLessonBanks = PILOT_LESSONS.map((lesson) => lesson.assessmentBankRef.code);
    for (const code of pilotLessonBanks) {
      const next = RATIOS_UNIT_2_LESSONS.find((lesson) => lesson.assessmentBankRef.code === code)!;
      expect(next.assessmentBankRef.version).toBe('2.0.0');
    }
  });

  it('unit 2.0.0 lists the five lessons and program 1.1.0 lists only the unit', () => {
    expect(RATIOS_UNIT_2_UNIT.programRef).toEqual({ code: 'grade-6-math', version: '1.1.0' });
    expect(RATIOS_UNIT_2_UNIT.lessonRefs).toEqual(
      RATIOS_UNIT_2_LESSONS.map(({ code, version }) => ({ code, version })),
    );
    expect(RATIOS_UNIT_2_UNIT.assessmentBankRef).toEqual({
      code: 'ratios-proportional-reasoning-unit-bank',
      version: '2.0.0',
    });
    expect(RATIOS_UNIT_2_PROGRAM.unitRefs).toEqual([
      { code: 'ratios-and-proportional-reasoning', version: '2.0.0' },
    ]);
    const program10 = PROGRAM_REGISTRY.find((program) => refKey(program) === 'grade-6-math@1.0.0')!;
    const withoutVersioned = (program: typeof program10) => ({
      ...program,
      version: undefined,
      unitRefs: undefined,
    });
    const rest10 = withoutVersioned(program10);
    const rest11 = withoutVersioned(RATIOS_UNIT_2_PROGRAM);
    expect(rest11).toEqual(rest10);
    // Program 1.0.0 and unit/lessons 1.0.0 are untouched.
    expect(PILOT_UNITS.map(refKey)).toEqual(['ratios-and-proportional-reasoning@1.0.0']);
  });

  it('V-2: 30 practice and 5 teaching refs match the raw file bytes, no exceptions', () => {
    const refs = RATIOS_UNIT_2_LESSONS.flatMap((lesson) => [
      ...lesson.practiceContentRefs,
      ...lesson.teachingContentRefs,
    ]);
    expect(RATIOS_UNIT_2_LESSONS.flatMap((lesson) => lesson.practiceContentRefs)).toHaveLength(30);
    expect(RATIOS_UNIT_2_LESSONS.flatMap((lesson) => lesson.teachingContentRefs)).toHaveLength(5);
    expect(refs).toHaveLength(35);
    const result = checkItemRefLabels(RATIOS_UNIT_2_LESSONS, lookup, []);
    expect(result.violations).toEqual([]);
    expect(result.staleExceptions).toEqual([]);
    expect(result.acceptedExceptions).toEqual([]);
    expect(itemRefLabelCheckBlocks(result)).toBe(false);
  });

  it('V-2 negative: the stale draft hash for ratio-language-3 is a HASH_MISMATCH', () => {
    // The exact stale draft hash recorded in the frozen RC-5 metadata.
    const draft = 'sha256:f57e6fab12e1ddc2567915ca7cd597a9fbc744d7fe32a7456fd2ff3c22fdcd88';
    const mutated = RATIOS_UNIT_2_LESSONS.map((lesson) => ({
      ...lesson,
      practiceContentRefs: lesson.practiceContentRefs.map((ref) =>
        ref.id === 'ratio-language-3' ? { ...ref, hash: draft } : ref,
      ),
    }));
    const result = checkItemRefLabels(mutated, lookup, []);
    expect(result.violations).toEqual([
      {
        lesson: 'ratio-language-lesson@2.0.0',
        ref: 'ratio-language-3@content-1',
        reason: 'HASH_MISMATCH',
      },
    ]);
    expect(itemRefLabelCheckBlocks(result)).toBe(true);
  });

  it('V-2 negative: an id-only path for a content-3 ref would not match (CE-6)', () => {
    const idOnly: ItemRecordLookup = (ref) => {
      const directory = teachingIds.has(ref.id) ? 'content/teaching/ratios' : 'content/ratios';
      const bytes = readFileSync(resolve(ROOT, `${directory}/${ref.id}.json`));
      const record = JSON.parse(bytes.toString('utf8')) as { version: string };
      return {
        version: record.version,
        rawSha256: createHash('sha256').update(bytes).digest('hex'),
      };
    };
    const lessons = RATIOS_UNIT_2_LESSONS.filter((lesson) => lesson.code === 'unit-rates-lesson');
    const result = checkItemRefLabels(lessons, idOnly, []);
    expect(result.violations).toEqual([
      { lesson: 'unit-rates-lesson@2.0.0', ref: 'unit-rates-2@content-3', reason: 'HASH_MISMATCH' },
    ]);
  });

  it('V-10: five probe items against the cap of 5 pass; a sixth skill fails', () => {
    const source = { lessonsOfUnit: () => [...RATIOS_UNIT_2_LESSONS] };
    const ok = checkPlacementCapacity(RATIOS_UNIT_2_UNIT, source, 5);
    expect(ok).toMatchObject({ ok: true, probeItemCount: 5, distinctSkillCount: 5 });
    const sixth = {
      lessonsOfUnit: () => [
        ...RATIOS_UNIT_2_LESSONS,
        { ...RATIOS_UNIT_2_LESSONS[0]!, skillRefs: [{ code: 'sixth-skill', version: '1.0.0' }] },
      ],
    };
    const over = checkPlacementCapacity(RATIOS_UNIT_2_UNIT, sixth, 5);
    expect(over.ok).toBe(false);
    expect(over.violations).toEqual(['PROBE_ITEM_COUNT', 'DISTINCT_SKILL_COUNT']);
  });

  it('the double-number-lines first ref (the figure source) has a figure and an alternative', () => {
    const dnl = RATIOS_UNIT_2_LESSONS.find(
      (lesson) => lesson.code === 'double-number-lines-lesson',
    )!;
    const first = dnl.practiceContentRefs[0]!;
    expect(first.id).toBe('double-number-lines-3');
    const record = JSON.parse(readFileSync(resolve(ROOT, pathOf(first, 'practice')), 'utf8')) as {
      figure?: unknown;
      accessibleAlternative?: unknown;
    };
    expect(record.figure).toBeTruthy();
    expect(typeof record.accessibleAlternative).toBe('string');
  });

  it('RI-5: the unresolved bank set is empty and the ten D-266 records are registered', () => {
    const missing = new Set<string>();
    const need = (ref: { code: string; version: string }) => {
      if (!COURSE_CATALOG_INDEX.bankByRef(ref)) missing.add(refKey(ref));
    };
    for (const lesson of RATIOS_UNIT_2_LESSONS) need(lesson.assessmentBankRef);
    need(RATIOS_UNIT_2_UNIT.assessmentBankRef!);
    for (const lesson of RATIOS_UNIT_2_LESSONS) {
      for (const skill of lesson.skillRefs) {
        need({ code: `${skill.code}-review-bank`, version: skill.version });
        need({ code: `${skill.code}-delayed-check-bank`, version: skill.version });
      }
    }
    expect([...missing]).toEqual([]);
    expect(RATIOS_UNIT_2_ASSESSMENT_BANKS).toHaveLength(10);
    // D-266 public metadata, verbatim.
    expect(
      RATIOS_UNIT_2_ASSESSMENT_BANKS.map((b) => [refKey(b), b.itemCount, b.contentHash]),
    ).toEqual([
      [
        'ratio-language-lesson-bank@2.0.0',
        9,
        'sha256:67ae5776597eed427ca08dff45db650d772a5cac6ce1a5d4f21591123b085da7',
      ],
      [
        'unit-rates-lesson-bank@2.0.0',
        9,
        'sha256:9240bc30980cd51af4231a9171f59db207d682226083643dc276440cbadc61fa',
      ],
      [
        'ratio-tables-lesson-bank@2.0.0',
        9,
        'sha256:b5fcc9dd5a03dbca7821f18a7692943b80c11c72f54c5f1f9f72c8eaf008a435',
      ],
      [
        'double-number-lines-lesson-bank@1.0.0',
        9,
        'sha256:83035b4a12b73ddd64aa3cd77d4028341ddd5b0e5783894efd708176ec692001',
      ],
      [
        'percent-applications-lesson-bank@1.0.0',
        9,
        'sha256:cc3740273ba24dde14f3f0cc53bb5da51d8a2c49230ba80f608dc94da0b9dc78',
      ],
      [
        'ratios-proportional-reasoning-unit-bank@2.0.0',
        30,
        'sha256:416b8c02e1ca3e3cf71e5ccc75159ad98fe2fbf892c34ff01adf2cfdc53b82be',
      ],
      [
        'double-number-lines-review-bank@1.0.0',
        3,
        'sha256:440f22d4bb5c1b61da4ec574c9145509a394354962ff8ddd9127d91ba1bde6a5',
      ],
      [
        'double-number-lines-delayed-check-bank@1.0.0',
        6,
        'sha256:62cec320cb858e4cf256b87da6317ffa7dc9c7e9aec71072684ccda70758b8a1',
      ],
      [
        'percent-applications-review-bank@1.0.0',
        3,
        'sha256:570faafaab2d72735f6bbc9accd4d9b364e7bf29837bd111fd8df13cfef6cdee',
      ],
      [
        'percent-applications-delayed-check-bank@1.0.0',
        6,
        'sha256:ea15c2d57e42d62bd82b2190d4a8814c2fb722e87d473e9346dcb84eca8058f0',
      ],
    ]);
    for (const bank of RATIOS_UNIT_2_ASSESSMENT_BANKS) {
      expect(bank.review.status).toBe('reviewed');
      expect(bank.review.reviewedAt).toBe('2026-10-23');
    }
    // Negative control: dropping one bank makes registration fail closed.
    expect(() =>
      createCourseCatalog({
        programs: PROGRAM_REGISTRY,
        units: [...PILOT_UNITS, RATIOS_UNIT_2_UNIT],
        lessons: [...PILOT_LESSONS, ...RATIOS_UNIT_2_LESSONS],
        banks: [...PILOT_ASSESSMENT_BANKS, ...RATIOS_UNIT_2_ASSESSMENT_BANKS.slice(1)],
      }),
    ).toThrow();
  });

  it('V-11: zero violations on grade-6-math@1.1.0 over the production catalog', () => {
    expect(checkClaimedSkillBanks(VERSIONED_COURSE_CATALOG, RATIOS_UNIT_2_PROGRAM_REF)).toEqual([]);
  });

  it('V-5: the real pilot 1.0.0 records are retained and unchanged by the 2.0.0 registration', () => {
    for (const unit of PILOT_UNITS) expect(COURSE_CATALOG_INDEX.unitByRef(unit)).toBe(unit);
    for (const lesson of PILOT_LESSONS) {
      expect(COURSE_CATALOG_INDEX.lessonByRef(lesson)).toBe(lesson);
      expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson)).toBe(false);
    }
    for (const bank of PILOT_ASSESSMENT_BANKS) {
      expect(COURSE_CATALOG_INDEX.bankByRef(bank)).toBe(bank);
    }
    for (const lesson of RATIOS_UNIT_2_LESSONS) {
      expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson)).toBe(true);
    }
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(RATIOS_UNIT_2_UNIT_REF)).toBe(true);
    expect(VERSIONED_COURSE_CATALOG.isActiveUnit(PILOT_UNITS[0]!)).toBe(false);
  });

  it('the unit 2.0.0 snapshot builds with five items in lesson order', () => {
    const snapshotLookup: ProbeLookup = (ref) => {
      const item = servableContentCatalog.find(
        (candidate) => candidate.id === ref.id && candidate.version === ref.version,
      );
      if (!item || !('skillRef' in item)) return undefined;
      return { item: item as never, rawSha256: lookup(ref)!.rawSha256, servable: true };
    };
    const result = buildPlacementProbeSnapshot(
      RATIOS_UNIT_2_UNIT,
      { lessonsOfUnit: () => RATIOS_UNIT_2_LESSONS },
      snapshotLookup,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.unitRef).toEqual({
      code: 'ratios-and-proportional-reasoning',
      version: '2.0.0',
    });
    expect(result.snapshot.items.map((entry) => entry.projection.skillRef.code)).toEqual(SKILLS);
    expect(result.snapshot.items.map((entry) => entry.projection.id)).toEqual([
      'ratio-language-1',
      'unit-rates-1',
      'ratio-tables-1',
      'double-number-lines-3',
      'percent-applications-1',
    ]);
    // The first three items match the live unit 1.0.0 probe projections (D-235).
    const live = placementProbeBank(PILOT_UNITS[0]!)!;
    expect(result.snapshot.items.slice(0, 3).map((entry) => entry.projection)).toEqual(live.items);
  });
});
