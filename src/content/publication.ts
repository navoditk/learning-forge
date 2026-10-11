import type { ContentRecord } from '../contracts/progression';
import type { Skill } from '../contracts/curriculum';
import type { ProgramRosterEntry } from '../curriculum/program-roster';

/**
 * Content records accepted by the public-site projection. Existing role-less
 * records are treated as practice only for publication purposes.
 */
export type CurriculumSiteContentItem = ContentRecord;

/**
 * The only content projection allowed to feed the public curriculum site.
 * Pending records and assessment/review records are excluded by construction.
 */
export function publishableContentProjection(
  items: readonly CurriculumSiteContentItem[],
): CurriculumSiteContentItem[] {
  return items.filter(
    (item) =>
      item.review.status === 'reviewed' &&
      (!('role' in item) || item.role === 'teaching' || item.role === 'practice'),
  );
}

export function publishableSkillProjection(
  skills: readonly Skill[],
  items: readonly CurriculumSiteContentItem[],
  programs: readonly ProgramRosterEntry[],
): Skill[] {
  const availablePrograms = new Set(
    programs.filter((program) => program.available).map((program) => program.code),
  );
  const reviewedSkillRefs = new Set(
    publishableContentProjection(items).map((item) =>
      'skillRef' in item
        ? JSON.stringify([item.skillRef.code, item.skillRef.version])
        : JSON.stringify([item.skillCode, '1.0.0']),
    ),
  );
  return skills.filter(
    (skill) =>
      availablePrograms.has(skill.program) &&
      reviewedSkillRefs.has(JSON.stringify([skill.code, skill.version ?? '1.0.0'])),
  );
}
