import { RETRY_GUIDANCE_CLASSES, type RetryGuidanceClass } from '../contracts';

/**
 * SCI6-REPAIR-FEEDBACK (D-311): class-only retry guidance for the second
 * attempt of a Science move.
 *
 * Noninterference: the guidance is a pure function of which STRUCTURAL reason
 * codes the first attempt produced. Those codes come from
 * scienceStructureViolations (text only, no protected tokens) or from schema
 * parsing, so neither the protected answer nor `protectedTokens` can change
 * which classes appear. Answer-derived (answer_leak_detected,
 * answer_word_leak_detected, answer_selection_detected), activity, safety,
 * policy, echo and model_error reasons are never mapped, and no token,
 * sentence or learner text is ever read.
 */
export const RETRY_GUIDANCE_VERSION = 'retry-guidance-1';

/** Suffix appended to the prompt template version on a call that had guidance. */
export const RETRY_GUIDANCE_TEMPLATE_SUFFIX = `-${RETRY_GUIDANCE_VERSION}`;

const RETRY_GUIDANCE_SENTENCES: Record<RetryGuidanceClass, string> = {
  numeric_expression_detected:
    'Your previous reply was not used because it contained a number, count or order word (for example both, two, second, half). Rewrite it using descriptive words only.',
  identifier_alias_detected:
    'Your previous reply was not used because it named something by a letter, label or plural group word taken from the problem. Rewrite it describing things by their features in plain words instead.',
  standalone_letter_detected:
    'Your previous reply was not used because it contained a single letter standing alone as a word. Rewrite it without such words, saying the, this, each, any or some instead.',
  unsupported_character_detected:
    'Your previous reply was not used because it contained a character that is not plain English text. Rewrite it using only plain English letters, spaces and ordinary punctuation.',
  invalid_schema:
    'Your previous reply was not used because it was not in the required shape. Call the tool exactly once and provide only the declared fields.',
};

/** The fixed sentence table, exported for conformance tests. */
export const RETRY_GUIDANCE_TEXT: Readonly<Record<RetryGuidanceClass, string>> =
  RETRY_GUIDANCE_SENTENCES;

const CLASS_SET: ReadonlySet<string> = new Set(RETRY_GUIDANCE_CLASSES);

/** Maps a validation reason list to guidance classes, in fixed class order. */
export function retryGuidanceClassesOf(reasons: readonly string[]): RetryGuidanceClass[] {
  const present = new Set(reasons.filter((reason) => CLASS_SET.has(reason)));
  return RETRY_GUIDANCE_CLASSES.filter((guidanceClass) => present.has(guidanceClass));
}

/**
 * Fixed sentences for the given classes, deduplicated, in fixed class order.
 * Unknown values are dropped; nothing is interpolated.
 */
export function renderRetryGuidance(classes: readonly string[] | undefined): string[] {
  if (!classes) return [];
  const requested = new Set(classes);
  return RETRY_GUIDANCE_CLASSES.filter((guidanceClass) => requested.has(guidanceClass)).map(
    (guidanceClass) => RETRY_GUIDANCE_SENTENCES[guidanceClass],
  );
}
