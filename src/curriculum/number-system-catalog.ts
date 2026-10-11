import type { Lesson, Ref, Unit } from '../contracts/progression';
import { LessonSchema, UnitSchema } from '../contracts/progression';

/**
 * Wraps all 7 Number System skills into a new unit, the same way
 * ratios-extension-catalog.ts wraps Ratios' 2 missing skills - reusing
 * already-reviewed production practice content (content/number-system/
 * *.json) verbatim, no new problems authored. See that file's header for
 * the two reasons this is not wired into COURSE_CATALOG yet (a
 * concurrent session actively editing the exact files needed to wire
 * units in, and every lesson still needing a real held-out assessment
 * bank this public repository can never hold the actual items for).
 *
 * Lesson order follows the skill prerequisite chain:
 * multi-digit-division and gcf-and-lcm are prerequisite-free;
 * fraction-decimal-operations precedes division-of-fractions;
 * negative-numbers-and-absolute-value precedes coordinate-plane, which
 * precedes coordinate-distance.
 */
const version = '1.0.0';
const programRef = { code: 'grade-6-math', version } satisfies Ref;
const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
export const NUMBER_SYSTEM_UNIT_REF = { code: 'number-system', version } satisfies Ref;

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
    'Practice content reused verbatim from the already-reviewed production catalog (content/number-system/*.json); no new problems authored for this wrapping.',
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
    unitRef: NUMBER_SYSTEM_UNIT_REF,
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

export const NUMBER_SYSTEM_LESSONS: readonly Lesson[] = [
  lesson(
    'multi-digit-division-lesson',
    'Multi-digit division',
    'Divide multi-digit whole numbers fluently using the standard algorithm, including cases with a remainder.',
    'multi-digit-division',
    ['multi-digit-division-1', 'multi-digit-division-2'],
    [
      'ef878d1e37fd16439c73bb347c297894e29fb936bc067f3abaf6c8177c0aa1e9',
      '9106edf64965e299ac0796150c803325e0e281e8e61f53b64bbebfe111b9d986',
    ],
  ),
  lesson(
    'gcf-and-lcm-lesson',
    'GCF and LCM',
    'Find the greatest common factor or least common multiple of two whole numbers up to 100.',
    'gcf-and-lcm',
    ['gcf-and-lcm-1', 'gcf-and-lcm-2'],
    [
      'd5fd5b11598a891e6656380f664311f36e43acbaa3b99e61b40b19babc8791ff',
      'd913eb40c7567c342430d9eaa8aed2cd7383b51a059915bbdcdf09bd04b956ec',
    ],
  ),
  lesson(
    'fraction-decimal-operations-lesson',
    'Fraction and decimal operations',
    'Add, subtract, multiply, or divide fractions and decimals with correct place value or common denominators.',
    'fraction-decimal-operations',
    ['fraction-decimal-operations-1', 'fraction-decimal-operations-2'],
    [
      'd7e2b1bbd0a85d69a1c752270224fb17620357743121165b4ba2b18b737947f2',
      '425078e463b1b2c6d7c5813faa3f4b663b38c1cfa1d79060da0b0a8c32a634ca',
    ],
  ),
  lesson(
    'division-of-fractions-lesson',
    'Division of fractions',
    'Divide a fraction by a fraction and interpret the quotient in context.',
    'division-of-fractions',
    ['division-of-fractions-1', 'division-of-fractions-2'],
    [
      '1d7b66867b963f2ceb12b858c8f14774d4eaa526bc76d287bd5ccfd17c466215',
      'abc354616c79907dc802a0c1152e8bbfb88f162021eb92cd10ca5d78f2abe2d4',
    ],
  ),
  lesson(
    'negative-numbers-and-absolute-value-lesson',
    'Negative numbers and absolute value',
    'Order signed numbers and evaluate the absolute value of a number in context.',
    'negative-numbers-and-absolute-value',
    ['negative-numbers-and-absolute-value-1', 'negative-numbers-and-absolute-value-2'],
    [
      'f06711ca1199b659cf57999f6db2076cc57112084d7c298c5590f78936fda9d6',
      '54f0eae47e7084608f4edb5ff18fab7fcd59de692bdbfc71b33232a5270fce02',
    ],
  ),
  lesson(
    'coordinate-plane-lesson',
    'Coordinate plane',
    'Plot and identify coordinates in all four quadrants of the coordinate plane.',
    'coordinate-plane',
    ['coordinate-plane-1', 'coordinate-plane-2'],
    [
      '1d3a9b5e5ecca762467b41a4327d7cd955dfffc74fede9d727df638a6cb3e2c2',
      '12a93561027048b58127555772d5aaa9d441eb6227db9f9dea2f3790fb5da4e7',
    ],
  ),
  lesson(
    'coordinate-distance-lesson',
    'Coordinate distance',
    'Find the distance between two points that share an x- or y-coordinate using the absolute value of the coordinate difference.',
    'coordinate-distance',
    ['coordinate-distance-1', 'coordinate-distance-2'],
    [
      'b9d6082b2855c006b4f16f51e17c9e6687683de477703f4e135eb3a23ea1c73f',
      '4ff3f45300d02d0586a3a465336c7768e53a93f338e548c2b49c2201a272a300',
    ],
  ),
];

export const NUMBER_SYSTEM_UNIT: Unit = UnitSchema.parse({
  code: NUMBER_SYSTEM_UNIT_REF.code,
  programRef,
  version,
  title: 'Number system',
  summary:
    'Build fluency with multi-digit division, factors and multiples, fraction/decimal operations, signed numbers, and the coordinate plane.',
  lessonRefs: NUMBER_SYSTEM_LESSONS.map(({ code, version: lessonVersion }) => ({
    code,
    version: lessonVersion,
  })),
  policyProfileRef,
  // No unit-level assessmentBankRef yet - optional on the schema, and
  // omitted here for the same reason every lesson-level bank is deferred
  // (see file header). Each lesson's own bank is still required and is
  // the actual blocker, not this.
  provenance,
  review,
});
