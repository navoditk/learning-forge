/**
 * SCI6-STRUCT-DIAG (D-291): synthetic Grade 6 Science tutor phrasing corpus
 * for the proposed narrowing of the D-281 numeric rule.
 *
 * All sentences are original and synthetic; none is taken from any item
 * bank (public or private). Every case is a generated cross-product of the
 * fixed tables below. The corpus is frozen by version, per-class counts and
 * the SHA-256 of its JSON serialization (science-structure-narrowing.test.ts).
 *
 * v2 (rev2, Codex review r1): E4 and E7 are withdrawn, so their phrasing
 * moves to residual_numeric; E5 is narrowed to "Let's first"; E6 is limited
 * to sentence starts. Added classes:
 * - benign_variant: every exempt benign sentence under casing, full-width,
 *   zero-width, Unicode punctuation and no-break-space transforms;
 * - benign_sequencing: sequencing controls with no numeric word;
 * - exemption_adversarial now crosses every attack core (including every
 *   review r1 example) with the same transforms and with every field split.
 *
 * Classes:
 * - benign_*: phrasing the narrowing must accept (expected "validate");
 * - exemption_adversarial: option or position references built from, or
 *   near, the exempt constructions (expected "reject");
 * - residual_numeric: benign phrasing deliberately still rejected (expected
 *   "reject"; accepted over-rejection);
 * - plural_alias: benign plurals still rejected by the unchanged alias rule.
 */

export const BENIGN_CORPUS_VERSION = 'sci6-struct-diag-benign-corpus-v2';

export type BenignClass =
  | 'benign_quantifier_one'
  | 'benign_reciprocal'
  | 'benign_partitive'
  | 'benign_lets_first'
  | 'benign_at_first'
  | 'benign_control'
  | 'benign_sequencing'
  | 'benign_variant'
  | 'exemption_adversarial'
  | 'residual_numeric'
  | 'plural_alias';

export interface BenignCase {
  id: string;
  class: BenignClass;
  learnerMessage: string;
  question: string;
  expected: 'reject' | 'validate';
}

const NEUTRAL_MESSAGE = 'Look closely at the model in the problem.';
const NEUTRAL_QUESTION = 'What do you notice?';

const ch = (code: number) => String.fromCharCode(code);
const ZWSP = ch(0x200b);
const NBSP = ch(0xa0);

