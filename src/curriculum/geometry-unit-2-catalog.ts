import type { AssessmentBank, Lesson, Program, Ref, Unit } from '../contracts/progression';
import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
} from '../contracts/progression';
import { RATIOS_UNIT_2_UNIT_REF } from './ratios-unit-2-catalog';
import { STATISTICS_UNIT_2_UNIT_REF } from './statistics-unit-2-catalog';

/**
 * Geometry `2.0.0` records (MATH-GEO-6; D-353, D-354, D-355, D-356): the four
 * Grade 6 Geometry lesson `2.0.0` records, unit `geometry@2.0.0`, successor
 * program `grade-6-math@1.3.0` and the thirteen bank metadata records.
 * Supersedes the unwired `geometry@1.0.0` stub, whose unit and lesson `1.0.0`
 * labels are reserved (ID-2, `grade-6-math-reserved-labels.json`).
 * REGISTERED, NOT ACTIVATED: the active selection still names program `1.1.0`,
 * so nothing here is servable.
 *
 * Imported by the production course catalog and program registry (the
 * import-graph test pins the importers). Bank items are private, held outside
 * the repository and merged by the owner (`scripts/private-bank-merge.ts
 * --bank-metadata src/curriculum/geometry-bank-metadata.json`). Only public
 * metadata (identity, `itemCount`, `contentHash`) lives here.
 *
 * Lesson order (D-354): area, surface area, prism volume, coordinate geometry.
 * No new prerequisite edge: `surface-area-and-volume` already depends on
 * `area-of-composite-shapes`; `coordinate-geometry` depends on the Number
 * System skill `coordinate-distance`, which stays legacy practice-only.
 *
 * PENDING (fail closed). Activation is blocked, in this order, by:
 *  1. `contentHash` of every bank is `GEOMETRY_BANK_DIGEST_PENDING` until the
 *     owner replaces it with the real digest of the stamped private package
 *     (the merge tool refuses a mismatching digest, so a sentinel can never
 *     validate a real package).
 *  2. Bank, lesson and unit `review.status` is `pending_review`; V-11
 *     (`checkClaimedSkillBanks`) reports every bank `NOT_REVIEWED` until a
 *     delegated or human review stamps it.
 *  3. The sixteen GEO-2 drafts (`<skill>-3..-6@content-1`) are registered in
 *     the content catalog as `pending_review` (never servable) and are NOT
 *     pinned here: a review flip changes their bytes, so they are pinned (and
 *     appended to each lesson) when accepted.
 * Tests forbid selecting program `1.3.0` while any sentinel remains.
 *
 * Practice pins: only reviewed, servable records. The first ref of each
 * lesson is its placement source (D-235). `surface-area-and-volume-1@content-1`
 * is NOT pinned anywhere in this unit (O-7, D-354): its identity was reused
 * from an unrelated v1 item, so it is excluded as a placement source and
 * left unclaimed until the production investigation. Its lesson pins
 * `surface-area-and-volume-2@content-1` only. `prism-volume-2` pins the
 * stamped `content-3` correction (D-354), whose whole-response validator
 * removes the `content-2` substring false accept; `content-2` stays
 * registered and byte-pinned for history. `coordinate-geometry-2` leads its
 * lesson because `coordinate-geometry-1` duplicates 6.NS.C.8.
 * No teaching records exist, so no lesson has teaching refs.
 */

const unitVersion = '2.0.0';
const skillVersion = '1.0.0';
const bankVersion = '1.0.0';

/** Marker for a bank digest the owner has not supplied yet. Never a real digest. */
export const GEOMETRY_BANK_DIGEST_PENDING = `sha256:${'0'.repeat(64)}`;

const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };
const structureReview = {
  status: 'pending_review' as const,
  reviewer: 'Pending delegated structure review (MATH-GEO-6)',
  originalityStatement: 'Course structure authored for this repository from first principles.',
};
const bankReview = {
  status: 'pending_review' as const,
  reviewer: 'Pending delegated bank-metadata review (MATH-GEO-6); items not yet drafted',
  originalityStatement:
    'Assessment items to be authored for this repository and held privately outside the repository (GEO-4).',
};

