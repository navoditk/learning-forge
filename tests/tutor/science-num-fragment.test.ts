import { describe, expect, it, vi } from 'vitest';

import {
  SCIENCE_COUNT_PREFIXES,
  scienceStructureTriggers,
  scienceStructureViolations,
  structureTriggersOf,
  structureViolationsOf,
} from '../../src/contracts/science-structure';
import { contentCatalog } from '../../src/content/catalog';
import { TutorHarness, type TutorAttemptDiagnostic } from '../../src/tutor';
import { SCIENCE_FALLBACK_MESSAGE } from '../../src/tutor/science-safety';
import { SCIENCE_ITEM_IDS } from './fixtures/science-structure-corpus';

/**
 * SCI6-NUM-FRAGMENT (D-305): a number word split by intra-word punctuation or
 * a space leaves fragments that are not number words. Adjacent alphabetic
 * fragments (separated by - . _ / , ' or whitespace) are concatenated in
 * windows of 2 to 4 (at most 24 characters) and judged by the existing
 * numeric, alias, suffix and substring rules. Science only.
 */

const NUMERIC = 'numeric_expression_detected';
const ALIAS = 'identifier_alias_detected';

const item = (id: string) => contentCatalog.find((record) => record.id === id)!;
const tokensOf = (id: string) => [
  item(id).deterministicValidator.canonicalAnswer,
  ...item(id).forbiddenLeakagePatterns,
];

async function throughHarness(itemId: string, learnerMessage: string, question: string) {
  const attempts: TutorAttemptDiagnostic[] = [];
  const generateMove = vi.fn(async () => ({
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
  }));
  const response = await new TutorHarness(
    { generateMove, scoreConstructedResponse: vi.fn() },
    { onAttempt: (attempt) => attempts.push(attempt) },
  ).respond({
    prompt: item(itemId).prompt,
    learnerMessage: 'Can you give me a hint?',
    redactedSkillContext: 'content:synthetic',
    state: 'hint_1_strategy',
    mode: 'math_tutor',
    genuineAttempt: true,
    priorHintCount: 0,
    attemptNumber: 1,
    subjectFraming: 'science',
    protectedTokens: tokensOf(itemId),
  });
  return { response, attempts, calls: generateMove.mock.calls.length };
}

const ch = (code: number) => String.fromCharCode(code);

// [text, concatenation that must be named]
const NUMERIC_SPLITS: Array<[string, string]> = [
  ['The leaf consists of thou-sands of bounded units.', 'thousands'],
  ['hun-dreds', 'hundreds'],
  ['hun.dreds', 'hundreds'],
  ['hun_dreds', 'hundreds'],
  ['hun/dreds', 'hundreds'],
  ['hun,dreds', 'hundreds'],
  ['hun-dred', 'hundred'],
  ['thir-teen', 'thirteen'],
  ['quintup-ling', 'quintupling'],
  ['hun dreds', 'hundreds'],
  ['thou sands', 'thousands'],
  [`hun${ch(0x2013)}dreds`, 'hundreds'], // en dash
  [`hun${ch(0x2010)}dreds`, 'hundreds'], // Unicode hyphen
  [`hun${ch(0x2212)}dreds`, 'hundreds'], // minus sign
  [`hun${ch(0xff0e)}dreds`, 'hundreds'], // fullwidth full stop
  [`hun${ch(0xff3f)}dreds`, 'hundreds'], // fullwidth low line
  [`hun${ch(0x2044)}dreds`, 'hundreds'], // fraction slash
  [`hun${ch(0x00b7)}dreds`, 'hundreds'], // middle dot
  [`hun${ch(0x2024)}dreds`, 'hundreds'], // one dot leader
  [`hun${ch(0x2027)}dreds`, 'hundreds'], // hyphenation point
  [`hun${ch(0x2019)} dreds`, 'hundreds'], // right single quote then space
  ['hun - dreds', 'hundreds'],
  ['hun--dreds', 'hundreds'],
  ['hun-_dreds', 'hundreds'],
  ['hun. dreds', 'hundreds'],
  ['hun\n\tdreds', 'hundreds'],
  ['t-e-n', 'ten'],
  ['ten-fold', 'tenfold'],
  ['six ty fol d', 'sixtyfold'],
  ['bill ion', 'billion'],
  ['mill ion s', 'millions'],
  ['qua-dru-ple', 'quadruple'],
  ['sep-tup-let', 'septuplet'],
  ['cen tu ry', 'century'],
  ['dou ble', 'double'],
  ['twen ty', 'twenty'],
];

