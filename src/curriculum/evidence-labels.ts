import { programsByCode } from './program-registry';

/**
 * Single policy source for qualified evidence wording (D-361).
 *
 * For the Scripps Spelling Bee Grade 6 program, explanation-by-selection is
 * PARTIAL evidence: the runtime reaches INDEPENDENTLY_CONFIRMED, HIGH mastery
 * and lesson or unit COMPLETE from numeric thresholds alone, so any learner or
 * parent text derived from those states must not overclaim for Spelling. Every
 * other program keeps its existing wording byte for byte (callers fall back to
 * their own text when a helper here returns null).
 *
 * This module changes text only. It never changes a status, band or score.
 */

const QUALIFIED_SKILL_CODE_PREFIXES: readonly string[] = [
  programsByCode.get('scripps-spelling-bee-6')?.skillCodePrefix,
].filter((prefix): prefix is string => typeof prefix === 'string' && prefix.length > 0);

export const SPELLING_SELECTED_EXPLANATION_LABEL =
  'Selected the correct explanation from supplied options.';
export const SPELLING_EXPLANATION_PARTIAL_LABEL =
  'Explanation evidence: partial, selection-based recognition only.';
export const SPELLING_GENERATED_EXPLANATION_LABEL =
  'Learner-generated explanation: not yet assessed; deferred requirement.';
export const SPELLING_INDEPENDENT_CHECK_LABEL =
  'Independent check passed on assessed tasks; explanation requirement remains incomplete.';
export const SPELLING_LESSON_COMPLETE_LABEL =
  'Lesson completed under the assessment policy; full skill mastery is not established.';
export const SPELLING_UNIT_COMPLETE_LABEL =
  'Unit completed under the assessment policy; full skill mastery is not established.';
export const SPELLING_L2_PARENT_NOTE =
  "This unit assesses spelling, word construction and choices made from supplied clues and options. Explanation questions assess recognition of a supplied explanation, not an explanation written by the learner. Lesson or unit completion and independent-check results do not establish the skills' full explanation requirement. Learner-generated explanation remains unassessed and deferred. These results do not establish readiness for the competition.";

/** True when the skill's evidence wording must be qualified (Spelling only). */
export function hasQualifiedEvidenceWording(skillCode: string): boolean {
  return QUALIFIED_SKILL_CODE_PREFIXES.some((prefix) => skillCode.startsWith(prefix));
}

/** Qualified text replacing "independently confirmed" for one skill, or null (unchanged). */
export function qualifiedIndependentCheckLabel(skillCode: string): string | null {
  return hasQualifiedEvidenceWording(skillCode) ? SPELLING_INDEPENDENT_CHECK_LABEL : null;
}

/**
 * Labels for a successful explanation-selection attempt on a qualified skill.
 * Null unless the attempt is a correct selection of a supplied explanation, so
 * every label stays linked to the matching attempt.
 */
export function selectionExplanationLabels(
  skillCode: string,
  attempt: { correct: boolean; selectedSuppliedExplanation: boolean },
): readonly string[] | null {
  if (!hasQualifiedEvidenceWording(skillCode)) return null;
  if (!attempt.correct || !attempt.selectedSuppliedExplanation) return null;
  return [
    SPELLING_SELECTED_EXPLANATION_LABEL,
    SPELLING_EXPLANATION_PARTIAL_LABEL,
    SPELLING_GENERATED_EXPLANATION_LABEL,
  ];
}

/**
 * Qualified completion text for a lesson or unit, or null (unchanged: no
 * Spelling skill, or not COMPLETE). All-Spelling gets the exact D-361 label;
 * a mixed lesson or unit qualifies only its Spelling portion.
 */
export function qualifiedCompletionLabel(
  kind: 'Lesson' | 'Unit',
  skillCodes: readonly string[],
  completionStatus: string,
): string | null {
  if (completionStatus.toUpperCase() !== 'COMPLETE') return null;
  const spelling = skillCodes.filter(hasQualifiedEvidenceWording).length;
  if (spelling === 0) return null;
  const exact = kind === 'Lesson' ? SPELLING_LESSON_COMPLETE_LABEL : SPELLING_UNIT_COMPLETE_LABEL;
  return spelling === skillCodes.length
    ? exact
    : `Spelling skills in this ${kind.toLowerCase()}: ${exact}`;
}

/** True when any listed skill needs the L2 parent note. */
export function needsSpellingL2Note(skillCodes: readonly string[]): boolean {
  return skillCodes.some(hasQualifiedEvidenceWording);
}

/**
 * Chapter confirmed-count text ("X of Y ..."). With no Spelling skill this is
 * the existing wording byte for byte. Spelling skills are counted and worded
 * separately so a mixed chapter never makes an unqualified claim about them.
 */
export function chapterConfirmedCountText(
  items: readonly { skillCode: string; status: string }[],
  unit: 'skills' | 'topics',
): string {
  const confirmed = (item: { status: string }) => item.status === 'INDEPENDENTLY_CONFIRMED';
  const spelling = items.filter((item) => hasQualifiedEvidenceWording(item.skillCode));
  const others = items.filter((item) => !hasQualifiedEvidenceWording(item.skillCode));
  const otherText = `${others.filter(confirmed).length} of ${others.length} ${
    unit === 'skills' ? 'skills confirmed' : 'topics independently confirmed'
  }`;
  if (spelling.length === 0) return otherText;
  const spellingText = `${spelling.filter(confirmed).length} of ${spelling.length} ${
    others.length === 0 ? '' : 'Spelling '
  }${unit} with an independent check passed on assessed tasks; explanation requirement remains incomplete`;
  return others.length === 0 ? spellingText : `${otherText}. ${spellingText}`;
}

/** "Recent strengths" line; the Spelling form keeps the attempt date. */
export function recentStrengthText(skillCode: string, skillTitle: string, date: string): string {
  const qualified = qualifiedIndependentCheckLabel(skillCode);
  return qualified
    ? `${skillTitle} — ${qualified} Date: ${date}`
    : `${skillTitle} — confirmed independently on ${date}`;
}

/** Activity-panel line when the independent check is already passed. */
export function activityCompletedText(skillCode: string): string {
  const qualified = qualifiedIndependentCheckLabel(skillCode);
  return qualified
    ? `Independent check passed — this activity is complete. ${qualified}`
    : 'Independent check passed — this activity is complete.';
}

/** Activity-panel feedback after a correct review check. */
export function reviewCorrectText(skillCode: string): string {
  const qualified = qualifiedIndependentCheckLabel(skillCode);
  return qualified ? `Correct. ${qualified}` : 'Correct — this skill is still confirmed.';
}
