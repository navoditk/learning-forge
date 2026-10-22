import { prisma } from '../server/prisma';
import type { CourseCatalog } from '../curriculum/course-catalog';
import { COURSE_CATALOG, COURSE_CATALOG_INDEX } from '../curriculum/course-catalog';

export type PilotLessonProgress = {
  code: string;
  version: string;
  title: string;
  completionStatus: string;
  remediationStatus: string;
  latestAssessment?: { outcome: string; resultId: string; scoredAt: string };
  /**
   * D-70's override API takes a skill ref, not a lesson ref - any skill
   * this lesson claims works, since applyNeedsHelpOverride resolves the
   * lesson(s) a skill belongs to internally. Exposed so the parent UI
   * can call it without a second lookup.
   */
  skillRefs: Array<{ code: string; version: string }>;
};

export type PilotUnitProgress = {
  code: string;
  version: string;
  title: string;
  status: string;
  lessons: PilotLessonProgress[];
};

export type PilotProgression = {
  program: { code: string; version: string; label: string };
  /** Active unit versions only: one per code (S-1). */
  units: PilotUnitProgress[];
  /**
   * C7-A (D-230): non-active indexed versions of an active unit's code,
   * keeping only lessons the learner has a state row for. Empty in
   * single-version operation.
   */
  history: PilotUnitProgress[];
};

/** The active view and the all-versions index; injectable for tests. */
export type PilotProgressCatalogs = { active: CourseCatalog; index: CourseCatalog };

const DEFAULT_CATALOGS: PilotProgressCatalogs = {
  active: COURSE_CATALOG,
  index: COURSE_CATALOG_INDEX,
};

const refKey = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;

/** Active units of the program plus the non-active indexed versions of their codes. */
function scopeOf(catalogs: PilotProgressCatalogs, programCode: string) {
  const program = catalogs.active.programByCode(programCode);
  if (!program) throw new Error('Pilot program is unavailable');
  const units = catalogs.active.unitsOfProgram(programCode);
  const activeLessonKeys = new Set(
    units.flatMap((unit) => catalogs.active.lessonsOfUnit(unit)).map(refKey),
  );
  const activeUnitKeys = new Set(units.map(refKey));
  const historyUnits = units.flatMap((unit) =>
    catalogs.index.units.filter(
      (candidate) => candidate.code === unit.code && !activeUnitKeys.has(refKey(candidate)),
    ),
  );
  const lessonCodes = [
    ...new Set(
      [...units, ...historyUnits]
        .flatMap((unit) => catalogs.index.lessonsOfUnit(unit))
        .map((lesson) => lesson.code),
    ),
  ];
  const unitCodes = units.map((unit) => unit.code);
  return { program, units, historyUnits, activeLessonKeys, lessonCodes, unitCodes };
}

export type PilotProgressRows = {
  lessonStates: ReadonlyArray<{
    lessonCode: string;
    lessonVersion: string;
    completionStatus: string;
    remediationStatus: string;
  }>;
  unitStates: ReadonlyArray<{ unitCode: string; unitVersion: string; completionStatus: string }>;
  /** Newest first; only assignments that have a result. */
  assignments: ReadonlyArray<{
    targetCode: string;
    targetVersion: string;
    result: { id: string; outcome: string; scoredAt: Date } | null;
  }>;
};

/**
 * Pure projection over already-loaded rows. `program`/`units` are the active
 * versions and are unchanged from single-version operation; `history` holds
 * earlier versions that have at least one lesson state row.
 */
export function projectPilotProgression(
  catalogs: PilotProgressCatalogs,
  programCode: string,
  rows: PilotProgressRows,
): PilotProgression {
  const { program, units, historyUnits, activeLessonKeys } = scopeOf(catalogs, programCode);
  const statesByLesson = new Map(
    rows.lessonStates.map((state) => [`${state.lessonCode}@${state.lessonVersion}`, state]),
  );
  const statesByUnit = new Map(
    rows.unitStates.map((state) => [`${state.unitCode}@${state.unitVersion}`, state]),
  );
  const latestResults = new Map<string, { outcome: string; resultId: string; scoredAt: string }>();
  for (const assignment of rows.assignments) {
    if (
      !assignment.result ||
      latestResults.has(`${assignment.targetCode}@${assignment.targetVersion}`)
    )
      continue;
    latestResults.set(`${assignment.targetCode}@${assignment.targetVersion}`, {
      outcome: assignment.result.outcome,
      resultId: assignment.result.id,
      scoredAt: assignment.result.scoredAt.toISOString(),
    });
  }
  const lessonProgress = (ref: { code: string; version: string }): PilotLessonProgress => {
    const lesson = catalogs.index.lessonByRef(ref);
    const state = statesByLesson.get(refKey(ref));
    return {
      code: ref.code,
      version: ref.version,
      title: lesson?.title ?? ref.code,
      completionStatus: state?.completionStatus ?? 'NOT_STARTED',
      remediationStatus: state?.remediationStatus ?? 'NONE',
      latestAssessment: latestResults.get(refKey(ref)),
      skillRefs: lesson?.skillRefs ?? [],
    };
  };
  const unitStatus = (unit: { code: string; version: string }): string =>
    statesByUnit.get(refKey(unit))?.completionStatus ?? 'NOT_STARTED';

  const history: PilotUnitProgress[] = [];
  for (const unit of historyUnits) {
    const lessons = unit.lessonRefs
      .filter((ref) => statesByLesson.has(refKey(ref)) && !activeLessonKeys.has(refKey(ref)))
      .map(lessonProgress);
    if (lessons.length === 0) continue;
    history.push({
      code: unit.code,
      version: unit.version,
      title: unit.title,
      status: unitStatus(unit),
      lessons,
    });
  }
  return {
    program: { code: program.code, version: program.version, label: 'Grade 6 Math' },
    units: units.map((unit) => ({
      code: unit.code,
      version: unit.version,
      title: unit.title,
      status: unitStatus(unit),
      lessons: unit.lessonRefs.map(lessonProgress),
    })),
    history,
  };
}

export async function getPilotProgression(
  identity: {
    householdId: string;
    learnerProfileId: string;
  },
  catalogs: PilotProgressCatalogs = DEFAULT_CATALOGS,
  programCode = 'grade-6-math',
): Promise<PilotProgression> {
  const { lessonCodes, unitCodes } = scopeOf(catalogs, programCode);
  const [lessonStates, unitStates, assignments] = await Promise.all([
    prisma.learnerLessonState.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        lessonCode: { in: lessonCodes },
      },
    }),
    prisma.learnerUnitState.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        unitCode: { in: unitCodes },
      },
    }),
    prisma.assessmentAssignment.findMany({
      where: {
        householdId: identity.householdId,
        learnerProfileId: identity.learnerProfileId,
        targetCode: { in: lessonCodes },
        result: { isNot: null },
      },
      include: { result: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return projectPilotProgression(catalogs, programCode, { lessonStates, unitStates, assignments });
}