export const GEOMETRY_UNIT_2_UNIT_REF = {
  code: 'geometry',
  version: unitVersion,
} satisfies Ref;
export const GEOMETRY_UNIT_2_PROGRAM_REF = {
  code: 'grade-6-math',
  version: '1.3.0',
} satisfies Ref;

const itemRef = (id: string, version: string, hash: string) => ({
  id,
  version,
  hash: `sha256:${hash}`,
});

function lesson(input: {
  skill: string;
  title: string;
  objective: string;
  /** `[id, version, bare raw-file SHA-256]`; the first is the placement source. */
  practice: ReadonlyArray<readonly [string, string, string]>;
}): Lesson {
  return LessonSchema.parse({
    code: `${input.skill}-lesson`,
    unitRef: GEOMETRY_UNIT_2_UNIT_REF,
    version: unitVersion,
    title: input.title,
    objectives: [input.objective],
    skillRefs: [{ code: input.skill, version: skillVersion }],
    teachingContentRefs: [],
    practiceContentRefs: input.practice.map(([id, version, hash]) => itemRef(id, version, hash)),
    assessmentBankRef: { code: `${input.skill}-lesson-bank`, version: bankVersion },
    policyProfileRef,
    provenance,
    review: structureReview,
  });
}

/** D-354 order: area, surface area, prism volume, coordinate geometry. */
export const GEOMETRY_UNIT_2_LESSONS: readonly Lesson[] = [
  lesson({
    skill: 'area-of-composite-shapes',
    title: 'Area of composite shapes',
    objective: 'Decomposes a composite shape into known shapes and sums their areas.',
    practice: [
      [
        'area-of-composite-shapes-1',
        'content-1',
        '6af41d9ffc068cefd4443b1266c077a34b54a59538f85dd9482c8c1485e3b853',
      ],
      [
        'area-of-composite-shapes-2',
        'content-1',
        'f4cceb87f615d06997163749c4a5bfd69547cf04423b45acf7e4e5ad73aae681',
      ],
    ],
  }),
  lesson({
    skill: 'surface-area-and-volume',
    title: 'Surface area and volume',
    objective:
      'Uses a net or formula to compute the total surface area of a rectangular or triangular prism.',
    practice: [
      [
        'surface-area-and-volume-2',
        'content-1',
        '878ad0da7bdb73fcfeb35eafdf31c6ed10c0cc89ee32acf0cbfdf39dffe98cc7',
      ],
    ],
  }),
  lesson({
    skill: 'prism-volume',
    title: 'Prism volume',
    objective:
      'Computes the volume of a right rectangular prism with fractional edge lengths by multiplying length, width, and height.',
    practice: [
      [
        'prism-volume-1',
        'content-1',
        'b734b0bbb9229e9101e73bd19662f781031e5791581eb1da9b56f0c00404b7af',
      ],
      [
        'prism-volume-2',
        'content-3',
        '798b2edf4c821a2c6e008b5e28b87ed6c46213664fec7b11d84a10730ae1f55a',
      ],
    ],
  }),
  lesson({
    skill: 'coordinate-geometry',
    title: 'Coordinate geometry',
    objective:
      'Finds the distance between two points that share an x- or y-coordinate, or computes the area or perimeter of a polygon plotted on the coordinate plane.',
    practice: [
      [
        'coordinate-geometry-2',
        'content-1',
        '3da81488e384ddd1e8cfb3facee4396b96db208a3515587f5c991fa94fd12e22',
      ],
      [
        'coordinate-geometry-1',
        'content-1',
        '7338475eb725ee75fb8dbbf99c5a9ee963658fa45802e7eed5fdce89244771df',
      ],
    ],
  }),
];

