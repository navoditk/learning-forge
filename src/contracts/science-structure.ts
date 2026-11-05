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

// SCI6-NUM-PLURAL (D-299): plural, approximate and multiplicative magnitude
// words. Science-only: the shared parser vocabulary is untouched, none of
// these words is given a numeric value, and none can be exempted (they are
// not "one" or "first"). Each inclusion and exclusion is recorded in the
// packet's audit.md. Possessives (including repeated terminal possessives) are folded by baseOf, as for NUMBER_WORDS.
const MAGNITUDE_WORDS: ReadonlySet<string> = new Set(
  words(`
    hundreds thousands millions billions trillions quadrillions quintillions sextillions
    septillions octillions nonillions decillions trillion quadrillion quintillion sextillion
    septillion octillion nonillion decillion googol googols zillion zillions bazillion
    bazillions gazillion gazillions jillion jillions umpteen lakh lakhs crore crores myriad
    myriads score scores millionth millionths billionth billionths trillionth trillionths
    zeros twos threes fours fives sixes sevens eights nines tens elevens twelves thirteens
    fourteens fifteens sixteens seventeens eighteens nineteens teens twenties thirties forties
    fifties sixties seventies eighties nineties
    twice thrice once double doubles doubled doubling doubly triple triples tripled tripling
    triply twin twins triplet triplets singly
    single singles pair pairs couple couples duo duos trio trios quartet quartets quintet
    quintets twosome threesome foursome both
    decade decades century centuries millennium millennia gross grosses
  `),
);

/** The plural, approximate and multiplicative words the Science contract also rejects (conformance tests). */
export const SCIENCE_MAGNITUDE_WORDS: ReadonlySet<string> = MAGNITUDE_WORDS;

// SCI6-NUM-PLURAL rev2 (review r1 F1): bounded recognition rule for the open
// families the enumerated set cannot complete. A token of at most
// MAX_FAMILY_TOKEN letters is a magnitude word when it is
//   (a) a cardinal stem (one or more concatenated cardinal words, e.g.
//       "eleven", "twenty", "billion", "twentyfive") plus "fold" or "some";
//   (b) a Latin multiplicative stem (quadr, quint, sext, sept, oct, non, dec,
//       undec ... vigint, cent, mill) plus "uple", "uples", "upled",
//       "upling", "uplet", "uplets" or "uply" ("quintupling", "sextuple",
//       "decuplets").
// Matching is on the whole token, so ordinary words such as "manifold" or
// "handsome" (not number stems) are not caught. No word gets a numeric value.
const MAX_FAMILY_TOKEN = 64;
const CARDINAL_STEMS = words(`
  zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen
  fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty
  ninety hundred thousand million billion trillion quadrillion quintillion sextillion
  septillion octillion nonillion decillion googol zillion
`);
const CARDINAL_FAMILY = new RegExp(`^(?:${CARDINAL_STEMS.join('|')})+(?:fold|some)$`, 'u');
const LATIN_STEMS = words(`
  quadr quint sext sept oct non dec undec duodec tredec quattuordec quindec sexdec septendec
  octodec novemdec vigint cent mill
`);
const LATIN_FAMILY = new RegExp(
  `^(?:${LATIN_STEMS.join('|')})(?:uples?|upled|upling|uplets?|uply)$`,
  'u',
);

function isMagnitudeWord(base: string): boolean {
  if (MAGNITUDE_WORDS.has(base)) return true;
  return base.length <= MAX_FAMILY_TOKEN && (CARDINAL_FAMILY.test(base) || LATIN_FAMILY.test(base));
}

