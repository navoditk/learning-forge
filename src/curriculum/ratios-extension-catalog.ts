import type { Lesson, Ref } from '../contracts/progression';
import { LessonSchema } from '../contracts/progression';
import { PILOT_UNIT_REF } from './pilot-catalog';

/**
 * Extends the Ratios and Proportional Reasoning unit to its two remaining
 * skills (`double-number-lines`, `percent-applications`) - the pilot unit
 * only ever covered 3 of the domain's 5 skills. Kept as a standalone file,
 * not merged into pilot-catalog.ts/course-catalog.ts yet: both are
 * currently being actively edited by a concurrent session, and merging
 * into files mid-refactor risks a real collision. Wiring this in (adding
 * these lessons to the unit's lessonRefs, feeding this file's exports into
 * createCourseCatalog's input) is a small, final, additive step once that
 * settles.
 *
 * Each lesson's practiceContentRefs reuse the already-authored, already-
 * reviewed production content for these skills (content/ratios/*.json) -
 * no new practice problems were written. Hashes are SHA-256 of the raw
 * file bytes, matching tests/progression/placement-probe.test.ts's own
 * verification method for the existing pilot lessons.
 *
 * assessmentBankRef below is metadata only (code/version/coverage), per
 * this project's held-out (Branch B, D-01) decision: the bank's actual
 * items must be authored separately and placed in the private package
 * outside this repository before contentHash can be pinned and this
 * extension can actually validate - see review-handoff notes before
 * wiring in. Not yet done; these two lessons cannot pass
 * validateProgressionCatalog until that happens.
 */
const version = '1.0.0';
const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
const skillRef = (code: string): Ref => ({ code, version });
const itemRef = (id: string, hash: string) => ({
  id,
  version: 'content-1',
  hash: `sha256:${hash}`,
});

const review = {
  status: 'reviewed' as const,
  reviewer: 'Navodit Kaushik (product/content owner)',
  reviewedAt: '2026-09-06',
  originalityStatement:
    'Practice content reused verbatim from the already-reviewed production catalog (content/ratios/*.json); no new problems authored for this wrapping.',
};
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };

export const RATIOS_EXTENSION_LESSONS: readonly Lesson[] = [
  LessonSchema.parse({
    code: 'double-number-lines-lesson',
    unitRef: PILOT_UNIT_REF,
    version,
    title: 'Double number lines',
    objectives: ['Match corresponding values on two number lines using a constant scale factor.'],
    skillRefs: [skillRef('double-number-lines')],
    teachingContentRefs: [],
    practiceContentRefs: [
      itemRef(
        'double-number-lines-1',
        '9a3f1e893a12d582bfc016cfbec81840fda1b23fcc064bcee5ccb7fd94ba036b',
      ),
      itemRef(
        'double-number-lines-2',
        '695e59085d7f134b06d22e7a3e30299da4c2e3fd5c9baffd68948a5287814d1f',
      ),
    ],
    assessmentBankRef: { code: 'double-number-lines-lesson-bank', version },
    policyProfileRef,
    provenance,
    review,
  }),
  LessonSchema.parse({
    code: 'percent-applications-lesson',
    unitRef: PILOT_UNIT_REF,
    version,
    title: 'Percent applications',
    objectives: ['Convert between a percent, fraction, and decimal to solve a part-whole problem.'],
    skillRefs: [skillRef('percent-applications')],
    teachingContentRefs: [],
    practiceContentRefs: [
      itemRef(
        'percent-applications-1',
        '7977fde3266e226a7b97007e88a0a940174b79c06f2ace01241af01f9d2cbf52',
      ),
      itemRef(
        'percent-applications-2',
        'ff0cc8f79a1e59cf8cf93d4cc950691377c0b40985eb29bb3f399f1b902fbc85',
      ),
    ],
    assessmentBankRef: { code: 'percent-applications-lesson-bank', version },
    policyProfileRef,
    provenance,
    review,
  }),
];

/**
 * No AssessmentBank records are exported here yet, deliberately: each
 * lesson above references a bank code (`double-number-lines-lesson-bank`,
 * `percent-applications-lesson-bank`) that does not exist as a real
 * record anywhere. `validateProgressionCatalog` requires every lesson's
 * assessmentBankRef to resolve, and `AssessmentBankSchema` requires a
 * positive itemCount and a real SHA-256 contentHash - neither of which
 * can exist until real held-out assessment items are authored and placed
 * in the private package (same workflow as the existing pilot banks'
 * BANK_HASHES in pilot-catalog.ts). Writing a fake bank record here to
 * make validation pass would be worse than leaving this unfinished: it
 * would silently claim assessment coverage that does not exist. These
 * two lessons are real and correct but cannot be wired into
 * COURSE_CATALOG until that content exists.
 */
