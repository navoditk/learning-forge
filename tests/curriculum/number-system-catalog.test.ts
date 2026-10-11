import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  NUMBER_SYSTEM_LESSONS,
  NUMBER_SYSTEM_UNIT,
  NUMBER_SYSTEM_UNIT_REF,
} from '../../src/curriculum/number-system-catalog';

/**
 * Wraps all 7 Number System skills using already-reviewed production
 * practice content - no new problems. Not yet wired into COURSE_CATALOG;
 * see the source file's header for why.
 */
describe('Number system domain extension', () => {
  it('covers all 7 Number System skills, one lesson each', () => {
    expect(NUMBER_SYSTEM_LESSONS).toHaveLength(7);
    const skillCodes = NUMBER_SYSTEM_LESSONS.flatMap((lesson) =>
      lesson.skillRefs.map((ref) => ref.code),
    );
    expect(new Set(skillCodes)).toEqual(
      new Set([
        'multi-digit-division',
        'gcf-and-lcm',
        'fraction-decimal-operations',
        'division-of-fractions',
        'negative-numbers-and-absolute-value',
        'coordinate-plane',
        'coordinate-distance',
      ]),
    );
    for (const lesson of NUMBER_SYSTEM_LESSONS) {
      expect(lesson.unitRef).toEqual(NUMBER_SYSTEM_UNIT_REF);
      expect(lesson.practiceContentRefs).toHaveLength(2);
    }
  });

  it('the unit lists exactly these 7 lessons, in prerequisite order', () => {
    expect(NUMBER_SYSTEM_UNIT.lessonRefs.map((ref) => ref.code)).toEqual(
      NUMBER_SYSTEM_LESSONS.map((lesson) => lesson.code),
    );
    // fraction-decimal-operations precedes the skill that depends on it.
    const codes = NUMBER_SYSTEM_LESSONS.map((lesson) => lesson.code);
    expect(codes.indexOf('fraction-decimal-operations-lesson')).toBeLessThan(
      codes.indexOf('division-of-fractions-lesson'),
    );
    expect(codes.indexOf('negative-numbers-and-absolute-value-lesson')).toBeLessThan(
      codes.indexOf('coordinate-plane-lesson'),
    );
    expect(codes.indexOf('coordinate-plane-lesson')).toBeLessThan(
      codes.indexOf('coordinate-distance-lesson'),
    );
  });

  it('pins each practice reference to the real SHA-256 of its already-reviewed record', () => {
    for (const lesson of NUMBER_SYSTEM_LESSONS) {
      for (const ref of lesson.practiceContentRefs) {
        const bytes = readFileSync(
          path.join(process.cwd(), 'content/number-system', `${ref.id}.json`),
        );
        expect(ref.hash, ref.id).toBe(`sha256:${createHash('sha256').update(bytes).digest('hex')}`);
      }
    }
  });
});
