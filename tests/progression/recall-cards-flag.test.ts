import { describe, expect, it } from 'vitest';

import { isRecallCardsEnabled } from '../../src/server/recall-cards-flag';

describe('recall-card capability flag', () => {
  it.each([
    [undefined, false],
    ['false', false],
    ['1', false],
    [' TRUE ', false],
    [' true', false],
    ['true ', false],
    ['unknown', false],
    ['true', true],
    ['TRUE', false],
  ] as const)('treats %s as %s', (value, expected) => {
    expect(isRecallCardsEnabled(value)).toBe(expected);
  });
});