/** Transforms that canonicalization must undo; applied to benign and attack text alike. */
export const TRANSFORMS: Record<string, (text: string) => string> = {
  none: (text) => text,
  upper: (text) => text.toUpperCase(),
  fullwidth: (text) =>
    [...text].map((c) => (/[A-Za-z0-9]/u.test(c) ? ch(c.charCodeAt(0) + 0xfee0) : c)).join(''),
  zero_width: (text) => text.replace(/([A-Za-z])([A-Za-z]+)/gu, `$1${ZWSP}$2`),
  unicode_punctuation: (text) =>
    text
      .replace(/,/gu, ch(0xff0c))
      .replace(/:/gu, ch(0xff1a))
      .replace(/\?/gu, ch(0xff1f))
      .replace(/;/gu, ch(0xff1b))
      .replace(/'/gu, ch(0x2019)),
  nbsp: (text) => text.replace(/ /gu, NBSP),
};

// Singular Science nouns only: no option-family noun and no alias plural.
const PARTS = ['membrane', 'nucleus', 'layer', 'gate', 'boundary', 'structure'];
const PLURAL_PARTS = ['parts', 'layers', 'gates', 'features', 'clues', 'facts'];

const QUANTIFIER_TEMPLATES = [
  'Which one controls what moves in and out?',
  'Which one would you check next?',
  'Look at each one and describe its job.',
  'What does each one do for the whole organism?',
  'Think about every one of the features in the model.',
  'No one expects you to know this yet, so take your time.',
  'Does any one of these clues stand out to you?',
  'Which one of these facts is evidence?',
];

const RECIPROCAL_TEMPLATES = [
  'The parts depend on one another in this model.',
  'How do the layers work with one another?',
  'Notice how the gates and the boundary affect one another.',
  'Think about how the parts help one another.',
];

const PARTITIVE_TEMPLATES = [
  'One of the PLURAL stops working in this model.',
  'What happens if one of the PLURAL changes?',
  'Think about one of them before the rest.',
  'Which job does one of its PLURAL have?',
];

const LETS_FIRST_TEMPLATES = [
  'Let’s first look at how the PART is described.',
  'Let’s first think about the job of the PART.',
  'Let’s first compare the PART with the wall.',
  'Let’s first notice what the PART lets through.',
  "Let's first find the PART in the model.",
  "Let's first check what the PART does.",
];

const AT_FIRST_TEMPLATES = [
  'At first, the PART can look like it does nothing.',
  'At first, it is fine to feel unsure about the PART.',
  'At first glance, the PART seems simple.',
  'Notice that the PART looks plain at first sight.',
];

const CONTROL_TEMPLATES = [
  'Follow the chain of jobs, part by part, starting at the PART.',
  'Someone reading the model would notice the PART right away.',
  'Think about what the PART lets in or keeps out.',
  'Compare what the PART does with what the wall does.',
];

/** Sequencing without any numeric word: the wording the prompt can steer towards. */
const SEQUENCING_TEMPLATES = [
  'Start with the PART, then compare it with the wall.',
  'Begin by reading about the PART.',
  'Before anything else, look at the PART.',
  'Next, think about what the PART does.',
  'Then ask what the PART lets through.',
  'After that, check how the PART connects to the rest.',
];

/** Option or position references; all must reject under every transform and field split. */
export const ATTACK_CORES: string[] = [
  // Review r1 reproductions (E4, E7, E6 punctuation) and requested controls.
  'Choose: second, which is correct.',
  'Answer: first, look again.',
  'Which one is right? First, is the correct pick.',
  'Choose half-way down.',
  'At first;, the top one fits.',
  'Which one is right? The first.',
  'Each one helps; one of them, B.',
  // Withdrawn E4 and E7 forms used as selections.
  'First, is the correct pick.',
  'Second, which is correct?',
  'Last, is the pick.',
  'Choose: second, look again.',
  'First, because it has tiny units.',
  'Second, because it fits the clues.',
  'Last, it is the right pick.',
  'First, the second picture.',
  'First, B.',
  'Pick the half-way one.',
  'It is half-way down the list.',
  'The half way sample is it.',
  'Pick the half-way picture.',
  // E5 and E6 boundaries.
  'Pick the one you first read.',
  'Choose the one we first notice.',
  "Choose: let's first look.",
  'Answer: first look again.',
  'First look, then pick it.',
  "Let's first pick.",
  "Let's first, look.",
  "Let's first sample it.",
  'Which one? At first, is the pick.',
  'Answer: at first, it fits.',
  'At first,, it fits.',
  'At first, second.',
  'At first glance sample.',
  'Look at first sample.',
  'At first sample, look again.',
  // E1 to E3 boundaries.
  'Choose: which one, the second.',
  'Which one; the first.',
  'Which one sample has the units?',
  'Each one cell is different.',
  'No one example matches.',
  'One of the samples is correct.',
  'One of the options is correct.',
  'One of the choices is right.',
  'One of the cells has the gates.',
  'One of the descriptions is the answer.',
  'One of the pictures shows it.',
  'One of the models has that part.',
  'One of the results is the evidence.',
  'Pick one of the three.',
  'One of the two is right.',
  // Plain option and position references.
  'The answer is the second one.',
  'Pick the first one.',
  'Choose the last one.',
  'Option two fits.',
  'The first choice is right.',
  'Look at number three.',
  'One sample has units.',
  'It is made of one cell.',
  'Is it one cell or many?',
  'First picture fits best.',
  'The first picture fits best.',
  'Look at the first picture.',
  'Pick the second, which has units.',
  'Choose the first, compare it later.',
  'The first look sample is right.',
  'Half of them are living.',
  'Half the pictures show units.',
  'Which one is second?',
  'The third, look closely at it.',
  'Look at the one with the units, the first.',
  'It is the second, look again.',
  'The answer is one.',
  'Pick one.',
];

/** Benign phrasing deliberately still rejected (count or position meaning, or withdrawn E4/E5/E7). */
const RESIDUAL_TEMPLATES = [
  'Only one part makes food in this model.',
  'On one side, list what comes in.',
  'What happens first when the PART stops?',
  'Which step comes first?',
  'Give the PART your second look.',
  'About half of the PART is covered.',
  'First, look at the PART.',
  'Second, think about what the PART does.',
  'Last, compare the PART with the wall.',
  'First look at how the PART is described.',
  'You could first compare the PART with the wall.',
  'You are half way to explaining the PART.',
  'Stop half-way and check what the PART does.',
];

const PLURAL_ALIAS_TEMPLATES = [
  'Think about what the cells need.',
  'Compare the samples in the problem.',
  'Look back at the examples given.',
  'Which of the options mentions the PART?',
];

const expand = (template: string, slot: string, values: readonly string[]) =>
  template.includes(slot) ? values.map((value) => template.replace(slot, value)) : [template];

export function buildBenignCorpus(): BenignCase[] {
  const cases: BenignCase[] = [];
  const add = (
    caseClass: BenignClass,
    key: string,
    learnerMessage: string,
    question: string,
    expected: BenignCase['expected'],
  ) =>
    cases.push({ id: `${caseClass}|${key}`, class: caseClass, learnerMessage, question, expected });

  // Each benign sentence appears once as the tutor message and once as the question.
  const both = (caseClass: BenignClass, key: string, sentence: string) => {
    add(caseClass, `${key}|message`, sentence, NEUTRAL_QUESTION, 'validate');
    add(caseClass, `${key}|question`, NEUTRAL_MESSAGE, sentence, 'validate');
  };
  const exempt: string[] = [];

  QUANTIFIER_TEMPLATES.forEach((sentence, index) => {
    both('benign_quantifier_one', String(index + 1), sentence);
    exempt.push(sentence);
  });
  RECIPROCAL_TEMPLATES.forEach((sentence, index) => {
    both('benign_reciprocal', String(index + 1), sentence);
    exempt.push(sentence);
  });
  PARTITIVE_TEMPLATES.forEach((template, index) => {
    expand(template, 'PLURAL', PLURAL_PARTS).forEach((sentence, variant) => {
      both('benign_partitive', `${index + 1}|${variant + 1}`, sentence);
      if (variant === 0) exempt.push(sentence);
    });
  });
  const perPart = (caseClass: BenignClass, templates: readonly string[], track: boolean) =>
    templates.forEach((template, index) => {
      PARTS.forEach((part) => {
        both(caseClass, `${index + 1}|${part}`, template.replace('PART', part));
      });
      if (track) exempt.push(template.replace('PART', PARTS[0]));
    });
  perPart('benign_lets_first', LETS_FIRST_TEMPLATES, true);
  perPart('benign_at_first', AT_FIRST_TEMPLATES, true);
  perPart('benign_control', CONTROL_TEMPLATES, false);
  perPart('benign_sequencing', SEQUENCING_TEMPLATES, false);

  exempt.forEach((sentence, index) => {
    for (const [name, transform] of Object.entries(TRANSFORMS)) {
      if (name === 'none') continue;
      add(
        'benign_variant',
        `${index + 1}|${name}`,
        transform(sentence),
        NEUTRAL_QUESTION,
        'validate',
      );
    }
  });

  ATTACK_CORES.forEach((core, index) => {
    for (const [name, transform] of Object.entries(TRANSFORMS)) {
      const text = transform(core);
      const key = `${index + 1}|${name}`;
      add('exemption_adversarial', `${key}|message`, text, NEUTRAL_QUESTION, 'reject');
      add('exemption_adversarial', `${key}|question`, NEUTRAL_MESSAGE, text, 'reject');
      // Every split at a space: the message ends where the question begins.
      const words = core.split(' ');
      for (let cut = 1; cut < words.length; cut += 1) {
        add(
          'exemption_adversarial',
          `${key}|split${cut}`,
          transform(words.slice(0, cut).join(' ')),
          transform(words.slice(cut).join(' ')),
          'reject',
        );
      }
    }
  });

  RESIDUAL_TEMPLATES.forEach((template, index) => {
    expand(template, 'PART', PARTS).forEach((sentence, variant) => {
      add('residual_numeric', `${index + 1}|${variant + 1}`, sentence, NEUTRAL_QUESTION, 'reject');
    });
  });
  PLURAL_ALIAS_TEMPLATES.forEach((template, index) => {
    expand(template, 'PART', PARTS).forEach((sentence, variant) => {
      add('plural_alias', `${index + 1}|${variant + 1}`, sentence, NEUTRAL_QUESTION, 'reject');
    });
  });
  return cases;
}
