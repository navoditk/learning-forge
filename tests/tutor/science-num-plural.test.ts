import { createHash } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { NUMBER_WORD_VOCABULARY } from '../../src/contracts/number-words';
import {
  SCIENCE_MAGNITUDE_WORDS,
  SCIENCE_NUMERIC_WORDS,
  SCIENCE_SUFFIX_ALLOWLIST,
  scienceStructureTriggers,
  scienceStructureViolations,
  structureTokens,
  structureTriggersOf,
  structureViolationsOf,
} from '../../src/contracts/science-structure';
import { contentCatalog } from '../../src/content/catalog';
import { TutorHarness, type TutorAttemptDiagnostic } from '../../src/tutor';
import * as scienceSafety from '../../src/tutor/science-safety';
import {
  SAFE_CONTROLS,
  SCIENCE_ITEM_IDS,
  buildScienceStructureCorpus,
} from './fixtures/science-structure-corpus';

const { SCIENCE_FALLBACK_MESSAGE } = scienceSafety;

/**
 * SCI6-NUM-PLURAL (D-299): plural, approximate and multiplicative magnitude
 * words are rejected by the Science structural contract. Science-only; the
 * shared number-word parser and Math validation are not involved.
 */

const WORDS = [...SCIENCE_MAGNITUDE_WORDS].sort();
const HEADLINE = [
  'hundreds',
  'thousands',
  'millions',
  'billions',
  'trillions',
  'dozens',
  'tens',
  'scores',
];
const NUMERIC = 'numeric_expression_detected';
const ALLOWLIST_COUNT = 91;
const ALLOWLIST_SHA256 = '0d29dd50c1aa7c6caf410ffbe5043ca902f267937ffc2bfeeaff092c2e664e5c';

const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
const tokensOf = (id: string) => [
  item(id).deterministicValidator.canonicalAnswer,
  ...item(id).forbiddenLeakagePatterns,
];

async function throughHarness(
  itemId: string,
  learnerMessage: string,
  question: string,
  framing: 'science' | 'math' = 'science',
) {
  const attempts: TutorAttemptDiagnostic[] = [];
  const model = {
    generateMove: vi.fn(async () => ({
      candidate: {
        moveType: 'hint_2_representation',
        learnerMessage,
        question,
        assistanceLevel: 'multiple_hints_representation',
        expectedResponseForm: 'explanation',
        safetyFlags: ['none'],
        confidence: 0.6,
      },
      metadata: {
        modelIdentifier: 'scripted',
        promptTemplateVersion: 'scripted-1',
        latencyMs: 0,
        tokenUsage: { input: 0, output: 0, total: 0 },
      },
    })),
    scoreConstructedResponse: vi.fn(),
  };
  const response = await new TutorHarness(model, {
    onAttempt: (attempt) => attempts.push(attempt),
  }).respond({
    prompt: item(itemId).prompt,
    learnerMessage: 'Can you give me a hint?',
    redactedSkillContext: 'content:synthetic',
    state: 'hint_1_strategy',
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: 0,
    attemptNumber: 1,
    subjectFraming: framing,
    protectedTokens: tokensOf(itemId),
  });
  return { response, attempts };
}

describe('SCI6-NUM-PLURAL vocabulary', () => {
  it('is separate from the shared parser vocabulary and the pinned numeric set', () => {
    expect(WORDS.length).toBeGreaterThan(100);
    for (const word of HEADLINE.filter((w) => w !== 'dozens')) {
      expect(SCIENCE_MAGNITUDE_WORDS.has(word), word).toBe(true);
    }
    // "dozens" was already a Science numeric word; the headline words that
    // are new must not leak into the shared parser or the pinned set.
    expect(SCIENCE_NUMERIC_WORDS.has('dozens')).toBe(true);
    for (const word of WORDS) {
      expect(NUMBER_WORD_VOCABULARY.has(word), word).toBe(false);
      expect(SCIENCE_NUMERIC_WORDS.has(word), word).toBe(false);
    }
  });

  it('excludes the audited non-numeric words', () => {
    for (const word of ['ones', 'several', 'many', 'few', 'either', 'neither']) {
      expect(SCIENCE_MAGNITUDE_WORDS.has(word), word).toBe(false);
    }
  });
});

