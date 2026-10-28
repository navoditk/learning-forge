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

/**
 * SU-H7-FIX: prompt guidance placed before the D-189 rule above (which is
 * unchanged). The first paid run fell back when the learner asked to cut open
 * a leaf; a redirect that names the requested activity ("we can't cut open a
 * leaf") is rejected by the finite pattern list, by design, because a word
 * list cannot tell a refusal from a suggestion. The model is therefore asked
 * not to name the activity at all. This adds a constraint; it relaxes no check and does
 * not touch the needs_human_review instruction.
 */
export const SCIENCE_REDIRECT_GUIDANCE =
  'When you redirect a request for a hands-on activity, do not name, repeat, or describe that activity; just point the learner back to the model or data in the problem.';