// SCI6-NUM-PLURAL rev3 (cause-checkpoint fail-safe): the exact recognizer above
// can miss a count word, so these rules hold no matter what it returns.
//  1. A token longer than MAX_SCIENCE_TOKEN characters is rejected outright
//     (longest word in current Science content, prompts and benign corpora: 14).
//  2. A token ending in fold, folds, some or somes is rejected unless it is in
//     SCIENCE_SUFFIX_ALLOWLIST.
//  3. A token containing uple, uplet, upling or uply is rejected unless allowlisted.
//  4. A token containing illion, lakh or crore is rejected.
//  5. A token beginning with an alias noun whose remainder is a letter, number
//     or magnitude word, or breaks rules 2 to 4 (allowlist not applied), is an alias.
// More over-rejection is accepted.
const MAX_SCIENCE_TOKEN = 24;

/** Closed, test-pinned list of non-numeric words exempt from the suffix rules 2 and 3. */
export const SCIENCE_SUFFIX_ALLOWLIST: ReadonlySet<string> = new Set(
  words(`
    fold folds some unfold unfolds refold refolds enfold enfolds infold infolds
    manifold manifolds scaffold scaffolds blindfold blindfolds billfold billfolds
    handsome awesome wholesome unwholesome troublesome lonesome tiresome fearsome gruesome
    meddlesome cumbersome quarrelsome burdensome loathsome irksome winsome toothsome fulsome
    noisome bothersome worrisome wearisome venturesome adventuresome lissome gladsome darksome
    lightsome blithesome
    chromosome chromosomes autosome autosomes ribosome ribosomes lysosome lysosomes
    centrosome centrosomes peroxisome peroxisomes nucleosome nucleosomes endosome endosomes
    phagosome phagosomes proteasome proteasomes spliceosome spliceosomes liposome liposomes
    acrosome acrosomes desmosome desmosomes microsome microsomes
    glycosome glycosomes oleosome oleosomes exosome exosomes
    coupled coupling couplings uncoupled uncoupling decoupled decoupling
  `),
);

const SUFFIX_RULE = /(?:fold|folds|some|somes)$/u;
const INFIX_RULE = /uple|uplet|upling|uply/u;
const MAGNITUDE_SUBSTRING = /illion|lakh|crore/u;

/** Rules 2 to 4 for a token (or an alias remainder when `allowlist` is false). */
function breaksFamilyRules(base: string, allowlist: boolean): boolean {
  if (MAGNITUDE_SUBSTRING.test(base)) return true;
  if (allowlist && SCIENCE_SUFFIX_ALLOWLIST.has(base)) return false;
  return SUFFIX_RULE.test(base) || INFIX_RULE.test(base);
}

/**
 * SCI6-NUM-FRAGMENT rev2 (D-307, review r1 F1): closed list of count prefixes.
 * A standalone "fold" or "some" fragment joined to one of these (or to a
 * number word, or inside an alias) forms a count-bearing compound ("bi fold",
 * "mono some", "poly some"). Test-pinned.
 */
export const SCIENCE_COUNT_PREFIXES: readonly string[] = words(`
  mono di bi tri tetra penta hexa hepta octa nona deca poly multi uni quadri semi hemi sesqui
  centi milli kilo
`);

const GENERIC_LITERALS = ['illion', 'lakh', 'crore', 'uple', 'uplet', 'upling', 'uply'];
const SUFFIX_LITERALS = ['fold', 'folds', 'some', 'somes'];

/** True when the alias recogniser fires without its rules-2-to-4 clause (no recursion). */
function isExactAlias(base: string): boolean {
  if (ALIAS_PATTERN.test(base)) return true;
  for (const noun of ALIAS_NOUNS) {
    if (!base.startsWith(noun) || base.length === noun.length) continue;
    const rest = base.slice(noun.length);
    if (
      /^[a-z]$/u.test(rest) ||
      /^\d+$/u.test(rest) ||
      NUMBER_WORDS.has(rest) ||
      isMagnitudeWord(rest)
    )
      return true;
  }
  return false;
}

/**
 * A fragment that is an allowlisted standalone literal ("fold", "some") formed
 * a compound with the fragments before it: judge that compound.
 */
