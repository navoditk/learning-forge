import type { AssessmentBank, Lesson, Ref, Unit } from '../contracts/progression';
import { AssessmentBankSchema, LessonSchema, UnitSchema } from '../contracts/progression';

const version = '1.0.0';
const programRef = { code: 'grade-6-math', version } satisfies Ref;
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
  originalityStatement: 'Course structure authored for this repository from first principles.',
};
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };

export const PILOT_UNIT_REF = { code: 'ratios-and-proportional-reasoning', version } satisfies Ref;

export const PILOT_LESSONS: readonly Lesson[] = [
  LessonSchema.parse({
    code: 'ratio-language-lesson',
    unitRef: PILOT_UNIT_REF,
    version,
    title: 'Ratio language',
    objectives: ['State and simplify a ratio in the requested order.'],
    skillRefs: [skillRef('ratio-language')],
    teachingContentRefs: [],
    practiceContentRefs: [
      itemRef(
        'ratio-language-1',
        'e20f92b3041abe43b5cd7341cb4788bd24172c64f532272dda4d0692765c8b50',
      ),
      itemRef(
        'ratio-language-2',
        'd05ea89e45b680ae8477c1968489092fc415cfc9191bbb507a184737fff6ebc5',
      ),
    ],
    assessmentBankRef: { code: 'ratio-language-lesson-bank', version },
    policyProfileRef,
    provenance,
    review,
  }),
  LessonSchema.parse({
    code: 'unit-rates-lesson',
    unitRef: PILOT_UNIT_REF,
    version,
    title: 'Unit rates',
    objectives: ['Compute a unit rate and interpret its units in context.'],
    skillRefs: [skillRef('unit-rates')],
    teachingContentRefs: [],
    practiceContentRefs: [
      itemRef('unit-rates-1', '0aee4911fb0462915f7a58b646c7a95d65ff18c1cd5b03a86a060076dff99428'),
      itemRef('unit-rates-2', '4157aad609244d2ba957cd6de892d8c2c8063f8d34f1b9842c14c4491b1a80ae'),
    ],
    assessmentBankRef: { code: 'unit-rates-lesson-bank', version },
    policyProfileRef,
    provenance,
    review,
  }),
  LessonSchema.parse({
    code: 'ratio-tables-lesson',
    unitRef: PILOT_UNIT_REF,
    version,
    title: 'Ratio tables',
    objectives: ['Extend a ratio table using a consistent scale factor.'],
    skillRefs: [skillRef('ratio-tables')],
    teachingContentRefs: [],
    practiceContentRefs: [
      itemRef('ratio-tables-1', 'bba24d9e4e012194c65c81b5a35ad86e46b2f06404668c67524ffa60faa6848b'),
      itemRef('ratio-tables-2', 'dd978debecccbf59261d1ee1782615d3b097ae9f0fda0b768b438d093c6cb0ab'),
    ],
    assessmentBankRef: { code: 'ratio-tables-lesson-bank', version },
    policyProfileRef,
    provenance,
    review,
  }),
];

