/**
 * SU-H7-FIX2: rewrites English number words as numerals so that the answer
 * leakage check sees "fifteen miles per hour", "two to three" or "two thirds"
 * exactly as it sees "15 miles per hour", "2 to 3" or "2/3".
 *
 * The rewrite is used only to ADD detections: the leakage check still runs on
 * the original text first, and the rewritten text is checked in addition.
 *
 * rev3 (review r2, integrator direction): fail-safe. Every number word that
 * has a value is rewritten, wherever it appears: there is no pronoun, count,
 * coin or answer-context exception, so a number word is rejected exactly when
 * the same numeral would be. "each one" becomes "each 1", "the two
 * quantities" becomes "the 2 quantities", "eight quarters" becomes 8/4 and a
 * bare "half" becomes 1/2. The resulting extra fallbacks are accepted.
 *
 * Canonicalization (canonicalizeCase / canonicalizeText): Unicode vulgar
 * fractions are expanded with a boundary first ("1⅔" -> "1 2/3", never
 * "12/3"), then NFKC; soft hyphens and zero-width characters are removed;
 * Unicode dashes and the fraction slash become ASCII; every whitespace run
 * becomes one space. Words of one number may be joined by " ", "-" or " - ";
 * other punctuation ends the number.
 *
 * Values are exact: fractions and mixed numbers are written as integer
 * ratios ("one and two thirds" -> "5/3", "3 3/4" -> "15/4"), never as
 * floating-point decimals.
 *
 * Forms: cardinals (zero to nineteen, tens, hundred, thousand, million, "a
 * hundred", "a dozen", "N dozen"), unary "negative"/"minus" signs (rev4,
 * review r3 finding 3) before cardinal words, article and bare fraction
 * words ("negative a quarter", "negative quarter", "minus half") and
 * numeral operands, including decimals, fractions and mixed or Unicode mixed
 * numbers ("negative 1⅔" -> -5/3, "minus 1/2" -> -1/2); "minus" directly after
 * a number or closing bracket stays a subtraction ("nine minus four", "9 minus
 * 4"), as the digit path reads "9 - 4"; "N point D D" decimals, fractions ("two
 * thirds", "three fifth", "one half", "a third", "half", "two over three",
 * "one twenty-fifth"), signed fractions ("negative half", "minus a third"),
 * and mixed numbers ("N and a half", "N and M <denominators>", "N and M/D",
 * "N M/D").
 *
 * Only constructions that carry no single number are left as written: a
 * compound ordinal ("twenty-fifth", "twenty-first": the digit path's "25th"
 * is not a quantity either) and scale words out of order ("one thousand
 * million").
 */

const UNITS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

const TEENS: Record<string, number> = {
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALES: Record<string, number> = { thousand: 1_000, million: 1_000_000 };

// Fraction words, singular and plural. "second" is deliberately absent: "two
// seconds" is a time, not a fraction.
const DENOMINATORS: Record<string, number> = {
  half: 2,
  halves: 2,
  third: 3,
  thirds: 3,
  fourth: 4,
  fourths: 4,
  quarter: 4,
  quarters: 4,
  fifth: 5,
  fifths: 5,
  sixth: 6,
  sixths: 6,
  seventh: 7,
  sevenths: 7,
  eighth: 8,
  eighths: 8,
  ninth: 9,
  ninths: 9,
  tenth: 10,
  tenths: 10,
  twelfth: 12,
  twelfths: 12,
  hundredth: 100,
  hundredths: 100,
  thousandth: 1000,
  thousandths: 1000,
};

// Unit ordinals that end a compound ordinal ("twenty-first", "thirty-fifth").
const UNIT_ORDINALS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  firsts: 1,
  seconds: 2,
  thirds: 3,
  fourths: 4,
  fifths: 5,
  sixths: 6,
  sevenths: 7,
  eighths: 8,
  ninths: 9,
};