describe('SCI6-NUM-PLURAL structural rejection', () => {
  it.each(HEADLINE)('rejects %s in the message, question and both joins, naming the token', (w) => {
    expect(structureViolationsOf(`Think about ${w} of tiny units.`)).toEqual([NUMERIC]);
    expect(scienceStructureViolations(`Think about ${w} of units.`, 'What do you see?')).toEqual([
      NUMERIC,
    ]);
    expect(scienceStructureViolations('Look closely.', `Are there ${w} of units?`)).toEqual([
      NUMERIC,
    ]);
    // Boundary joins: concatenated and space-joined.
    expect(scienceStructureTriggers('Look closely at the', `${w} of units.`)).toContainEqual({
      rule: NUMERIC,
      token: w,
    });
    expect(structureTriggersOf(`Think about ${w} of tiny units.`)).toEqual([
      { rule: NUMERIC, token: w },
    ]);
  });

  it.each(WORDS)('rejects %s in every field position', (word) => {
    const message = scienceStructureViolations(`Think about the ${word} here.`, 'What happens?');
    const question = scienceStructureViolations('Look closely.', `Why the ${word} here?`);
    expect(message, word).toContain(NUMERIC);
    expect(question, word).toContain(NUMERIC);
    // Joined fields: the word sits at the end of one field and the start of the other.
    const triggers = scienceStructureTriggers('Think about the', `${word} here.`);
    expect(triggers.map((trigger) => trigger.token)).toContain(word);
    const trailing = scienceStructureTriggers(`Think about ${word}`, 'here now.');
    expect(trailing.map((trigger) => trigger.token)).toContain(word);
  });

  it('rejects casing and possessive variants', () => {
    for (const text of [
      'HUNDREDS of units',
      'Thousands of units',
      'MiLLiOnS of units',
      "the hundreds's role",
      "the thousands' role",
      'the thousand’s role',
      "the dozens's role",
      "the tens's role",
      "the scores's role",
      "Twice the cell's size",
      'TENFOLD more',
    ]) {
      expect(structureViolationsOf(text), text).toContain(NUMERIC);
    }
    expect(structureTriggersOf('HUNDREDS of units')).toEqual([
      { rule: NUMERIC, token: 'hundreds' },
    ]);
    expect(structureTriggersOf("the hundreds's role")).toEqual([
      { rule: NUMERIC, token: "hundreds's" },
    ]);
  });

  it('is not weakened by D-294 exemptions next to a magnitude word', () => {
    for (const text of [
      'Which one hundreds of units?',
      'Each one of the thousands matters.',
      'Let’s first look at the millions.',
      'At first, hundreds of units look alike.',
    ]) {
      expect(structureViolationsOf(text), text).toContain(NUMERIC);
    }
  });

  it('keeps D-294 exemptions and benign controls working', () => {
    for (const text of [
      'Which one of the parts does the work?',
      "Let's first look closely at the leaf.",
      'At first glance the leaf looks flat.',
      'Think about many tiny units and what they do together.',
      'Several parts work together, and few of them are alike.',
      'The ones you drew show the boundary.',
      'After you notice the boundary, describe what it does.',
      'Either way, look closely at the parts.',
      'Neither of the parts is hidden.',
    ]) {
      expect(structureViolationsOf(text), text).toEqual([]);
    }
  });
});

