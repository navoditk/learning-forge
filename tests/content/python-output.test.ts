import { describe, expect, it } from 'vitest';

import { matchesAcceptedAnswer, normalizeAnswer } from '../../src/content/answer-matching';
import {
  evaluatePythonOutput,
  normalizePythonOutputResponse,
  projectPythonPresentation,
  PYTHON_INVALID_MESSAGES,
  PYTHON_INVALID_REASONS,
  PYTHON_OUTPUT_EVALUATOR_VERSION,
} from '../../src/content/python-output';
import {
  evaluateSubmission,
  InvalidResponseError,
  scoreSubmission,
  StructuredResponseRefusedError,
} from '../../src/progression/assessment-submission';
import type { DeterministicValidator } from '../../src/contracts/content';
import { PY_LISTING, PY_VALIDATOR } from '../phase1/python-paths-support';

// Canonical answers use \n for LF. Nothing here runs Python: every case is a
// string comparison against an authored output (dossier 5.2, D-321).
const outcome = (canonical: string, response: string) => {
  const result = evaluatePythonOutput(canonical, response);
  return result.status === 'scored' ? result.correctness : `invalid:${result.reason}`;
};

describe('python_output evaluator: accepted (dossier 5.2)', () => {
  it('matches exact output with or without one final terminator and any line-ending style', () => {
    expect(outcome('True', 'True')).toBe('CORRECT');
    expect(outcome('a\nb', 'a\nb')).toBe('CORRECT');
    expect(outcome('a\nb', 'a\nb\n')).toBe('CORRECT');
    expect(outcome('a\nb', 'a\r\nb\r\n')).toBe('CORRECT');
    expect(outcome('a\nb', 'a\rb')).toBe('CORRECT');
    expect(outcome('a\nb', 'a\r\nb')).toBe('CORRECT');
  });
});

describe('python_output evaluator: incorrect (case, punctuation, number form)', () => {
  it.each([
    ['True', 'true'],
    ['True', 'TRUE'],
    ['7', '7.0'],
    ['Done!', 'Done'],
    ['Done', 'Done!'],
    ['[1, 2]', '[1,2]'],
    ['Hi there', 'hi there'],
  ])('%j vs %j', (canonical, response) => {
    expect(outcome(canonical, response)).toBe('INCORRECT');
  });
});

describe('python_output evaluator: incorrect (whitespace)', () => {
  it.each([
    ['Hi there', 'Hi  there'],
    ['Hi', 'Hi '],
    ['a\nb', '  a\nb'],
    ['a\nb', 'a \nb'],
    ['a\nb', 'a\n\nb'],
    ['a\nb', '\na\nb'],
    ['a\nb', 'a\nb\n\n'],
    ['a\nb', 'a\n\nb\n'],
  ])('%j vs %j', (canonical, response) => {
    expect(outcome(canonical, response)).toBe('INCORRECT');
  });

  it('removes exactly one final terminator and nothing else', () => {
    expect(normalizePythonOutputResponse('a\nb\n\n')).toEqual({
      status: 'ok',
      normalized: 'a\nb\n',
    });
    expect(normalizePythonOutputResponse('  a')).toEqual({ status: 'ok', normalized: '  a' });
    expect(normalizePythonOutputResponse('a  ')).toEqual({ status: 'ok', normalized: 'a  ' });
  });
});

describe('python_output evaluator: incorrect (line structure)', () => {
  it('a b vs a\\nb and b\\na vs a\\nb', () => {
    expect(outcome('a\nb', 'a b')).toBe('INCORRECT');
    expect(outcome('a\nb', 'b\na')).toBe('INCORRECT');
  });
});

describe('python_output evaluator: invalid responses', () => {
  it.each([
    ['an empty response', '', 'EMPTY'],
    ['a lone newline', '\n', 'EMPTY'],
    ['a lone CRLF', '\r\n', 'EMPTY'],
    ['a tab', 'a\tb', 'DISALLOWED_CHARACTER'],
    ['NUL', 'a\u0000b', 'DISALLOWED_CHARACTER'],
    ['another control character', 'a\u0007b', 'DISALLOWED_CHARACTER'],
    ['DEL', 'a\u007fb', 'DISALLOWED_CHARACTER'],
    ['curly double quotes', '“a”', 'DISALLOWED_CHARACTER'],
    ['a curly apostrophe', 'it’s', 'DISALLOWED_CHARACTER'],
    ['a non-breaking space', 'a b', 'DISALLOWED_CHARACTER'],
    ['a non-ASCII letter', 'café', 'DISALLOWED_CHARACTER'],
    ['an emoji', 'a😀', 'DISALLOWED_CHARACTER'],
    ['over 1000 code units', 'x'.repeat(1001), 'TOO_LONG'],
    ['21 lines', Array.from({ length: 21 }, () => 'a').join('\n'), 'TOO_MANY_LINES'],
  ])('%s', (_label, response, reason) => {
    expect(normalizePythonOutputResponse(response)).toEqual({ status: 'invalid', reason });
    expect(outcome('a', response)).toBe(`invalid:${reason}`);
  });

  it('applies the documented boundaries', () => {
    expect(outcome('a', 'x'.repeat(1000))).toBe('INCORRECT');
    const twenty = Array.from({ length: 20 }, () => 'a').join('\n');
    expect(outcome('a', twenty)).toBe('INCORRECT');
    expect(outcome('a', `${twenty}\n`)).toBe('INCORRECT');
    // 1001 code units is judged before any line-ending conversion.
    expect(normalizePythonOutputResponse(`${'x'.repeat(1000)}\n`)).toEqual({
      status: 'invalid',
      reason: 'TOO_LONG',
    });
  });

  it('gives every reason a neutral message that says nothing about correctness', () => {
    for (const reason of PYTHON_INVALID_REASONS) {
      const message = PYTHON_INVALID_MESSAGES[reason];
      expect(message.length).toBeGreaterThan(0);
      expect(message).not.toMatch(/correct|incorrect|wrong|right|answer is/i);
    }
    expect(PYTHON_INVALID_MESSAGES.DISALLOWED_CHARACTER).toBe(
      'Use plain keyboard characters and straight quotes.',
    );
    expect(PYTHON_INVALID_MESSAGES.EMPTY).toBe('Type at least one line.');
  });
});