// Ordinal words, read as the digit path reads "3rd" or "25th".
const ORDINALS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
  eleventh: 11,
  twelfth: 12,
  thirteenth: 13,
  fourteenth: 14,
  fifteenth: 15,
  sixteenth: 16,
  seventeenth: 17,
  eighteenth: 18,
  nineteenth: 19,
  twentieth: 20,
  thirtieth: 30,
  fortieth: 40,
  fiftieth: 50,
  sixtieth: 60,
  seventieth: 70,
  eightieth: 80,
  ninetieth: 90,
  hundredth: 100,
};

/**
 * Every word this parser reads as part of a number (SU-H7-FIX2 rev5, review r4
 * finding 2). The Science structural contract builds its numeric vocabulary
 * from this set, so a word the parser supports can never be missing there.
 */
export const NUMBER_WORD_VOCABULARY: ReadonlySet<string> = new Set([
  ...Object.keys(UNITS),
  ...Object.keys(TEENS),
  ...Object.keys(TENS),
  ...Object.keys(SCALES),
  'hundred',
  'dozen',
  ...Object.keys(DENOMINATORS),
  ...Object.keys(UNIT_ORDINALS),
  ...Object.keys(ORDINALS),
]);

function ordinalNumeral(value: number): string {
  const lastTwo = value % 100;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13
      ? 'th'
      : value % 10 === 1
        ? 'st'
        : value % 10 === 2
          ? 'nd'
          : value % 10 === 3
            ? 'rd'
            : 'th';
  return `${value}${suffix}`;
}

const VULGAR_FRACTIONS: Record<string, string> = {
  '\u00BC': '1/4',
  '\u00BD': '1/2',
  '\u00BE': '3/4',
  '\u2150': '1/7',
  '\u2151': '1/9',
  '\u2152': '1/10',
  '\u2153': '1/3',
  '\u2154': '2/3',
  '\u2155': '1/5',
  '\u2156': '2/5',
  '\u2157': '3/5',
  '\u2158': '4/5',
  '\u2159': '1/6',
  '\u215A': '5/6',
  '\u215B': '1/8',
  '\u215C': '3/8',
  '\u215D': '5/8',
  '\u215E': '7/8',
  '\u2189': '0/3',
};

/** NFKC with vulgar fractions expanded, invisible characters removed, ASCII dashes, one space per run. */
export function canonicalizeCase(text: string): string {
  return text
    .replace(/[\u00BC-\u00BE\u2150-\u215E\u2189]/gu, (glyph) => ` ${VULGAR_FRACTIONS[glyph]}`)
    .normalize('NFKC')
    .replace(/[\u00AD\u200B-\u200D\u2060\uFEFF]/gu, '')
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/gu, '-')
    .replace(/[\u2044\u2215]/gu, '/')
    .replace(/[\u2018\u2019\u02BC]/gu, "'")
    .replace(/[\s\u00A0\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]+/gu, ' ');
}

/** canonicalizeCase, then lower case. */
export function canonicalizeText(text: string): string {
  return canonicalizeCase(text).toLocaleLowerCase();
}

type Kind = 'unit' | 'teen' | 'tens' | 'hundred' | 'scale';

function kindOf(word: string): Kind | undefined {
  if (word in UNITS) return 'unit';
  if (word in TEENS) return 'teen';
  if (word in TENS) return 'tens';
  if (word === 'hundred') return 'hundred';
  if (word in SCALES) return 'scale';
  return undefined;
}

function isCountWord(word: string | undefined): boolean {
  const kind = word === undefined ? undefined : kindOf(word);
  return kind === 'unit' || kind === 'teen' || kind === 'tens';
}

interface Piece {
  text: string;
  word: boolean;
}

function split(text: string): Piece[] {
  return (text.match(/[a-z]+|[^a-z]+/gu) ?? []).map((part) => ({
    text: part,
    word: /^[a-z]/u.test(part),
  }));
}

/** Index of the next word piece if only " ", "-" or " - " separates them. */
function nextWord(pieces: readonly Piece[], index: number): number | undefined {
  const separator = pieces[index + 1];
  const candidate = pieces[index + 2];
  if (!separator || !candidate || separator.word || !candidate.word) return undefined;
  return /^(?: |-| - )$/u.test(separator.text) ? index + 2 : undefined;
}

function previousWord(pieces: readonly Piece[], index: number): string | undefined {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (pieces[cursor].word) return pieces[cursor].text;
    if (!/^\s*$/u.test(pieces[cursor].text)) return undefined;
  }
  return undefined;
}

