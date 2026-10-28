/**
 * SU-H7-FIX: detects tutor text that repeats the learner's own message.
 *
 * The first paid Science-framing run showed the model copying the learner's
 * sentence verbatim into the tutor's message field ("I tried dividing, but I
 * am unsure what the result means."). Echoed learner text is shown to the
 * learner as if the tutor said it, can carry injected instructions or answer
 * forms back into tutor output, and is never a useful tutoring move.
 *
 * The check is word-based and deterministic: it rejects the tutor text when it
 * contains any run of ECHO_WINDOW consecutive words from the learner message
 * (or the whole message when it is shorter), ignoring case and punctuation.
 * Word runs that also appear in the problem prompt are allowed, because both
 * the learner and the tutor may legitimately quote the problem. Learner
 * messages shorter than MIN_ECHO_WORDS words are not checked.
 *
 * This check only ever adds a rejection; it never makes any other check pass.
 */
export const ECHO_WINDOW = 5;
export const MIN_ECHO_WORDS = 4;

function words(value: string): string[] {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[‘’ʼ]/gu, "'")
    .split(/[^\p{L}\p{N}']+/u)
    .map((word) => word.replace(/^'+|'+$/gu, ''))
    .filter((word) => word.length > 0);
}

function joined(list: readonly string[]): string {
  return ` ${list.join(' ')} `;
}

export function echoesLearnerMessage(
  tutorText: string,
  learnerMessage: string,
  problemPrompt = '',
): boolean {
  const learner = words(learnerMessage);
  if (learner.length < MIN_ECHO_WORDS) return false;
  const size = Math.min(ECHO_WINDOW, learner.length);
  const tutor = joined(words(tutorText));
  const prompt = joined(words(problemPrompt));
  for (let start = 0; start + size <= learner.length; start += 1) {
    const run = joined(learner.slice(start, start + size));
    if (tutor.includes(run) && !prompt.includes(run)) return true;
  }
  return false;
}