describe('SCI6-NUM-PLURAL through the complete harness', () => {
  const EXAMPLES = [
    'Think about hundreds of tiny units.',
    'The leaf consists of thousands of bounded units.',
  ];

  describe.each(SCIENCE_ITEM_IDS)('%s', (itemId) => {
    it.each(EXAMPLES)('falls back on %j in the message', async (text) => {
      const { response, attempts } = await throughHarness(itemId, text, 'What do you see?');
      expect(response.status).toBe('fallback');
      expect(response.fallbackMessage).toBe(SCIENCE_FALLBACK_MESSAGE);
      expect(response.move).toBeUndefined();
      expect(attempts.length).toBe(2);
      for (const attempt of attempts) expect(attempt.reasons).toContain(NUMERIC);
    });

    it('falls back on a magnitude word in the question field', async () => {
      const { response } = await throughHarness(itemId, 'Look closely.', 'Are there thousands?');
      expect(response.status).toBe('fallback');
    });

    it('still validates a number-free control', async () => {
      const [message, question] = SAFE_CONTROLS[itemId][0];
      const { response } = await throughHarness(itemId, message, question);
      expect(response.status).toBe('validated');
    });
  });

  it('does not change Math validation (the structural contract is Science-only)', async () => {
    const math = await throughHarness(
      SCIENCE_ITEM_IDS[0],
      'Think about hundreds of tiny units.',
      'What do you see?',
      'math',
    );
    expect(math.attempts.every((attempt) => !attempt.reasons.includes(NUMERIC))).toBe(true);
  });
});

// Hand-listed, independent of the implementation's own set (review r1 F1).
const EXPECTED_REJECTED_WORDS = [
  'quintupling',
  'sextuple',
  'elevenfold',
  'twentyfold',
  'billionfold',
  'octuple',
  'nonuple',
  'decuple',
  'centuplets',
  'quadruply',
  'septupled',
  'undecuple',
  'trillionfold',
  'twelvefold',
  'ninetyfold',
  'twentyfivefold',
  'hundredfold',
  'foursome',
  'sixsome',
  'triply',
  'doubly',
  'singly',
  'twins',
  'triplets',
  'both',
  'once',
  'decade',
  'decades',
  'century',
  'centuries',
  'millennium',
  'millennia',
  'gross',
  'grosses',
  'single',
  'twice',
  'thrice',
  'pairs',
];

describe('SCI6-NUM-PLURAL rev2 hand-listed rejections (F1)', () => {
  it.each(EXPECTED_REJECTED_WORDS)('rejects %s in either field and across the join', (word) => {
    expect(scienceStructureViolations(`The count grows ${word}.`, 'What do you see?')).toContain(
      NUMERIC,
    );
    expect(scienceStructureViolations('Look closely.', `Why ${word}?`)).toContain(NUMERIC);
    expect(scienceStructureViolations('Look at the', `${word} here.`)).toContain(NUMERIC);
  });

  it('keeps ordinary look-alikes valid', () => {
    for (const text of ['The big diagram is not needed.', 'It is a handsome leaf.']) {
      expect(structureViolationsOf(text), text).not.toContain(NUMERIC);
    }
    expect(structureViolationsOf('Name the manifold parts.')).not.toContain(NUMERIC);
  });

  it('rejects the original both-control as a rejection case', async () => {
    const { response } = await throughHarness(
      'sci6-cell-parts-functions-2',
      'List the parts of both cell models side by side.',
      'What do you see?',
    );
    expect(response.status).toBe('fallback');
  });
});