describe('SCI6-NUM-FRAGMENT split number words are rejected', () => {
  it.each(NUMERIC_SPLITS)('rejects %j, naming %s', (text, joined) => {
    expect(structureViolationsOf(text), text).toContain(NUMERIC);
    expect(structureTriggersOf(text), text).toContainEqual({ rule: NUMERIC, token: joined });
  });

  it('rejects the headline example with exactly the concatenation as the trigger', () => {
    expect(structureTriggersOf('The leaf consists of thou-sands of bounded units.')).toEqual([
      { rule: NUMERIC, token: 'thousands' },
    ]);
    expect(structureViolationsOf('The leaf consists of hun.dreds of units.')).toEqual([NUMERIC]);
  });

  it('rejects hyphen, dot and space together and mixed case', () => {
    for (const text of ['Hun-Dreds of units', 'HUN DREDS of units', 'Thou. Sands of units']) {
      expect(structureViolationsOf(text), text).toContain(NUMERIC);
    }
  });

  it.each([
    ['two fragments', 'hun-dreds'],
    ['three fragments', 'mil-li-ons'],
    ['three fragments, spaces', 'hun d red'],
    ['four fragments', 'ni ne te en'],
    ['four fragments, mixed separators', 'tho.us-and_th'],
  ])('rejects a %s split (%s)', (_label, text) => {
    expect(structureViolationsOf(text)).toContain(NUMERIC);
  });
});

describe('SCI6-NUM-FRAGMENT compact alias splits', () => {
  it.each([
    ['op-tion-two', 'optiontwo'],
    ['opt ion thr ee', 'optionthree'],
    ['sam ple two', 'sampletwo'],
    ['cho ice thr ee', 'choicethree'],
    ['let-ter-four', 'letterfour'],
    ['exam ple ni ne', 'examplenine'],
    ['cell-sec-ond', 'cellsecond'],
    ['optionth-ree', 'optionthree'],
  ])('rejects %j as an alias (%s)', (text, joined) => {
    expect(structureViolationsOf(text), text).toContain(ALIAS);
    expect(structureTriggersOf(text), text).toContainEqual({ rule: ALIAS, token: joined });
  });

  it('rejects an alias noun split from a letter suffix', () => {
    expect(structureTriggersOf('sample-b')).toContainEqual({ rule: ALIAS, token: 'sampleb' });
  });
});

describe('SCI6-NUM-FRAGMENT placement', () => {
  it('rejects a split in the message', () => {
    expect(
      scienceStructureViolations('Think about thou-sands of units.', 'What happens?'),
    ).toContain(NUMERIC);
  });

  it('rejects a split in the question', () => {
    expect(scienceStructureViolations('Look closely.', 'Are there hun dreds of units?')).toContain(
      NUMERIC,
    );
  });

  it.each([
    ['Think about hun', 'dreds of units.'],
    ['Think about hun-', 'dreds of units.'],
    ['Think about hun.', 'dreds of units.'],
    ['Think about thou', 'sands of units.'],
    ['Think about thou ', ' sands of units.'],
    ['Think about thir', 'teen units.'],
    ['Think about quintup', 'ling it.'],
    ['Think about mil-li', 'ons of units.'],
    ['Think about mil', 'li-ons of units.'],
    ['Think about op', 'tion-two.'],
  ])('rejects a split across the field join %j + %j', (message, question) => {
    const violations = scienceStructureViolations(message, question);
    expect(violations.length, `${message}|${question}`).toBeGreaterThan(0);
    expect(violations.some((v) => v === NUMERIC || v === ALIAS)).toBe(true);
    expect(scienceStructureTriggers(message, question).length).toBeGreaterThan(0);
  });

  it('does not let a split on its own side of the join hide behind the other field', () => {
    expect(scienceStructureViolations('Look closely.', 'Why thou-sands?')).toContain(NUMERIC);
    expect(scienceStructureViolations('Why thou-sands?', 'Look closely.')).toContain(NUMERIC);
  });

  it.each(SCIENCE_ITEM_IDS)('falls back through the complete harness on %s', async (itemId) => {
    for (const [message, question] of [
      ['The leaf consists of thou-sands of bounded units.', 'What do you notice?'],
      ['Look closely at the boundary.', 'Are there hun dreds of tiny units?'],
      ['Think about hun', 'dreds of tiny units.'],
      ['Look closely at the op-tion-two idea.', 'What do you notice?'],
    ] as const) {
      const { response, attempts, calls } = await throughHarness(itemId, message, question);
      expect(response.status, `${message}|${question}`).toBe('fallback');
      expect(calls).toBe(2);
      expect(response.move).toBeUndefined();
      expect(response.fallbackMessage).toBe(SCIENCE_FALLBACK_MESSAGE);
      expect(response.masteryAdvanced).toBe(false);
      for (const attempt of attempts) {
        expect(
          attempt.reasons.some((reason) => reason === NUMERIC || reason === ALIAS),
          attempt.reasons.join(','),
        ).toBe(true);
      }
    }
  });
});

