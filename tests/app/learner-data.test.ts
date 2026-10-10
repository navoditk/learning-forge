import { describe, expect, it } from 'vitest';

import { SessionSchema } from '../../src/app/learner-data';

const validFigure = {
  svgMarkup:
    '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5"/></svg>',
  altText: 'A square',
  caption: 'A square',
  width: 200,
  height: 120,
};

const base = () => ({
  sessionId: 's1',
  resumed: false,
  completed: false,
  hintCount: 0,
  learner: { displayName: 'Learner' },
  content: {
    id: 'c1',
    version: '1.0.0',
    title: 'T',
    skillCode: 'ratio-language',
    prompt: 'P',
    accessibilityNotes: 'N',
  },
});

describe('SessionSchema', () => {
  it('accepts a session with the optional fields omitted', () => {
    expect(SessionSchema.safeParse(base()).success).toBe(true);
  });

  it('accepts valid optional fields', () => {
    const value = {
      ...base(),
      hintCount: 2,
      latestAttempt: { attemptId: 'a', correctness: 'INCORRECT' },
      latestCheck: { attemptId: 'b', correctness: 'CORRECT' },
      content: { ...base().content, figure: validFigure },
    };
    expect(SessionSchema.safeParse(value).success).toBe(true);
  });

  it('drops fields the learner page does not consume', () => {
    const parsed = SessionSchema.parse({ ...base(), answerKey: 'x' });
    expect(parsed).not.toHaveProperty('answerKey');
  });

  it.each([
    ['latestAttempt', { ...base(), latestAttempt: { unexpected: true } }],
    ['latestCheck', { ...base(), latestCheck: { attemptId: 1, correctness: 'CORRECT' } }],
    ['figure', { ...base(), content: { ...base().content, figure: { unexpected: true } } }],
    [
      'unsafe figure markup',
      {
        ...base(),
        content: {
          ...base().content,
          figure: { ...validFigure, svgMarkup: '<svg viewBox="0 0 1 1"><script/></svg>' },
        },
      },
    ],
    ['version', { ...base(), content: { ...base().content, version: {} } }],
    ['hintCount', { ...base(), hintCount: -1 }],
  ])('rejects an invalid %s rather than ignoring it', (_name, value) => {
    expect(SessionSchema.safeParse(value).success).toBe(false);
  });
});
