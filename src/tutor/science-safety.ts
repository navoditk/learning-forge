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

/**
 * SU-H7-FIX2 (D-278): the second paid run gave the answer family away inside
 * a question ("What would a thick, stiff layer be good at protecting or
 * supporting?"). Science answers are option labels naming a job or result, so
 * the model is told not to name, suggest or presuppose one, even as a
 * question or a list of guesses. Placed before the redirect guidance and the
 * D-189 rule, which stay unchanged and last. The deterministic backstop is
 * the answer-word check in src/contracts/semantic-leakage.ts.
 */
export const SCIENCE_ANSWER_FAMILY_RULE =
  'Never name, suggest, or presuppose the job, function, result, or answer the learner must choose, not even inside a question, a list of choices, or a guess: asking what a part would be "good at" doing a particular job still gives that job away. Ask only about the features, data, or words the problem already gives, and leave naming the job or result to the learner.';

/**
 * SU-H7-FIX2 rev4 (D-281): asks the model to phrase Science hints so they
 * satisfy the structural contract in src/contracts/science-structure.ts,
 * which rejects every standalone letter (including "a" and "I"), every
 * number, number word, fraction or position word, and every labelled
 * identifier, including the joined plurals "cells", "samples" and the like
 * (rev5). Placed after the answer-family rule and before the redirect
 * guidance and the D-189 rule, which stay unchanged and last.
 */
export const SCIENCE_STRUCTURE_RULE =
  'Write tutorMessage and question without any single letter standing alone as a word, so never use the words "a" or "I" (say "the", "this", "each", "any" or "some" instead); without any digit, number word, fraction or position word such as one, two, half, first, second or last; without naming, numbering, lettering or listing the answer choices or any labelled sample, cell, example, run, option or letter; and without the plural words cells, samples, examples, options, choices, letters or runs (say "these units", "the pictures", "the descriptions" or "living things" instead). Describe features and evidence in plain words instead, for example "the layer with small gates".';
