/**
 * Grade 6 Social Studies load-time rules (SS-IMPLEMENT, D-324 O2, dossier
 * R1 to R4).
 *
 * These rules only constrain skills and records that belong to the
 * `grade-6-social-studies` program (or use an `hss6-` domain). Every other
 * program is untouched. They add no content and no behavior: the program stays
 * unavailable, and these checks run at catalog load so a malformed future
 * Social Studies record fails loudly. They are syntactic rejections only;
 * closed option sets, a single correct option, distractor rationale and source
 * mapping remain mandatory author and reviewer checks.
 */

export const SOCIAL_STUDIES_PROGRAM_CODE = 'grade-6-social-studies';
export const SOCIAL_STUDIES_DOMAIN_PREFIX = 'hss6-';

/**
 * The 48 California History-Social Science Grade 6 content substandards
 * (6.1.1-3, 6.2.1-9, 6.3.1-5, 6.4.1-8, 6.5.1-7, 6.6.1-8, 6.7.1-8). An explicit
 * list, not a pattern: there is no 6.1.4 or 6.2.10. ASCII only.
 */
export const GRADE_6_HSS_CONTENT_STANDARDS: readonly string[] = [
  'CA-HSS.6.1.1',
  'CA-HSS.6.1.2',
  'CA-HSS.6.1.3',
  'CA-HSS.6.2.1',
  'CA-HSS.6.2.2',
  'CA-HSS.6.2.3',
  'CA-HSS.6.2.4',
  'CA-HSS.6.2.5',
  'CA-HSS.6.2.6',
  'CA-HSS.6.2.7',
  'CA-HSS.6.2.8',
  'CA-HSS.6.2.9',
  'CA-HSS.6.3.1',
  'CA-HSS.6.3.2',
  'CA-HSS.6.3.3',
  'CA-HSS.6.3.4',
  'CA-HSS.6.3.5',
  'CA-HSS.6.4.1',
  'CA-HSS.6.4.2',
  'CA-HSS.6.4.3',
  'CA-HSS.6.4.4',
  'CA-HSS.6.4.5',
  'CA-HSS.6.4.6',
  'CA-HSS.6.4.7',
  'CA-HSS.6.4.8',
  'CA-HSS.6.5.1',
  'CA-HSS.6.5.2',
  'CA-HSS.6.5.3',
  'CA-HSS.6.5.4',
  'CA-HSS.6.5.5',
  'CA-HSS.6.5.6',
  'CA-HSS.6.5.7',
  'CA-HSS.6.6.1',
  'CA-HSS.6.6.2',
  'CA-HSS.6.6.3',
  'CA-HSS.6.6.4',
  'CA-HSS.6.6.5',
  'CA-HSS.6.6.6',
  'CA-HSS.6.6.7',
  'CA-HSS.6.6.8',
  'CA-HSS.6.7.1',
  'CA-HSS.6.7.2',
  'CA-HSS.6.7.3',
  'CA-HSS.6.7.4',
  'CA-HSS.6.7.5',
  'CA-HSS.6.7.6',
  'CA-HSS.6.7.7',
  'CA-HSS.6.7.8',
];

/**
 * The 14 grades 6-8 historical and social sciences analysis skills:
 * chronological and spatial thinking 1-3, research, evidence and point of view
 * 1-5, and historical interpretation 1-6.
 */
export const GRADES_6_8_HSS_ANALYSIS_STANDARDS: readonly string[] = [
  'CA-HSS-AS.6-8.CST.1',
  'CA-HSS-AS.6-8.CST.2',
  'CA-HSS-AS.6-8.CST.3',
  'CA-HSS-AS.6-8.REP.1',
  'CA-HSS-AS.6-8.REP.2',
  'CA-HSS-AS.6-8.REP.3',
  'CA-HSS-AS.6-8.REP.4',
  'CA-HSS-AS.6-8.REP.5',
  'CA-HSS-AS.6-8.HI.1',
  'CA-HSS-AS.6-8.HI.2',
  'CA-HSS-AS.6-8.HI.3',
  'CA-HSS-AS.6-8.HI.4',
  'CA-HSS-AS.6-8.HI.5',
  'CA-HSS-AS.6-8.HI.6',
];

