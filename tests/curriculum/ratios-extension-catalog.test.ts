import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { RATIOS_EXTENSION_LESSONS } from '../../src/curriculum/ratios-extension-catalog';
import { PILOT_UNIT_REF } from '../../src/curriculum/pilot-catalog';

/**
 * These two lessons wrap the Ratios domain's two remaining skills
 * (`double-number-lines`, `percent-applications`) using already-reviewed
 * production practice content - no new problems. Not yet wired into
 * COURSE_CATALOG (see the file's own header for why: no real held-out
 * assessment bank exists for either lesson yet).
 */
describe('Ratios domain extension (double-number-lines, percent-applications)', () => {
  it('covers exactly the two skills missing from the pilot unit', () => {
    expect(RATIOS_EXTENSION_LESSONS.map((lesson) => lesson.code)).toEqual([
      'double-number-lines-lesson',
      'percent-applications-lesson',
    ]);
    for (const lesson of RATIOS_EXTENSION_LESSONS) {
      expect(lesson.unitRef).toEqual(PILOT_UNIT_REF);
      expect(lesson.practiceContentRefs).toHaveLength(2);
    }
  });

  it('pins each practice reference to the real SHA-256 of its already-reviewed record', () => {
    for (const lesson of RATIOS_EXTENSION_LESSONS) {
      for (const ref of lesson.practiceContentRefs) {
        const bytes = readFileSync(path.join(process.cwd(), 'content/ratios', `${ref.id}.json`));
        expect(ref.hash, ref.id).toBe(`sha256:${createHash('sha256').update(bytes).digest('hex')}`);
      }
    }
  });

  it('is not yet wired into the program unit, by design (no assessment bank exists yet)', async () => {
    const { programsByCode } = await import('../../src/curriculum/program-registry');
    const program = programsByCode.get('grade-6-math');
    const lessonCodes = RATIOS_EXTENSION_LESSONS.map((lesson) => lesson.code);
    // This assertion should start failing the day these lessons are wired
    // in - that's the intended trigger to update/retire this test, not a
    // bug in it.
    expect(program?.unitRefs).toEqual([PILOT_UNIT_REF]);
    expect(lessonCodes).not.toHaveLength(0);
  });
});
