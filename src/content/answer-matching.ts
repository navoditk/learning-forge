/**
 * Shared answer-matching used by both grading call sites
 * (src/phase1/service.ts and src/progression/assessment-submission.ts).
 * Previously each kept its own copy of this logic, which had already begun
 * to drift in subtle ways between the two files.
 *
 * Grading remains exact-match-after-normalization and per-part substring
 * matching, never fuzzy or semantic matching (see docs/content-review.md
 * on deterministic validators). A composite validator may additionally
 * declare `parts` (src/contracts/content.ts), each with its own accepted
 * phrasings for one required clause - a response matches if every part's
 * requirement is satisfied anywhere in the text, independent of wording or
 * order, which is the M2 fix
 * (docs/course-progression-review/independent-review.md) for composite
 * answers that need several independent clauses rather than one whole
 * sentence. A record with no `parts` still needs an additional
 * accepted-answer variant authored for any new phrasing, same as before.
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

type PartialValidator = {
  acceptedAnswers: readonly string[];
  parts?: readonly { accepted: readonly string[] }[];
};

/**
 * Checks the whole-string exact match first (always - this is the only
 * check when `parts` is absent, and it never regresses an existing
 * pre-authored variant even when parts is present and that variant would
 * not independently satisfy every part). If that fails and `parts` is
 * present, the response matches if every part's accepted phrasings
 * include at least one substring match, independent of order or exact
 * wording elsewhere in the response.
 */
export function matchesAcceptedAnswer(validator: PartialValidator, response: string): boolean {
  const normalizedResponse = normalizeAnswer(response);
  const wholeStringMatch = validator.acceptedAnswers.some(
    (accepted) => normalizeAnswer(accepted) === normalizedResponse,
  );
  if (wholeStringMatch) return true;
  if (!validator.parts || validator.parts.length === 0) return false;
  // A pre-authored acceptedAnswers variant may deliberately omit a clause
  // that parts requires (e.g. it's thinner evidence than the canonical
  // form, but was still authored as accepted) - the whole-string check
  // above already covers that exact text. parts is an *additional* path
  // for a correct answer that is phrased differently from every
  // pre-authored variant, not a replacement that could reject one.
  return validator.parts.every((part) =>
    part.accepted.some((accepted) => normalizedResponse.includes(normalizeAnswer(accepted))),
  );
}
