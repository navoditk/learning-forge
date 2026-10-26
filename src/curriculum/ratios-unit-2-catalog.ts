import type { AssessmentBank, Lesson, Program, Ref, Unit } from '../contracts/progression';
import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
} from '../contracts/progression';

/**
 * Ratios `2.0.0` records (RAT-INTEGRATE RI-4 staged, RI-5 registered; D-228,
 * D-231, D-232, D-235-D-237, D-256, D-266): the five Grade 6 Ratios lesson
 * `2.0.0` records, unit `ratios-and-proportional-reasoning@2.0.0`, program
 * `grade-6-math@1.1.0` and the ten bank metadata records.
 *
 * Imported by the production course catalog and program registry (the
 * import-graph test pins the importers). Bank items are private and
 * owner-held (O-10); only the public metadata (`itemCount`, `contentHash`)
 * from the owner-authorized RAT-PACKAGE output (D-266) lives here.
 *
 * Every practice ref is `id@version` plus `sha256:` and the SHA-256 of the
 * raw record file (V-2, `catalog-registration-checks.ts`); the first ref of
 * each lesson is its placement source (D-235). The five teaching refs are
 * pinned only (D-232): nothing serves them, no `TEACHING` grant exists and
 * nothing is published (D-165, D-233). Pilot lessons bind their own
 * `@2.0.0` lesson banks (L-2); no lesson here names a pilot `@1.0.0` bank.
 *
 * `review` is the D-256 metadata-only stamp applied after the accepted
 * structure and pins were verified unchanged since RI-4.
 */

const unitVersion = '2.0.0';
const skillVersion = '1.0.0';

const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };
const review = {
  status: 'reviewed' as const,
  reviewer: 'Codex gpt-6.1-sol delegated sign-off (RAT-INTEGRATE RI-4 structure, D-256)',
  reviewedAt: '2026-10-23',
  originalityStatement: 'Course structure authored for this repository from first principles.',
};

export const RATIOS_UNIT_2_UNIT_REF = {
  code: 'ratios-and-proportional-reasoning',
  version: unitVersion,
} satisfies Ref;

export const RATIOS_UNIT_2_PROGRAM_REF = { code: 'grade-6-math', version: '1.1.0' } satisfies Ref;

const itemRef = (id: string, version: string, hash: string) => ({
  id,
  version,
  hash: `sha256:${hash}`,
});

function stagedLesson(input: {
  skill: string;
  title: string;
  objective: string;
  bankRef: Ref;
  /** Ordered `[id, version, bare raw-file SHA-256]`; the first is the placement source. */
  practice: ReadonlyArray<readonly [string, string, string]>;
  /** `[id, bare raw-file SHA-256]` at version `content-1`. */
  teaching: readonly [string, string];
}): Lesson {
  return LessonSchema.parse({
    code: `${input.skill}-lesson`,
    unitRef: RATIOS_UNIT_2_UNIT_REF,
    version: unitVersion,
    title: input.title,
    objectives: [input.objective],
    skillRefs: [{ code: input.skill, version: skillVersion }],
    teachingContentRefs: [itemRef(input.teaching[0], 'content-1', input.teaching[1])],
    practiceContentRefs: input.practice.map(([id, version, hash]) => itemRef(id, version, hash)),
    assessmentBankRef: input.bankRef,
    policyProfileRef,
    provenance,
    review,
  });
}