type Cardinal =
  { kind: 'number'; value: number; end: number; last: Kind } | { kind: 'unsupported'; end: number };

/** Parses one cardinal starting at word piece `start`; undefined if it is not one. */
function parseCardinal(pieces: readonly Piece[], start: number): Cardinal | undefined {
  let total = 0;
  let current = 0;
  let last: Kind | undefined;
  let lastScale = Number.POSITIVE_INFINITY;
  let end = -1;
  let index: number | undefined = start;
  let leadingA = false;

  if (pieces[start].text === 'a') {
    const following = nextWord(pieces, start);
    const kind = following === undefined ? undefined : kindOf(pieces[following].text);
    if (kind !== 'hundred' && kind !== 'scale') return undefined;
    leadingA = true;
    index = following;
  }

  while (index !== undefined) {
    const word = pieces[index].text;
    const kind = kindOf(word);
    if (!kind) break;
    if (kind === 'unit') {
      if (last === 'unit' || last === 'teen') break;
      current += UNITS[word];
    } else if (kind === 'teen') {
      if (last === 'unit' || last === 'teen' || last === 'tens') break;
      current += TEENS[word];
    } else if (kind === 'tens') {
      if (last === 'unit' || last === 'teen' || last === 'tens') break;
      current += TENS[word];
    } else if (kind === 'hundred') {
      if (last === 'hundred') break;
      // A bare "hundred" with no count before it is not a number here.
      if (last === undefined && !leadingA) return undefined;
      if (last === 'scale' || current >= 100) return { kind: 'unsupported', end: index };
      current = (current === 0 ? 1 : current) * 100;
    } else {
      if (last === undefined && !leadingA) return undefined;
      if (SCALES[word] >= lastScale) {
        // "one thousand million": a larger scale multiplies everything before
        // it (1,000 x 1,000,000), as English reads it.
        total = (total + current) * SCALES[word];
      } else {
        total += (current === 0 ? 1 : current) * SCALES[word];
      }
      current = 0;
      lastScale = SCALES[word];
    }
    last = kind;
    end = index;

    let following = nextWord(pieces, index);
    if (
      following !== undefined &&
      pieces[following].text === 'and' &&
      (last === 'hundred' || last === 'scale')
    ) {
      const afterAnd = nextWord(pieces, following);
      following =
        afterAnd !== undefined && isCountWord(pieces[afterAnd].text) ? afterAnd : undefined;
    }
    index = following;
  }

  if (end < 0 || last === undefined) return undefined;
  return { kind: 'number', value: total + current, end, last };
}

/** Denominator read after a count: "thirds", "fifth", "twenty-fifths". */
function denominatorAt(
  pieces: readonly Piece[],
  index: number,
): { denominator: number; end: number } | undefined {
  const word = pieces[index]?.text;
  if (word === undefined) return undefined;
  if (word in DENOMINATORS) return { denominator: DENOMINATORS[word], end: index };
  // "one twenty-fifth": a compound ordinal after a count is a denominator.
  if (word in TENS) {
    const following = nextWord(pieces, index);
    const ordinal = following === undefined ? undefined : pieces[following].text;
    if (ordinal !== undefined && ordinal in UNIT_ORDINALS) {
      return { denominator: TENS[word] + UNIT_ORDINALS[ordinal], end: following! };
    }
  }
  return undefined;
}

interface Rational {
  numerator: number;
  denominator: number;
}

/** A fraction starting at word piece `index`: "a half", "half", "two thirds". */
function fractionAt(
  pieces: readonly Piece[],
  index: number,
): { value: Rational; end: number } | undefined {
  const word = pieces[index]?.text;
  if (word === 'a') {
    const following = nextWord(pieces, index);
    const denominator = following === undefined ? undefined : denominatorAt(pieces, following);
    if (denominator && pieces[following!].text in DENOMINATORS) {
      return {
        value: { numerator: 1, denominator: denominator.denominator },
        end: denominator.end,
      };
    }
    return undefined;
  }
  if (word === 'half') return { value: { numerator: 1, denominator: 2 }, end: index };
  const cardinal = parseCardinal(pieces, index);
  if (!cardinal || cardinal.kind !== 'number') return undefined;
  const following = nextWord(pieces, cardinal.end);
  const denominator = following === undefined ? undefined : denominatorAt(pieces, following);
  if (!denominator) return undefined;
  return {
    value: { numerator: cardinal.value, denominator: denominator.denominator },
    end: denominator.end,
  };
}

