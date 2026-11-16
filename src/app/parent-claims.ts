import { programsByCode } from '../curriculum/program-registry';

/**
 * Pure helpers for what the parent page may claim about each program's
 * evidence (SU-E5, D-191).
 */

export const SCIENCE_EVIDENCE_NOTE =
  'Grade 6 Science rows come from practice checks on provided cell models, two items per topic. They do not show mastery of a full science standard, investigation skills or building models.';

const SCIENCE_SKILL_CODE_PREFIX = programsByCode.get('grade-6-science')?.skillCodePrefix;

export const SPELLING_EVIDENCE_NOTE =
  'Scripps Spelling Bee rows come from practice only: exact-match spelling checks, two items per skill. They are not a measure of readiness for the competition.';

const SPELLING_SKILL_CODE_PREFIX = programsByCode.get('scripps-spelling-bee-6')?.skillCodePrefix;

/** True when any mastery row belongs to the Scripps Spelling Bee program. */
export function hasSpellingEvidence(rows: readonly { skillCode: string }[]): boolean {
  if (!SPELLING_SKILL_CODE_PREFIX) return false;
  return rows.some((row) => row.skillCode.startsWith(SPELLING_SKILL_CODE_PREFIX));
}

/** True when any mastery row belongs to the Grade 6 Science program. */
export function hasScienceEvidence(rows: readonly { skillCode: string }[]): boolean {
  if (!SCIENCE_SKILL_CODE_PREFIX) return false;
  return rows.some((row) => row.skillCode.startsWith(SCIENCE_SKILL_CODE_PREFIX));
}