function compoundIsCounted(parts: readonly string[], index: number): boolean {
  for (let k = 1; k <= 3 && index - k >= 0; k += 1) {
    const before = parts.slice(index - k, index).join('');
    if (SCIENCE_COUNT_PREFIXES.some((prefix) => before.endsWith(prefix))) return true;
    if (NUMBER_WORDS.has(before) || isMagnitudeWord(before)) return true;
    if (isExactAlias(`${before}${parts[index]}`)) return true;
  }
  return false;
}

/**
 * SCI6-NUM-FRAGMENT (D-305, rev2 D-307): rules 2 to 4 for the part of a
 * fragment concatenation from `from` on. `parts` are the window's fragments,
 * whose concatenation is `joined`. A match that crosses a fragment boundary
 * counts. A match wholly inside one fragment is skipped when the fragment is
 * longer than the literal (the whole-token rules already judged it, so "the
 * ribosome", "in some cases" and "coupled with" stay valid); when the fragment
 * IS an allowlisted standalone literal the compound with the preceding
 * fragments is judged (compoundIsCounted).
 */
function breaksFamilyRulesAcross(
  joined: string,
  from: number,
  allowlist: boolean,
  parts: readonly string[],
): boolean {
  const base = joined.slice(from);
  if (allowlist && SCIENCE_SUFFIX_ALLOWLIST.has(base)) return false;
  let starts: number[] | undefined;
  const startsOf = () => {
    if (starts === undefined) {
      starts = [];
      let offset = 0;
      for (const part of parts) {
        starts.push(offset);
        offset += part.length;
      }
    }
    return starts;
  };
  const judge = (literal: string, anchoredAtEnd: boolean) => {
    for (let at = base.indexOf(literal); at >= 0; at = base.indexOf(literal, at + 1)) {
      if (anchoredAtEnd && at + literal.length !== base.length) continue;
      const first = from + at;
      const last = first + literal.length;
      const offsets = startsOf();
      let index = offsets.length - 1;
      while (index > 0 && offsets[index] > first) index -= 1;
      if (last > offsets[index] + parts[index].length) return true; // crosses a boundary
      if (
        parts[index] === literal &&
        SCIENCE_SUFFIX_ALLOWLIST.has(literal) &&
        compoundIsCounted(parts, index)
      ) {
        return true;
      }
    }
    return false;
  };
  return (
    GENERIC_LITERALS.some((literal) => judge(literal, false)) ||
    SUFFIX_LITERALS.some((literal) => judge(literal, true))
  );
}

/**
 * True when `base` is an alias noun joined to a remainder that states a number (rule 5).
 * With `parts` (fragment concatenations only) the rules-2-to-4 clause is judged
 * per fragment by breaksFamilyRulesAcross.
 */
function isFamilyAlias(base: string, parts?: readonly string[]): boolean {
  for (const noun of ALIAS_NOUNS) {
    if (!base.startsWith(noun) || base.length === noun.length) continue;
    const rest = base.slice(noun.length);
    if (
      /^[a-z]$/u.test(rest) ||
      /^\d+$/u.test(rest) ||
      NUMBER_WORDS.has(rest) ||
      isMagnitudeWord(rest) ||
      (parts === undefined
        ? breaksFamilyRules(rest, false)
        : breaksFamilyRulesAcross(base, noun.length, false, parts))
    ) {
      return true;
    }
  }
  return false;
}

const isNumericFamily = (base: string) => isMagnitudeWord(base) || breaksFamilyRules(base, true);

