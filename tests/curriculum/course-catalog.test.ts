import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  COURSE_CATALOG,
  COURSE_CATALOG_INDEX,
  createCourseCatalog,
} from '../../src/curriculum/course-catalog';
import {
  PILOT_ASSESSMENT_BANKS,
  PILOT_LESSONS,
  PILOT_UNITS,
} from '../../src/curriculum/pilot-catalog';
import { PROGRAM_REGISTRY, programsByCode } from '../../src/curriculum/program-registry';
import { isSkillClaimedByAuthoredUnit } from '../../src/curriculum/unit-claims';
import {
  SYNTHETIC_BANKS,
  SYNTHETIC_LESSONS,
  SYNTHETIC_PROGRAM,
  SYNTHETIC_PROGRAM_CODE,
  SYNTHETIC_SKILL_CODES,
  SYNTHETIC_UNITS,
} from './fixtures/synthetic-course-catalog';

const PRODUCTION_RECORDS_SHA256 =
  '47531706f7de71eee2b0201fae5efe490d340eeeea272fca797ec2ba42b5c74b';

const fixtureInput = {
  programs: [SYNTHETIC_PROGRAM],
  units: SYNTHETIC_UNITS,
  lessons: SYNTHETIC_LESSONS,
  banks: SYNTHETIC_BANKS,
};

const multiProgramCatalog = createCourseCatalog({
  programs: [...PROGRAM_REGISTRY, SYNTHETIC_PROGRAM],
  units: [...PILOT_UNITS, ...SYNTHETIC_UNITS],
  lessons: [...PILOT_LESSONS, ...SYNTHETIC_LESSONS],
  banks: [...PILOT_ASSESSMENT_BANKS, ...SYNTHETIC_BANKS],
});

describe('production course catalog', () => {
  it('exposes the same pilot records, order and identity', () => {
    // P-A live (RI-1): the production catalog is the active view over the
    // version index. With one version per code it lists the same programs in
    // the same order, and the index keeps the original record objects.
    expect(COURSE_CATALOG.programs).toEqual([...PROGRAM_REGISTRY]);
    expect(COURSE_CATALOG_INDEX.programs).toBe(PROGRAM_REGISTRY);
    expect(COURSE_CATALOG_INDEX.units).toBe(PILOT_UNITS);
    expect(COURSE_CATALOG.units).toBe(PILOT_UNITS);
    expect(COURSE_CATALOG.lessons).toBe(PILOT_LESSONS);
    expect(COURSE_CATALOG.banks).toBe(PILOT_ASSESSMENT_BANKS);
    const digest = createHash('sha256')
      .update(
        JSON.stringify({
          units: COURSE_CATALOG.units,
          lessons: COURSE_CATALOG.lessons,
          banks: COURSE_CATALOG.banks,
        }),
      )
      .digest('hex');
    expect(digest).toBe(PRODUCTION_RECORDS_SHA256);
  });

  it('keeps the registry refs and resolves them through the lookup seam', () => {
    const grade6 = programsByCode.get('grade-6-math');
    expect(grade6?.unitRefs).toEqual([
      { code: 'ratios-and-proportional-reasoning', version: '1.0.0' },
    ]);
    expect(COURSE_CATALOG.unitsOfProgram('grade-6-math')).toEqual([...PILOT_UNITS]);
    for (const unit of PILOT_UNITS) {
      expect(COURSE_CATALOG.unitByRef(unit)).toBe(unit);
      expect(COURSE_CATALOG.lessonsOfUnit(unit)).toEqual(
        unit.lessonRefs.flatMap((ref) =>
          PILOT_LESSONS.filter((l) => l.code === ref.code && l.version === ref.version),
        ),
      );
    }
    for (const lesson of PILOT_LESSONS) {
      expect(COURSE_CATALOG.lessonByRef(lesson)).toBe(lesson);
      expect(COURSE_CATALOG.unitOfLesson(lesson)).toBe(PILOT_UNITS[0]);
      expect(COURSE_CATALOG.bankByRef(lesson.assessmentBankRef)).toBe(
        PILOT_ASSESSMENT_BANKS.find((b) => b.code === lesson.assessmentBankRef.code),
      );
    }
    expect(COURSE_CATALOG.lessonByRef({ code: 'ratio-language-lesson', version: '9.9.9' })).toBe(
      undefined,
    );
  });

  it('keeps claims for Grade 6 and none for unitless or unknown programs', () => {
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'ratio-language')).toBe(true);
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'gcf-and-lcm')).toBe(false);
    for (const program of PROGRAM_REGISTRY.filter((p) => p.unitRefs.length === 0)) {
      expect(isSkillClaimedByAuthoredUnit(program.code, 'ratio-language')).toBe(false);
    }
    expect(isSkillClaimedByAuthoredUnit('no-such-program', 'ratio-language')).toBe(false);
  });
});

