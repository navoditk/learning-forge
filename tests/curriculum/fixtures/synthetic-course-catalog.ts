import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
  type AssessmentBank,
  type Lesson,
  type Program,
  type Unit,
} from '../../../src/contracts/progression';

// Database-free synthetic second program. Every code, title and hash is
// invented; it is never registered in the production program registry and
// carries public bank metadata only (no items).
const version = '1.0.0';
const policyProfileRef = { code: 'synthetic-second-default', version } as const;
const provenance = { origin: 'original', licenseStatus: 'owned' } as const;
const review = {
  status: 'reviewed',
  reviewer: 'Synthetic fixture reviewer',
  reviewedAt: '2026-10-10',
  originalityStatement: 'Synthetic test fixture with no real curriculum content.',
} as const;

export const SYNTHETIC_PROGRAM_CODE = 'synthetic-second-program';
export const SYNTHETIC_UNIT_REF = { code: 'synthetic-unit-one', version } as const;
export const SYNTHETIC_SKILL_CODES = ['synthetic-skill-a', 'synthetic-skill-b'] as const;

export const SYNTHETIC_PROGRAM: Program = ProgramSchema.parse({
  code: SYNTHETIC_PROGRAM_CODE,
  version,
  label: 'Synthetic Second Program',
  available: false,
  subjectKind: 'enrichment-contest',
  skillCodePrefix: null,
  progressionMode: 'unit-sequenced',
  unitRefs: [SYNTHETIC_UNIT_REF],
  accessPolicyRef: { code: 'synthetic-second-access', version },
  legacyCompatibilityPolicyRef: null,
  defaultPolicyProfileRef: policyProfileRef,
});

export const SYNTHETIC_LESSONS: readonly Lesson[] = SYNTHETIC_SKILL_CODES.map((skillCode, index) =>
  LessonSchema.parse({
    code: `synthetic-lesson-${index + 1}`,
    unitRef: SYNTHETIC_UNIT_REF,
    version,
    title: `Synthetic lesson ${index + 1}`,
    objectives: ['Exercise the shared catalog with invented metadata.'],
    skillRefs: [{ code: skillCode, version }],
    teachingContentRefs: [],
    practiceContentRefs: [],
    assessmentBankRef: { code: `synthetic-lesson-${index + 1}-bank`, version },
    policyProfileRef,
    provenance,
    review,
  }),
);

export const SYNTHETIC_UNITS: readonly Unit[] = [
  UnitSchema.parse({
    code: SYNTHETIC_UNIT_REF.code,
    programRef: { code: SYNTHETIC_PROGRAM_CODE, version },
    version,
    title: 'Synthetic unit one',
    summary: 'Invented unit used only by catalog tests.',
    lessonRefs: SYNTHETIC_LESSONS.map(({ code }) => ({ code, version })),
    policyProfileRef,
    assessmentBankRef: { code: 'synthetic-unit-one-bank', version },
    provenance,
    review,
  }),
];

const hash = (character: string) => `sha256:${character.repeat(64)}`;

export const SYNTHETIC_BANKS: readonly AssessmentBank[] = [
  ...SYNTHETIC_LESSONS.map((lesson, index) =>
    AssessmentBankSchema.parse({
      code: lesson.assessmentBankRef.code,
      version,
      targetRef: { code: lesson.code, version },
      policyProfileRef,
      coveredSkillRefs: lesson.skillRefs,
      itemCount: 3,
      contentHash: hash(String(index + 1)),
      provenance,
      review,
    }),
  ),
  AssessmentBankSchema.parse({
    code: 'synthetic-unit-one-bank',
    version,
    targetRef: SYNTHETIC_UNIT_REF,
    policyProfileRef,
    coveredSkillRefs: SYNTHETIC_LESSONS.flatMap(({ skillRefs }) => skillRefs),
    itemCount: 6,
    contentHash: hash('9'),
    provenance,
    review,
  }),
];
