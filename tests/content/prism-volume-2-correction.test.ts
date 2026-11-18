/**
 * D-350: `prism-volume-2@content-3` removes the substring false accept in
 * `prism-volume-2@content-2` (`parts` matching accepted `12 cubic meters; ...`
 * because `2 cubic meters` is a substring). The correction is a
 * correction, stamped reviewed (D-354) and registered at MATH-GEO-6 beside content-2.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { contentCatalog } from '../../src/content/catalog';
import { matchesAcceptedAnswer } from '../../src/content/answer-matching';
import { LegacyDeterministicValidatorSchema } from '../../src/contracts/content';

const read = (name: string) =>
  JSON.parse(readFileSync(resolve(process.cwd(), 'content/geometry', name), 'utf8'));
const v2 = read('prism-volume-2.json');
const v3 = read('prism-volume-2-content-3.json');

describe('prism-volume-2 content-3 correction (D-350)', () => {
  it('is a delegated-reviewed correction (D-354), registered at MATH-GEO-6 beside content-2', () => {
    expect(`${v3.id}@${v3.version}`).toBe('prism-volume-2@content-3');
    expect(v3.review.status).toBe('reviewed');
    expect(v3.review.reviewedAt).toBe('2026-11-17');
    // Registered at MATH-GEO-6; content-2 stays registered (byte-pinned) for history.
    expect(contentCatalog.filter((i) => i.id === 'prism-volume-2').map((i) => i.version)).toEqual([
      'content-2',
      'content-3',
    ]);
  });

  it('keeps the prompt and hints unchanged and has a schema-valid whole-string validator', () => {
    expect(v3.prompt).toBe(v2.prompt);
    expect(v3.hintSteps).toEqual(v2.hintSteps);
    expect(() => LegacyDeterministicValidatorSchema.parse(v3.deterministicValidator)).not.toThrow();
    expect(v3.deterministicValidator.parts).toBeUndefined();
  });

  it('documents the content-2 false accept (derived, not a change to content-2)', () => {
    expect(
      matchesAcceptedAnswer(v2.deterministicValidator, '12 cubic meters; the space inside the box'),
    ).toBe(true);
  });

  it.each([
    '12 cubic meters; the space inside the box',
    '32 m^3 interior space',
    '2 cubic meters',
    '2 cubic meters; the space outside the box',
    '2 square meters; the space inside the box',
    '22 cubic meters, the space inside the box',
  ])('rejects %s', (response) => {
    expect(matchesAcceptedAnswer(v3.deterministicValidator, response)).toBe(false);
  });

  it('accepts every listed variant and the canonical answer', () => {
    for (const a of [
      v3.deterministicValidator.canonicalAnswer,
      ...v3.deterministicValidator.acceptedAnswers,
    ]) {
      expect(matchesAcceptedAnswer(v3.deterministicValidator, a)).toBe(true);
    }
    expect(
      matchesAcceptedAnswer(v3.deterministicValidator, '2 CUBIC METERS; The space inside the box.'),
    ).toBe(true);
  });
});