function raw(pieces: readonly Piece[], from: number, to: number): string {
  return pieces
    .slice(from, to + 1)
    .map((piece) => piece.text)
    .join('');
}

/** True when the word at `index` directly follows a number ("nine minus", "9 minus"). */
function followsNumber(pieces: readonly Piece[], index: number): boolean {
  const before = pieces[index - 1];
  if (!before) return false;
  if (!before.word && /\d\s*$/u.test(before.text)) return true;
  const previous = previousWord(pieces, index);
  return previous !== undefined && (kindOf(previous) !== undefined || previous in DENOMINATORS);
}

function digitsAfterPoint(
  pieces: readonly Piece[],
  pointIndex: number,
): { digits: string; end: number } | undefined {
  let digits = '';
  let end = pointIndex;
  let index = nextWord(pieces, pointIndex);
  while (index !== undefined && pieces[index].text in UNITS) {
    digits += String(UNITS[pieces[index].text]);
    end = index;
    index = nextWord(pieces, index);
  }
  return digits ? { digits, end } : undefined;
}

const ratio = (sign: string, value: Rational) =>
  value.denominator === 1
    ? `${sign}${value.numerator}`
    : `${sign}${value.numerator}/${value.denominator}`;

/** A mixed number as an exact improper fraction: 1 and 2/3 -> 5/3. */
const mixed = (whole: number, part: Rational): Rational => ({
  numerator: whole * part.denominator + part.numerator,
  denominator: part.denominator,
});

/**
 * Numeral forms after rewriting, folded exactly: "3 and 3/4" and "3 3/4" ->
 * 15/4, "2 over 3" -> 2/3, "2-to-3" -> "2 to 3".
 */
function foldNumeralForms(text: string): string {
  const folded = text
    .replace(/(\d) over (\d)/gu, '$1/$2')
    .replace(/(\d)-to-(\d)/gu, '$1 to $2')
    .replace(
      /(^|[^\d./-])(-?)(\d+) (?:and )?(\d+)\/(\d+)(?![\d/])/gu,
      (match, before: string, sign: string, whole: string, top: string, bottom: string) => {
        const denominator = Number(bottom);
        if (denominator === 0) return match;
        const value = mixed(Number(whole), { numerator: Number(top), denominator });
        return `${before}${ratio(sign, value)}`;
      },
    );
  // Unary "negative"/"minus" before a numeral operand (integer, decimal,
  // fraction or folded mixed number): "negative 5/3" -> "-5/3". After a
  // number or a closing bracket "minus" is subtraction ("9 minus 4"), as
  // the digit path reads "9 - 4".
  return folded.replace(/\b(negative|minus) (?=\d)/gu, (match, word: string, offset: number) => {
    const preceding = folded.slice(0, offset).trimEnd();
    if (word === 'minus' && /[\d)\]]$/u.test(preceding)) return match;
    return '-';
  });
}

export interface NumberWordOptions {
  /**
   * false: a count before a fraction word stays a count ("eight quarters" ->
   * "8 quarters"). The leakage check runs both readings, so a count of coins
   * and an improper fraction are each protected; neither hides the other.
   */
  fractions?: boolean;
  /**
   * false: a standalone ordinal stays a word. The leakage check runs this
   * reading too, so an ordinal turned into a numeral can never hide a match
   * that depends on the other numbers in the text.
   */
  ordinals?: boolean;
}