describe('injectable synthetic catalog', () => {
  it('validates a second program through the real schemas and spine validator', () => {
    const catalog = createCourseCatalog(fixtureInput);
    expect(catalog.unitsOfProgram(SYNTHETIC_PROGRAM_CODE)).toEqual([...SYNTHETIC_UNITS]);
    expect(catalog.lessons).toBe(SYNTHETIC_LESSONS);
    expect(
      catalog.bankByRef({ code: 'synthetic-unit-one-bank', version: '1.0.0' })?.itemCount,
    ).toBe(6);
    expect(JSON.stringify(catalog.banks)).not.toMatch(/prompt|answer|item"/i);
  });

  it('claims skills by exact id and version for the registered program only', () => {
    const catalog = createCourseCatalog(fixtureInput);
    for (const skill of SYNTHETIC_SKILL_CODES) {
      expect(isSkillClaimedByAuthoredUnit(SYNTHETIC_PROGRAM_CODE, skill, catalog)).toBe(true);
    }
    expect(isSkillClaimedByAuthoredUnit(SYNTHETIC_PROGRAM_CODE, 'synthetic-skill-c', catalog)).toBe(
      false,
    );
    expect(isSkillClaimedByAuthoredUnit('grade-6-math', 'synthetic-skill-a', catalog)).toBe(false);
    expect(catalog.lessonsClaimingSkill({ code: 'synthetic-skill-a', version: '1.0.0' })).toEqual([
      SYNTHETIC_LESSONS[0],
    ]);
    expect(catalog.lessonsClaimingSkill({ code: 'synthetic-skill-a', version: '2.0.0' })).toEqual(
      [],
    );
  });

  it('isolates programs when two share one catalog', () => {
    expect(
      isSkillClaimedByAuthoredUnit('grade-6-math', 'ratio-language', multiProgramCatalog),
    ).toBe(true);
    expect(
      isSkillClaimedByAuthoredUnit('grade-6-math', 'synthetic-skill-a', multiProgramCatalog),
    ).toBe(false);
    expect(
      isSkillClaimedByAuthoredUnit(SYNTHETIC_PROGRAM_CODE, 'ratio-language', multiProgramCatalog),
    ).toBe(false);
    expect(
      isSkillClaimedByAuthoredUnit(
        SYNTHETIC_PROGRAM_CODE,
        'synthetic-skill-a',
        multiProgramCatalog,
      ),
    ).toBe(true);
    expect(multiProgramCatalog.unitsOfProgram('grade-6-math')).toEqual([...PILOT_UNITS]);
    for (const program of PROGRAM_REGISTRY.filter((p) => p.unitRefs.length === 0)) {
      expect(
        isSkillClaimedByAuthoredUnit(program.code, 'synthetic-skill-a', multiProgramCatalog),
      ).toBe(false);
    }
    expect(
      isSkillClaimedByAuthoredUnit('unknown-program', 'synthetic-skill-a', multiProgramCatalog),
    ).toBe(false);
  });

  it('keeps production claims unaffected by an injected catalog', () => {
    createCourseCatalog(fixtureInput);
    expect(isSkillClaimedByAuthoredUnit(SYNTHETIC_PROGRAM_CODE, 'synthetic-skill-a')).toBe(false);
  });
});

describe('catalog validation', () => {
  it('rejects a program unit ref that does not resolve', () => {
    expect(() =>
      createCourseCatalog({ ...fixtureInput, units: [], lessons: [], banks: [] }),
    ).toThrow('Program unit reference does not resolve: synthetic-unit-one@1.0.0');
  });

  it('rejects a unit pinned at a different version', () => {
    const [unit] = SYNTHETIC_UNITS;
    if (!unit) throw new Error('fixture unit missing');
    expect(() =>
      createCourseCatalog({ ...fixtureInput, units: [{ ...unit, version: '2.0.0' }] }),
    ).toThrow('Program unit reference does not resolve');
  });

  it('rejects duplicate records and unlisted records', () => {
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        lessons: [...SYNTHETIC_LESSONS, ...SYNTHETIC_LESSONS],
      }),
    ).toThrow('Duplicate lesson reference');
    expect(() =>
      createCourseCatalog({ ...fixtureInput, banks: [...SYNTHETIC_BANKS, ...SYNTHETIC_BANKS] }),
    ).toThrow('Duplicate assessment bank reference');
    expect(() => createCourseCatalog({ ...fixtureInput, programs: [] })).toThrow(
      'is not listed by a program',
    );
  });

  it('rejects a lesson whose bank does not resolve', () => {
    expect(() => createCourseCatalog({ ...fixtureInput, banks: SYNTHETIC_BANKS.slice(1) })).toThrow(
      'Lesson assessment bank reference does not resolve',
    );
  });

  it('rejects records the schemas would normalize, including nested refs', () => {
    const [bank, ...otherBanks] = SYNTHETIC_BANKS;
    const [lesson, ...otherLessons] = SYNTHETIC_LESSONS;
    const [unit] = SYNTHETIC_UNITS;
    if (!bank || !lesson || !unit) throw new Error('fixture records missing');
    const canonical = /not in canonical schema form/;

    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        banks: [{ ...bank, code: ' synthetic-lesson-1-bank ' }, ...otherBanks],
      }),
    ).toThrow(canonical);
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        banks: [
          { ...bank, targetRef: { ...bank.targetRef, code: ` ${bank.targetRef.code}` } },
          ...otherBanks,
        ],
      }),
    ).toThrow(canonical);
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        lessons: [
          { ...lesson, skillRefs: [{ code: ' synthetic-skill-a', version: '1.0.0' }] },
          ...otherLessons,
        ],
      }),
    ).toThrow(canonical);
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        units: [{ ...unit, lessonRefs: [{ code: ' synthetic-lesson-1', version: '1.0.0' }] }],
      }),
    ).toThrow(canonical);
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        programs: [{ ...SYNTHETIC_PROGRAM, code: ' synthetic-second-program' }],
      }),
    ).toThrow(canonical);
  });

  it('rejects schema-malformed records', () => {
    const [bank, ...otherBanks] = SYNTHETIC_BANKS;
    if (!bank) throw new Error('fixture bank missing');
    const programWithExtraKey = { ...SYNTHETIC_PROGRAM, extra: 1 };
    expect(() =>
      createCourseCatalog({ ...fixtureInput, banks: [{ ...bank, itemCount: 0 }, ...otherBanks] }),
    ).toThrow();
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        programs: [programWithExtraKey],
      }),
    ).toThrow();
  });

  it('rejects owner and version mismatches', () => {
    const [lesson, ...otherLessons] = SYNTHETIC_LESSONS;
    const [unit] = SYNTHETIC_UNITS;
    if (!lesson || !unit) throw new Error('fixture records missing');
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        lessons: [{ ...lesson, unitRef: { ...lesson.unitRef, version: '2.0.0' } }, ...otherLessons],
      }),
    ).toThrow('points to a different unit');
    expect(() =>
      createCourseCatalog({
        ...fixtureInput,
        units: [{ ...unit, programRef: { code: SYNTHETIC_PROGRAM_CODE, version: '2.0.0' } }],
      }),
    ).toThrow('points to a different program');
  });

  it('keeps catalog order and reference order distinct in lesson selectors', () => {
    const [unit] = SYNTHETIC_UNITS;
    if (!unit) throw new Error('fixture unit missing');
    const reordered = { ...unit, lessonRefs: [...unit.lessonRefs].reverse() };
    const catalog = createCourseCatalog({ ...fixtureInput, units: [reordered] });
    expect(catalog.lessonsOfUnit(reordered)).toEqual([SYNTHETIC_LESSONS[1], SYNTHETIC_LESSONS[0]]);
    expect(catalog.lessonsListedByUnit(reordered)).toEqual([...SYNTHETIC_LESSONS]);
    expect(catalog.unitOfLesson(SYNTHETIC_LESSONS[1]!)).toBe(reordered);
  });
});
