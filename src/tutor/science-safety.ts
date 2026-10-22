/**
 * Grade 6 Science tutor framing (SU-E4, D-189 option b).
 *
 * The pattern list is a finite check, not comprehensive enforcement of D-171:
 * it catches only model replies containing one of these case-insensitive,
 * word-bounded expressions. Unlisted hands-on procedures are not detected; the
 * other defenses are the prompt rule below and human reading of real-eval text.
 */
export const SCIENCE_PROHIBITED_ACTIVITY_PATTERNS: readonly RegExp[] = [
  /\bmicroscopes?\b/i,
  /\bspecimens?\b/i,
  /\bscrap(e|es|ed|ing)\b/i,
  /\bswabs?\b/i,
  /\bcheek\b/i,
  /\bpond\b/i,
  /\bcut(s|ting)?\b/i,
  /\bknife\b/i,
  /\bknives\b/i,
  /\bscalpels?\b/i,
  /\bdissect\w*/i,
  /\biodine\b/i,
  /\bstain(s|ed|ing)?\b/i,
  /\bbleach\b/i,
  /\bchemicals\b/i,
  /\bat home\b/i,
  /\bexperiment(s|ed|ing)?\b/i,
];

export const SCIENCE_FALLBACK_MESSAGE =
  'Let’s look at the model in the problem again. What does it tell you about this part?';

export const SCIENCE_VIRTUAL_ACTIVITY_RULE =
  'This is a virtual activity that uses only the information provided in the problem. Never suggest or describe hands-on procedures: collecting or handling specimens or living things, using a microscope or other equipment, using chemicals, cutting anything, or trying an experiment at home. If the learner asks for one, kindly redirect them to the model or data in the problem.';
