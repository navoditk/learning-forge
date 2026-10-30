import { SCIENCE_NUMERIC_WORDS } from '../../../src/contracts/science-structure';

/**
 * SU-H7-FIX2 rev4: frozen D-281 Science structural conformance corpus.
 *
 * Every case is generated as a cross-product from the fixed tables below (no
 * hand-picked selection), except the prior-failure and safe-control classes,
 * which list every r1-r3 reproduction and three or more identifier-free,
 * number-free hints per Science catalog item. The corpus is frozen by its
 * version, per-class counts and the SHA-256 of its JSON serialization,
 * pinned in science-structure-contract.test.ts; any change to a table changes
 * the hash and must be re-reviewed.
 */

// v2 (rev5, review r4): alias suffixes cover all 26 letters; the numeric
// vocabulary class covers every word the shared numeric parser supports.
export const CORPUS_VERSION = 'd281-science-structure-corpus-v2';

export type CorpusClass =
  | 'standalone_identifier'
  | 'placement'
  | 'phrasing'
  | 'numeric_selection'
  | 'normalization'
  | 'numeric_vocabulary'
  | 'prior_failure'
  | 'safe_control';

export interface CorpusCase {
  id: string;
  class: CorpusClass;
  itemId: string;
  learnerMessage: string;
  question: string;
  expected: 'reject' | 'validate';
}

export const SCIENCE_ITEM_IDS = [
  'sci6-cell-as-a-system-1',
  'sci6-cell-as-a-system-2',
  'sci6-cell-parts-functions-1',
  'sci6-cell-parts-functions-2',
  'sci6-cells-evidence-of-life-1',
  'sci6-cells-evidence-of-life-2',
] as const;

const ch = (code: number) => String.fromCharCode(code);
const NBSP = ch(0xa0);
const ZWSP = ch(0x200b);
const EN_DASH = ch(0x2013);
const LEFT_SINGLE = ch(0x2018);
const RIGHT_SINGLE = ch(0x2019);
const LEFT_DOUBLE = ch(0x201c);
const RIGHT_DOUBLE = ch(0x201d);
const fullwidth = (text: string) =>
  [...text]
    .map((letter) => (/[A-Za-z0-9]/u.test(letter) ? ch(letter.charCodeAt(0) + 0xfee0) : letter))
    .join('');

const NEUTRAL_MESSAGE = 'Look closely at the model in the problem.';
const NEUTRAL_QUESTION = 'What do you notice?';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWER = UPPER.map((letter) => letter.toLowerCase());
const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const CHOICE_IDENTIFIERS = [
  ...CHOICE_LETTERS,
  ...CHOICE_LETTERS.map((letter) => letter.toLowerCase()),
  ...['1', '2', '3', '4', '5', '6', '7', '8'],
];
const LABELLED_IDENTIFIERS = ['Sample B', 'Cell Y', 'Example A', 'Run 2'];

/** Templates with slot X. Each one, with X replaced by "it", is structure-clean. */
export const PLACEMENT_TEMPLATES = {
  learnerMessage: {
    start: 'X fits the clues in the model.',
    middle: 'The model shows X near the layer.',
    end: 'Look closely at X.',
  },
  question: {
    start: 'X fits which clue?',
    middle: 'Does X match the model here?',
    end: 'What do you notice about X?',
  },
} as const;

export const PLACEMENT_FORMS = {
  bare: (x: string) => x,
  quoted: (x: string) => `${LEFT_DOUBLE}${x}${RIGHT_DOUBLE}`,
  parenthesized: (x: string) => `(${x})`,
  possessive: (x: string) => `${x}${RIGHT_SINGLE}s`,
} as const;

export const PHRASINGS = {
  bare: 'X.',
  selection_command: 'Choose X now.',
  answer_assertion: 'The answer is X.',
  explanation_after: 'X, because it has tiny units.',
  adverb_after: 'Pick X confidently.',
  question: 'Is it X?',
  comparison: 'Compare X with the other picture.',
  separate_sentence: 'Think about the units. X.',
} as const;

const CARDINALS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const ORDINAL_WORDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
const ORDINAL_NUMERALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
const NUMERIC_PREFIXES = ['', 'option ', 'choice '];
const ALIAS_NOUNS = ['option', 'choice', 'letter', 'sample', 'cell', 'example', 'run'];
const ALIAS_IDS = [...UPPER, '1', '2', '3', '4', '5', '6', '7', '8', 'two', 'second'];
const ALIAS_JOINS = ['', '-', '_'];

