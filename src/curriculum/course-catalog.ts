import { isDeepStrictEqual } from 'node:util';

import type { ZodType } from 'zod';

import type { AssessmentBank, Lesson, Program, Unit } from '../contracts/progression';
import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
} from '../contracts/progression';
import type { ActiveSelection, ReservedLabel, VersionedCourseCatalog } from './catalog-versions';
import { createVersionedCourseCatalog } from './catalog-versions';
import ACTIVE_SELECTION from './grade-6-math-active-selection.json';
import RESERVED_LABELS from './grade-6-math-reserved-labels.json';
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

/**
 * Production catalog (P-A live, D-229): the version index over every
 * registered record plus the committed active selection. `COURSE_CATALOG` is
 * the active view, so code-keyed program lookups mean "currently selected";
 * the index keeps every version resolvable for history. Single-version
 * operation is unchanged: the active view equals the former catalog.
 */
let versionedCatalog: VersionedCourseCatalog | undefined;

function buildVersionedCatalog(): VersionedCourseCatalog {
  versionedCatalog ??= createVersionedCourseCatalog({
    records: {
      programs: PROGRAM_REGISTRY,
      units: PILOT_UNITS,
      lessons: PILOT_LESSONS,
      banks: PILOT_ASSESSMENT_BANKS,
    },
    selection: ACTIVE_SELECTION as ActiveSelection,
    reservedLabels: RESERVED_LABELS as readonly ReservedLabel[],
  });
  return versionedCatalog;
}

/**
 * catalog-versions imports createCourseCatalog from this module, so the
 * production catalog is built on first use. Building it at load would run
 * before catalog-versions finished initializing whenever that module is the
 * import entry point (a module cycle). The proxies are transparent.
 */
function lazy<T extends object>(resolve: () => T): T {
  return new Proxy({} as T, {
    get: (_target, key) => Reflect.get(resolve(), key),
    has: (_target, key) => Reflect.has(resolve(), key),
    ownKeys: () => Reflect.ownKeys(resolve()),
    getOwnPropertyDescriptor: (_target, key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(resolve(), key);
      return descriptor ? { ...descriptor, configurable: true } : undefined;
    },
  });
}

export const VERSIONED_COURSE_CATALOG: VersionedCourseCatalog = lazy(buildVersionedCatalog);

export const COURSE_CATALOG_INDEX: CourseCatalog = lazy(() => buildVersionedCatalog().index);

let activeCatalog: CourseCatalog | undefined;

export const COURSE_CATALOG: CourseCatalog = lazy(() => {
  if (!activeCatalog) {
    const view = buildVersionedCatalog().activeView();
    // With one version per code the active programs are the registry itself;
    // keep its identity so single-version consumers see the same array.
    const unchanged =
      view.programs.length === PROGRAM_REGISTRY.length &&
      view.programs.every((program, i) => program === PROGRAM_REGISTRY[i]);
    activeCatalog = unchanged ? { ...view, programs: PROGRAM_REGISTRY } : view;
  }
  return activeCatalog;
});
