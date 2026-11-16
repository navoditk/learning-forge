/**
 * Model-generated tutoring gate (PYTHON-IMPLEMENT C9, dossier 5.4 and 7.2; Social
 * Studies dossier R6).
 *
 * Python intro items stay on authored hint ladders only: leakage detection is
 * not yet evaluated for short, case-sensitive program outputs, so no learner
 * text or item content for a `py6-` skill may reach a model provider. Grade 6
 * Social Studies (`hss6-`) is held to the same fail-closed default until a
 * subject-appropriate, feature-flagged tutor template and evals (answer
 * leakage, religion neutrality, prompt injection, age appropriateness) exist.
 * Scripps Spelling Bee (`snsb6-`): hints were sent to the model framed as a math
 * tutor, and a hint naming letters of a one-word answer is a partial disclosure
 * the substring leakage guard cannot see; fail closed.
 * Lifting this needs a separate reviewed decision, not a flag flip in this module.
 */
export const MODEL_TUTORING_DISABLED_SKILL_PREFIXES: readonly string[] = [
  'py6-',
  'hss6-',
  'snsb6-',
];

export const MODEL_TUTORING_DISABLED_REASON = 'MODEL_TUTORING_DISABLED';

export function isModelTutoringDisabled(skillCode: string): boolean {
  return MODEL_TUTORING_DISABLED_SKILL_PREFIXES.some((prefix) => skillCode.startsWith(prefix));
}
