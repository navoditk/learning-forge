import type { Lesson, Ref, Unit } from '../contracts/progression';
import { LessonSchema, UnitSchema } from '../contracts/progression';

/**
 * Wraps all 4 Geometry skills into a new unit, the same way
 * ratios-extension-catalog.ts wraps its domain - reusing already-reviewed
 * production practice content (content/geometry/*.json) verbatim, no new
 * problems authored. See that file's header for why this is not wired
 * into COURSE_CATALOG yet.
 *
 * Lesson order: area-of-composite-shapes and prism-volume are
 * prerequisite-free; surface-area-and-volume depends on
 * area-of-composite-shapes; coordinate-geometry depends on
 * coordinate-distance (Number System, a cross-domain prerequisite this
 * standalone wrapping does not re-validate).
 */
const version = '1.0.0';
const programRef = { code: 'grade-6-math', version } satisfies Ref;
const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
export const GEOMETRY_UNIT_REF = { code: 'geometry', version } satisfies Ref;

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
    'Practice content reused verbatim from the already-reviewed production catalog (content/geometry/*.json); no new problems authored for this wrapping.',
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
    unitRef: GEOMETRY_UNIT_REF,
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

export const GEOMETRY_LESSONS: readonly Lesson[] = [
  lesson(
    'area-of-composite-shapes-lesson',
    'Area of composite shapes',
    'Decomposes a composite shape into known shapes and sums their areas.',
    'area-of-composite-shapes',
    ['area-of-composite-shapes-1', 'area-of-composite-shapes-2'],
    [
      '6af41d9ffc068cefd4443b1266c077a34b54a59538f85dd9482c8c1485e3b853',
      'f4cceb87f615d06997163749c4a5bfd69547cf04423b45acf7e4e5ad73aae681',
    ],
  ),
  lesson(
    'prism-volume-lesson',
    'Prism volume',
    'Computes the volume of a right rectangular prism with fractional edge lengths by multiplying length, width, and height.',
    'prism-volume',
    ['prism-volume-1', 'prism-volume-2'],
    [
      'b734b0bbb9229e9101e73bd19662f781031e5791581eb1da9b56f0c00404b7af',
      '570b8278c0b47fdb420a39b88dc7c270d4c75ee41bab01956bf0bd9081ecc19d',
    ],
  ),
  lesson(
    'surface-area-and-volume-lesson',
    'Surface area and volume',
    'Uses a net or formula to compute the total surface area of a rectangular or triangular prism.',
    'surface-area-and-volume',
    ['surface-area-and-volume-1', 'surface-area-and-volume-2'],
    [
      '81d97bde92f249bf6029087040ceffe33003e24a881c76a65dbe93f1de48b0e1',
      '878ad0da7bdb73fcfeb35eafdf31c6ed10c0cc89ee32acf0cbfdf39dffe98cc7',
    ],
  ),
  lesson(
    'coordinate-geometry-lesson',
    'Coordinate geometry',
    'Finds the distance between two points that share an x- or y-coordinate, or computes the area or perimeter of a polygon plotted on the coordinate plane.',
    'coordinate-geometry',
    ['coordinate-geometry-1', 'coordinate-geometry-2'],
    [
      '7338475eb725ee75fb8dbbf99c5a9ee963658fa45802e7eed5fdce89244771df',
      '3da81488e384ddd1e8cfb3facee4396b96db208a3515587f5c991fa94fd12e22',
    ],
  ),
];

export const GEOMETRY_UNIT: Unit = UnitSchema.parse({
  code: GEOMETRY_UNIT_REF.code,
  programRef,
  version,
  title: 'Geometry',
  summary:
    'Build fluency decomposing composite-shape area, computing fractional-edge prism volume and surface area, and reasoning about distance and area on the coordinate plane.',
  lessonRefs: GEOMETRY_LESSONS.map(({ code, version: lessonVersion }) => ({
    code,
    version: lessonVersion,
  })),
  policyProfileRef,
  provenance,
  review,
});