/** Plan section 2.1 order; five lessons, five skills (the D-22 placement cap exactly). */
export const RATIOS_UNIT_2_LESSONS: readonly Lesson[] = [
  stagedLesson({
    skill: 'ratio-language',
    title: 'Ratio language',
    objective: 'State and simplify a ratio in the requested order.',
    bankRef: { code: 'ratio-language-lesson-bank', version: '2.0.0' },
    practice: [
      [
        'ratio-language-1',
        'content-1',
        'e20f92b3041abe43b5cd7341cb4788bd24172c64f532272dda4d0692765c8b50',
      ],
      [
        'ratio-language-2',
        'content-1',
        'd05ea89e45b680ae8477c1968489092fc415cfc9191bbb507a184737fff6ebc5',
      ],
      [
        'ratio-language-3',
        'content-1',
        '73debdc6adc891712b4db24a49c7c58cd64d6bdc1992f48adc3f603d6b775338',
      ],
      [
        'ratio-language-4',
        'content-1',
        '3a8eebe4397b91dfd09dfd45edfb26eff3f3e0bdc850a5c4d0d7adcd1a5590a2',
      ],
      [
        'ratio-language-5',
        'content-1',
        'd84d96538bd352e96d1ed89c8c9c2477cc8d40ecc6811b65d8d0308a3f4bc9e6',
      ],
      [
        'ratio-language-6',
        'content-1',
        '50d1d529884ae4be1dc5c7d666df7bb1b62748c330d1c6a0409dfdfb06d07d1c',
      ],
    ],
    teaching: [
      'ratio-language-teaching-1',
      'ab40b0deea2c90c0d16d6b0247e29ee3bc45c5c3f7f8b5125af8daba0ad29cb2',
    ],
  }),
  stagedLesson({
    skill: 'unit-rates',
    title: 'Unit rates',
    objective: 'Compute a unit rate and interpret its units in context.',
    bankRef: { code: 'unit-rates-lesson-bank', version: '2.0.0' },
    practice: [
      [
        'unit-rates-1',
        'content-1',
        '0aee4911fb0462915f7a58b646c7a95d65ff18c1cd5b03a86a060076dff99428',
      ],
      [
        'unit-rates-2',
        'content-3',
        '88520a8684d9e5dc34165186f9f5b09f3ca29a29e9fceac1e392442f30226aab',
      ],
      [
        'unit-rates-3',
        'content-1',
        'e687e6434eb4253a12006295f171ef3fc92dfe7328c4524953dc766171aa791c',
      ],
      [
        'unit-rates-4',
        'content-1',
        'be43aff58c23f6d8f3f17c97158f467067fbdbab82a42f91c7815b14a098ad4f',
      ],
      [
        'unit-rates-5',
        'content-1',
        'e9f10bdaeb0cb7653533f7ab6e6fa35e08ff265291fcd1e558f8c137f3b98799',
      ],
      [
        'unit-rates-6',
        'content-1',
        '64b32f02bffc1f06f678c44a67d13d224409bf47f33162dc6034f823e567a1a5',
      ],
    ],
    teaching: [
      'unit-rates-teaching-1',
      '8ddf3e2d41237b8d1699ac2779c94031336b3603c4dc1082333bb474540fed0a',
    ],
  }),
  stagedLesson({
    skill: 'ratio-tables',
    title: 'Ratio tables',
    objective: 'Extend a ratio table using a consistent scale factor.',
    bankRef: { code: 'ratio-tables-lesson-bank', version: '2.0.0' },
    practice: [
      [
        'ratio-tables-1',
        'content-1',
        'bba24d9e4e012194c65c81b5a35ad86e46b2f06404668c67524ffa60faa6848b',
      ],
      [
        'ratio-tables-2',
        'content-3',
        'c95aac520998d0dfa1b88829bf9ab38d9510f43e60e4c9338ceccbc4655db005',
      ],
      [
        'ratio-tables-3',
        'content-1',
        'd991e8c999ce5309f151f4b8deeb57e3e7c4604dd7a45a689a4429a36d5440b2',
      ],
      [
        'ratio-tables-4',
        'content-1',
        '7d317eaf63b9503f8d2ba5a9f23ec0879bd48f4390250b22cd2c0435fc72bafb',
      ],
      [
        'ratio-tables-5',
        'content-1',
        'b3152f5ac67e16cd7ecf60edf0be397de03eee28c73114a573a8a6b5c38eb7f8',
      ],
      [
        'ratio-tables-6',
        'content-1',
        '554409687fe42c8ac89ac8f05662e10e9de9b6b820f8021c1e3789c0a00bfc14',
      ],
    ],
    teaching: [
      'ratio-tables-teaching-1',
      '1ceba67f31544c5bb8b3d1c950f25cbd74b1714ef5b69e7b8a2dc4a9439f07dd',
    ],
  }),
  stagedLesson({
    skill: 'double-number-lines',
    title: 'Double number lines',
    objective: 'Match corresponding values on two number lines using a constant scale factor.',
    bankRef: { code: 'double-number-lines-lesson-bank', version: '1.0.0' },
    practice: [
      [
        'double-number-lines-3',
        'content-1',
        'e11be05496438d2b2386f9c9e7ff6e4c671e61381f8435c97a1dedc0ca81dabb',
      ],
      [
        'double-number-lines-4',
        'content-1',
        '75007172abeee9d5c4aaefc7e5c3b188167844856a359fde5d039ed695b30d7f',
      ],
      [
        'double-number-lines-5',
        'content-1',
        'baa8f095cda3821b6f882ec9b1586ac15881c848235c1e52e80a0ac504244235',
      ],
      [
        'double-number-lines-6',
        'content-1',
        '528f8bbadb9fbe82423bb81e4fcf67ef573a01a40ace5bc5aa744a676c34c795',
      ],
      [
        'double-number-lines-1',
        'content-1',
        '9a3f1e893a12d582bfc016cfbec81840fda1b23fcc064bcee5ccb7fd94ba036b',
      ],
      [
        'double-number-lines-2',
        'content-1',
        '695e59085d7f134b06d22e7a3e30299da4c2e3fd5c9baffd68948a5287814d1f',
      ],
    ],
    teaching: [
      'double-number-lines-teaching-1',
      'a1826b1cfc8959172e5d12916fbc8d65cf4f8d659187ca3191c4c2a65b5bd128',
    ],
  }),
  stagedLesson({
    skill: 'percent-applications',
    title: 'Percent applications',
    objective: 'Convert between a percent, fraction, and decimal to solve a part-whole problem.',
    bankRef: { code: 'percent-applications-lesson-bank', version: '1.0.0' },
    practice: [
      [
        'percent-applications-1',
        'content-1',
        '7977fde3266e226a7b97007e88a0a940174b79c06f2ace01241af01f9d2cbf52',
      ],
      [
        'percent-applications-2',
        'content-1',
        'ff0cc8f79a1e59cf8cf93d4cc950691377c0b40985eb29bb3f399f1b902fbc85',
      ],
      [
        'percent-applications-3',
        'content-1',
        '59a1b92d0fe786a77c23bad48b194f6d9fe8cb9f2a40ae557e4fd2a7a91df714',
      ],
      [
        'percent-applications-4',
        'content-1',
        '02e3aeb90185eac40d96cd98fb2bbc70752be556f50eeb112ad2b18dd6ff8b04',
      ],
      [
        'percent-applications-5',
        'content-1',
        '4c1a021b93d2497dac8dbe2277b27a0bbc29a7c5c11d8e0675c8579270f1a7ba',
      ],
      [
        'percent-applications-6',
        'content-1',
        'bcd6cb8c85af92af9deb66937d8e8cc198b34761db7c4412a8ed16302a61f4f8',
      ],
    ],
    teaching: [
      'percent-applications-teaching-1',
      '3c735fa642fe8fc9cd40d941c433a9220e6ab2d40b8aaf69d0e8211e5b783be1',
    ],
  }),
];

