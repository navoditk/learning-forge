import { PYTHON_OUTPUT_LIMITS, type CodeListing } from '../contracts/python';

/**
 * Deterministic `python_output` evaluator (dossier section 5.2, D-321).
 *
 * The learner types the exact text the listing prints. Nothing is executed:
 * the response is normalized by the ordered pipeline below and compared with
 * the authored canonical output by exact, case-sensitive equality. It never
 * lowercases, trims, collapses whitespace, matches substrings or uses `parts`.
 */
export const PYTHON_OUTPUT_EVALUATOR_VERSION = 'python-output-1';

/** Typed, correctness-free reason codes for a rejected response. */
export const PYTHON_INVALID_REASONS = [
  'EMPTY',
  'TOO_LONG',
  'DISALLOWED_CHARACTER',
  'TOO_MANY_LINES',
] as const;
export type PythonInvalidReason = (typeof PYTHON_INVALID_REASONS)[number];

export type PythonOutputNormalization =
  { status: 'ok'; normalized: string } | { status: 'invalid'; reason: PythonInvalidReason };

/** Steps 2 to 6 of the pipeline. Step 1 (no trim) is the caller's contract. */
export function normalizePythonOutputResponse(raw: string): PythonOutputNormalization {
  // Step 2: raw length in UTF-16 code units.
  if (raw.length > PYTHON_OUTPUT_LIMITS.maxResponseCodeUnits) {
    return { status: 'invalid', reason: 'TOO_LONG' };
  }
  // Step 3: CRLF then lone CR become LF. The only character conversion.
  const lf = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Step 4: printable ASCII and LF only (rejects tabs, controls, curly quotes).
  if (/[^\n\x20-\x7e]/.test(lf)) return { status: 'invalid', reason: 'DISALLOWED_CHARACTER' };
  // Step 5: remove exactly one final LF. Nothing else is removed.
  const normalized = lf.endsWith('\n') ? lf.slice(0, -1) : lf;
  // Step 6: normalized limits.
  if (normalized.length === 0) return { status: 'invalid', reason: 'EMPTY' };
  if (normalized.split('\n').length > PYTHON_OUTPUT_LIMITS.maxResponseLines) {
    return { status: 'invalid', reason: 'TOO_MANY_LINES' };
  }
  return { status: 'ok', normalized };
}

export type PythonOutputEvaluation =
  | { status: 'scored'; correctness: 'CORRECT' | 'INCORRECT'; normalizedResponse: string }
  | { status: 'invalid'; reason: PythonInvalidReason };

/** Full pipeline: normalize (steps 2 to 6), then step 7 exact comparison. */
export function evaluatePythonOutput(
  canonicalAnswer: string,
  rawResponse: string,
): PythonOutputEvaluation {
  const result = normalizePythonOutputResponse(rawResponse);
  if (result.status === 'invalid') return result;
  return {
    status: 'scored',
    correctness: result.normalized === canonicalAnswer ? 'CORRECT' : 'INCORRECT',
    normalizedResponse: result.normalized,
  };
}

/** Learner-facing wording for each reason: neutral, never about correctness. */
export const PYTHON_INVALID_MESSAGES: Readonly<Record<PythonInvalidReason, string>> = {
  EMPTY: 'Type at least one line.',
  TOO_LONG: 'Use 1000 characters or fewer.',
  DISALLOWED_CHARACTER: 'Use plain keyboard characters and straight quotes.',
  TOO_MANY_LINES: 'Use 20 lines or fewer.',
};

/**
 * Learner-facing presentation for a `python_output` item: the public listing
 * and the answer kind only. Built by allowlist, so no canonical output, accepted
 * answer, hint or leakage pattern can reach the learner. `{}` for any other item.
 */
export function projectPythonPresentation(item: {
  deterministicValidator: { type: string };
  codeListing?: CodeListing;
}): { answerKind: 'python_output'; codeListing: CodeListing } | Record<string, never> {
  if (item.deterministicValidator.type !== 'python_output' || !item.codeListing) return {};
  const { language, languageVersion, source, showLineNumbers, structureDescription } =
    item.codeListing;
  return {
    answerKind: 'python_output',
    codeListing: { language, languageVersion, source, showLineNumbers, structureDescription },
  };
}