/** Rewrites every number word in `text` as a numeral (see file comment). */
export function normalizeNumberWords(text: string, options: NumberWordOptions = {}): string {
  const fractions = options.fractions !== false;
  const ordinals = options.ordinals !== false;
  const pieces = split(canonicalizeText(text));
  const out: string[] = [];
  let index = 0;
  while (index < pieces.length) {
    const piece = pieces[index];
    if (!piece.word) {
      out.push(piece.text);
      index += 1;
      continue;
    }

    let sign = '';
    let start = index;
    if (piece.text === 'negative' || (piece.text === 'minus' && !followsNumber(pieces, index))) {
      const following = nextWord(pieces, index);
      if (following !== undefined) {
        const word = pieces[following].text;
        if (word === 'a' || word in DENOMINATORS || kindOf(word)) {
          sign = '-';
          start = following;
        }
      }
    }

    const startWord = pieces[start].text;
    if (startWord === 'a' || startWord === 'half') {
      const dozen = startWord === 'a' ? nextWord(pieces, start) : undefined;
      if (dozen !== undefined && pieces[dozen].text === 'dozen') {
        out.push(`${sign}12`);
        index = dozen + 1;
        continue;
      }
      const fraction = fractionAt(pieces, start);
      if (fraction) {
        out.push(ratio(sign, fraction.value));
        index = fraction.end + 1;
        continue;
      }
    }

    // A bare "quarter" is 1/4; a signed bare fraction word ("negative
    // quarter", "minus third") is minus one part.
    if (
      (sign === '' && piece.text === 'quarter') ||
      (sign === '-' && startWord in DENOMINATORS && !startWord.endsWith('s'))
    ) {
      out.push(ratio(sign, { numerator: 1, denominator: DENOMINATORS[startWord] }));
      index = start + 1;
      continue;
    }
    // A standalone ordinal ("the third step") reads as "3rd", exactly as the
    // digit path reads it. After a number it is a unit or a fraction word
    // ("one second", "two thirds"), handled with that number.
    if (ordinals && sign === '' && piece.text in ORDINALS && !followsNumber(pieces, index)) {
      out.push(ordinalNumeral(ORDINALS[piece.text]));
      index += 1;
      continue;
    }

    const parsed = parseCardinal(pieces, start);
    if (!parsed) {
      out.push(piece.text);
      index += 1;
      continue;
    }
    if (parsed.kind === 'unsupported') {
      out.push(raw(pieces, index, parsed.end));
      index = parsed.end + 1;
      continue;
    }

    let numeral = `${sign}${parsed.value}`;
    let end = parsed.end;
    const following = nextWord(pieces, end);
    const followingWord = following === undefined ? undefined : pieces[following].text;

    // "twenty-fifth", "thirty-first": a compound ordinal, read as "25th".
    if (
      parsed.last === 'tens' &&
      followingWord !== undefined &&
      followingWord in ORDINALS &&
      ORDINALS[followingWord] < 10 &&
      pieces[following! - 1].text === '-'
    ) {
      out.push(`${sign}${ordinalNumeral(parsed.value + ORDINALS[followingWord])}`);
      index = following! + 1;
      continue;
    }

    const denominator =
      following === undefined || !fractions ? undefined : denominatorAt(pieces, following);
    if (followingWord === 'dozen') {
      numeral = `${sign}${parsed.value * 12}`;
      end = following!;
    } else if (followingWord === 'over') {
      const overIndex = nextWord(pieces, following!);
      const over = overIndex === undefined ? undefined : parseCardinal(pieces, overIndex);
      if (over?.kind === 'number' && over.value !== 0) {
        numeral = ratio(sign, { numerator: parsed.value, denominator: over.value });
        end = over.end;
      }
    } else if (denominator) {
      numeral = ratio(sign, { numerator: parsed.value, denominator: denominator.denominator });
      end = denominator.end;
    } else if (followingWord === 'point') {
      const decimal = digitsAfterPoint(pieces, following!);
      if (decimal) {
        numeral = `${sign}${parsed.value}.${decimal.digits}`;
        end = decimal.end;
      }
    } else if (followingWord === 'and') {
      const afterAnd = nextWord(pieces, following!);
      const part = afterAnd === undefined ? undefined : fractionAt(pieces, afterAnd);
      if (part) {
        numeral = ratio(sign, mixed(parsed.value, part.value));
        end = part.end;
      }
    }

    out.push(numeral);
    index = end + 1;
  }
  return foldNumeralForms(out.join(''));
}
