import type { AssessmentBank, Lesson, Program, Ref, Unit } from '../contracts/progression';
import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
} from '../contracts/progression';
import { RATIOS_UNIT_2_UNIT_REF } from './ratios-unit-2-catalog';

/**
 * Statistics `2.0.0` records (MATH-ST6; D-334, D-335, D-336, D-340, D-341,
 * D-343): the three Grade 6 Statistics lesson `2.0.0` records, unit
 * `statistics@2.0.0`, successor program `grade-6-math@1.2.0` and the ten bank
 * metadata records. Supersedes the unwired `statistics@1.0.0` stub, whose
 * unit and lesson `1.0.0` labels are reserved (ID-2, `grade-6-math-reserved-labels.json`).
 *
 * Imported by the production course catalog and program registry (the
 * import-graph test pins the importers). Bank items are private, held outside
 * the repository and merged by the owner (`scripts/private-bank-merge.ts
 * --bank-metadata src/curriculum/statistics-bank-metadata.json`). Only public
 * metadata (identity, `itemCount`, `contentHash`) lives here.
 *
 * DIGESTS REPLACED (D-360): every bank carries its reviewed digest
 * (`STATISTICS_UNIT_2_BANK_DIGESTS`); the sentinel is retired. Activation of
 * program `1.2.0` is still blocked by the `pending_review` unit and lesson
 * stamps (the banks are already reviewed, so V-11 is clean) and by the
 * selection naming `1.1.0`; tests keep that gate live (a test gate, not a
 * runtime prohibition).
 *
 * Lesson practice refs pin only the two already-reviewed records per skill
 * (`<skill>-1` and `<skill>-2`, `content-1`); the first ref of each lesson is
 * its placement source (D-235). The twelve `pending_review` public drafts are
 * registered in the content catalog but unserved and unpinned: a review flip
 * changes their bytes, so they are pinned (and appended here) when accepted.
 * No teaching records exist (ST-3 deferred), so no lesson has teaching refs.
 */

const unitVersion = '2.0.0';
const skillVersion = '1.0.0';
const bankVersion = '1.0.0';

/** Retired sentinel (D-360): every bank now carries its reviewed digest; nothing may use this for a bank. */
export const STATISTICS_BANK_DIGEST_PENDING = `sha256:${'0'.repeat(64)}`;

/**
 * Reviewed per-bank digests (D-360), keyed by `code@version`; each equals the digest
 * in the reviewed private bank metadata. Stamps are a separate step.
 */
export const STATISTICS_UNIT_2_BANK_DIGESTS: Readonly<Record<string, string>> = {
  'statistical-questions-lesson-bank@1.0.0':
    'sha256:7cd57a21c5202c4f1d773f5954a3eab6ad3c684523c487a81208cbc54fb4e219',
  'distributions-lesson-bank@1.0.0':
    'sha256:06d5997073dc1a3dfbbdec2d5883712561c056ec8d2b0a3e0138522a701cefb1',
  'center-and-variability-lesson-bank@1.0.0':
    'sha256:03652cf0c2e2e6e8e03ae6d8936af58f6e3d237a66912a2cd78ad29b0c6ddc14',
  'statistics-unit-bank@1.0.0':
    'sha256:c642482f8a9b938959dc65923194a42476a00a9480fc5fdcdafbaae990a469ad',
  'statistical-questions-review-bank@1.0.0':
    'sha256:3f9335216bba600513b6efdbcace7c79992f9df232801d7bae0f9923bb77dc43',
  'distributions-review-bank@1.0.0':
    'sha256:9b89185caf8d5b4c7e4447506124eb7236a583c57c1eccd772003413917b6ed1',
  'center-and-variability-review-bank@1.0.0':
    'sha256:e596ffe55348b890ef124c5a5e68d6c94577fc6f0ca52bc2c6a0d25e6a6d8f1b',
  'statistical-questions-delayed-check-bank@1.0.0':
    'sha256:e9c11022432e5eb722305ff7a7fa9102895dd2e698bc2c5835f287b4ea2f5143',
  'distributions-delayed-check-bank@1.0.0':
    'sha256:fad40531406d56784e80388db4d8e83692c2823fd876cd06d5c92ea15798f780',
  'center-and-variability-delayed-check-bank@1.0.0':
    'sha256:15f3ab1a49022e2a3e2dbf9135601eb5fdadbe17d06734ce81a694bab5697058',
};

