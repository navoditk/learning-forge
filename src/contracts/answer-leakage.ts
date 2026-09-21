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

/** Detects literal or simple equivalent numeric answer forms in tutor text. */
export function containsProtectedAnswer(text: string, protectedTokens: readonly string[]): boolean {
  const normalizedText = text.toLocaleLowerCase();
  return protectedTokens.some((token) => {
    const normalizedToken = token.trim().toLocaleLowerCase();
    if (!normalizedToken) return false;
    if (normalizedText.includes(normalizedToken)) return true;
    return equivalentNumericValue(normalizedToken, normalizedText);
  });
}