describe('SCI6-NUM-PLURAL rev2 invisible characters (F2)', () => {
  const INVISIBLES = [
    '͏',
    '᠎',
    '⁡',
    '⁢',
    '⁣',
    '⁤',
    '︀',
    '️',
    '\u{E0100}',
    '\u{E01EF}',
    '‪',
    '‫',
    '‬',
    '‭',
    '‮',
    '⁦',
    '⁧',
    '⁨',
    '⁩',
    '‎',
    '‏',
    '\u0008',
    '\u007F',
    '́',
    '؜',
  ];
  it.each(INVISIBLES.map((c) => [`U+${c.codePointAt(0)!.toString(16).toUpperCase()}`, c]))(
    '%s inside a word is rejected in each field and the joins',
    (_label, c) => {
      const split = `hun${c}dreds`;
      for (const [m, q] of [
        [`The leaf consists of ${split} of bounded units.`, 'What do you see?'],
        ['Look closely.', `Are there ${split}?`],
        [`Look at hun${c}`, 'dreds here.'],
      ]) {
        const triggers = scienceStructureTriggers(m, q);
        expect(
          triggers.map((t) => t.rule),
          `${m}|${q}`,
        ).toContain('unsupported_character_detected');
        expect(triggers.some((t) => t.token === c)).toBe(true);
      }
      // Between words as well.
      expect(structureViolationsOf(`Look${c}closely.`)).toContain('unsupported_character_detected');
    },
  );

  it('still reads through the characters the shared pipeline already deletes', () => {
    for (const c of ['­', '​', '‌', '‍', '⁠', '﻿']) {
      expect(structureViolationsOf(`hun${c}dreds of units`), c).toContain(NUMERIC);
      expect(structureViolationsOf(`Look${c}closely.`), c).toEqual([]);
    }
  });

  it.each([
    'The leaf consists of hun͏dreds of bounded units.',
    'The leaf consists of hun⁣dreds of bounded units.',
  ])('falls back through the full harness: %j', async (text) => {
    for (const [m, q] of [
      [text, 'What do you see?'],
      ['Look closely.', text],
    ]) {
      const { response, attempts } = await throughHarness('sci6-cells-evidence-of-life-2', m, q);
      expect(response.status).toBe('fallback');
      for (const attempt of attempts) {
        expect(attempt.reasons).toContain('unsupported_character_detected');
      }
    }
  });
});

describe('SCI6-NUM-PLURAL rev2 cross-field word splits (F3)', () => {
  it.each([
    ['Think about hun', 'dreds of units.'],
    ['Think about thou', 'sands of units.'],
    ['The count grows eleven', 'fold.'],
    ['Think about quintup', 'ling it.'],
  ])('rejects %j + %j', (m, q) => {
    expect(scienceStructureViolations(m, q)).toContain(NUMERIC);
  });
});