// Re-pinned 2026-10-04 (D-73) after the lesson/unit banks were corrected
// (broadened accepted answers, unit-bank skill retagging, two items
// replaced to stop leaking their answer from public practice content) and
// all 10 banks' review metadata was updated - every pinned hash below must
// match the private package's current bank.contentHash exactly, or
// createAssessmentAssignment refuses the assignment
// (ASSESSMENT_BANK_METADATA_MISMATCH). Re-pin again from the private
// package after any future content edit.
const BANK_HASHES: Record<string, string> = {
  'ratio-language-lesson-bank':
    'sha256:2f6375fc187596f2395b710d21b1da85a2c0023c55fbc5a8c68cbdc445b8ef43',
  'unit-rates-lesson-bank':
    'sha256:8f9f65e86c551d4b981e11d5a751738618582b4c19e5a082cd0d9958e39f01b4',
  'ratio-tables-lesson-bank':
    'sha256:1b9b53926b3c539e89b04d7747c1a0542bb8d10b786afe4660370633019510b8',
  'ratios-proportional-reasoning-unit-bank':
    'sha256:7bb0a22e281df58eef824b43ca0fd5469e5c2982a842abdec1a87c200a102085',
  'ratio-language-review-bank':
    'sha256:d18ba08d972c72f0da35c74c74a8c4eb3d40d85a09651a47359851506c42b514',
  'ratio-language-delayed-check-bank':
    'sha256:ee5c2ce75ddef45c6450a02d997e2a26dc99341dc0f0ddfe1d3dc83df092ffaa',
  'unit-rates-review-bank':
    'sha256:3af6e366be39835e259fdb394a6cc304cc143b11d84514f13c864f806a76f568',
  'unit-rates-delayed-check-bank':
    'sha256:b969b9fe051ef33e0a2af580114fc695747508b0583a47b870c953e5932525ae',
  'ratio-tables-review-bank':
    'sha256:085f187e3a7e2935a45422e2b144ee5754bbf93074573001d4d229c36029f24d',
  'ratio-tables-delayed-check-bank':
    'sha256:312fc97d7f4864c7eae2f8d0c4d8429c6eeb842ba23c1cee13acbd1cbb6dac48',
};

function bankHash(code: string): string {
  const hash = BANK_HASHES[code];
  if (!hash) throw new Error(`Missing pilot assessment bank hash for ${code}`);
  return hash;
}

const pilotLessonAssessmentBanks: readonly AssessmentBank[] = PILOT_LESSONS.map((lesson) => {
  const code = lesson.assessmentBankRef.code;
  return AssessmentBankSchema.parse({
    code,
    version,
    targetRef: { code: lesson.code, version },
    policyProfileRef,
    coveredSkillRefs: lesson.skillRefs,
    itemCount: 9,
    contentHash: bankHash(code),
    provenance,
    review,
  });
});

export const PILOT_UNITS: readonly Unit[] = [
  UnitSchema.parse({
    code: PILOT_UNIT_REF.code,
    programRef,
    version,
    title: 'Ratios and proportional reasoning',
    summary: 'Build ratio language, unit-rate reasoning, and ratio-table fluency.',
    lessonRefs: PILOT_LESSONS.map(({ code, version: lessonVersion }) => ({
      code,
      version: lessonVersion,
    })),
    policyProfileRef,
    assessmentBankRef: { code: 'ratios-proportional-reasoning-unit-bank', version },
    provenance,
    review,
  }),
];

const pilotUnit = PILOT_UNITS[0];
if (!pilotUnit) throw new Error('Pilot unit is missing');

export const PILOT_ASSESSMENT_BANKS: readonly AssessmentBank[] = [
  ...pilotLessonAssessmentBanks,
  AssessmentBankSchema.parse({
    code: 'ratios-proportional-reasoning-unit-bank',
    version,
    targetRef: { code: pilotUnit.code, version },
    policyProfileRef,
    coveredSkillRefs: PILOT_LESSONS.flatMap(({ skillRefs }) => skillRefs),
    itemCount: 18,
    contentHash: bankHash('ratios-proportional-reasoning-unit-bank'),
    provenance,
    review,
  }),
  ...PILOT_LESSONS.flatMap(({ skillRefs }) => skillRefs).flatMap((skill) =>
    (
      [
        ['review-bank', 3],
        ['delayed-check-bank', 6],
      ] as const
    ).map(([suffix, itemCount]) =>
      AssessmentBankSchema.parse({
        code: `${skill.code}-${suffix}`,
        version,
        targetRef: skill,
        policyProfileRef,
        coveredSkillRefs: [skill],
        itemCount,
        contentHash: bankHash(`${skill.code}-${suffix}`),
        provenance,
        review,
      }),
    ),
  ),
];

export const PILOT_PROGRAM_UNIT_REFS: readonly Ref[] = [PILOT_UNIT_REF];
