import type { Lesson, Ref, Unit } from '../contracts/progression';
import { LessonSchema, UnitSchema } from '../contracts/progression';

/**
 * Wraps all 3 Statistics skills into a new unit, the same way
 * ratios-extension-catalog.ts wraps its domain - reusing already-
 * reviewed production practice content (content/statistics/*.json)
 * verbatim, no new problems authored. See that file's header for why
 * this is not wired into COURSE_CATALOG yet.
 *
 * Lesson order follows the skill prerequisite chain exactly:
 * statistical-questions -> distributions -> center-and-variability.
 */
const version = '1.0.0';
const programRef = { code: 'grade-6-math', version } satisfies Ref;
const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
export const STATISTICS_UNIT_REF = { code: 'statistics', version } satisfies Ref;

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
    'Practice content reused verbatim from the already-reviewed production catalog (content/statistics/*.json); no new problems authored for this wrapping.',
};
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };

function lesson(
  code: string,
  title: string,
  objective: string,
  skillCode: string,
  itemIds: readonly [string, string],
  hashes: readonly [string, string],
): Lesson {
  return LessonSchema.parse({
    code,
    unitRef: STATISTICS_UNIT_REF,
    version,
    title,
    objectives: [objective],
    skillRefs: [skillRef(skillCode)],
    teachingContentRefs: [],
    practiceContentRefs: [itemRef(itemIds[0], hashes[0]), itemRef(itemIds[1], hashes[1])],
    assessmentBankRef: { code: `${code}-bank`, version },
    policyProfileRef,
    provenance,
    review,
  });
}

export const STATISTICS_LESSONS: readonly Lesson[] = [
  lesson(
    'statistical-questions-lesson',
    'Statistical questions',
    'Distinguishes a statistical question that anticipates variability from a question with a single answer.',
    'statistical-questions',
    ['statistical-questions-1', 'statistical-questions-2'],
    [
      'a1a556d33dcc468ff152bc5e231ffb4d6539b773bd7a8a86c2404fa603022afa',
      '5fe100d72db8437b0c8e1bdffd0bd8fd5048a70693b0b9ae56b66027b9190189',
    ],
  ),
  lesson(
    'distributions-lesson',
    'Distributions',
    'Describes the shape, center, and spread of a data distribution shown in a dot plot, histogram, or box plot.',
    'distributions',
    ['distributions-1', 'distributions-2'],
    [
      '5cef737cae53abf1c0ecb4bcba5e24bbdcba07f28bfcdfa756584d88f7494f20',
      '57a3a3356ac0340623b163b27fbf7ba51256aeaa8021773b8b2dca7db02e3ac4',
    ],
  ),
  lesson(
    'center-and-variability-lesson',
    'Center and variability',
    'Calculates and compares measures of center (mean, median) and variability (range, interquartile range) for a data set.',
    'center-and-variability',
    ['center-and-variability-1', 'center-and-variability-2'],
    [
      '8cb3218d4d591db0bf9910d1f0a50e1d176db09cf199284a580b4cf1e532f793',
      '8a7ce203e180388c807cb4143fc9975453de604e793222aef71b821fa98d57d8',
    ],
  ),
];

export const STATISTICS_UNIT: Unit = UnitSchema.parse({
  code: STATISTICS_UNIT_REF.code,
  programRef,
  version,
  title: 'Statistics',
  summary:
    'Build fluency distinguishing statistical questions, describing distributions, and calculating measures of center and variability.',
  lessonRefs: STATISTICS_LESSONS.map(({ code, version: lessonVersion }) => ({
    code,
    version: lessonVersion,
  })),
  policyProfileRef,
  provenance,
  review,
});