describe('SCI6-NUM-PLURAL rev3 fail-safe rules', () => {
  const LONG_93 =
    'ninehundredninetyninequadrillionninehundredninetyninetrillionninehundredninetyninebillionfold';
  const COUNTEREXAMPLES = [
    'bazillionfold',
    'gazillionfold',
    'lakhfold',
    'crorefold',
    'optionelevenfold',
    'cellelevenfold',
    'trillionfolds',
    'tenfolds',
    'foursomes',
    'multifold',
    'trifold',
    'vermillion',
    'optionsome',
    'runfold',
    'samplequintupling',
    'examplesextuple',
    'letterhundreds',
    'choicebazillion',
    LONG_93,
  ];

  it('measured: the longest word in current Science content is far below the limit', () => {
    const longest = [
      'representation',
      'magnification',
      'clarification',
      'independently',
      'chloroplasts',
      'mitochondria',
      'descriptions',
    ];
    for (const word of longest) {
      expect(word.length).toBeLessThanOrEqual(14);
      expect(structureViolationsOf(`Look at the ${word} now.`), word).toEqual([]);
    }
  });

  it.each([23, 24])('a %i-character ordinary token is not rejected for length', (n) => {
    const token = 'b'.repeat(n);
    expect(structureViolationsOf(`Look at ${token} now.`)).toEqual([]);
  });

  it.each([25, 63, 64, 65, 93, 200])(
    'a %i-character token is rejected, truncated in diagnostics',
    (n) => {
      const token = 'b'.repeat(n);
      const triggers = structureTriggersOf(`Look at ${token} now.`);
      expect(triggers).toEqual([{ rule: 'unsupported_character_detected', token: 'b'.repeat(24) }]);
      expect(scienceStructureViolations(`Look at ${token}`, 'What?')).toContain(
        'unsupported_character_detected',
      );
    },
  );

  it('rejects the 93-character compound and a 65-character numeric compound', () => {
    expect(LONG_93.length).toBe(93);
    expect(structureViolationsOf(`The count grows ${LONG_93}.`)).toContain(NUMERIC);
    const sixtyFive = 'ninehundredninetyninequadrillionninehundredninetynineoctillionfold'.slice(
      -65,
    );
    expect(sixtyFive.length).toBe(65);
    expect(structureViolationsOf(`Grows ${sixtyFive}.`).length).toBeGreaterThan(0);
  });

  it.each(COUNTEREXAMPLES)('rejects %s in message, question, joins and possessive', (word) => {
    const rejected = (violations: string[]) => violations.length > 0;
    expect(rejected(scienceStructureViolations(`The count grows ${word}.`, 'What?'))).toBe(true);
    expect(rejected(scienceStructureViolations('Look closely.', `Why ${word}?`))).toBe(true);
    expect(rejected(scienceStructureViolations('Look at the', `${word} here.`))).toBe(true);
    expect(rejected(structureViolationsOf(`The ${word}'s role.`))).toBe(true);
    expect(rejected(structureViolationsOf(word.toUpperCase()))).toBe(true);
  });

  it('rejects field splits of the new families', () => {
    for (const [m, q] of [
      ['The count grows bazillion', 'fold.'],
      ['The count grows baz', 'illionfold.'],
      ['Look at option', 'elevenfold now.'],
      ['Look at lakh', 'fold now.'],
      ['It is crore', 'fold.'],
    ]) {
      expect(scienceStructureViolations(m, q).length, `${m}|${q}`).toBeGreaterThan(0);
    }
  });

  describe.each(SCIENCE_ITEM_IDS)('%s', (itemId) => {
    it.each(COUNTEREXAMPLES)('falls back on %s through the full harness', async (word) => {
      for (const [m, q] of [
        [`The count grows ${word}.`, 'What do you see?'],
        ['Look closely.', `Why ${word}?`],
      ]) {
        const { response, attempts } = await throughHarness(itemId, m, q);
        expect(response.status, `${m}|${q}`).toBe('fallback');
        expect(attempts.length).toBe(2);
      }
    });
  });

  const ALLOWLIST_WORDS = [...SCIENCE_SUFFIX_ALLOWLIST].sort();

  it('the allowlist is closed and pinned', () => {
    expect(ALLOWLIST_WORDS.length).toBe(ALLOWLIST_COUNT);
    expect(createHash('sha256').update(ALLOWLIST_WORDS.join(' ')).digest('hex')).toBe(
      ALLOWLIST_SHA256,
    );
  });

  it.each(ALLOWLIST_WORDS)('allowlisted %s is not rejected', (word) => {
    expect(structureViolationsOf(`Notice the ${word} here.`), word).toEqual([]);
    expect(structureViolationsOf(`The ${word}'s role.`), word).toEqual([]);
  });

  it('keeps ordinary alias-noun compounds and biology words valid', () => {
    for (const word of [
      'cellular',
      'cellulose',
      'celluloid',
      'runner',
      'running',
      'runway',
      'lettering',
      'chromosomes',
      'ribosomes',
      'lysosomes',
      'mitochondria',
      'coupled',
    ]) {
      expect(structureViolationsOf(`Notice the ${word} here.`), word).toEqual([]);
    }
    // Unchanged behavior: plural alias nouns are still aliases.
    for (const word of ['cells', 'samples', 'examples', 'options', 'choices', 'letters', 'runs']) {
      expect(structureViolationsOf(`Notice the ${word} here.`), word).toEqual([
        'identifier_alias_detected',
      ]);
    }
  });
});