export const RATIOS_UNIT_2_UNIT: Unit = UnitSchema.parse({
  code: RATIOS_UNIT_2_UNIT_REF.code,
  programRef: RATIOS_UNIT_2_PROGRAM_REF,
  version: unitVersion,
  title: 'Ratios and proportional reasoning',
  summary: 'Build ratio language, unit-rate reasoning, and ratio-table fluency.',
  lessonRefs: RATIOS_UNIT_2_LESSONS.map(({ code, version }) => ({ code, version })),
  policyProfileRef,
  assessmentBankRef: { code: 'ratios-proportional-reasoning-unit-bank', version: unitVersion },
  provenance,
  review,
});

/** As program `1.0.0` (program-registry.ts) with version `1.1.0` and the `2.0.0` unit. */
export const RATIOS_UNIT_2_PROGRAM: Program = ProgramSchema.parse({
  code: RATIOS_UNIT_2_PROGRAM_REF.code,
  version: RATIOS_UNIT_2_PROGRAM_REF.version,
  label: 'Grade 6 Math',
  available: true,
  subjectKind: 'graded-academic',
  skillCodePrefix: null,
  progressionMode: 'hybrid',
  unitRefs: [RATIOS_UNIT_2_UNIT_REF],
  accessPolicyRef: { code: 'grade-6-math-access', version: '1.1.0' },
  legacyCompatibilityPolicyRef: { code: 'grade-6-math-legacy-compatibility', version: '1.0.0' },
  defaultPolicyProfileRef: policyProfileRef,
});

