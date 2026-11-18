import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { resolvePinnedPolicyProfile } from '../../src/progression/artifacts';
import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import {
  COURSE_CATALOG,
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
} from '../../src/curriculum/course-catalog';
import {
  SPELLING_UNIT_1_LESSONS,
  SPELLING_UNIT_1_UNIT,
} from '../../src/curriculum/spelling-unit-1-catalog';
import {
  DEFAULT_PROGRESSION_PROGRAM_CODE,
  activeProgramForTarget,
  programCodeOfTarget,
  reviewCourseSummaries,
  stepUpAdvertisedLifetimeMinutes,
} from '../../src/progression/program-resolution';

/**
 * SPELL-SP5 (scope row 10): the progression routes, the pilot-progress
 * projection and the review page no longer name 'grade-6-math' literally.
 */
const ROOT = process.cwd();
const spellingActive = () => {
  const selection = {
    ...VERSIONED_COURSE_CATALOG.selection,
    programs: VERSIONED_COURSE_CATALOG.selection.programs.map((ref) =>
      ref.code === 'scripps-spelling-bee-6' ? { code: ref.code, version: '1.1.0' } : ref,
    ),
  };
  return createVersionedCourseCatalog({
    records: {
      programs: COURSE_CATALOG_INDEX.programs,
      units: COURSE_CATALOG_INDEX.units,
      lessons: COURSE_CATALOG_INDEX.lessons,
      banks: COURSE_CATALOG_INDEX.banks,
    },
    selection,
    reservedLabels: undefined,
  });
};

describe('programCodeOfTarget', () => {
  it('resolves skills, lessons and units to their program, across versions', () => {
    expect(programCodeOfTarget({ targetKind: 'SKILL', code: 'ratio-language' })).toBe(
      'grade-6-math',
    );
    expect(programCodeOfTarget({ targetKind: 'SKILL', code: 'snsb6-morphology-roots' })).toBe(
      'scripps-spelling-bee-6',
    );
    expect(
      programCodeOfTarget({
        targetKind: 'LESSON',
        code: SPELLING_UNIT_1_LESSONS[0]!.code,
        version: '1.0.0',
      }),
    ).toBe('scripps-spelling-bee-6');
    expect(
      programCodeOfTarget({
        targetKind: 'UNIT',
        code: SPELLING_UNIT_1_UNIT.code,
        version: '1.0.0',
      }),
    ).toBe('scripps-spelling-bee-6');
    expect(
      programCodeOfTarget({
        targetKind: 'LESSON',
        code: 'ratio-language-lesson',
        version: '2.0.0',
      }),
    ).toBe('grade-6-math');
    expect(programCodeOfTarget({ targetKind: 'PROGRAM', code: 'moems-6' })).toBe('moems-6');
  });

  it('returns undefined for unknown targets or a missing version', () => {
    expect(programCodeOfTarget({ targetKind: 'SKILL', code: 'no-such-skill' })).toBeUndefined();
    expect(
      programCodeOfTarget({ targetKind: 'UNIT', code: 'no-such-unit', version: '1.0.0' }),
    ).toBeUndefined();
    expect(
      programCodeOfTarget({ targetKind: 'LESSON', code: 'ratio-language-lesson' }),
    ).toBeUndefined();
  });
});

describe('activeProgramForTarget', () => {
  it('keeps Math targets on the active Math program (behavior preserved)', () => {
    const math = COURSE_CATALOG.programByCode('grade-6-math');
    for (const target of [
      { targetKind: 'SKILL', code: 'unit-rates' },
      { targetKind: 'LESSON', code: 'unit-rates-lesson', version: '2.0.0' },
      { targetKind: 'UNIT', code: 'ratios-and-proportional-reasoning', version: '2.0.0' },
    ] as const) {
      expect(activeProgramForTarget(target)).toBe(math);
    }
  });

  it('unknown targets fall back to the default program so the route refusal is unchanged', () => {
    expect(DEFAULT_PROGRESSION_PROGRAM_CODE).toBe('grade-6-math');
    expect(activeProgramForTarget({ targetKind: 'SKILL', code: 'nope' })).toBe(
      COURSE_CATALOG.programByCode('grade-6-math'),
    );
  });

  it('a Spelling target resolves to the ACTIVE Spelling program: 1.0.0 now, 1.1.0 after the switch', () => {
    const target = {
      targetKind: 'LESSON',
      code: SPELLING_UNIT_1_LESSONS[0]!.code,
      version: '1.0.0',
    } as const;
    expect(activeProgramForTarget(target)?.version).toBe('1.0.0');
    const after = spellingActive();
    const switched = activeProgramForTarget(target, after.activeView(), after.index);
    expect(switched?.code).toBe('scripps-spelling-bee-6');
    expect(switched?.version).toBe('1.1.0');
    // The pinned profile is the same unchanged 1.0.0 profile either way (D-131).
    expect(switched?.defaultPolicyProfileRef).toEqual({
      code: 'scripps-spelling-bee-6-default',
      version: '1.0.0',
    });
    expect(
      activeProgramForTarget({ targetKind: 'SKILL', code: 'snsb6-etymology-language-origins' })
        ?.code,
    ).toBe('scripps-spelling-bee-6');
  });
});

