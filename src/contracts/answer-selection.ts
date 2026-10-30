import { normalizeNumberWords } from './number-words';
import { stemWord } from './semantic-leakage';

/**
 * SU-H7-FIX2 Science option-rebuild check.
 *
 * The answer-word check (semantic-leakage.ts) lets a hint reuse any word the
 * problem gives, so a correct option written only in problem words ("Many
 * tiny units, each with a boundary and parts inside") is not protected by it.
 * This check rejects tutor text that rebuilds a correct option value: every
 * content term of one correct option (its field label "Sample:" removed, at
 * least two terms, problem words included).
 *
 * rev4 (D-281): pointing at an option by letter, number, position or
 * identifier is now rejected unconditionally by the Science structural
 * contract (science-structure.ts): every standalone letter, every number or
 * ordinal word and every compact identifier alias. The rev2/rev3 lexical
 * selection rules (selection verbs, copulas, assignment verbs, option words,
 * the article-"a" heuristic) only ever fired on such a token, so they are
 * strictly covered by the structural contract and have been removed. A
 * correct option whose value contains an identifier ("Sample B", "Cell Y")
 * cannot be written without that identifier, which the structural contract
 * rejects; this check therefore rebuilds only identifier-free values.
 *
 * Like the other Science checks this only adds a rejection.
 */

const VALUE_STOP_WORDS = new Set(
  `a an the of and or to in on at for with by it its this that these those so is are was were be
  been has have had each from as than then there their they them what which who if but also into`
    .split(/\s+/u)
    .filter((word) => word.length > 0),
);

/** Option values of a protected token: "Sample: Sample B; Evidence: X" -> ["Sample B", "X"]. */
function optionValues(token: string): string[] {
  return token
    .split(';')
    .map((segment) => {
      const labelled = segment.match(/^\s*[A-Za-z][^:]{0,59}:\s+([\s\S]+)$/u);
      return (labelled ? labelled[1] : segment).trim();
    })
    .filter((value) => value.length > 0);
}

/** True when the value names an identifier after a noun ("Sample B", "Run 2"). */
function hasIdentifier(value: string): boolean {
  return /\b[A-Za-z]{2,}\W{1,3}(?:[A-Z]|\d{1,2})(?![A-Za-z0-9])/u.test(value.normalize('NFKC'));
}

function termsOf(text: string): Set<string> {
  const normalized = normalizeNumberWords(text).replace(/'s\b/gu, '');
  const terms = new Set<string>(normalized.match(/\d+(?:\.\d+)?(?![a-z])/gu) ?? []);
  for (const word of normalized.split(/[^\p{L}]+/u)) {
    if (word.length < 2 || VALUE_STOP_WORDS.has(word)) continue;
    terms.add(stemWord(word));
  }
  return terms;
}

/** True when the tutor text rebuilds an identifier-free correct option value. */
export function rebuildsAnswerOption(text: string, protectedTokens: readonly string[]): boolean {
  const textTerms = termsOf(text);
  for (const token of protectedTokens) {
    for (const value of optionValues(token)) {
      if (hasIdentifier(value)) continue;
      const valueTerms = termsOf(value);
      if (valueTerms.size < 2) continue;
      if ([...valueTerms].every((term) => textTerms.has(term))) return true;
    }
  }
  return false;
}