/** Every r1-r3 reproduction on Science items (Math numeric reproductions live in the numeric tests). */
export const PRIOR_FAILURES: [string, string][] = [
  // r1 finding 1
  ['sci6-cells-evidence-of-life-1', 'The correct sample is B.'],
  // rev2 author sweep
  ['sci6-cells-evidence-of-life-1', 'B is the answer.'],
  ['sci6-cells-evidence-of-life-1', '(B) is the one.'],
  ['sci6-cells-evidence-of-life-1', 'Go with B.'],
  ['sci6-cells-evidence-of-life-1', 'the sample labeled B'],
  ['sci6-cells-evidence-of-life-1', 'The answer is the second one.'],
  ['sci6-cell-parts-functions-2', `Only Cell Y${RIGHT_SINGLE}s model has that part.`],
  ['sci6-cells-evidence-of-life-2', 'Example A is 1 cell.'],
  // r2 finding 1
  ['sci6-cells-evidence-of-life-1', 'Choose B because it has tiny units.'],
  ['sci6-cells-evidence-of-life-1', 'Pick B for this question.'],
  // r3 findings 1 and 2
  ['sci6-cells-evidence-of-life-1', 'Choose a confidently.'],
  ['sci6-cells-evidence-of-life-1', 'The answer is a due to its units.'],
  ['sci6-cells-evidence-of-life-1', 'The answer is 2.'],
  ['sci6-cells-evidence-of-life-1', 'Choose option two because it fits.'],
  // r3 ruling examples
  ['sci6-cells-evidence-of-life-1', 'Choose a sample.'],
  ['sci6-cells-evidence-of-life-1', 'Look at sampleb closely.'],
  ['sci6-cell-parts-functions-2', 'Look at Cell-Y closely.'],
  ['sci6-cells-evidence-of-life-1', 'Pick option_2 now.'],
  // r4 findings 1 and 2
  ['sci6-cells-evidence-of-life-1', 'Choose sampleS.'],
  ['sci6-cells-evidence-of-life-1', 'Choose optionS.'],
  ['sci6-cell-parts-functions-2', 'Choose cellS.'],
  ['sci6-cells-evidence-of-life-1', 'The answer is the thirteenth.'],
  ['sci6-cells-evidence-of-life-1', 'Choose the fourteenth option.'],
];

/** At least three identifier-free, number-free, answer-free hints per Science item. */
export const SAFE_CONTROLS: Record<(typeof SCIENCE_ITEM_IDS)[number], [string, string][]> = {
  'sci6-cell-parts-functions-1': [
    [
      'Look closely at how the model describes the thin, bendable layer.',
      'What happens to different materials at its gates?',
    ],
    [
      'Compare the features of the thick layer and the thin layer.',
      'Which features belong to the layer with gates?',
    ],
    [
      'Think about the job of each outer layer for the whole cell.',
      'How do the gates treat water, food and waste?',
    ],
  ],
  'sci6-cell-as-a-system-1': [
    [
      'Follow the chain of jobs in the model, part by part.',
      'Which part depends on what the chloroplasts make?',
    ],
    [
      'Picture the arrows from light to food to energy.',
      'What happens further along the chain when the chloroplasts stop?',
    ],
    [
      'Think about where the cell gets its food in this model.',
      'Which parts need that food to keep working?',
    ],
  ],
  'sci6-cell-as-a-system-2': [
    [
      'Compare what changed in each version of the model.',
      'Which result shows that changing the membrane changed another part?',
    ],
    [
      'Sort the results described in the problem into changes and effects.',
      'Which result is evidence, and which is only description?',
    ],
    [
      'Think about whether the chloroplasts themselves were changed.',
      'What else stopped after the membrane setting changed?',
    ],
  ],
  'sci6-cell-parts-functions-2': [
    ['List the parts that appear in both models.', 'Which part appears in just the leaf model?'],
    [
      'Think about what the leaf cell can do in light that the root cell cannot.',
      'Which part could explain that difference?',
    ],
    [
      'Cross out every part shared by both models.',
      'What is left after you cross out the shared parts?',
    ],
  ],
  'sci6-cells-evidence-of-life-1': [
    [
      'Make your checklist for each picture: units, edges and anything inside.',
      'Which picture gets yes for every item on your checklist?',
    ],
    ['Think about what living things are built from.', 'What would the pictures need to show?'],
    [
      'Notice that neat shapes and colors can appear in things that are not living.',
      'Which feature do living things have that crystals do not?',
    ],
  ],
  'sci6-cells-evidence-of-life-2': [
    [
      'Start with what each description actually states.',
      'Which descriptions mention units with their own boundary?',
    ],
    [
      'Use only stated facts, not guesses.',
      'What does each description say about growing or taking in materials?',
    ],
    [
      'Think about whether each living thing is built from units at all.',
      'How would you sort the descriptions using those facts?',
    ],
  ],
};

