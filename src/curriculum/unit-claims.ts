import { PILOT_LESSONS, PILOT_UNITS } from './pilot-catalog';
import { programsByCode } from './program-registry';

/**
 * Whether an authored unit registered on the program claims the skill through
 * one of its lessons. Unknown programs claim nothing.
 */
export function isSkillClaimedByAuthoredUnit(programCode: string, skillCode: string): boolean {
  const program = programsByCode.get(programCode);
  if (!program) return false;
  return program.unitRefs.some((unitRef) =>
    PILOT_UNITS.some(
      (unit) =>
        unit.code === unitRef.code &&
        unit.version === unitRef.version &&
        unit.lessonRefs.some((lessonRef) =>
          PILOT_LESSONS.some(
            (lesson) =>
              lesson.code === lessonRef.code &&
              lesson.version === lessonRef.version &&
              lesson.skillRefs.some((ref) => ref.code === skillCode),
          ),
        ),
    ),
  );
}