describe('SCI6-NUM-PLURAL rev4 repeated possessives (F4)', () => {
  const CHAINS = [
    "tenfold's's",
    'tenfold’s’s',
    "hundreds's's",
    'hundreds’s’s',
    "optionelevenfold's's",
    "bazillionfold's's's",
    "dozens's's",
    "twice's's",
    "one's's",
  ];

  it.each(CHAINS)('rejects %s in each field and across joins', (word) => {
    expect(scienceStructureViolations(`The count grows ${word}.`, 'What?').length).toBeGreaterThan(
      0,
    );
    expect(scienceStructureViolations('Look closely.', `Why ${word}?`).length).toBeGreaterThan(0);
    expect(scienceStructureViolations('Look at the', `${word} here.`).length).toBeGreaterThan(0);
    expect(scienceStructureViolations(`Look at ${word}`, 'here now.').length).toBeGreaterThan(0);
  });

  it('rejects field splits that complete a possessive chain', () => {
    for (const [m, q] of [
      ["The count grows tenfold's", 's.'],
      ["Think about hundreds's", 's of units.'],
      ['Think about hundreds’s', '’s of units.'],
    ]) {
      // The joins (concatenated or space-joined) see the chain or the bare word.
      expect(scienceStructureViolations(m, q).length, `${m}|${q}`).toBeGreaterThan(0);
    }
  });

  it.each(["The count grows tenfold's's.", 'Think about hundreds’s’s of bounded units.'])(
    'falls back through the full harness on all six items: %j',
    async (text) => {
      for (const itemId of SCIENCE_ITEM_IDS) {
        for (const [m, q] of [
          [text, 'What do you see?'],
          ['Look closely.', text],
        ]) {
          const { response } = await throughHarness(itemId, m, q);
          expect(response.status, `${itemId}|${m}|${q}`).toBe('fallback');
        }
      }
    },
  );

  it('keeps ordinary contractions and single possessives valid', () => {
    for (const text of [
      "It's the cell's job, don't guess.",
      "The leaf's edge and the root's tip.",
      'The leaf’s edge isn’t hidden.',
      "Those units' edges matter.",
      'What is the membrane’s role?',
    ]) {
      expect(
        structureViolationsOf(text).filter((rule) => rule !== 'identifier_alias_detected'),
        text,
      ).toEqual([]);
    }
    expect(structureViolationsOf("It's the leaf's job, don't guess.")).toEqual([]);
  });
});

describe('SCI6-NUM-PLURAL rev4 count-bearing biology terms (F5)', () => {
  const REMOVED = ['monosome', 'monosomes', 'polysome', 'polysomes'];

  it.each(REMOVED)('%s is no longer allowlisted and is rejected', (word) => {
    expect(SCIENCE_SUFFIX_ALLOWLIST.has(word)).toBe(false);
    expect(structureViolationsOf(`Notice the ${word} here.`)).toContain(NUMERIC);
  });

  it.each([
    'The microbe has as many bounded units as the ribosomes in the monosome.',
    'The leaf has as many bounded units as the ribosomes in the polysome.',
  ])('falls back through the full harness on all six items: %s', async (text) => {
    for (const itemId of SCIENCE_ITEM_IDS) {
      const { response } = await throughHarness(itemId, text, 'What do you see?');
      expect(response.status, itemId).toBe('fallback');
      const second = await throughHarness(itemId, 'Look closely.', text);
      expect(second.response.status, itemId).toBe('fallback');
    }
  });

  it('keeps autosome(s) and the other non-count terms valid', () => {
    for (const word of ['autosome', 'autosomes', 'chromosome', 'ribosomes', 'lysosome']) {
      expect(SCIENCE_SUFFIX_ALLOWLIST.has(word), word).toBe(true);
      expect(structureViolationsOf(`Notice the ${word} here.`), word).toEqual([]);
    }
  });
});