const bankDigest = (code: string, version: string): string => {
  const digest = STATISTICS_UNIT_2_BANK_DIGESTS[`${code}@${version}`];
  if (digest === undefined) throw new Error(`No reviewed digest for bank ${code}@${version}`);
  return digest;
};

const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };
const structureReview = {
  status: 'pending_review' as const,
  reviewer: 'Pending delegated structure review (MATH-ST6)',
  originalityStatement: 'Course structure authored for this repository from first principles.',
};

export const STATISTICS_UNIT_2_UNIT_REF = {
  code: 'statistics',
  version: unitVersion,
} satisfies Ref;
export const STATISTICS_UNIT_2_PROGRAM_REF = {
  code: 'grade-6-math',
  version: '1.2.0',
} satisfies Ref;

const itemRef = (id: string, hash: string) => ({
  id,
  version: 'content-1',
  hash: `sha256:${hash}`,
});

function lesson(input: {
  skill: string;
  title: string;
  objective: string;
  /** `[id, bare raw-file SHA-256]`; the first is the placement source. */
  practice: ReadonlyArray<readonly [string, string]>;
}): Lesson {
  return LessonSchema.parse({
    code: `${input.skill}-lesson`,
    unitRef: STATISTICS_UNIT_2_UNIT_REF,
    version: unitVersion,
    title: input.title,
    objectives: [input.objective],
    skillRefs: [{ code: input.skill, version: skillVersion }],
    teachingContentRefs: [],
    practiceContentRefs: input.practice.map(([id, hash]) => itemRef(id, hash)),
    assessmentBankRef: { code: `${input.skill}-lesson-bank`, version: bankVersion },
    policyProfileRef,
    provenance,
    review: structureReview,
  });
}

/** Skill prerequisite order: statistical-questions, distributions, center-and-variability. */
export const STATISTICS_UNIT_2_LESSONS: readonly Lesson[] = [
  lesson({
    skill: 'statistical-questions',
    title: 'Statistical questions',
    objective:
      'Distinguish a statistical question that anticipates variability from a question with a single answer.',
    practice: [
      [
        'statistical-questions-1',
        'a1a556d33dcc468ff152bc5e231ffb4d6539b773bd7a8a86c2404fa603022afa',
      ],
      [
        'statistical-questions-2',
        '5fe100d72db8437b0c8e1bdffd0bd8fd5048a70693b0b9ae56b66027b9190189',
      ],
    ],
  }),
  lesson({
    skill: 'distributions',
    title: 'Distributions',
    objective:
      'Describe the shape, center, and spread of a data distribution shown in a dot plot, histogram, or box plot.',
    practice: [
      ['distributions-1', '5cef737cae53abf1c0ecb4bcba5e24bbdcba07f28bfcdfa756584d88f7494f20'],
      ['distributions-2', '57a3a3356ac0340623b163b27fbf7ba51256aeaa8021773b8b2dca7db02e3ac4'],
    ],
  }),
  lesson({
    skill: 'center-and-variability',
    title: 'Center and variability',
    objective:
      'Calculate and compare measures of center (mean, median) and variability (range, interquartile range) for a data set.',
    practice: [
      [
        'center-and-variability-1',
        '8cb3218d4d591db0bf9910d1f0a50e1d176db09cf199284a580b4cf1e532f793',
      ],
      [
        'center-and-variability-2',
        '8a7ce203e180388c807cb4143fc9975453de604e793222aef71b821fa98d57d8',
      ],
    ],
  }),
];