// SCI6-NUM-PLURAL rev2 (review r1 F2): format, control, private-use, unassigned
// and combining characters split or hide a word from the tokenizer (U+034F,
// U+180E, U+2061-U+2064, variation selectors, bidi controls). The shared
// canonicalization already deletes soft hyphen, U+200B-U+200D, U+2060 and
// U+FEFF (so the hidden word is still read); every other such character is
// rejected as unsupported in the Science path only.
const ALREADY_STRIPPED = /[\u00AD\u200B-\u200D\u2060\uFEFF]/u;
const INVISIBLE =
  /[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Cn}\p{M}\u034F\u180E\u2061-\u2064\uFE00-\uFE0F\u{E0100}-\u{E01EF}\u202A-\u202E\u2066-\u2069]/gu;
const ALLOWED_CONTROLS = /[\t\n\v\f\r]/u;

function invisibleTriggers(text: string): StructureTrigger[] {
  return [...text.matchAll(INVISIBLE)]
    .map((match) => match[0])
    .filter((char) => !ALREADY_STRIPPED.test(char) && !ALLOWED_CONTROLS.test(char))
    .map((char) => ({ rule: 'unsupported_character_detected' as const, token: char }));
}

const ALIAS_NOUNS = ['option', 'choice', 'letter', 'sample', 'cell', 'example', 'run'];