const bankReview = {
  status: 'reviewed' as const,
  reviewer: 'Codex gpt-6.1-sol delegated sign-off (RAT-PACKAGE PK-1, 2026-10-23)',
  reviewedAt: '2026-10-23',
  originalityStatement:
    'Assessment items authored for this repository and held privately (RAT-PACKAGE, D-265).',
};

const lessonBank = (
  code: string,
  bankVersion: string,
  lessonCode: string,
  skill: string,
  contentHash: string,
): AssessmentBank =>
  AssessmentBankSchema.parse({
    code,
    version: bankVersion,
    targetRef: { code: lessonCode, version: unitVersion },
    policyProfileRef,
    coveredSkillRefs: [{ code: skill, version: skillVersion }],
    itemCount: 9,
    contentHash: `sha256:${contentHash}`,
    provenance,
    review: bankReview,
  });

const skillBank = (
  skill: string,
  suffix: 'review-bank' | 'delayed-check-bank',
  itemCount: number,
  contentHash: string,
): AssessmentBank =>
  AssessmentBankSchema.parse({
    code: `${skill}-${suffix}`,
    version: skillVersion,
    targetRef: { code: skill, version: skillVersion },
    policyProfileRef,
    coveredSkillRefs: [{ code: skill, version: skillVersion }],
    itemCount,
    contentHash: `sha256:${contentHash}`,
    provenance,
    review: bankReview,
  });

/** D-266 public metadata, verbatim. Table order of scope section 2.4. */
export const RATIOS_UNIT_2_ASSESSMENT_BANKS: readonly AssessmentBank[] = [
  lessonBank(
    'ratio-language-lesson-bank',
    '2.0.0',
    'ratio-language-lesson',
    'ratio-language',
    '67ae5776597eed427ca08dff45db650d772a5cac6ce1a5d4f21591123b085da7',
  ),
  lessonBank(
    'unit-rates-lesson-bank',
    '2.0.0',
    'unit-rates-lesson',
    'unit-rates',
    '9240bc30980cd51af4231a9171f59db207d682226083643dc276440cbadc61fa',
  ),
  lessonBank(
    'ratio-tables-lesson-bank',
    '2.0.0',
    'ratio-tables-lesson',
    'ratio-tables',
    'b5fcc9dd5a03dbca7821f18a7692943b80c11c72f54c5f1f9f72c8eaf008a435',
  ),
  lessonBank(
    'double-number-lines-lesson-bank',
    '1.0.0',
    'double-number-lines-lesson',
    'double-number-lines',
    '83035b4a12b73ddd64aa3cd77d4028341ddd5b0e5783894efd708176ec692001',
  ),
  lessonBank(
    'percent-applications-lesson-bank',
    '1.0.0',
    'percent-applications-lesson',
    'percent-applications',
    'cc3740273ba24dde14f3f0cc53bb5da51d8a2c49230ba80f608dc94da0b9dc78',
  ),
  AssessmentBankSchema.parse({
    code: 'ratios-proportional-reasoning-unit-bank',
    version: unitVersion,
    targetRef: RATIOS_UNIT_2_UNIT_REF,
    policyProfileRef,
    coveredSkillRefs: RATIOS_UNIT_2_LESSONS.flatMap(({ skillRefs }) => skillRefs),
    itemCount: 30,
    contentHash: 'sha256:416b8c02e1ca3e3cf71e5ccc75159ad98fe2fbf892c34ff01adf2cfdc53b82be',
    provenance,
    review: bankReview,
  }),
  skillBank(
    'double-number-lines',
    'review-bank',
    3,
    '440f22d4bb5c1b61da4ec574c9145509a394354962ff8ddd9127d91ba1bde6a5',
  ),
  skillBank(
    'double-number-lines',
    'delayed-check-bank',
    6,
    '62cec320cb858e4cf256b87da6317ffa7dc9c7e9aec71072684ccda70758b8a1',
  ),
  skillBank(
    'percent-applications',
    'review-bank',
    3,
    '570faafaab2d72735f6bbc9accd4d9b364e7bf29837bd111fd8df13cfef6cdee',
  ),
  skillBank(
    'percent-applications',
    'delayed-check-bank',
    6,
    'ea15c2d57e42d62bd82b2190d4a8814c2fb722e87d473e9346dcb84eca8058f0',
  ),
];