describe('stepUpAdvertisedLifetimeMinutes', () => {
  it('is the shortest pinned lifetime across active unit-bearing programs', () => {
    const lifetimeOf = (ref: { code: string; version: string }) =>
      resolvePinnedPolicyProfile(ref).stepUpReauthLifetimeMinutes;
    const withUnits = COURSE_CATALOG.programs.filter((p) => p.unitRefs.length > 0);
    expect(withUnits.map((p) => p.code)).toEqual(['grade-6-math']);
    const math = lifetimeOf(withUnits[0]!.defaultPolicyProfileRef);
    expect(stepUpAdvertisedLifetimeMinutes(COURSE_CATALOG.programs, lifetimeOf)).toBe(math);
    // Spelling's pinned profile carries the same value, so activation cannot change the token lifetime.
    const after = spellingActive().activeView();
    expect(after.programs.filter((p) => p.unitRefs.length > 0).map((p) => p.code)).toEqual([
      'grade-6-math',
      'scripps-spelling-bee-6',
    ]);
    expect(stepUpAdvertisedLifetimeMinutes(after.programs, lifetimeOf)).toBe(math);
    expect(
      stepUpAdvertisedLifetimeMinutes(
        [
          {
            unitRefs: [{ code: 'u', version: '1.0.0' }],
            defaultPolicyProfileRef: { code: 'x', version: '1.0.0' },
          },
          {
            unitRefs: [{ code: 'v', version: '1.0.0' }],
            defaultPolicyProfileRef: { code: 'y', version: '1.0.0' },
          },
        ],
        (ref) => (ref.code === 'x' ? 10 : 4),
      ),
    ).toBe(4);
    expect(() => stepUpAdvertisedLifetimeMinutes([], lifetimeOf)).toThrow();
  });
});

describe('reviewCourseSummaries', () => {
  it('today lists only Grade 6 Math (Spelling has no active unit)', () => {
    const summaries = reviewCourseSummaries();
    expect(summaries.map((s) => s.programCode)).toEqual(['grade-6-math']);
    expect(summaries[0]!.units.map((u) => u.code)).toEqual(['ratios-and-proportional-reasoning']);
    expect(summaries[0]!.units[0]!.lessons).toHaveLength(5);
    // five lesson banks plus the unit bank
    expect(summaries[0]!.bankCount).toBe(6);
  });

  it('after the Spelling switch it lists Spelling without any code change', () => {
    const summaries = reviewCourseSummaries(spellingActive().activeView());
    expect(summaries.map((s) => s.programCode)).toEqual(['grade-6-math', 'scripps-spelling-bee-6']);
    const spelling = summaries[1]!;
    expect(spelling.label).toBe('Scripps National Spelling Bee (Grade 6)');
    expect(spelling.units.map((u) => u.title)).toEqual(['Word structure']);
    expect(spelling.units[0]!.lessons.map((l) => l.code)).toEqual(
      SPELLING_UNIT_1_LESSONS.map((l) => l.code),
    );
    // four lesson banks plus the unit bank
    expect(spelling.bankCount).toBe(5);
  });
});

describe('no program literal remains in the generalized files', () => {
  const FILES = [
    'src/app/api/progression/assessment/assignment/route.ts',
    'src/app/api/progression/override/route.ts',
    'src/app/api/progression/step-up/route.ts',
    'src/app/api/progression/pilot/route.ts',
    'src/progression/pilot-progress.ts',
    'src/app/review/course-progression/page.tsx',
  ];
  it('none of the files names grade-6-math, and the only literal is the shared default constant', () => {
    for (const file of FILES) {
      expect(readFileSync(join(ROOT, file), 'utf8'), file).not.toMatch(/['"]grade-6-math['"]/);
    }
    const defining = readFileSync(join(ROOT, 'src/progression/program-resolution.ts'), 'utf8');
    const codeLines = defining.split('\n').filter((line) => !/^\s*(\/\*|\*|\/\/)/.test(line));
    expect(codeLines.join('\n').match(/['"]grade-6-math['"]/g)).toHaveLength(1);
    // Sensitivity: the scan sees a literal if one is present.
    expect("programByCode('grade-6-math')").toMatch(/['"]grade-6-math['"]/);
    expect(readdirSync(join(ROOT, 'src/app/api/progression')).length).toBeGreaterThan(3);
  });
});