export const GEOMETRY_UNIT_2_UNIT: Unit = UnitSchema.parse({
  code: GEOMETRY_UNIT_2_UNIT_REF.code,
  programRef: GEOMETRY_UNIT_2_PROGRAM_REF,
  version: unitVersion,
  title: 'Geometry',
  summary:
    'Build fluency decomposing composite-shape area, computing surface area and fractional-edge prism volume, and reasoning about distance and area on the coordinate plane.',
  lessonRefs: GEOMETRY_UNIT_2_LESSONS.map(({ code, version }) => ({ code, version })),
  policyProfileRef,
  assessmentBankRef: { code: 'geometry-unit-bank', version: bankVersion },
  provenance,
  review: structureReview,
});

/**
 * Successor program (D-336 U-2..U-5, K-1): pins exactly Ratios `2.0.0`, then
 * Statistics `2.0.0`, then Geometry `2.0.0`. Ratios and Statistics keep their
 * introducers (`1.1.0`, `1.2.0`) and are not re-claimed; Geometry is
 * introduced here (PV-1).
 */
export const GEOMETRY_UNIT_2_PROGRAM: Program = ProgramSchema.parse({
  code: GEOMETRY_UNIT_2_PROGRAM_REF.code,
  version: GEOMETRY_UNIT_2_PROGRAM_REF.version,
  label: 'Grade 6 Math',
  available: true,
  subjectKind: 'graded-academic',
  skillCodePrefix: null,
  progressionMode: 'hybrid',
  unitRefs: [RATIOS_UNIT_2_UNIT_REF, STATISTICS_UNIT_2_UNIT_REF, GEOMETRY_UNIT_2_UNIT_REF],
  accessPolicyRef: { code: 'grade-6-math-access', version: '1.1.0' },
  legacyCompatibilityPolicyRef: { code: 'grade-6-math-legacy-compatibility', version: '1.0.0' },
  defaultPolicyProfileRef: policyProfileRef,
});

const skillRefOf = (skill: string): Ref => ({ code: skill, version: skillVersion });

const lessonBank = (skill: string): AssessmentBank =>
  AssessmentBankSchema.parse({
    code: `${skill}-lesson-bank`,
    version: bankVersion,
    targetRef: { code: `${skill}-lesson`, version: unitVersion },
    policyProfileRef,
    coveredSkillRefs: [skillRefOf(skill)],
    itemCount: 9,
    contentHash: GEOMETRY_BANK_DIGEST_PENDING,
    provenance,
    review: bankReview,
  });

const skillBank = (
  skill: string,
  suffix: 'review-bank' | 'delayed-check-bank',
  itemCount: number,
): AssessmentBank =>
  AssessmentBankSchema.parse({
    code: `${skill}-${suffix}`,
    version: bankVersion,
    targetRef: skillRefOf(skill),
    policyProfileRef,
    coveredSkillRefs: [skillRefOf(skill)],
    itemCount,
    contentHash: GEOMETRY_BANK_DIGEST_PENDING,
    provenance,
    review: bankReview,
  });

/** Skills in D-354 lesson order. */
const SKILLS = [
  'area-of-composite-shapes',
  'surface-area-and-volume',
  'prism-volume',
  'coordinate-geometry',
] as const;

/**
 * Thirteen bank metadata records, 96 planned private items in total: four
 * lesson banks (9 each), the unit bank (24, six per skill), four review banks
 * (3 each) and four delayed-check banks (6 each). Index order: lesson banks,
 * unit bank, then per skill review and delayed-check.
 */
export const GEOMETRY_UNIT_2_ASSESSMENT_BANKS: readonly AssessmentBank[] = [
  ...SKILLS.map(lessonBank),
  AssessmentBankSchema.parse({
    code: 'geometry-unit-bank',
    version: bankVersion,
    targetRef: GEOMETRY_UNIT_2_UNIT_REF,
    policyProfileRef,
    coveredSkillRefs: SKILLS.map(skillRefOf),
    itemCount: 24,
    contentHash: GEOMETRY_BANK_DIGEST_PENDING,
    provenance,
    review: bankReview,
  }),
  ...SKILLS.flatMap((skill) => [
    skillBank(skill, 'review-bank', 3),
    skillBank(skill, 'delayed-check-bank', 6),
  ]),
];
