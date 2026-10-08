/**
 * Shared answer-matching used by both grading call sites
 * (src/phase1/service.ts and src/progression/assessment-submission.ts).
 * Previously each kept its own copy of this logic, which had already begun
 * to drift in subtle ways between the two files.
 *
 * Grading remains exact-match-after-normalization, not fuzzy or semantic
 * matching (see docs/content-review.md on deterministic validators). The
 * normalization here only absorbs punctuation/spacing variation that a
 * correct answer may incidentally have - trailing periods, uneven spacing
 * around separators - not wording or notation variation. A learner response
 * that is correct but phrased differently from every accepted-answer
 * variant still needs an additional accepted-answer variant authored for
 * that record; see docs/PROGRESS.md 2026-10-07 (M2) for the larger,
 * deferred redesign this would need to fix comprehensively.
 */
export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/gu, ' ')
    .replace(/[.,;!?]+$/u, '')
    .replace(/\s*([;,])\s*/gu, '$1 ')
    .trim();
}

export function matchesAcceptedAnswer(
  acceptedAnswers: readonly string[],
  response: string,
): boolean {
  const normalizedResponse = normalizeAnswer(response);
  return acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === normalizedResponse);
}
