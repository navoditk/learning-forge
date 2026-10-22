import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createVersionedCourseCatalog } from '../../src/curriculum/catalog-versions';
import {
  COURSE_CATALOG,
  COURSE_CATALOG_INDEX,
  VERSIONED_COURSE_CATALOG,
} from '../../src/curriculum/course-catalog';
import { PILOT_ASSESSMENT_BANKS, PILOT_LESSONS } from '../../src/curriculum/pilot-catalog';
import { PROGRAM_ROSTER, buildProgramRoster } from '../../src/curriculum/program-roster';
import {
  PROGRAM_REGISTRY,
  programsByCode,
  selectActivePrograms,
} from '../../src/curriculum/program-registry';
import { isSkillClaimedByAuthoredUnit } from '../../src/curriculum/unit-claims';
import {
  SV_PROGRAM_CODE,
  SV_PROGRAM_V1,
  SV_PROGRAM_V11,
} from './fixtures/synthetic-versioned-catalog';
import { pilotSkillRef, skillAssessmentBank } from '../../src/progression/skill-assessment';

const curriculumFile = (name: string): unknown =>
  JSON.parse(readFileSync(join(process.cwd(), 'src', 'curriculum', name), 'utf8'));

const PILOT_SKILLS = ['ratio-language', 'unit-rates', 'ratio-tables'];

describe('P-A live: committed active selection (RI-1)', () => {
  it('S-1 names every registry program exactly once at the registered version', () => {
    const selection = VERSIONED_COURSE_CATALOG.selection;
    expect(selection.programs).toHaveLength(11);
    expect(selection.programs).toEqual(
      PROGRAM_REGISTRY.map(({ code, version }) => ({ code, version })),
    );
    expect(new Set(selection.programs.map((ref) => ref.code)).size).toBe(11);
  });

  it('names one skill bank per skill-targeted pilot bank code', () => {
    const skillBankCodes = PILOT_ASSESSMENT_BANKS.map((bank) => bank.code).filter((code) =>
      /-(review|delayed-check)-bank$/u.test(code),
    );
    expect(skillBankCodes).toHaveLength(6);
    expect(VERSIONED_COURSE_CATALOG.selection.skillBanks.map((ref) => ref.code)).toEqual(
      skillBankCodes,
    );
  });

  it('keeps the committed JSON equal to the catalog selection object', () => {
    expect(curriculumFile('grade-6-math-active-selection.json')).toEqual(
      VERSIONED_COURSE_CATALOG.selection,
    );
  });

  it('CE-5 registry, catalog and claims agree on the active program for every code', () => {
    for (const program of PROGRAM_REGISTRY) {
      expect(programsByCode.get(program.code), program.code).toBe(program);
      expect(COURSE_CATALOG.programByCode(program.code), program.code).toBe(program);
      expect(VERSIONED_COURSE_CATALOG.activeProgram(program.code), program.code).toBe(program);
    }
    for (const skill of PILOT_SKILLS) {
      expect(isSkillClaimedByAuthoredUnit('grade-6-math', skill), skill).toBe(true);
    }
    expect(COURSE_CATALOG.programs).toEqual([...PROGRAM_REGISTRY]);
  });

  it('single-version characterization: the active view equals the index and every pilot record is active', () => {
    expect(COURSE_CATALOG.units).toBe(COURSE_CATALOG_INDEX.units);
    expect(COURSE_CATALOG.lessons).toBe(COURSE_CATALOG_INDEX.lessons);
    expect(COURSE_CATALOG.banks).toBe(COURSE_CATALOG_INDEX.banks);
    for (const lesson of PILOT_LESSONS) {
      expect(VERSIONED_COURSE_CATALOG.isActiveLesson(lesson), lesson.code).toBe(true);
    }
    for (const unit of COURSE_CATALOG.unitsOfProgram('grade-6-math')) {
      expect(VERSIONED_COURSE_CATALOG.isActiveUnit(unit), unit.code).toBe(true);
    }
  });

  it('pilotSkillRef and skillAssessmentBank match the former array lookups', () => {
    for (const lesson of PILOT_LESSONS) {
      for (const skill of lesson.skillRefs) {
        expect(pilotSkillRef(skill.code, skill.version)).toEqual(skill);
        expect(pilotSkillRef(skill.code, '9.9.9')).toBeUndefined();
        for (const [kind, suffix] of [
          ['DELAYED_CHECK', 'delayed-check-bank'],
          ['REVIEW', 'review-bank'],
        ] as const) {
          const former = PILOT_ASSESSMENT_BANKS.find(
            (bank) =>
              bank.code === `${skill.code}-${suffix}` &&
              bank.targetRef.code === skill.code &&
              bank.targetRef.version === skill.version,
          );
          expect(skillAssessmentBank(kind, skill), `${kind} ${skill.code}`).toBe(former);
        }
      }
    }
    expect(pilotSkillRef('gcf-and-lcm', '1.0.0')).toBeUndefined();
  });

  it('reserved labels (ID-2) are not indexed or selected, and indexing one fails closed', () => {
    const reserved = curriculumFile('grade-6-math-reserved-labels.json') as {
      kind: string;
      code: string;
      version: string;
    }[];
    expect(reserved).toEqual([
      { kind: 'lesson', code: 'double-number-lines-lesson', version: '1.0.0' },
      { kind: 'lesson', code: 'percent-applications-lesson', version: '1.0.0' },
    ]);
    for (const label of reserved) {
      expect(COURSE_CATALOG_INDEX.lessonByRef(label), label.code).toBeUndefined();
    }
    const records = {
      programs: COURSE_CATALOG_INDEX.programs,
      units: COURSE_CATALOG_INDEX.units,
      lessons: COURSE_CATALOG_INDEX.lessons,
      banks: COURSE_CATALOG_INDEX.banks,
    };
    expect(() =>
      createVersionedCourseCatalog({
        records,
        selection: VERSIONED_COURSE_CATALOG.selection,
        reservedLabels: [{ kind: 'lesson', code: 'ratio-language-lesson', version: '1.0.0' }],
      }),
    ).toThrow('Reserved label is indexed: lesson ratio-language-lesson@1.0.0');
  });
});

describe('active-only roster (RI-1, P-A)', () => {
  it('lists one entry per registry program today', () => {
    expect(PROGRAM_ROSTER.map((entry) => entry.code)).toEqual(PROGRAM_REGISTRY.map((p) => p.code));
  });

  it('lists exactly the selected version of a two-version program, in either declaration order', () => {
    for (const programs of [
      [SV_PROGRAM_V1, SV_PROGRAM_V11],
      [SV_PROGRAM_V11, SV_PROGRAM_V1],
    ]) {
      for (const version of ['1.0.0', '1.1.0']) {
        const active = selectActivePrograms(programs, {
          programs: [{ code: SV_PROGRAM_CODE, version }],
        });
        const roster = buildProgramRoster(active);
        expect(roster).toHaveLength(1);
        expect(roster[0]!.code).toBe(SV_PROGRAM_CODE);
        expect(active[0]!.version).toBe(version);
      }
    }
    // The unfiltered registry would list the code twice.
    expect(buildProgramRoster([SV_PROGRAM_V1, SV_PROGRAM_V11])).toHaveLength(2);
  });
});
