import { normalizeNumberWords } from './number-words';

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?/gu;
const FRACTION_PATTERN = /(-?\d+)\s*\/\s*(-?\d+)/u;
const RATIO_PATTERN = /(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)/u;

function numbers(value: string): number[] {
  return [...value.matchAll(NUMBER_PATTERN)].map((match) => Number(match[0]));
}

function equivalentNumericValue(left: string, right: string): boolean {
  const leftFraction = left.match(FRACTION_PATTERN);
  const rightFraction = right.match(FRACTION_PATTERN);
  if (leftFraction || rightFraction) {
    const leftValues = leftFraction
      ? [Number(leftFraction[1]) / Number(leftFraction[2])]
      : numbers(left);
    const rightValues = rightFraction
      ? [Number(rightFraction[1]) / Number(rightFraction[2])]
      : numbers(right);
    return leftValues.length === 1 && rightValues.length === 1 && leftValues[0] === rightValues[0];
  }

  const leftRatio = left.match(RATIO_PATTERN);
  const rightRatio = right.match(RATIO_PATTERN);
  if (leftRatio || rightRatio) {
    const leftValues = leftRatio ? [Number(leftRatio[1]), Number(leftRatio[2])] : numbers(left);
    const rightValues = rightRatio
      ? [Number(rightRatio[1]), Number(rightRatio[2])]
      : numbers(right);
    return (
      leftValues.length === 2 &&
      rightValues.length === 2 &&
      leftValues[0] * rightValues[1] === rightValues[0] * leftValues[1]
    );
  }

  const leftValues = numbers(left);
  const rightValues = numbers(right);
  return leftValues.length === 1 && rightValues.length === 1 && leftValues[0] === rightValues[0];
}

function matchesToken(normalizedText: string, normalizedToken: string): boolean {
  if (normalizedText.includes(normalizedToken)) return true;
  return equivalentNumericValue(normalizedToken, normalizedText);
}

// SU-H7-FIX2 rev3: exact equivalence for the rewritten passes. The same
// three branches as equivalentNumericValue (fraction, ratio, single number),
// but every value is an exact rational (integer numerator and denominator,
// compared by cross-multiplication), so 5/3 and "1 and 2/3" (written 5/3)
// agree and no floating-point rounding can hide a match.
interface Exact {
  numerator: bigint;
  denominator: bigint;
}

function exact(value: string): Exact {
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace(/^-/u, '').split('.');
  const denominator = BigInt(`1${'0'.repeat(fraction.length)}`);
  const numerator = BigInt(whole + fraction);
  return { numerator: negative ? -numerator : numerator, denominator };
}

function divide(top: Exact, bottom: Exact): Exact | undefined {
  if (bottom.numerator === BigInt(0)) return undefined;
  return {
    numerator: top.numerator * bottom.denominator,
    denominator: top.denominator * bottom.numerator,
  };
}

function same(left: Exact, right: Exact): boolean {
  return left.numerator * right.denominator === right.numerator * left.denominator;
}

function times(left: Exact, right: Exact): Exact {
  return {
    numerator: left.numerator * right.numerator,
    denominator: left.denominator * right.denominator,
  };
}

function exactNumbers(value: string): Exact[] {
  return [...value.matchAll(NUMBER_PATTERN)].map((match) => exact(match[0]));
}

function exactEquivalent(left: string, right: string): boolean {
  const leftFraction = left.match(FRACTION_PATTERN);
  const rightFraction = right.match(FRACTION_PATTERN);
  if (leftFraction || rightFraction) {
    const leftValues = leftFraction
      ? [divide(exact(leftFraction[1]), exact(leftFraction[2]))]
      : exactNumbers(left);
    const rightValues = rightFraction
      ? [divide(exact(rightFraction[1]), exact(rightFraction[2]))]
      : exactNumbers(right);
    const [a] = leftValues;
    const [b] = rightValues;
    return leftValues.length === 1 && rightValues.length === 1 && !!a && !!b && same(a, b);
  }

  const leftRatio = left.match(RATIO_PATTERN);
  const rightRatio = right.match(RATIO_PATTERN);
  if (leftRatio || rightRatio) {
    const leftValues = leftRatio ? [exact(leftRatio[1]), exact(leftRatio[2])] : exactNumbers(left);
    const rightValues = rightRatio
      ? [exact(rightRatio[1]), exact(rightRatio[2])]
      : exactNumbers(right);
    return (
      leftValues.length === 2 &&
      rightValues.length === 2 &&
      same(times(leftValues[0], rightValues[1]), times(rightValues[0], leftValues[1]))
    );
  }

  const leftValues = exactNumbers(left);
  const rightValues = exactNumbers(right);
  return leftValues.length === 1 && rightValues.length === 1 && same(leftValues[0], rightValues[0]);
}

function matchesExactly(text: string, token: string): boolean {
  return text.includes(token) || exactEquivalent(token, text);
}

function sentences(text: string): string[] {
  return text.split(/[!?;]|\.(?!\d)/u).filter((sentence) => sentence.trim().length > 0);
}

/**
 * Detects literal or simple equivalent numeric answer forms in tutor text.
 *
 * SU-H7-FIX2 rev3: the original check runs unchanged on the original text
 * first. Then text and token are canonicalized and every number word is
 * rewritten as a numeral (number-words.ts, no exceptions), and the same
 * literal and equivalence check runs again with exact rational arithmetic,
 * on the whole text and on each sentence, under each reading (full rewrite;
 * a count before a fraction word read as a count; ordinals left as words). Every added pass can only add a
 * detection, so nothing the original check finds can be lost.
 */
export function containsProtectedAnswer(text: string, protectedTokens: readonly string[]): boolean {
  const normalizedText = text.toLocaleLowerCase();
  // Several readings, any one matching is a detection: the full rewrite;
  // "N <fraction word>" as a count ("8 quarters") rather than a fraction
  // (8/4); and ordinals left as words.
  const readings = [{}, { fractions: false }, { ordinals: false }].map((options) => {
    const rewritten = normalizeNumberWords(text, options);
    return { options, texts: [rewritten, ...sentences(rewritten)] };
  });
  return protectedTokens.some((token) => {
    const normalizedToken = token.trim().toLocaleLowerCase();
    if (!normalizedToken) return false;
    if (matchesToken(normalizedText, normalizedToken)) return true;
    return readings.some(({ options, texts }) => {
      const rewrittenToken = normalizeNumberWords(token, options).trim();
      return rewrittenToken.length > 0 && texts.some((t) => matchesExactly(t, rewrittenToken));
    });
  });
}
