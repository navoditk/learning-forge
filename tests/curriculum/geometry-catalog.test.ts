import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  GEOMETRY_LESSONS,
  GEOMETRY_UNIT,
  GEOMETRY_UNIT_REF,
} from '../../src/curriculum/geometry-catalog';

/**
 * Wraps all 4 Geometry skills using already-reviewed production practice
 * content - no new problems. Not yet wired into COURSE_CATALOG; see the
 * source file's header for why.
 */
describe('Geometry domain extension', () => {
  it('covers all 4 skills, one lesson each', () => {
    expect(GEOMETRY_LESSONS).toHaveLength(4);
    const skillCodes = GEOMETRY_LESSONS.flatMap((lesson) =>
      lesson.skillRefs.map((ref) => ref.code),
    );
    expect(new Set(skillCodes)).toEqual(
      new Set([
        'area-of-composite-shapes',
        'prism-volume',
        'surface-area-and-volume',
        'coordinate-geometry',
      ]),
    );
    for (const lesson of GEOMETRY_LESSONS) {
      expect(lesson.unitRef).toEqual(GEOMETRY_UNIT_REF);
      expect(lesson.practiceContentRefs).toHaveLength(2);
    }
  });

  it('the unit lists exactly these 4 lessons, in prerequisite order', () => {
    expect(GEOMETRY_UNIT.lessonRefs.map((ref) => ref.code)).toEqual(
      GEOMETRY_LESSONS.map((lesson) => lesson.code),
    );
    const codes = GEOMETRY_LESSONS.map((lesson) => lesson.code);
    expect(codes.indexOf('area-of-composite-shapes-lesson')).toBeLessThan(
      codes.indexOf('surface-area-and-volume-lesson'),
    );
  });

  it('pins each practice reference to the real SHA-256 of its already-reviewed record', () => {
    for (const lesson of GEOMETRY_LESSONS) {
      for (const ref of lesson.practiceContentRefs) {
        const bytes = readFileSync(path.join(process.cwd(), 'content/geometry', `${ref.id}.json`));
        expect(ref.hash, ref.id).toBe(`sha256:${createHash('sha256').update(bytes).digest('hex')}`);
      }
    }
  });
});
