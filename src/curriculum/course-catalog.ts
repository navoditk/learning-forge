import { isDeepStrictEqual } from 'node:util';

import type { ZodType } from 'zod';

import type { AssessmentBank, Lesson, Program, Unit } from '../contracts/progression';
import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
} from '../contracts/progression';
import { PILOT_ASSESSMENT_BANKS, PILOT_LESSONS, PILOT_UNITS } from './pilot-catalog';
import { PROGRAM_REGISTRY } from './program-registry';
import { validateProgressionCatalog } from './progression-catalog';

export type CourseCatalogInput = {
  programs: readonly Program[];
  units: readonly Unit[];
  lessons: readonly Lesson[];
  banks: readonly AssessmentBank[];
};

type RefLike = { code: string; version: string };

/**
 * Read-only access to the authored Program -> Unit -> Lesson -> bank records.
 * Selectors keep the declaration order of the underlying arrays and return the
 * first match for a code and version, like the direct array lookups they replace.
 */
export type CourseCatalog = {
  readonly programs: readonly Program[];
  readonly units: readonly Unit[];
  readonly lessons: readonly Lesson[];
  readonly banks: readonly AssessmentBank[];
  programByCode(code: string): Program | undefined;
  unitByRef(ref: RefLike): Unit | undefined;
  lessonByRef(ref: RefLike): Lesson | undefined;
  bankByRef(ref: RefLike): AssessmentBank | undefined;
  /** Units a program registers, in unitRefs order; unresolved refs are skipped. */
  unitsOfProgram(code: string): Unit[];
  /** Lessons a unit lists, in catalog (not lessonRefs) order. */
  lessonsListedByUnit(unit: Pick<Unit, 'lessonRefs'>): Lesson[];
  /** Lessons of a unit in the unit's lessonRefs order; unresolved refs are skipped. */
  lessonsOfUnit(unit: Pick<Unit, 'lessonRefs'>): Lesson[];
  /** Lessons whose skillRefs pin the exact skill code and version, in catalog order. */
  lessonsClaimingSkill(skillRef: RefLike): Lesson[];
  /** First unit listing the lesson in its lessonRefs. */
  unitOfLesson(lesson: RefLike): Unit | undefined;
};

const refKey = (ref: RefLike): string => `${ref.code}@${ref.version}`;

/**
 * Records are indexed by their raw identifiers, so a record the schema would
 * normalize (for example trimmed codes, in nested refs too) is rejected
 * instead of being indexed under a non-canonical key.
 */
function assertCanonical(schema: ZodType, record: unknown, label: string): void {
  const parsed = schema.parse(record);
  if (!isDeepStrictEqual(parsed, record)) {
    throw new Error(`Catalog ${label} is not in canonical schema form`);
  }
}

function firstByRef<T extends RefLike>(records: readonly T[]): Map<string, T> {
  const index = new Map<string, T>();
  for (const record of records) {
    const key = refKey(record);
    if (!index.has(key)) index.set(key, record);
  }
  return index;
}

/**
 * Builds a catalog from already-authored records, keeping the same record
 * objects and order. Records are re-validated
 * against the contract schemas and the unchanged progression spine validator,
 * so an injected fixture catalog is held to the production rules.
 */
export function createCourseCatalog(input: CourseCatalogInput): CourseCatalog {
  const { programs, units, lessons, banks } = input;
  for (const program of programs) assertCanonical(ProgramSchema, program, 'program');
  for (const unit of units) assertCanonical(UnitSchema, unit, 'unit');
  for (const lesson of lessons) assertCanonical(LessonSchema, lesson, 'lesson');
  for (const bank of banks) assertCanonical(AssessmentBankSchema, bank, 'assessment bank');
  validateProgressionCatalog(programs, units, lessons, banks);

  const programsByCode = new Map<string, Program>();
  for (const program of programs) {
    if (!programsByCode.has(program.code)) programsByCode.set(program.code, program);
  }
  const unitsByRef = firstByRef(units);
  const lessonsByRef = firstByRef(lessons);
  const banksByRef = firstByRef(banks);

  return {
    programs,
    units,
    lessons,
    banks,
    programByCode: (code) => programsByCode.get(code),
    unitByRef: (ref) => unitsByRef.get(refKey(ref)),
    lessonByRef: (ref) => lessonsByRef.get(refKey(ref)),
    bankByRef: (ref) => banksByRef.get(refKey(ref)),
    unitsOfProgram: (code) =>
      (programsByCode.get(code)?.unitRefs ?? []).flatMap((ref) => {
        const unit = unitsByRef.get(refKey(ref));
        return unit ? [unit] : [];
      }),
    lessonsListedByUnit: (unit) =>
      lessons.filter((lesson) =>
        unit.lessonRefs.some((ref) => ref.code === lesson.code && ref.version === lesson.version),
      ),
    lessonsOfUnit: (unit) =>
      unit.lessonRefs.flatMap((ref) => lessons.filter((lesson) => refKey(lesson) === refKey(ref))),
    lessonsClaimingSkill: (skillRef) =>
      lessons.filter((lesson) =>
        lesson.skillRefs.some(
          (ref) => ref.code === skillRef.code && ref.version === skillRef.version,
        ),
      ),
    unitOfLesson: (lesson) =>
      units.find((unit) =>
        unit.lessonRefs.some((ref) => ref.code === lesson.code && ref.version === lesson.version),
      ),
  };
}

/** Production catalog: the program registry plus the unchanged Grade 6 pilot records. */
export const COURSE_CATALOG: CourseCatalog = createCourseCatalog({
  programs: PROGRAM_REGISTRY,
  units: PILOT_UNITS,
  lessons: PILOT_LESSONS,
  banks: PILOT_ASSESSMENT_BANKS,
});
