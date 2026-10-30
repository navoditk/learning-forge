import { describe, expect, it } from 'vitest';

import { containsProtectedAnswer } from '../../src/contracts/answer-leakage';
import { normalizeNumberWords } from '../../src/contracts/number-words';
import { contentCatalog, contentSkillCode } from '../../src/content/catalog';
import { skillsByCode } from '../../src/curriculum/catalog';
import { SCIENCE_PROGRAM_CODE } from '../../src/curriculum/science-rules';
import { FakeTutorModel, TutorHarness } from '../../src/tutor';
import type { TutorState } from '../../src/tutor/policy';

/**
 * SU-H7-FIX2 rev4: closure tests for Codex review r3 findings 3 and 4.
 * Findings 1 and 2 (selection) are closed by the D-281 structural contract and
 * pinned in science-structure-contract.test.ts (prior_failure and
 * numeric_selection classes). Fake model only; no network.
 */

const ch = (code: number) => String.fromCharCode(code);

describe('r3 finding 3: unary signs in the shared numeric detector (Math and Science)', () => {
  it('rejects the reproduced examples', () => {
    expect(containsProtectedAnswer(`The answer is negative 1${ch(0x2154)}.`, ['-5/3'])).toBe(true);
    expect(containsProtectedAnswer('The answer is minus 1/2.', ['-1/2'])).toBe(true);
    expect(containsProtectedAnswer('The answer is negative quarter.', ['-1/4'])).toBe(true);
  });

  it('applies the sign to every supported operand, with exact values', () => {
    const cases: [string, string][] = [
      ['negative seven', '-7'],
      ['minus three', '-3'],
      ['negative 7', '-7'],
      ['minus 0.5', '-1/2'],
      ['negative 0.25', '-0.25'],
      ['minus 3/4', '-0.75'],
      ['negative 3 3/4', '-15/4'],
      ['negative 3 and 3/4', '-3.75'],
      ['negative three and three quarters', '-15/4'],
      [`negative 1${ch(0x2154)}`, '-5/3'],
      [`${ch(0x2212)}1${ch(0x2154)}`, '-5/3'],
      [`minus ${ch(0xbd)}`, '-1/2'],
      ['negative half', '-1/2'],
      ['minus a third', '-1/3'],
      ['negative third', '-1/3'],
      ['minus quarter', '-0.25'],
      ['negative one and a half', '-3/2'],
    ];
    for (const [form, answer] of cases) {
      expect(containsProtectedAnswer(`The answer is ${form}.`, [answer]), form).toBe(true);
    }
    expect(normalizeNumberWords(`negative 1${ch(0x2154)}`)).toBe('-5/3');
    expect(normalizeNumberWords('minus 1/2')).toBe('-1/2');
    expect(normalizeNumberWords('negative quarter')).toBe('-1/4');
  });

  it('a positive value does not match its negative, and a negative does not match its positive', () => {
    expect(containsProtectedAnswer(`The answer is 1${ch(0x2154)}.`, ['-5/3'])).toBe(false);
    expect(containsProtectedAnswer('The answer is negative 7.', ['7'])).toBe(true); // literal "7"
    expect(containsProtectedAnswer('The answer is negative 5/3.', ['5/3'])).toBe(true); // literal
    expect(containsProtectedAnswer('The answer is negative two thirds.', ['0.6667'])).toBe(false);
  });

  it('binary subtraction keeps its meaning, in digits and in words', () => {
    for (const text of ['Try 9 minus 4.', 'Try nine minus four.', 'Work out 10 minus 1/2.']) {
      expect(containsProtectedAnswer(text, ['-4']), text).toBe(false);
      expect(containsProtectedAnswer(text, ['-1/2']), text).toBe(false);
    }
    expect(normalizeNumberWords('9 minus 4')).toBe('9 minus 4');
    expect(normalizeNumberWords('(2) minus 4')).toBe('(2) minus 4');
  });
});

type Item = (typeof contentCatalog)[number];
const isScience = (record: Item) =>
  skillsByCode.get(contentSkillCode(record))?.program === SCIENCE_PROGRAM_CODE;

/**
 * Drives the fake tutor exactly as the hint route does
 * (src/app/api/phase1/hint/route.ts) and as getTutorContext rebuilds state
 * between requests: the next request's state is the last returned move and
 * priorHintCount counts the returned moves. A fallback stores no interaction
 * (recordTutorResponse), so it never advances this journey.
 */
async function journey(record: Item, steps: number) {
  const harness = new TutorHarness(new FakeTutorModel());
  let state: TutorState = 'awaiting_attempt';
  const moves: string[] = [];
  for (let step = 0; step < steps; step += 1) {
    const response = await harness.respond({
      prompt: record.prompt,
      learnerMessage: 'I am stuck, can you help?',
      redactedSkillContext: `content:${record.id}; skill:${contentSkillCode(record)}`,
      state,
      mode: 'math_tutor',
      subjectFraming: isScience(record) ? 'science' : 'math',
      genuineAttempt: true,
      priorHintCount: moves.length,
      attemptNumber: 1,
      protectedTokens: [
        record.deterministicValidator.canonicalAnswer,
        ...record.forbiddenLeakagePatterns,
      ],
    });
    if (response.status !== 'validated' || !response.move) {
      return { moves, stalledAt: step, state };
    }
    expect(response.masteryAdvanced).toBe(false);
    moves.push(response.move.moveType);
    state = response.nextState;
  }
  return { moves, stalledAt: undefined, state };
}

describe('r3 finding 4: fake-tutor journeys never dead-end (served behaviour)', () => {
  it('both affected Science items return a move, then a further authorized move', async () => {
    for (const id of ['sci6-cells-evidence-of-life-2', 'sci6-cell-as-a-system-2']) {
      const record = contentCatalog.find((candidate) => candidate.id === id)!;
      const result = await journey(record, 3);
      expect(result.stalledAt, id).toBeUndefined();
      expect(result.moves, id).toHaveLength(3);
      expect(result.state, id).not.toBe('awaiting_attempt');
    }
  });

  it('every catalog item, Math and Science, completes a three-move fake journey', async () => {
    const stalled: string[] = [];
    for (const record of contentCatalog) {
      const result = await journey(record, 3);
      if (result.stalledAt !== undefined) stalled.push(`${record.id}@${result.stalledAt}`);
    }
    expect(stalled).toEqual([]);
  });
});
