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
 *    ii-viii, except in one of the closed exempt constructions below
 *    (SCI6-STRUCT-DIAG, proposed D-281 amendment);
 * 3. a compact identifier alias: option, choice, letter, sample, cell,
 *    example or run joined to any letter a-z or number identifier ("sampleb",
 *    "samples", "optiontwo", "cellsecond"); spaced, hyphenated and
 *    underscored forms ("Cell-Y", "option_2") already fall under rules 1
 *    and 2. A joined "s" is not exempted as a plural (rev5);
 * 4. any other letter outside a-z after canonicalization (Greek, Cyrillic or
 *    accented confusables are not allowed through).
 *
 * SCI6-STRUCT-DIAG exempt constructions (rule 2 only; digits and Unicode
 * number characters are never exempt). "Next to" means separated by exactly
 * one space; "sentence start" means the first token of the text, or a token
 * after . ! or ? (optionally closing quotes or brackets) and at most one
 * space. A colon, semicolon or comma never starts a sentence.
 *
 * - E1 quantifier pronoun: "one" right after which/each/every/no/any
 *   ("which one", "each one", "no one").
 * - E2 reciprocal: "one" right before "another" ("one another").
 * - E3 partitive: "one of" + them, or "one of" + the/these/those/its/their/
 *   your + a non-option noun ("one of the parts").
 * - E5 "Let's first": "first" right after a sentence-opening "let's" and
 *   right before an instruction verb ("Let's first look ...").
 * - E6 "at first": "at first glance/sight", or a sentence-opening
 *   "At first," (exactly one comma) followed by a clause subject.
 *
 * rev2 (Codex review r1): E4 (discourse "First, ...") and E7 ("half way")
 * are withdrawn because they admit positional selection ("Choose: second,
 * which is correct.", "Choose half-way down."); E5 is narrowed to "Let's
 * first" and E6 to sentence starts. The numbering keeps the rev1 labels.
 *
 * Blocking condition, checked for every exemption: the exempt word must not
 * be next to an option-family noun (option, choice, letter, sample, cell,
 * example, run, answer, picture, description, result, model, claim and their
 * plurals), another numeric word, a single letter or a digit token; for E3
 * the noun after the determiner, and for E6a the word after glance/sight,
 * must not be one either. Anything not matched stays rejected ("the second
 * one", "option two", "the first choice", "number three", "one cell",
 * "First, look ...", "half way").
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

/** One structural violation and the canonical token that triggered it (diagnostics only). */
export interface StructureTrigger {
  rule: StructureViolation;
  token: string;
}

const VIOLATION_ORDER: readonly StructureViolation[] = [
  'standalone_letter_detected',
  'numeric_expression_detected',
  'identifier_alias_detected',
  'unsupported_character_detected',
];

const words = (list: string) => list.split(/\s+/u).filter((word) => word.length > 0);

// The shared parser vocabulary (every word it reads as a number) plus words
// the parser does not need but that still name a number or a position.
const NUMBER_WORDS: ReadonlySet<string> = new Set([
  ...NUMBER_WORD_VOCABULARY,
  ...words('billion dozens last ii iii iv vi vii viii'),
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

// SCI6-STRUCT-DIAG: nouns that can name an answer option. An exempt number
// word is never allowed next to one of these.
const OPTION_FAMILY: ReadonlySet<string> = new Set(
  words(
    `option options choice choices letter letters sample samples cell cells example examples run
    runs answer answers picture pictures description descriptions result results model models
    claim claims`,
  ),
);
const QUANTIFIERS: ReadonlySet<string> = new Set(words('which each every no any'));
const PARTITIVE_DETERMINERS: ReadonlySet<string> = new Set(words('the these those its their your'));
// Instruction verbs that may follow "Let's first". Words that are also common
// names of option objects (picture, list, model, test, sketch) are absent.
const INSTRUCTION_VERBS: ReadonlySet<string> = new Set(
  words(
    `look think read reread find notice check compare ask consider focus follow trace name
    describe imagine remember recall review start try see figure work`,
  ),
);
// Subjects that may open the clause after "At first,".
const CLAUSE_SUBJECTS: ReadonlySet<string> = new Set(
  words('it the this that these those you we each every some many living'),
);

interface Token {
  text: string;
  start: number;
  end: number;
}

function tokenize(text: string): { canonical: string; tokens: Token[] } {
  const canonical = canonicalizeCase(text).toLocaleLowerCase();
  const tokens = [...canonical.matchAll(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu)].map((match) => ({
    text: match[0],
    start: match.index,
    end: match.index + match[0].length,
  }));
  return { canonical, tokens };
}

/** The canonical, case-folded tokens of `text` (see file comment). */
export function structureTokens(text: string): string[] {
  return tokenize(text).tokens.map((token) => token.text);
}

const baseOf = (token: string) => token.replace(/'s$/u, '');

function isNumericToken(token: string): boolean {
  return /\p{N}/u.test(token) || NUMBER_WORDS.has(baseOf(token));
}

/** True when `neighbour` triggers the blocking condition for an exempt numeric word. */
function blocksExemption(neighbour: string | undefined): boolean {
  if (neighbour === undefined) return false;
  const base = baseOf(neighbour);
  return (
    OPTION_FAMILY.has(base) ||
    isNumericToken(neighbour) ||
    /^[a-z]$/u.test(base) ||
    ALIAS_PATTERN.test(base)
  );
}

/** SCI6-STRUCT-DIAG: true when the numeric word at `index` is in an exempt construction. */
function isExemptNumericWord(canonical: string, tokens: readonly Token[], index: number): boolean {
  const word = tokens[index].text;
  const separatorBefore = (at: number) =>
    at <= 0 ? '' : canonical.slice(tokens[at - 1].end, tokens[at].start);
  const spaced = (at: number) => at > 0 && at < tokens.length && separatorBefore(at) === ' ';
  // rev2 (review r1 findings 1 and 4): a sentence start is the first token of
  // the text or a token after sentence-final punctuation (optionally closing
  // quotes or brackets) and at most one space. A colon, semicolon or comma
  // never starts a sentence, so "Choose: ..." and "Which one? ...," cannot
  // open an exemption mid-assertion.
  const sentenceStart = (at: number) => at === 0 || /^[.!?]+["')\]]* ?$/u.test(separatorBefore(at));
  const previous = spaced(index) ? tokens[index - 1].text : undefined;
  const next = spaced(index + 1) ? tokens[index + 1].text : undefined;
  // Blocking condition: never next to an option noun, a number, a letter or an alias.
  if (blocksExemption(previous) || blocksExemption(next)) return false;

  if (word === 'one') {
    // E1: "which one", "each one", "every one", "no one", "any one".
    if (previous !== undefined && QUANTIFIERS.has(previous)) return true;
    // E2: "one another".
    if (next === 'another') return true;
    // E3: "one of them", "one of the parts" (never an option-family noun).
    if (next === 'of' && spaced(index + 2)) {
      const determiner = tokens[index + 2].text;
      if (determiner === 'them') return true;
      if (PARTITIVE_DETERMINERS.has(determiner) && spaced(index + 3)) {
        return !blocksExemption(tokens[index + 3].text);
      }
    }
    return false;
  }

  if (word !== 'first') return false;
  // E5 (rev2, narrowed): "Let's first <instruction verb>" opening a sentence.
  // "Let's" heads a main clause and can never sit inside a noun phrase, so
  // "first" can only order the action ("Let's first look ..."), never pick an
  // object ("the one you first read" stays rejected).
  if (
    (previous === "let's" || previous === 'lets') &&
    sentenceStart(index - 1) &&
    next !== undefined &&
    INSTRUCTION_VERBS.has(next)
  ) {
    return true;
  }
  if (previous !== 'at') return false;
  // E6a: "at first glance" / "at first sight", the word after not an option noun.
  if (next === 'glance' || next === 'sight') {
    return !(spaced(index + 2) && blocksExemption(tokens[index + 2].text));
  }
  // E6b (rev2, tightened): "At first, <subject> ..." opening a sentence, with
  // exactly one comma (and at most one space) after "first".
  const following = tokens[index + 1];
  return (
    sentenceStart(index - 1) &&
    following !== undefined &&
    /^, ?$/u.test(separatorBefore(index + 1)) &&
    CLAUSE_SUBJECTS.has(following.text)
  );
}

/**
 * Every structural violation in one text with the canonical token that
 * triggered it, in token order. Diagnostics only: production callers use
 * structureViolationsOf, which returns fixed reason codes.
 */
export function structureTriggersOf(text: string): StructureTrigger[] {
  const triggers: StructureTrigger[] = [];
  const { canonical, tokens } = tokenize(text);
  let numericTokenSeen = false;
  tokens.forEach((token, index) => {
    const base = baseOf(token.text);
    if (/[^a-z0-9']/u.test(token.text)) {
      triggers.push({ rule: 'unsupported_character_detected', token: token.text });
    }
    if (/\p{N}/u.test(token.text)) {
      numericTokenSeen = true;
      triggers.push({ rule: 'numeric_expression_detected', token: token.text });
    } else if (NUMBER_WORDS.has(base) && !isExemptNumericWord(canonical, tokens, index)) {
      numericTokenSeen = true;
      triggers.push({ rule: 'numeric_expression_detected', token: token.text });
    }
    if (/^[a-z]$/u.test(base)) triggers.push({ rule: 'standalone_letter_detected', token: base });
    if (ALIAS_PATTERN.test(base)) triggers.push({ rule: 'identifier_alias_detected', token: base });
  });
  // Number characters are checked before NFKC can rewrite them (Ⅳ, ①, ²).
  if (!numericTokenSeen && /\p{N}/u.test(text)) {
    triggers.push({ rule: 'numeric_expression_detected', token: '<number-character>' });
  }
  return triggers;
}

function rulesOf(triggers: readonly StructureTrigger[]): StructureViolation[] {
  const found = new Set(triggers.map((trigger) => trigger.rule));
  return VIOLATION_ORDER.filter((violation) => found.has(violation));
}

/** Every structural violation in one text, in a fixed order. */
export function structureViolationsOf(text: string): StructureViolation[] {
  return rulesOf(structureTriggersOf(text));
}

/**
 * Triggers for a Science move: each response field on its own and the two
 * fields joined, deduplicated by rule and token, in VIOLATION_ORDER.
 */
export function scienceStructureTriggers(
  learnerMessage: string,
  question: string,
): StructureTrigger[] {
  const all = [
    ...structureTriggersOf(learnerMessage),
    ...structureTriggersOf(question),
    ...structureTriggersOf(`${learnerMessage}${question}`),
    ...structureTriggersOf(`${learnerMessage} ${question}`),
  ];
  const seen = new Set<string>();
  const unique = all.filter((trigger) => {
    const key = `${trigger.rule}|${trigger.token}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return VIOLATION_ORDER.flatMap((rule) => unique.filter((trigger) => trigger.rule === rule));
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
  return rulesOf(scienceStructureTriggers(learnerMessage, question));
}