describe('SCI6-NUM-PLURAL rev5 apostrophe tails (F6)', () => {
  const MALFORMED = [
    "tenfold'x",
    "tenfold's'x",
    'tenfold’s’x',
    "tenfold's’x",
    "optionelevenfold'x",
    "hundreds'x",
    'hundreds’x',
    "option'x",
    "cell'x",
    "dozens'ss",
    "tenfold'tt",
    "don't's't",
    "tenfold're're",
  ];
  const NUMERIC_PREFIX_CONTRACTIONS = [
    "hundreds're",
    "tenfold'll",
    "hundreds've",
    "twice'd",
    'tenfold’m',
  ];

  it.each(MALFORMED)('rejects the malformed apostrophe shape %s', (word) => {
    expect(structureViolationsOf(`The count grows ${word}.`)).toContain(
      'unsupported_character_detected',
    );
    expect(structureTriggersOf(`The count grows ${word}.`).map((t) => t.token)).toContain(
      word.replace('’', "'").replace('’', "'"),
    );
  });

  it.each([...MALFORMED, ...NUMERIC_PREFIX_CONTRACTIONS])(
    'rejects %s in each field and across joins',
    (word) => {
      expect(
        scienceStructureViolations(`The count grows ${word}.`, 'What?').length,
      ).toBeGreaterThan(0);
      expect(scienceStructureViolations('Look closely.', `Why ${word}?`).length).toBeGreaterThan(0);
      expect(scienceStructureViolations('Look at the', `${word} here.`).length).toBeGreaterThan(0);
      expect(scienceStructureViolations(`Look at ${word}`, 'here now.').length).toBeGreaterThan(0);
    },
  );

  it.each(NUMERIC_PREFIX_CONTRACTIONS)(
    'an allowed tail does not hide a numeric prefix: %s',
    (word) => {
      expect(structureViolationsOf(`The count grows ${word}.`)).toContain(NUMERIC);
      expect(structureViolationsOf(`The count grows ${word}.`)).not.toContain(
        'unsupported_character_detected',
      );
    },
  );

  it('rejects alias prefixes with contraction tails', () => {
    expect(structureViolationsOf("Look at option's'x now.")).toContain(
      'unsupported_character_detected',
    );
    expect(structureViolationsOf("Look at optionten're now.")).toContain(
      'identifier_alias_detected',
    );
    expect(structureViolationsOf("Look at optionelevenfold'll now.")).toContain(NUMERIC);
  });

  it('rejects field splits that complete a malformed apostrophe shape', () => {
    for (const [m, q] of [
      ["The count grows tenfold'", 'x.'],
      ["The count grows tenfold's'", 'x.'],
      ['The count grows tenfold', "'x."],
      ['The count grows tenfold’s', '’x.'],
      ['The count grows hun', "dreds'x."],
    ]) {
      expect(scienceStructureViolations(m, q).length, `${m}|${q}`).toBeGreaterThan(0);
    }
  });

  it.each([
    "The count grows tenfold'x.",
    "The count grows tenfold's'x.",
    'The leaf consists of hundreds’x of bounded units.',
    'The count grows tenfold’s’x.',
    "The count grows hundreds're.",
  ])('falls back through the full harness on all six items: %j', async (text) => {
    for (const itemId of SCIENCE_ITEM_IDS) {
      for (const [m, q] of [
        [text, 'What do you see?'],
        ['Look closely.', text],
      ]) {
        const { response } = await throughHarness(itemId, m, q);
        expect(response.status, `${itemId}|${m}|${q}`).toBe('fallback');
      }
    }
  });

  it.each([
    "it's",
    "don't",
    "isn't",
    "can't",
    "won't",
    "they're",
    "we've",
    "you'll",
    "I'd",
    "I'm",
    "cell's",
    "cells'",
    'it’s',
    'don’t',
    'I’m',
    "leaf's",
    "doesn't",
    "wouldn't",
    "that's",
  ])('keeps the contraction or possessive %s valid', (word) => {
    const violations = structureViolationsOf(`Notice that ${word} here.`).filter(
      (rule) => !(word.startsWith('cells') && rule === 'identifier_alias_detected'),
    );
    expect(violations, word).toEqual([]);
  });

  it('keeps every apostrophe word in Science prompts, items and safety strings valid', () => {
    const texts: string[] = [];
    const collect = (value: unknown) => {
      if (typeof value === 'string') texts.push(value);
      else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(Object.values(scienceSafety));
    collect(contentCatalog.filter((record) => record.id.startsWith('sci6')));
    collect(buildScienceStructureCorpus().filter((c) => c.expected === 'validate'));
    const apostropheTokens = new Set(
      texts.flatMap((text) => structureTokens(text)).filter((token) => token.includes("'")),
    );
    expect(apostropheTokens.size).toBeGreaterThan(0);
    for (const token of apostropheTokens) {
      expect(
        structureTriggersOf(token).map((t) => t.rule),
        token,
      ).not.toContain('unsupported_character_detected');
    }
  });
});
