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
  const accepted = ['x = 5; check 3(5) + 5 = 20'];

  it('matches an accepted answer with different separator spacing and a trailing period', () => {
    expect(matchesAcceptedAnswer(accepted, 'x = 5 ; check 3(5) + 5 = 20.')).toBe(true);
  });

  it('matches case-insensitively with extra whitespace', () => {
    expect(matchesAcceptedAnswer(accepted, '  X = 5;   CHECK 3(5) + 5 = 20  ')).toBe(true);
  });

  it('still rejects a genuinely different answer', () => {
    expect(matchesAcceptedAnswer(accepted, 'x = 7; check 3(7) + 5 = 26')).toBe(false);
  });

  it('rejects an answer missing a required clause', () => {
    expect(matchesAcceptedAnswer(accepted, 'x = 5')).toBe(false);
  });
});
