import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  EXPRESSIONS_AND_EQUATIONS_LESSONS,
  EXPRESSIONS_AND_EQUATIONS_UNIT,
  EXPRESSIONS_AND_EQUATIONS_UNIT_REF,
} from '../../src/curriculum/expressions-and-equations-catalog';

/**
 * Wraps all 8 Expressions and Equations skills using already-reviewed
 * production practice content - no new problems. Not yet wired into
 * COURSE_CATALOG; see the source file's header for why.
 */
describe('Expressions and equations domain extension', () => {
  it('covers all 8 skills, one lesson each', () => {
    expect(EXPRESSIONS_AND_EQUATIONS_LESSONS).toHaveLength(8);
    const skillCodes = EXPRESSIONS_AND_EQUATIONS_LESSONS.flatMap((lesson) =>
      lesson.skillRefs.map((ref) => ref.code),
    );
    expect(new Set(skillCodes)).toEqual(
      new Set([
        'variables-and-expressions',
        'whole-number-exponents',
        'variables-in-context',
        'dependent-and-independent-variables',
        'equation-and-inequality-meaning',
        'equivalent-expressions',
        'one-variable-equations',
        'real-world-inequalities',
      ]),
    );
    for (const lesson of EXPRESSIONS_AND_EQUATIONS_LESSONS) {
      expect(lesson.unitRef).toEqual(EXPRESSIONS_AND_EQUATIONS_UNIT_REF);
      expect(lesson.practiceContentRefs).toHaveLength(2);
    }
  });

  it('the unit lists exactly these 8 lessons, in prerequisite order', () => {
    expect(EXPRESSIONS_AND_EQUATIONS_UNIT.lessonRefs.map((ref) => ref.code)).toEqual(
      EXPRESSIONS_AND_EQUATIONS_LESSONS.map((lesson) => lesson.code),
    );
    const codes = EXPRESSIONS_AND_EQUATIONS_LESSONS.map((lesson) => lesson.code);
    expect(codes.indexOf('variables-and-expressions-lesson')).toBeLessThan(
      codes.indexOf('variables-in-context-lesson'),
    );
    expect(codes.indexOf('variables-in-context-lesson')).toBeLessThan(
      codes.indexOf('dependent-and-independent-variables-lesson'),
    );
    expect(codes.indexOf('equation-and-inequality-meaning-lesson')).toBeLessThan(
      codes.indexOf('one-variable-equations-lesson'),
    );
    expect(codes.indexOf('equation-and-inequality-meaning-lesson')).toBeLessThan(
      codes.indexOf('real-world-inequalities-lesson'),
    );
  });

  it('pins each practice reference to the real SHA-256 of its already-reviewed record', () => {
    for (const lesson of EXPRESSIONS_AND_EQUATIONS_LESSONS) {
      for (const ref of lesson.practiceContentRefs) {
        const bytes = readFileSync(
          path.join(process.cwd(), 'content/expressions-and-equations', `${ref.id}.json`),
        );
        expect(ref.hash, ref.id).toBe(`sha256:${createHash('sha256').update(bytes).digest('hex')}`);
      }
    }
  });
});
