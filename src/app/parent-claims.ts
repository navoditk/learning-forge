import { programsByCode } from '../curriculum/program-registry';

/**
 * Pure helpers for what the parent page may claim about each program's
 * evidence (SU-E5, D-191).
 */

export const SCIENCE_EVIDENCE_NOTE =
  'Grade 6 Science rows come from practice checks on provided cell models, two items per topic. They do not show mastery of a full science standard, investigation skills or building models.';

const SCIENCE_SKILL_CODE_PREFIX = programsByCode.get('grade-6-science')?.skillCodePrefix;

/** True when any mastery row belongs to the Grade 6 Science program. */
export function hasScienceEvidence(rows: readonly { skillCode: string }[]): boolean {
  if (!SCIENCE_SKILL_CODE_PREFIX) return false;
  return rows.some((row) => row.skillCode.startsWith(SCIENCE_SKILL_CODE_PREFIX));
}