describe('SCI6-NUM-FRAGMENT positive controls', () => {
  it.each([
    'The leaf is cell-like in some ways.',
    'Is the process light-dependent or water-based?',
    'Think about a multi-step process.',
    'This is a well-known idea about living things.',
    "Don't worry, it's the cell's boundary that matters, and we're looking at it.",
    'You can say that in some cases the ribosome is easy to spot.',
    'Plants make food in their leaves, so look closely at the boundary.',
    'What does the boundary let in and keep out of the cell?',
    'The cell membrane controls what passes through, so what might that look like?',
    'Some parts work together, coupled with others, for some reason.',
    'Look at the bill of rights for the tune, then the sea, then the leaf.',
    'Each part has a job, and the parts work together as a system.',
    'What would happen to the leaf-like part if the water-based fluid was removed?',
    'Check the run-time notes and the well-known, light-dependent step.',
  ])('still validates: %s', (text) => {
    // Standalone "a" is rejected by D-281 regardless of fragments; compare to base behaviour.
    const letters = structureTriggersOf(text).filter(
      (t) => t.rule !== 'standalone_letter_detected',
    );
    expect(letters, text).toEqual([]);
  });

  it('keeps hyphenated science words valid in a full sentence', () => {
    for (const text of [
      'Is the process light-dependent or water-based?',
      'Think about how cell-like and well-known parts work together.',
    ]) {
      expect(structureViolationsOf(text), text).toEqual([]);
    }
  });

  it('single-celled is rejected only through the whole token "single" (unchanged by D-305)', () => {
    expect(structureTriggersOf('single-celled')).toEqual([{ rule: NUMERIC, token: 'single' }]);
  });

  it('adds no fragment trigger to ordinary adjacent words', () => {
    for (const text of [
      'cell wall',
      'cell membrane',
      'for tune',
      'in some cases',
      'the ribosome',
      'coupled with',
      'bill of rights',
      'the sea sons',
      'run time',
      'out line',
    ]) {
      expect(structureTriggersOf(text), text).toEqual([]);
    }
  });

  it('never joins across other punctuation or a digit, as before', () => {
    expect(structureViolationsOf('Look (closely) at the cell wall.')).toEqual([]);
    expect(structureTriggersOf('hun-3-dreds').some((t) => t.rule === NUMERIC)).toBe(true);
  });

  it('validates a clean reply through the complete harness on all six items', async () => {
    for (const itemId of SCIENCE_ITEM_IDS) {
      const { response, calls } = await throughHarness(
        itemId,
        'Look closely at the boundary and think about how the parts are light-dependent or water-based.',
        'What do you notice about the way the parts work together?',
      );
      expect(response.status, itemId).toBe('validated');
      expect(calls).toBe(1);
    }
  });
});