const SOCIAL_STUDIES_STANDARDS: ReadonlySet<string> = new Set([
  ...GRADE_6_HSS_CONTENT_STANDARDS,
  ...GRADES_6_8_HSS_ANALYSIS_STANDARDS,
]);

/** Literacy-support tags are not standards-coverage claims (R4). */
const LITERACY_TAG_PREFIXES = ['RH.', 'WHST.'] as const;

const ALLOWED_VALIDATOR_TYPES: readonly string[] = ['multiple_choice', 'text', 'numeric'];
const ALLOWED_MODES: readonly string[] = ['core', 'depth'];

function standardsViolations(owner: string, standards: readonly string[]): string[] {
  const violations: string[] = [];
  for (const standard of standards) {
    if (LITERACY_TAG_PREFIXES.some((prefix) => standard.startsWith(prefix))) {
      violations.push(
        `${owner} lists literacy tag "${standard}" in standards; RH. and WHST. tags are not allowed until a non-claiming support field exists`,
      );
    } else if (!SOCIAL_STUDIES_STANDARDS.has(standard)) {
      violations.push(
        `${owner} lists standard "${standard}" outside the Grade 6 History-Social Science allow-list`,
      );
    }
  }
  return violations;
}

export type SocialStudiesSkillShape = {
  code: string;
  program: string;
  domain: string;
  standards: readonly string[];
};

/** R2/R3: program/domain pairing and the standards allow-list, applied to skills. */
export function validateSocialStudiesSkillRules(skills: readonly SocialStudiesSkillShape[]): void {
  for (const skill of skills) {
    const isProgram = skill.program === SOCIAL_STUDIES_PROGRAM_CODE;
    const isDomain = skill.domain.startsWith(SOCIAL_STUDIES_DOMAIN_PREFIX);
    if (isProgram && !isDomain) {
      throw new Error(
        `${skill.code} in ${SOCIAL_STUDIES_PROGRAM_CODE} must use a ${SOCIAL_STUDIES_DOMAIN_PREFIX}* domain, found ${skill.domain}`,
      );
    }
    if (!isProgram && isDomain) {
      throw new Error(
        `${skill.code} uses the ${skill.domain} domain, which is reserved for ${SOCIAL_STUDIES_PROGRAM_CODE}`,
      );
    }
    if (!isProgram) continue;
    const violations = standardsViolations(skill.code, skill.standards);
    if (violations.length > 0) throw new Error(violations.join('; '));
  }
}

export type SocialStudiesContentShape = {
  id: string;
  mode: string;
  standards?: readonly string[];
  contestFormat?: unknown;
  figure?: unknown;
  deterministicValidator?: { type: string; parts?: unknown };
};

/**
 * R3/R4: record rules for a record whose skill belongs to
 * `grade-6-social-studies`. Applies to every role; validator rules apply to
 * records that carry a validator.
 */
export function validateSocialStudiesContentRules(item: SocialStudiesContentShape): void {
  const violations: string[] = [];
  if (!ALLOWED_MODES.includes(item.mode)) {
    violations.push(`${item.id} must use core or depth mode, found ${item.mode}`);
  }
  if (item.figure !== undefined) {
    violations.push(`${item.id} must not carry a figure until figure provenance exists`);
  }
  if (item.contestFormat !== undefined) {
    violations.push(`${item.id} must not carry contestFormat metadata`);
  }
  const validator = item.deterministicValidator;
  if (validator) {
    if (!ALLOWED_VALIDATOR_TYPES.includes(validator.type)) {
      violations.push(
        `${item.id} must use a multiple_choice, text or numeric validator, found ${validator.type}`,
      );
    }
    if (validator.parts !== undefined) {
      violations.push(`${item.id} must not use validator parts (substring matching)`);
    }
  }
  violations.push(...standardsViolations(item.id, item.standards ?? []));
  if (violations.length > 0) {
    throw new Error(violations.join('; '));
  }
}
