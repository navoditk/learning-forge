import { describe, expect, it } from 'vitest';

import { matchesAcceptedAnswer, normalizeAnswer } from '../../src/content/answer-matching';

describe('normalizeAnswer', () => {
  it('trims, lowercases, and collapses internal whitespace', () => {
    expect(normalizeAnswer('  X =   5  ')).toBe('x = 5');
  });

  it('strips a trailing terminal punctuation mark', () => {
    expect(normalizeAnswer('x = 5.')).toBe('x = 5');
    expect(normalizeAnswer('x = 5;')).toBe('x = 5');
    expect(normalizeAnswer('x = 5!')).toBe('x = 5');
  });

  it('normalizes spacing around internal separators', () => {
    expect(normalizeAnswer('x = 5 ;check 3(5)+5=20')).toBe('x = 5; check 3(5)+5=20');
    expect(normalizeAnswer('x = 5,check')).toBe('x = 5, check');
    expect(normalizeAnswer('x = 5  ;   check')).toBe('x = 5; check');
  });

  it('does not alter meaningful internal punctuation beyond separator spacing', () => {
    expect(normalizeAnswer('3(5) + 5 = 20')).toBe('3(5) + 5 = 20');
  });
});

describe('matchesAcceptedAnswer', () => {
  const validator = { acceptedAnswers: ['x = 5; check 3(5) + 5 = 20'] };

  it('matches an accepted answer with different separator spacing and a trailing period', () => {
    expect(matchesAcceptedAnswer(validator, 'x = 5 ; check 3(5) + 5 = 20.')).toBe(true);
  });

  it('matches case-insensitively with extra whitespace', () => {
    expect(matchesAcceptedAnswer(validator, '  X = 5;   CHECK 3(5) + 5 = 20  ')).toBe(true);
  });

  it('still rejects a genuinely different answer', () => {
    expect(matchesAcceptedAnswer(validator, 'x = 7; check 3(7) + 5 = 26')).toBe(false);
  });

  it('rejects an answer missing a required clause', () => {
    expect(matchesAcceptedAnswer(validator, 'x = 5')).toBe(false);
  });
});

describe('matchesAcceptedAnswer with parts (M2)', () => {
  const validator = {
    acceptedAnswers: ['x = 24; check (3/4)(24) = 18'],
    parts: [{ accepted: ['x = 24', 'x=24'] }, { accepted: ['(3/4)(24) = 18', '18 = 18'] }],
  };

  it('matches when each part appears, in a differently-phrased whole response', () => {
    expect(
      matchesAcceptedAnswer(validator, 'x=24, and checking the original equation gives 18 = 18'),
    ).toBe(true);
  });

  it('matches parts in either order', () => {
    expect(matchesAcceptedAnswer(validator, '18 = 18, so x = 24')).toBe(true);
  });

  it('rejects a response missing one required part', () => {
    expect(matchesAcceptedAnswer(validator, 'x = 24')).toBe(false);
  });

  it('rejects a response that gets the value wrong', () => {
    expect(matchesAcceptedAnswer(validator, 'x = 20, and 18 = 18')).toBe(false);
  });

  it('falls back to whole-string matching when parts is absent', () => {
    const withoutParts = { acceptedAnswers: ['x = 5; check 3(5) + 5 = 20'] };
    expect(matchesAcceptedAnswer(withoutParts, 'x = 5; check 3(5) + 5 = 20')).toBe(true);
    expect(matchesAcceptedAnswer(withoutParts, '3(5) + 5 = 20; x = 5')).toBe(false);
  });
});
