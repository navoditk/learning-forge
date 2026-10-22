import type { Lesson, Program, Ref, Unit } from '../contracts/progression';
import { LessonSchema, ProgramSchema, UnitSchema } from '../contracts/progression';

/**
 * STAGED, NOT REGISTERED (RAT-INTEGRATE RI-4; D-228, D-231, D-232, D-235-D-237).
 * The five Grade 6 Ratios lesson `2.0.0` records, unit
 * `ratios-and-proportional-reasoning@2.0.0` and program `grade-6-math@1.1.0`.
 *
 * Nothing in production imports this module (the import-graph test pins it),
 * and the records are not passed to `createCourseCatalog`: every lesson, unit
 * and skill bank ref below names a bank that has no metadata record yet. The
 * bank items are private and owner-held (O-10), so bank `itemCount` and
 * `contentHash` do not exist here and none is fabricated. RI-5 adds the ten
 * bank records from the owner-authorized RAT-PACKAGE output and registers
 * these records.
 *
 * Every practice ref is `id@version` plus `sha256:` and the SHA-256 of the
 * raw record file (V-2, `catalog-registration-checks.ts`); the first ref of
 * each lesson is its placement source (D-235). The five teaching refs are
 * pinned only (D-232): nothing serves them, no `TEACHING` grant exists and
 * nothing is published (D-165, D-233). Pilot lessons bind their own
 * `@2.0.0` lesson banks (L-2); no lesson here names a pilot `@1.0.0` bank.
 *
 * `review.status` is `pending_review` (D-236). After the exact structure bytes
 * are accepted, the delegated stamp is a metadata-only change.
 */

const unitVersion = '2.0.0';
const skillVersion = '1.0.0';

const policyProfileRef = { code: 'grade-6-math-default', version: '1.1.0' } satisfies Ref;
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };
const review = {
  status: 'pending_review' as const,
  reviewer: 'Pending delegated structure review (D-236)',
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
