import { NUMBER_WORD_VOCABULARY, canonicalizeCase } from './number-words';

/**
 * SU-H7-FIX2 rev4: the D-281 Science structural contract.
 *
 * A Science tutor reply is served only if neither response field, nor the
 * two fields joined, contains:
 *
 * 1. a standalone Latin letter A-Z in either case, including "a" and "I"
 *    (no article allowlist), or a single-letter possessive ("Y's" exposes Y);
 * 2. a numeric expression or numeric character: any Unicode number
 *    character (digits, superscripts, Roman numeral and circled forms,
 *    vulgar fractions), a cardinal word, a fraction word, an ordinal position
 *    word (first to eighth and beyond, and "last") or a Roman numeral word
 *    ii-viii;
 * 3. a compact identifier alias: option, choice, letter, sample, cell,
 *    example or run joined to any letter a-z or number identifier ("sampleb",
 *    "samples", "optiontwo", "cellsecond"); spaced, hyphenated and
 *    underscored forms ("Cell-Y", "option_2") already fall under rules 1
 *    and 2. A joined "s" is not exempted as a plural (rev5);
 * 4. any other letter outside a-z after canonicalization (Greek, Cyrillic or
 *    accented confusables are not allowed through).
 *
 * The check does not decide whether a reply is correct or leaks the answer;
 * it is a deterministic output restriction for the current Science tutor
 * (D-281). It supplements, and never replaces, the literal, numeric,
 * answer-word, option-rebuild, activity, echo, escalation and authorization
 * checks.
 *
 * Canonicalization (structureTokens): canonicalizeCase (vulgar fractions
 * expanded with a boundary, NFKC, invisible characters removed, Unicode
 * dashes, slashes and apostrophes folded to ASCII, whitespace collapsed),
 * then case folding. Tokens are maximal runs of letters and digits, joined
 * only by an apostrophe inside a word, so contractions ("it's", "don't")
 * stay whole and any other punctuation (hyphen, underscore, quote,
 * parenthesis, full stop) separates tokens.
 */

export type StructureViolation =
  | 'standalone_letter_detected'
  | 'numeric_expression_detected'
  | 'identifier_alias_detected'
  | 'unsupported_character_detected';

// The shared parser vocabulary (every word it reads as a number) plus words
// the parser does not need but that still name a number or a position.
const NUMBER_WORDS: ReadonlySet<string> = new Set([
  ...NUMBER_WORD_VOCABULARY,
  ...`billion dozens last ii iii iv vi vii viii`.split(/\s+/u).filter((word) => word.length > 0),
]);

/** The numeric vocabulary the Science structural contract rejects (exported for conformance tests). */
export const SCIENCE_NUMERIC_WORDS: ReadonlySet<string> = NUMBER_WORDS;

const ALIAS_NOUNS = ['option', 'choice', 'letter', 'sample', 'cell', 'example', 'run'];

// A compact alias: an alias noun joined directly to any single letter a-z,
// digits or a number word. rev5 (review r4 finding 1): there is no plural
// exemption, so "cells", "samples", "options", "examples", "choices",
// "letters" and "runs" are rejected too (accepted over-rejection under
// D-281; the Science prompt tells the model to avoid these plurals).
const ALIAS_PATTERN = new RegExp(
  `^(?:${ALIAS_NOUNS.join('|')})(?:[a-z]|\\d+|${[...NUMBER_WORDS].join('|')})$`,
  'u',
);

/** The canonical, case-folded tokens of `text` (see file comment). */
export function structureTokens(text: string): string[] {
  const canonical = canonicalizeCase(text).toLocaleLowerCase();
  return canonical.match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu) ?? [];
}

/** Every structural violation in one text, in a fixed order. */
export function structureViolationsOf(text: string): StructureViolation[] {
  const found = new Set<StructureViolation>();
  // Number characters are checked before NFKC can rewrite them (Ⅳ, ①, ²).
  if (/\p{N}/u.test(text)) found.add('numeric_expression_detected');
  for (const token of structureTokens(text)) {
    const base = token.replace(/'s$/u, '');
    if (/[^a-z0-9']/u.test(token)) found.add('unsupported_character_detected');
    if (/\p{N}/u.test(token) || NUMBER_WORDS.has(base)) found.add('numeric_expression_detected');
    if (/^[a-z]$/u.test(base)) found.add('standalone_letter_detected');
    if (ALIAS_PATTERN.test(base)) found.add('identifier_alias_detected');
  }
  const order: StructureViolation[] = [
    'standalone_letter_detected',
    'numeric_expression_detected',
    'identifier_alias_detected',
    'unsupported_character_detected',
  ];
  return order.filter((violation) => found.has(violation));
}

/**
 * Structural violations of a Science move: each response field on its own
 * and the two fields joined. Joining can only add a violation that spans the
 * boundary; it never removes one.
 */
export function scienceStructureViolations(
  learnerMessage: string,
  question: string,
): StructureViolation[] {
  const found = new Set<StructureViolation>([
    ...structureViolationsOf(learnerMessage),
    ...structureViolationsOf(question),
    ...structureViolationsOf(`${learnerMessage}${question}`),
    ...structureViolationsOf(`${learnerMessage} ${question}`),
  ]);
  const order: StructureViolation[] = [
    'standalone_letter_detected',
    'numeric_expression_detected',
    'identifier_alias_detected',
    'unsupported_character_detected',
  ];
  return order.filter((violation) => found.has(violation));
}