export const STATISTICS_UNIT_2_UNIT: Unit = UnitSchema.parse({
  code: STATISTICS_UNIT_2_UNIT_REF.code,
  programRef: STATISTICS_UNIT_2_PROGRAM_REF,
  version: unitVersion,
  title: 'Statistics',
  summary:
    'Build fluency distinguishing statistical questions, describing distributions, and calculating measures of center and variability.',
  lessonRefs: STATISTICS_UNIT_2_LESSONS.map(({ code, version }) => ({ code, version })),
  policyProfileRef,
  assessmentBankRef: { code: 'statistics-unit-bank', version: bankVersion },
  provenance,
  review: structureReview,
});

/**
 * Successor program (D-334, D-336 U-2..U-5): pins exactly Ratios `2.0.0` then
 * Statistics `2.0.0` (K-1). Ratios keeps its introducer `grade-6-math@1.1.0`
 * and its Ratios lessons are not re-claimed; Statistics is introduced here.
 */
export const STATISTICS_UNIT_2_PROGRAM: Program = ProgramSchema.parse({
  code: STATISTICS_UNIT_2_PROGRAM_REF.code,
  version: STATISTICS_UNIT_2_PROGRAM_REF.version,
  label: 'Grade 6 Math',
  available: true,
  subjectKind: 'graded-academic',
  skillCodePrefix: null,
  progressionMode: 'hybrid',
  unitRefs: [RATIOS_UNIT_2_UNIT_REF, STATISTICS_UNIT_2_UNIT_REF],
  accessPolicyRef: { code: 'grade-6-math-access', version: '1.1.0' },
  legacyCompatibilityPolicyRef: { code: 'grade-6-math-legacy-compatibility', version: '1.0.0' },
  defaultPolicyProfileRef: policyProfileRef,
});

const bankReview = {
  status: 'reviewed' as const,
  reviewer: 'Codex gpt-6.1-sol delegated sign-off (MATH-ST4, D-343)',
  reviewedAt: '2026-11-16',
  originalityStatement:
    'Assessment items authored for this repository and held privately outside the repository (MATH-ST4).',
};

const skillRefOf = (skill: string): Ref => ({ code: skill, version: skillVersion });

const lessonBank = (skill: string): AssessmentBank =>
  AssessmentBankSchema.parse({
    code: `${skill}-lesson-bank`,
    version: bankVersion,
    targetRef: { code: `${skill}-lesson`, version: unitVersion },
    policyProfileRef,
    coveredSkillRefs: [skillRefOf(skill)],
    itemCount: 9,
    contentHash: bankDigest(`${skill}-lesson-bank`, bankVersion),
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
    contentHash: bankDigest(`${skill}-${suffix}`, bankVersion),
    provenance,
    review: bankReview,
  });

const SKILLS = ['statistical-questions', 'distributions', 'center-and-variability'] as const;

/**
 * Ten bank metadata records, 72 private items in total: three lesson banks
 * (9 each), the unit bank (18, six per skill), three review banks (3 each)
 * and three delayed-check banks (6 each). Index order: lesson banks, unit
 * bank, then per skill review and delayed-check.
 */
export const STATISTICS_UNIT_2_ASSESSMENT_BANKS: readonly AssessmentBank[] = [
  ...SKILLS.map(lessonBank),
  AssessmentBankSchema.parse({
    code: 'statistics-unit-bank',
    version: bankVersion,
    targetRef: STATISTICS_UNIT_2_UNIT_REF,
    policyProfileRef,
    coveredSkillRefs: SKILLS.map(skillRefOf),
    itemCount: 18,
    contentHash: bankDigest('statistics-unit-bank', bankVersion),
    provenance,
    review: bankReview,
  }),
  ...SKILLS.flatMap((skill) => [
    skillBank(skill, 'review-bank', 3),
    skillBank(skill, 'delayed-check-bank', 6),
  ]),
];
