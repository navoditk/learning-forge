import type { AssessmentBank, Lesson, Ref, Unit } from '../contracts/progression';
import { AssessmentBankSchema, LessonSchema, UnitSchema } from '../contracts/progression';

const version = '1.0.0';
const programRef = { code: 'grade-6-math', version } satisfies Ref;
const policyProfileRef = { code: 'grade-6-math-default', version } satisfies Ref;

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

const BANK_HASHES: Record<string, string> = {
  'ratio-language-lesson-bank':
    'sha256:6469742b86673041c2e43e3bfe465a7950a13d39b396939e95323d8217aab0e0',
  'unit-rates-lesson-bank':
    'sha256:816467f8ea7a548a9b820f2323dc570e424b959a00c0292a94e514823f487f95',
  'ratio-tables-lesson-bank':
    'sha256:d19ca5d1ad0d22f41cd2c5a2ac92bdd289b1153015ead2e0fe8f710be2218721',
  'ratios-proportional-reasoning-unit-bank':
    'sha256:dabfd7ba2400abe338c01d38bbe5636707ce5f902a7714e84df3d433ea0a4b72',
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
];

export const PILOT_PROGRAM_UNIT_REFS: readonly Ref[] = [PILOT_UNIT_REF];
