import { COURSE_CATALOG, type CourseCatalog } from './course-catalog';

/**
 * Whether an authored unit registered on the program claims the skill through
 * one of its lessons. Programs unknown to the catalog claim nothing.
 */
export function isSkillClaimedByAuthoredUnit(
  programCode: string,
  skillCode: string,
  catalog: CourseCatalog = COURSE_CATALOG,
): boolean {
  const program = catalog.programByCode(programCode);
  if (!program) return false;
  return program.unitRefs.some((unitRef) => {
    const unit = catalog.unitByRef(unitRef);
    return (
      unit !== undefined &&
      unit.lessonRefs.some((lessonRef) =>
        catalog.lessonByRef(lessonRef)?.skillRefs.some((ref) => ref.code === skillCode),
      )
    );
  });
}
