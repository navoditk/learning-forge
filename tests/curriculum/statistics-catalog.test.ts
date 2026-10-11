import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  STATISTICS_LESSONS,
  STATISTICS_UNIT,
  STATISTICS_UNIT_REF,
} from '../../src/curriculum/statistics-catalog';

/**
 * Wraps all 3 Statistics skills using already-reviewed production
 * practice content - no new problems. Not yet wired into COURSE_CATALOG;
 * see the source file's header for why.
 */
describe('Statistics domain extension', () => {
  it('covers all 3 skills, one lesson each, in prerequisite order', () => {
    expect(STATISTICS_LESSONS.map((lesson) => lesson.code)).toEqual([
      'statistical-questions-lesson',
      'distributions-lesson',
      'center-and-variability-lesson',
    ]);
    for (const lesson of STATISTICS_LESSONS) {
      expect(lesson.unitRef).toEqual(STATISTICS_UNIT_REF);
      expect(lesson.practiceContentRefs).toHaveLength(2);
    }
  });

  it('the unit lists exactly these 3 lessons in the same order', () => {
    expect(STATISTICS_UNIT.lessonRefs.map((ref) => ref.code)).toEqual(
      STATISTICS_LESSONS.map((lesson) => lesson.code),
    );
  });

  it('pins each practice reference to the real SHA-256 of its already-reviewed record', () => {
    for (const lesson of STATISTICS_LESSONS) {
      for (const ref of lesson.practiceContentRefs) {
        const bytes = readFileSync(
          path.join(process.cwd(), 'content/statistics', `${ref.id}.json`),
        );
        expect(ref.hash, ref.id).toBe(`sha256:${createHash('sha256').update(bytes).digest('hex')}`);
      }
    }
  });
});