// A compact alias: an alias noun joined directly to any single letter a-z,
// digits or a number word. rev5 (review r4 finding 1): there is no plural
// exemption, so "cells", "samples", "options", "examples", "choices",
// "letters" and "runs" are rejected too (accepted over-rejection under
// D-281; the Science prompt tells the model to avoid these plurals).
const ALIAS_PATTERN = new RegExp(
  `^(?:${ALIAS_NOUNS.join('|')})(?:[a-z]|\\d+|${[...NUMBER_WORDS, ...MAGNITUDE_WORDS].join('|')})$`,
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

const baseOf = (token: string) => token.replace(/(?:'s)+$/u, '');

// SCI6-NUM-PLURAL rev5 (review r4 F6): a token keeps apostrophe-joined letters,
// so after the terminal 's chain is folded (baseOf) it passes only when it has
// no apostrophe, or exactly one whose tail is a closed contraction tail. The
// prefix before that tail is what the numeric, alias and exemption-blocker
// checks see (coreOf), through this one helper. Any other apostrophe shape is
// malformed and is rejected as unsupported_character_detected (the whole token
// is the diagnostic).
const CONTRACTION_TAILS: ReadonlySet<string> = new Set(['t', 're', 've', 'll', 'd', 'm']);

function isMalformedApostrophe(base: string): boolean {
  const first = base.indexOf("'");
  if (first < 0) return false;
  return base.indexOf("'", first + 1) >= 0 || !CONTRACTION_TAILS.has(base.slice(first + 1));
}

const coreOf = (base: string) => {
  const first = base.indexOf("'");
  return first < 0 ? base : base.slice(0, first);
};

function isNumericToken(token: string): boolean {
  const core = coreOf(baseOf(token));
  return /\p{N}/u.test(token) || NUMBER_WORDS.has(core) || isNumericFamily(core);
}

/** True when `neighbour` triggers the blocking condition for an exempt numeric word. */
function blocksExemption(neighbour: string | undefined): boolean {
  if (neighbour === undefined) return false;
  const base = baseOf(neighbour);
  const core = coreOf(base);
  return (
    isMalformedApostrophe(base) ||
    OPTION_FAMILY.has(core) ||
    isNumericToken(neighbour) ||
    /^[a-z]$/u.test(base) ||
    ALIAS_PATTERN.test(core) ||
    isFamilyAlias(core)
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

// SCI6-NUM-FRAGMENT (D-305): a number word split by intra-word punctuation or
// a space ("thou-sands", "hun dreds") leaves fragments that are not number
// words. Adjacent alphabetic fragments are therefore also concatenated, in
// sliding windows of 2 to MAX_FRAGMENTS, up to MAX_SCIENCE_TOKEN characters,
// and each concatenation goes through the same numeric, alias, suffix and
// substring rules as a whole token (no exemption applies). Fragments are
// adjacent when only whitespace and/or the punctuation - . _ / , ' (their
// Unicode variants are folded by canonicalization, plus U+00B7, U+2024 and
// U+2027) lies between them. Science only; the Math path is untouched.
const MAX_FRAGMENTS = 4;
const FRAGMENT_SEPARATOR = /^[\s\-._/,'·․‧]+$/u;
const FRAGMENT_TEXT = /^[a-z']+$/u;

// rev2 (review r1 F2): a fragment contributes every canonical letter (the
// apostrophe is dropped, the tail kept: "hun'd" -> "hund"); the possessive-folded
// core ("hun's" -> "hun") is tried as well, so both readings are judged.
const fragmentForms = (text: string): string[] => {
  if (!text.includes("'")) return [text];
  const forms = [text.replace(/'/gu, ''), coreOf(baseOf(text))];
  return forms[0] === forms[1] ? [forms[0]] : forms;
};

function fragmentTriggers(canonical: string, tokens: readonly Token[]): StructureTrigger[] {
  const triggers: StructureTrigger[] = [];
  const visit = (parts: string[], joined: string) => {
    if (
      NUMBER_WORDS.has(joined) ||
      isMagnitudeWord(joined) ||
      breaksFamilyRulesAcross(joined, 0, true, parts)
    ) {
      triggers.push({ rule: 'numeric_expression_detected', token: joined });
    }
    if (ALIAS_PATTERN.test(joined) || isFamilyAlias(joined, parts)) {
      triggers.push({ rule: 'identifier_alias_detected', token: joined });
    }
  };
  const extend = (start: number, end: number, parts: string[], base: string) => {
    for (const form of fragmentForms(tokens[end].text)) {
      const next = [...parts, form];
      const joined = base + form;
      if (joined.length > MAX_SCIENCE_TOKEN) continue;
      if (next.length >= 2) visit(next, joined);
      if (end + 1 < tokens.length && end + 1 < start + MAX_FRAGMENTS) {
        const following = tokens[end + 1];
        if (
          FRAGMENT_TEXT.test(following.text) &&
          FRAGMENT_SEPARATOR.test(canonical.slice(tokens[end].end, following.start))
        ) {
          extend(start, end + 1, next, joined);
        }
      }
    }
  };
  tokens.forEach((token, start) => {
    if (FRAGMENT_TEXT.test(token.text)) extend(start, start, [], '');
  });
  return triggers;
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
    const core = coreOf(base);
    if (/[^a-z0-9']/u.test(token.text) || isMalformedApostrophe(base)) {
      triggers.push({ rule: 'unsupported_character_detected', token: token.text });
    }
    if (token.text.length > MAX_SCIENCE_TOKEN) {
      // SCI6-NUM-PLURAL rev3: overlong tokens fail closed; the diagnostic token is truncated.
      triggers.push({
        rule: 'unsupported_character_detected',
        token: token.text.slice(0, MAX_SCIENCE_TOKEN),
      });
    }
    if (/\p{N}/u.test(token.text)) {
      numericTokenSeen = true;
      triggers.push({ rule: 'numeric_expression_detected', token: token.text });
    } else if (NUMBER_WORDS.has(core) && !isExemptNumericWord(canonical, tokens, index)) {
      numericTokenSeen = true;
      triggers.push({ rule: 'numeric_expression_detected', token: token.text });
    } else if (isNumericFamily(core)) {
      // SCI6-NUM-PLURAL: never exempt.
      numericTokenSeen = true;
      triggers.push({ rule: 'numeric_expression_detected', token: token.text });
    }
    if (/^[a-z]$/u.test(base)) triggers.push({ rule: 'standalone_letter_detected', token: base });
    if (ALIAS_PATTERN.test(core) || isFamilyAlias(core))
      triggers.push({ rule: 'identifier_alias_detected', token: core });
  });
  triggers.push(...fragmentTriggers(canonical, tokens));
  triggers.push(...invisibleTriggers(text));
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