// rev2 (D-307, review r1 F1 to F3).
const REV2_REJECTIONS: Array<[string, string]> = [
  ['bi fold', 'bifold'],
  ['bi fo ld', 'bifold'],
  ['mono some', 'monosome'],
  ['poly some', 'polysome'],
  ['option bi fold', 'optionbifold'],
  ["hun'd reds", 'hundreds'],
  [`hun${String.fromCharCode(0x2019)}d reds`, 'hundreds'],
  ["thou's ands", 'thousands'],
  ["hun's dreds", 'hundreds'],
  ['tri fold', 'trifold'],
  ['ten fold', 'tenfold'],
];

describe('SCI6-NUM-FRAGMENT rev2 closures (F1, F2)', () => {
  it('pins the closed count-prefix list', () => {
    expect(SCIENCE_COUNT_PREFIXES).toHaveLength(21);
    expect(SCIENCE_COUNT_PREFIXES).toEqual(
      expect.arrayContaining(['mono', 'di', 'bi', 'tri', 'poly', 'multi', 'semi', 'kilo']),
    );
  });

  it.each(REV2_REJECTIONS)('rejects %j in the message, the question and the joins', (text) => {
    expect(structureViolationsOf(text), text).not.toEqual([]);
    expect(scienceStructureViolations(`Look at ${text} here.`, 'What happens?'), text).not.toEqual(
      [],
    );
    expect(scienceStructureViolations('Look closely.', `Why ${text}?`), text).not.toEqual([]);
    // Field split at every space.
    const words = text.split(' ');
    for (let cut = 1; cut < words.length; cut += 1) {
      const message = `Look at ${words.slice(0, cut).join(' ')}`;
      const question = `${words.slice(cut).join(' ')} here?`;
      expect(scienceStructureViolations(message, question), `${message}|${question}`).not.toEqual(
        [],
      );
    }
    // Mid-word field split.
    const flat = text.replace(/ /gu, '');
    expect(scienceStructureViolations(flat.slice(0, 2), flat.slice(2)), text).not.toEqual([]);
  });

  it('names the numeric concatenation', () => {
    for (const [text, joined] of REV2_REJECTIONS.filter(([, j]) => !j.startsWith('option'))) {
      expect(structureTriggersOf(text), text).toContainEqual({ rule: NUMERIC, token: joined });
    }
    expect(structureViolationsOf('option bi fold')).toContain(NUMERIC);
  });

  it('pins bi fold and bi fo ld (review r1 F3)', () => {
    expect(structureViolationsOf('bi fold')).toEqual([NUMERIC]);
    expect(structureViolationsOf('bi fo ld')).toEqual([NUMERIC]);
  });

  it.each(SCIENCE_ITEM_IDS)(
    'falls back on the rev2 splits through the harness on %s',
    async (id) => {
      for (const [text] of REV2_REJECTIONS) {
        const flat = text.split(' ');
        for (const [message, question] of [
          [`Look at ${text} here.`, 'What do you notice?'],
          ['Look closely.', `Why ${text}?`],
          [`Look at ${flat[0]}`, `${flat.slice(1).join(' ')} here?`],
        ] as const) {
          const { response, calls } = await throughHarness(id, message, question);
          expect(response.status, `${message}|${question}`).toBe('fallback');
          expect(calls).toBe(2);
        }
      }
    },
  );

  it('keeps ordinary contractions and possessives valid', () => {
    for (const text of [
      "It's the cell's boundary, and we're looking at it.",
      "Don't worry, they'll see what you'd notice.",
      "The leaf's parts work, and the cell's wall helps.",
    ]) {
      expect(structureViolationsOf(text), text).toEqual([]);
    }
  });

  it('keeps benign some/fold phrases valid', () => {
    for (const text of [
      'in some cases',
      'the ribosome',
      'coupled with',
      'for some reason',
      'the some',
      'manifold',
      'unfold',
      'Think about some parts and fold the paper',
      'the leaf can unfold in some cases',
      'a chromosome and the ribosome',
      'Look at the paper fold and some parts',
      'semi-permeable',
      'cell membrane some of the time',
    ]) {
      const hits = structureTriggersOf(text).filter((t) => t.rule !== 'standalone_letter_detected');
      expect(hits, text).toEqual([]);
    }
  });
});
