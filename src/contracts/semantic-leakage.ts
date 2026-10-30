/**
 * SU-H7-FIX2 (D-278): conservative content-word check for Science answers.
 *
 * The literal check in answer-leakage.ts only finds a protected answer or
 * leakage pattern as a whole phrase. The second paid Science run showed the
 * model giving the answer family away inside a question ("What would a thick,
 * stiff layer be good at protecting or supporting?" for the answer "Gives the
 * cell support and shape"; "what those gates might control" for "Controls
 * what enters and leaves the cell").
 *
 * Science answers are choice-option labels (the canonical answer is the
 * correct option label, sometimes prefixed by the field label, and every
 * forbidden leakage pattern is part of a correct label; see
 * validateScienceContentRules). This check takes the content words of those
 * protected strings, removes stop words, generic tutoring/question words and
 * every word the problem prompt already gives, and stems what remains. The
 * tutor text is rejected when it contains any of those remaining stems, in any
 * inflection ("support", "supporting", "supported").
 *
 * Words the problem already gives never count, so a hint may reuse the
 * model's own description ("thick", "stiff", "gates", "boundary"). A single
 * remaining answer word is enough: in run 2 one word ("supporting",
 * "control") carried the disclosure. This is deliberately conservative and
 * has false positives (see the SU-H7-FIX2 self-audit); a rejection only
 * produces a retry and then the scripted Science fallback.
 *
 * The check only ever adds a rejection; it never makes any other check pass.
 */

// Function words, plus generic verbs, quantifiers and tutoring/question
// words that carry no answer content ("give", "make", "whole", "problem").
const STOP_WORDS = new Set(
  `a about above after again against all also an and any are as at be because been before being
  below between both but by can could did do does doing down during each either else every few
  for from further had has have having he her here hers him his how i if in into is it its itself
  just let lets like may me might more most much must my no nor not now of off on once only or
  other our ours out over own per same she should so some such than that the their them then
  there these they this those through to too under until up upon us very was we were what when
  where which while who whom whose why will with within without would you your yours
  get gets got give gives given giving make makes made making take takes took use uses used using
  go goes went come comes came put puts see sees saw look looks find finds help helps keep keeps
  think know show shows tell tells say says try tries work works thing things way ways
  whole entire many several one two three four five six seven eight nine ten
  job jobs answer answers option options choice choices problem problems question questions
  part parts`
    .split(/\s+/u)
    .filter((word) => word.length > 0),
);

const MIN_STEM_LENGTH = 3;

function words(value: string): string[] {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[‘’ʼ]/gu, "'")
    .replace(/'s\b/gu, '')
    .split(/[^\p{L}]+/u)
    .filter((word) => word.length > 0);
}

const DOUBLE_CONSONANT = /([b-df-hj-np-tv-z])\1$/u;

/**
 * Light suffix stemmer (lower-case input): enough to join the inflections a
 * tutor uses ("controls/controlled/controlling", "shape/shaped/shaping",
 * "supports/supporting/supportive", "protection/protect"). Not a full Porter
 * stemmer; unrelated words that share a stem are accepted false positives.
 */
export function stemWord(input: string): string {
  let word = input;
  const strip = (suffix: string, minimumRemaining: number): boolean => {
    if (word.endsWith(suffix) && word.length - suffix.length >= minimumRemaining) {
      word = word.slice(0, -suffix.length);
      return true;
    }
    return false;
  };

  if (word.endsWith('ies') && word.length > 4) word = `${word.slice(0, -3)}y`;
  else if (/(sses|shes|ches|xes|zes)$/u.test(word)) word = word.slice(0, -2);
  else if (word.endsWith('s') && !/(ss|us|is)$/u.test(word) && word.length > 3) {
    word = word.slice(0, -1);
  }

  if (strip('ingly', 3) || strip('edly', 3)) {
    // handled
  } else if (strip('ing', 3) || strip('ed', 3)) {
    // handled
  } else if (strip('ive', 4) || strip('ly', 4) || strip('ment', 4)) {
    // handled
  } else if (word.endsWith('tion') && word.length > 6) {
    word = word.slice(0, -3);
  }

  if (word.endsWith('e') && word.length > MIN_STEM_LENGTH) word = word.slice(0, -1);
  // Any final double consonant is reduced, so "control"/"controlling",
  // "pass"/"passing" and "stop"/"stopped" share one stem.
  if (DOUBLE_CONSONANT.test(word) && word.length > MIN_STEM_LENGTH) word = word.slice(0, -1);
  return word;
}

function stems(value: string): Set<string> {
  const result = new Set<string>();
  for (const word of words(value)) {
    if (STOP_WORDS.has(word)) continue;
    const stem = stemWord(word);
    if (stem.length >= MIN_STEM_LENGTH) result.add(stem);
  }
  return result;
}

/**
 * The stems the tutor text must not contain: content words of the protected
 * answer strings that the problem prompt does not already give.
 */
export function protectedAnswerStems(
  protectedTokens: readonly string[],
  problemPrompt: string,
): Set<string> {
  const given = new Set<string>();
  for (const word of words(problemPrompt)) {
    given.add(word);
    given.add(stemWord(word));
  }
  const result = new Set<string>();
  for (const token of protectedTokens) {
    for (const stem of stems(token)) {
      if (!given.has(stem)) result.add(stem);
    }
  }
  return result;
}

/**
 * True when the tutor text uses a content word of the protected answer that
 * the problem prompt does not already give.
 */
export function sharesProtectedAnswerWord(
  text: string,
  protectedTokens: readonly string[],
  problemPrompt: string,
): boolean {
  const protectedStems = protectedAnswerStems(protectedTokens, problemPrompt);
  if (protectedStems.size === 0) return false;
  for (const stem of stems(text)) {
    if (protectedStems.has(stem)) return true;
  }
  return false;
}
