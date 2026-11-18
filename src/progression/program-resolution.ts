import type { Program } from '../contracts/progression';
import { skillsByCode } from '../curriculum/catalog';
import { COURSE_CATALOG, COURSE_CATALOG_INDEX } from '../curriculum/course-catalog';
import type { CourseCatalog } from '../curriculum/course-catalog';

/**
 * Program resolution for progression routes and the review page (SPELL-SP5,
 * scope row 10). The assignment, override and step-up routes, the pilot
 * progress projection and the review page used to name `'grade-6-math'`
 * literally; they now derive the program from the target, so a second
 * unit-bearing program (Spelling) needs no code change when it is selected.
 *
 * Resolution never widens access: it only chooses which ACTIVE program's
 * pinned policy profile applies. Whether the target itself is servable stays
 * the caller's job (active lesson, active unit, active skill claim).
 */

/** What an unresolvable target falls back to, preserving the earlier refusal paths. */
export const DEFAULT_PROGRESSION_PROGRAM_CODE = 'grade-6-math';

export type ProgressionTarget = {
  targetKind: 'SKILL' | 'LESSON' | 'UNIT' | 'PROGRAM';
  code: string;
  /** Required for LESSON and UNIT; ignored for SKILL (skills are not versioned in the index). */
  version?: string;
};

type SkillPrograms = ReadonlyMap<string, { program: string }>;

/**
 * Program code that owns a target: a skill's declared program, or the
 * introducing program of a unit (and of a lesson's unit). Looks through the
 * full version index, so a registered but not yet selected unit still names
 * its program; the caller then asks for that code's ACTIVE program.
 * Returns undefined when the target is unknown.
 */
export function programCodeOfTarget(
  target: ProgressionTarget,
  index: Pick<CourseCatalog, 'lessonByRef' | 'unitByRef' | 'unitOfLesson'> = COURSE_CATALOG_INDEX,
  skills: SkillPrograms = skillsByCode,
): string | undefined {
  if (target.targetKind === 'SKILL') return skills.get(target.code)?.program;
  if (target.targetKind === 'PROGRAM') return target.code;
  if (target.version === undefined) return undefined;
  const ref = { code: target.code, version: target.version };
  if (target.targetKind === 'UNIT') return index.unitByRef(ref)?.programRef.code;
  const lesson = index.lessonByRef(ref);
  return lesson ? index.unitOfLesson(lesson)?.programRef.code : undefined;
}

/**
 * The active program whose pinned profile governs a target. Unknown targets
 * fall back to the default program so the existing refusal (for example
 * `VERSION_MISMATCH`) is produced by the route exactly as before.
 */
export function activeProgramForTarget(
  target: ProgressionTarget,
  catalog: Pick<CourseCatalog, 'programByCode'> = COURSE_CATALOG,
  index?: Pick<CourseCatalog, 'lessonByRef' | 'unitByRef' | 'unitOfLesson'>,
  skills?: SkillPrograms,
): Program | undefined {
  const code = programCodeOfTarget(target, index, skills) ?? DEFAULT_PROGRESSION_PROGRAM_CODE;
  return catalog.programByCode(code);
}

/**
 * Step-up tokens are household-level (D-06), not program-level. The advertised
 * lifetime is the shortest pinned lifetime across active unit-bearing
 * programs, so no program's own bound can be exceeded; each program's profile
 * still decides acceptance when the token is used.
 */
export function stepUpAdvertisedLifetimeMinutes(
  programs: readonly Pick<Program, 'unitRefs' | 'defaultPolicyProfileRef'>[],
  lifetimeOf: (profileRef: Program['defaultPolicyProfileRef']) => number,
): number {
  const lifetimes = programs
    .filter((program) => program.unitRefs.length > 0)
    .map((program) => lifetimeOf(program.defaultPolicyProfileRef));
  if (lifetimes.length === 0) throw new Error('No active unit-bearing program');
  return Math.min(...lifetimes);
}

export type ReviewCourseSummary = {
  programCode: string;
  label: string;
  units: { code: string; version: string; title: string; lessons: readonly Lesson[] }[];
  bankCount: number;
};
type Lesson = { code: string; title: string; objectives: readonly string[] };

/**
 * Review-page data: every active program that has units, with each unit's
 * lessons and the assessment-bank metadata those units reference. Programs
 * without units (skill-graph-only) have no course to review.
 */
export function reviewCourseSummaries(
  catalog: CourseCatalog = COURSE_CATALOG,
): ReviewCourseSummary[] {
  return catalog.programs.flatMap((program) => {
    const units = catalog.unitsOfProgram(program.code);
    if (units.length === 0) return [];
    const bankKeys = new Set<string>();
    for (const unit of units) {
      if (unit.assessmentBankRef) {
        bankKeys.add(`${unit.assessmentBankRef.code}@${unit.assessmentBankRef.version}`);
      }
      for (const lesson of catalog.lessonsOfUnit(unit)) {
        bankKeys.add(`${lesson.assessmentBankRef.code}@${lesson.assessmentBankRef.version}`);
      }
    }
    return [
      {
        programCode: program.code,
        label: program.label,
        units: units.map((unit) => ({
          code: unit.code,
          version: unit.version,
          title: unit.title,
          lessons: catalog.lessonsOfUnit(unit),
        })),
        bankCount: bankKeys.size,
      },
    ];
  });
}