describe('type-dispatched submission evaluation', () => {
  const validator = PY_VALIDATOR as unknown as DeterministicValidator;

  it('evaluates a python item on the raw, untrimmed pythonResponse and records the evaluator version', () => {
    const evaluation = evaluateSubmission(validator, { pythonResponse: 'Hi\r\n3\r\n' });
    expect(evaluation).toEqual({
      status: 'scored',
      correctness: 'CORRECT',
      learnerResponse: 'Hi\r\n3\r\n',
      normalizedResponse: 'Hi\n3',
      evaluatorVersion: PYTHON_OUTPUT_EVALUATOR_VERSION,
    });
    expect(PYTHON_OUTPUT_EVALUATOR_VERSION).toBe('python-output-1');
    expect(evaluateSubmission(validator, { pythonResponse: '  Hi\n3' })).toMatchObject({
      correctness: 'INCORRECT',
      normalizedResponse: '  Hi\n3',
    });
  });

  it('returns a typed invalid response, and scoreSubmission throws it before any write', () => {
    const evaluation = evaluateSubmission(validator, { pythonResponse: '\n' });
    expect(evaluation).toEqual({ status: 'invalid_response', reason: 'EMPTY' });
    expect(() => scoreSubmission(evaluation, validator)).toThrow(InvalidResponseError);
    try {
      scoreSubmission(evaluation, validator);
    } catch (error) {
      expect((error as InvalidResponseError).reason).toBe('EMPTY');
      expect((error as Error).message).toBe('Type at least one line.');
    }
  });

  it('refuses a structured or legacy body for a python item (mode mismatch), never scoring it', () => {
    for (const body of [
      { structuredResponse: { mode: 'structured-fields', modeVersion: '1', fields: {} } },
      { learnerResponse: 'Hi\n3' },
    ]) {
      const evaluation = evaluateSubmission(validator, body);
      expect(evaluation).toMatchObject({ status: 'refused', code: 'RESPONSE_MODE_MISMATCH' });
      expect(() => scoreSubmission(evaluation, validator)).toThrow(StructuredResponseRefusedError);
    }
  });

  it('refuses a pythonResponse for a non-python item', () => {
    const legacy = {
      type: 'text',
      canonicalAnswer: 'a',
      acceptedAnswers: ['a'],
      equivalenceNotes: 'n',
    } as DeterministicValidator;
    expect(evaluateSubmission(legacy, { pythonResponse: 'a' })).toMatchObject({
      status: 'refused',
      code: 'RESPONSE_MODE_MISMATCH',
    });
  });

  it('never uses the legacy matcher or the legacy normalization for python', () => {
    expect(normalizeAnswer('TRUE')).toBe(normalizeAnswer('true'));
    expect(matchesAcceptedAnswer({ acceptedAnswers: ['Done!'] }, 'done')).toBe(true);
    const done = {
      ...validator,
      canonicalAnswer: 'Done!',
      acceptedAnswers: ['Done!'],
    } as DeterministicValidator;
    expect(evaluateSubmission(done, { pythonResponse: 'done' })).toMatchObject({
      correctness: 'INCORRECT',
    });
    expect(evaluateSubmission(done, { pythonResponse: 'Done' })).toMatchObject({
      correctness: 'INCORRECT',
    });
  });
});

describe('legacy evaluation is unchanged (regression)', () => {
  const legacy = {
    type: 'text',
    canonicalAnswer: 'a',
    acceptedAnswers: ['a'],
    equivalenceNotes: 'n',
  } as DeterministicValidator;

  it('legacy evaluation still goes through the unchanged normalizer and matcher', () => {
    expect(evaluateSubmission(legacy, { learnerResponse: 'A.' })).toEqual({
      status: 'legacy',
      learnerResponse: 'A.',
    });
    expect(normalizeAnswer(' A. ')).toBe('a');
  });
});

describe('learner presentation projection', () => {
  it('projects the public listing only, for a python item', () => {
    const projected = projectPythonPresentation({
      deterministicValidator: PY_VALIDATOR,
      codeListing: PY_LISTING as never,
    });
    expect(projected).toEqual({ answerKind: 'python_output', codeListing: PY_LISTING });
    const text = JSON.stringify(projected);
    expect(text).not.toContain('canonicalAnswer');
    expect(text).not.toContain('acceptedAnswers');
    expect(text).not.toContain('equivalenceNotes');
  });

  it('projects nothing for any other item', () => {
    expect(
      projectPythonPresentation({
        deterministicValidator: { type: 'text' },
        codeListing: PY_LISTING as never,
      }),
    ).toEqual({});
    expect(projectPythonPresentation({ deterministicValidator: PY_VALIDATOR })).toEqual({});
  });
});