export function buildScienceStructureCorpus(): CorpusCase[] {
  const cases: CorpusCase[] = [];
  const add = (
    caseClass: CorpusClass,
    itemId: string,
    key: string,
    learnerMessage: string,
    question: string,
    expected: CorpusCase['expected'] = 'reject',
  ) => {
    cases.push({
      id: `${caseClass}|${itemId}|${key}`,
      class: caseClass,
      itemId,
      learnerMessage,
      question,
      expected,
    });
  };

  for (const itemId of SCIENCE_ITEM_IDS) {
    // All 26 letters, upper and lower case.
    for (const letter of [...UPPER, ...LOWER]) {
      add(
        'standalone_identifier',
        itemId,
        letter === letter.toUpperCase() ? `upper-${letter}` : `lower-${letter}`,
        `Think about ${letter} here.`,
        NEUTRAL_QUESTION,
      );
    }

    // Start, middle and end of either field; bare, quoted, parenthesized, possessive.
    for (const identifier of CHOICE_IDENTIFIERS) {
      for (const field of ['learnerMessage', 'question'] as const) {
        for (const [position, template] of Object.entries(PLACEMENT_TEMPLATES[field])) {
          for (const [form, render] of Object.entries(PLACEMENT_FORMS)) {
            const text = template.replace('X', render(identifier));
            add(
              'placement',
              itemId,
              `${identifier}|${field}|${position}|${form}`,
              field === 'learnerMessage' ? text : NEUTRAL_MESSAGE,
              field === 'question' ? text : NEUTRAL_QUESTION,
            );
          }
        }
      }
    }

    // Eight phrasings, each with every choice identifier and labelled identifier.
    for (const identifier of [...CHOICE_IDENTIFIERS, ...LABELLED_IDENTIFIERS]) {
      for (const [phrasing, template] of Object.entries(PHRASINGS)) {
        add(
          'phrasing',
          itemId,
          `${identifier}|${phrasing}`,
          template.replace('X', identifier),
          NEUTRAL_QUESTION,
        );
      }
    }

    // Positions 1-8 as digits, cardinal words, ordinal words and ordinal numerals,
    // with and without option/choice; plus "last".
    for (let position = 0; position < 8; position += 1) {
      const forms: Record<string, string> = {
        digit: String(position + 1),
        cardinal: CARDINALS[position],
        ordinal_word: ORDINAL_WORDS[position],
        ordinal_numeral: ORDINAL_NUMERALS[position],
      };
      for (const [form, value] of Object.entries(forms)) {
        for (const prefix of NUMERIC_PREFIXES) {
          add(
            'numeric_selection',
            itemId,
            `${position + 1}|${form}|${prefix.trim() || 'none'}`,
            `Pick ${prefix}${value} for this question.`,
            NEUTRAL_QUESTION,
          );
        }
      }
    }
    for (const prefix of NUMERIC_PREFIXES) {
      add(
        'numeric_selection',
        itemId,
        `last|${prefix.trim() || 'none'}`,
        `Pick the last ${prefix.trim() || 'answer'} for this question.`,
        NEUTRAL_QUESTION,
      );
    }

    // Fullwidth, NBSP/newline, Unicode quotes/dashes, zero-width insertion.
    for (const letter of CHOICE_LETTERS) {
      const variants: Record<string, string> = {
        fullwidth: `Pick ${fullwidth(letter)} now.`,
        nbsp: `Look at sample${NBSP}${letter} now.`,
        newline: `Look at sample\n${letter} now.`,
        unicode_quotes: `Pick ${LEFT_SINGLE}${letter}${RIGHT_SINGLE} now.`,
        unicode_dash: `Look at sample${EN_DASH}${letter} now.`,
        zero_width_joined: `Look at sample${ZWSP}${letter} now.`,
        zero_width_after: `Pick ${letter}${ZWSP} now.`,
      };
      for (const [variant, text] of Object.entries(variants)) {
        add('normalization', itemId, `${letter}|${variant}`, text, NEUTRAL_QUESTION);
      }
    }
    // Compact identifier aliases: joined, hyphenated and underscored.
    for (const noun of ALIAS_NOUNS) {
      for (const identifier of ALIAS_IDS) {
        for (const join of ALIAS_JOINS) {
          add(
            'normalization',
            itemId,
            `alias|${noun}|${identifier}|${join === '' ? 'joined' : join}`,
            `Look at ${noun}${join}${identifier} now.`,
            NEUTRAL_QUESTION,
          );
        }
      }
    }

    // Every word of the Science numeric vocabulary (the shared parser
    // vocabulary plus extras), sorted, in a selection sentence.
    for (const word of [...SCIENCE_NUMERIC_WORDS].sort()) {
      add('numeric_vocabulary', itemId, word, `Choose the ${word} option.`, NEUTRAL_QUESTION);
    }

    SAFE_CONTROLS[itemId].forEach(([learnerMessage, question], index) => {
      add('safe_control', itemId, String(index + 1), learnerMessage, question, 'validate');
    });
  }

  PRIOR_FAILURES.forEach(([itemId, text], index) => {
    add('prior_failure', itemId, String(index + 1), text, NEUTRAL_QUESTION);
  });

  return cases;
}
