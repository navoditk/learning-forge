import type { AssessmentBank, Lesson, Program, Ref, Unit } from '../contracts/progression';
import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
} from '../contracts/progression';

/**
 * Spelling word-structure unit `1.0.0` (SPELL-SP5; D-127, D-128, D-352, D-353):
 * unit `snsb6-word-structure@1.0.0` (unit U-B), four one-skill lessons
 * (morphology, orthography, phoneme-grapheme mapping, etymology), successor
 * program `scripps-spelling-bee-6@1.1.0` and the thirteen bank metadata
 * records. Registered the same way as Statistics 2.0.0 (MATH-ST6): REGISTERED,
 * NOT ACTIVATED. The active selection still names program `1.0.0`
 * (skill-graph-only, practice only), so nothing here is servable.
 *
 * Imported by the production course catalog and program registry (the
 * import-graph test pins the importers). Bank items are private, held outside
 * the repository and merged by the owner (`scripts/private-bank-merge.ts
 * --bank-metadata src/curriculum/spelling-bank-metadata.json`). Only public
 * metadata (identity, `itemCount`, `contentHash`) lives here.
 *
 * D-127: no new prerequisite edge between the four skills; the lesson order
 * (morphology first) is teaching order only. D-131: profile
 * `scripps-spelling-bee-6-default@1.0.0` stays pinned unchanged.
 *
 * PENDING (fail closed). Three things block activation, in this order:
 *  1. Each bank carries its reviewed digest (D-360, `SPELLING_UNIT_1_BANK_DIGESTS`);
 *     the sentinel is retired (satisfied).
 *  2. Bank, lesson and unit `review.status` is `pending_review`; V-11
 *     (`checkClaimedSkillBanks`) reports every bank `NOT_REVIEWED` until a
 *     delegated or human review stamps it.
 *  3. Lesson practice refs pin the reviewed `content-1` records. The
 *     `content-2` corrections (D-135) are `pending_review` and unpinned; when
 *     accepted, the lessons are re-pinned, and the probe snapshot and
 *     structure manifest digests regenerated, before the selection moves.
 * Tests forbid selecting program `1.1.0` while any of the remaining blockers stand.
 *
 * Practice-only skills: the other four `snsb6-` skills (homophones-homographs,
 * vocabulary-context, variant-dictionary-judgment, oral-round-procedure) are
 * claimed by no unit, so program `1.1.0` serves them under the new
 * `scripps-spelling-bee-6-legacy-compatibility@1.0.0` policy, which grants
 * PRACTICE, PLACEMENT and REVIEW and denies assessments.
 */

const unitVersion = '1.0.0';
const skillVersion = '1.0.0';
const bankVersion = '1.0.0';

/** Retired sentinel (D-360): every bank now carries its reviewed digest; nothing may use this for a bank. */
export const SPELLING_BANK_DIGEST_PENDING = `sha256:${'0'.repeat(64)}`;

/**
 * Reviewed per-bank digests (D-360), keyed by `code@version`; each equals the digest
 * in the reviewed private bank metadata. Stamps are a separate step.
 */
export const SPELLING_UNIT_1_BANK_DIGESTS: Readonly<Record<string, string>> = {
  'snsb6-morphology-roots-lesson-bank@1.0.0':
    'sha256:7201a06a833f5ed14e4b6935e5359dfca148407e9a9cc267b79870d504d9b802',
  'snsb6-orthographic-patterns-lesson-bank@1.0.0':
    'sha256:dea4caf0ec3afcb1db371f660e515ac7a64ce597c14fa3e4c784b1c6a4ab5e20',
  'snsb6-phoneme-grapheme-mapping-lesson-bank@1.0.0':
    'sha256:467335fe9a91b02031c3357bc0df62336111b9d6bbb154c1dfc482f18f94bf0e',
  'snsb6-etymology-language-origins-lesson-bank@1.0.0':
    'sha256:3b05104982b80afa28218641ae077f06b802265a62b5d6437e22882f2cf6898c',
  'snsb6-word-structure-unit-bank@1.0.0':
    'sha256:7466eb3128947cb51e634cbadc828478ee9942ac3d35a25f8f9706f868a1123f',
  'snsb6-morphology-roots-review-bank@1.0.0':
    'sha256:18c0bee17e994dee56a8034c50473407c19f362a2e09ef6f55319e2440967818',
  'snsb6-orthographic-patterns-review-bank@1.0.0':
    'sha256:30e18747c0e2949d088b068ad2cf2a5e0078f6c5e07d3e18f6ec3f546005061a',
  'snsb6-phoneme-grapheme-mapping-review-bank@1.0.0':
    'sha256:4b1d0182fa9a2714c7f5e2de3d35388db9eda3149aadeee453120dbf0481f980',
  'snsb6-etymology-language-origins-review-bank@1.0.0':
    'sha256:08bf73e69f25c392fd3d67881dceea0d3875cf69738266e047a79cf52a8a330c',
  'snsb6-morphology-roots-delayed-check-bank@1.0.0':
    'sha256:a1f0a7df318daeddfdd9fdd201cba5616797936d3142f2b179b90353edbec396',
  'snsb6-orthographic-patterns-delayed-check-bank@1.0.0':
    'sha256:bbfb8a0e1761bcd3169ff36007f903babde00140582e03c0f00d07524bd54f7c',
  'snsb6-phoneme-grapheme-mapping-delayed-check-bank@1.0.0':
    'sha256:bbbf21ab29ff5597ae9b5b92eaabed3d4be119ef01f015070875c67e770edc76',
  'snsb6-etymology-language-origins-delayed-check-bank@1.0.0':
    'sha256:e721380e33f3a27b9dde3ae4ae109f91626083de9a03fae0db0987e04807c094',
};

const bankDigest = (code: string, version: string): string => {
  const digest = SPELLING_UNIT_1_BANK_DIGESTS[`${code}@${version}`];
  if (digest === undefined) throw new Error(`No reviewed digest for bank ${code}@${version}`);
  return digest;
};

const policyProfileRef = {
  code: 'scripps-spelling-bee-6-default',
  version: '1.0.0',
} satisfies Ref;
const provenance = { origin: 'original' as const, licenseStatus: 'owned' as const };
const structureReview = {
  status: 'pending_review' as const,
  reviewer: 'Pending delegated structure review (SPELL-SP5)',
  originalityStatement: 'Course structure authored for this repository from first principles.',
};
const bankReview = {
  status: 'pending_review' as const,
  reviewer: 'Pending delegated bank-metadata review (SPELL-SP5); items not yet drafted',
  originalityStatement:
    'Assessment items to be authored for this repository and held privately outside the repository (SPELL-SP6).',
};

export const SPELLING_UNIT_1_UNIT_REF = {
  code: 'snsb6-word-structure',
  version: unitVersion,
} satisfies Ref;
export const SPELLING_UNIT_1_PROGRAM_REF = {
  code: 'scripps-spelling-bee-6',
  version: '1.1.0',
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
  /** `[id, bare raw-file SHA-256]`; the first is the placement source (D-235). */
  practice: ReadonlyArray<readonly [string, string]>;
}): Lesson {
  return LessonSchema.parse({
    code: `${input.skill}-lesson`,
    unitRef: SPELLING_UNIT_1_UNIT_REF,
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

/**
 * Lesson order is teaching order only (D-127): morphology, orthography,
 * phoneme-grapheme mapping, etymology. The four skills have no prerequisite
 * edges. Orthography's placement source is `contest-2` (first ref) because
 * `core-1` relies on an unstated stress cue (finding F-04).
 */
export const SPELLING_UNIT_1_LESSONS: readonly Lesson[] = [
  lesson({
    skill: 'snsb6-morphology-roots',
    title: 'Morphology, affixes, and roots',
    objective:
      'Segment an original word into meaningful parts and use a root or affix to predict its spelling or meaning.',
    practice: [
      [
        'snsb6-morphology-roots-core-1',
        'd1ff02ad9fdea70cafa46a613717c787e4230c77f8faeaf24d1cfc8ca00c9dca',
      ],
      [
        'snsb6-morphology-roots-contest-2',
        '7976c564ec37b71c3574d67ab6f0669bf5c275a484bda1d53884710b4fdd922c',
      ],
    ],
  }),
  lesson({
    skill: 'snsb6-orthographic-patterns',
    title: 'Orthographic pattern reasoning',
    objective: 'Identify a letter pattern and apply it to an unseen original word.',
    practice: [
      [
        'snsb6-orthographic-patterns-contest-2',
        'e2e1a4f32af739444e8bb4625480773b637d4ccb890d2926c595a486d2aea993',
      ],
      [
        'snsb6-orthographic-patterns-core-1',
        'deeaecf8206ba78f8df11e14231f45cb63cdfa01f05d72cbe43dd5ec3aaa1abf',
      ],
    ],
  }),
  lesson({
    skill: 'snsb6-phoneme-grapheme-mapping',
    title: 'Pronunciation and phoneme-grapheme mapping',
    objective: 'Map a supplied pronunciation to a plausible letter sequence.',
    practice: [
      [
        'snsb6-phoneme-grapheme-mapping-core-1',
        'ddff0dd2962e9e35e96f4fc6698a4b6e48f5f73845f633ce6ad924e948f5872a',
      ],
      [
        'snsb6-phoneme-grapheme-mapping-contest-2',
        '3eea23f962582b868b21e8a2ddfe888fcfd818ca72a7ec996ba0ec22619058e9',
      ],
    ],
  }),
  lesson({
    skill: 'snsb6-etymology-language-origins',
    title: 'Etymology and language-of-origin reasoning',
    objective: 'Use a supplied origin clue to compare plausible spellings.',
    practice: [
      [
        'snsb6-etymology-language-origins-core-1',
        '244e270fc6f09cb49741c60a8f3754d2bd6d964454dc8e8fff0d63e2dbed1e1c',
      ],
      [
        'snsb6-etymology-language-origins-contest-2',
        'de855d05a686911e2c7684b9d86fb7c8fd5c708ce71c7576be5efb2d94ae34f8',
      ],
    ],
  }),
];

export const SPELLING_UNIT_1_UNIT: Unit = UnitSchema.parse({
  code: SPELLING_UNIT_1_UNIT_REF.code,
  programRef: SPELLING_UNIT_1_PROGRAM_REF,
  version: unitVersion,
  title: 'Word structure',
  summary:
    'Practice how words are built and spelled: morphology and roots, orthographic patterns, sounds to letters, and language origins.',
  lessonRefs: SPELLING_UNIT_1_LESSONS.map(({ code, version }) => ({ code, version })),
  policyProfileRef,
  assessmentBankRef: { code: 'snsb6-word-structure-unit-bank', version: bankVersion },
  provenance,
  review: structureReview,
});

/**
 * Successor program (D-352 unit shape, dossier section 3.2): `hybrid`, lists
 * exactly the one unit, with the new access `1.1.0` and legacy-compatibility
 * `1.0.0` policy versions and the profile `1.0.0` unchanged (D-131). It is
 * selected only by the activation switch.
 */
export const SPELLING_UNIT_1_PROGRAM: Program = ProgramSchema.parse({
  code: SPELLING_UNIT_1_PROGRAM_REF.code,
  version: SPELLING_UNIT_1_PROGRAM_REF.version,
  label: 'Scripps National Spelling Bee (Grade 6)',
  available: true,
  subjectKind: 'enrichment-contest',
  skillCodePrefix: 'snsb6-',
  progressionMode: 'hybrid',
  unitRefs: [SPELLING_UNIT_1_UNIT_REF],
  accessPolicyRef: { code: 'scripps-spelling-bee-6-access', version: '1.1.0' },
  legacyCompatibilityPolicyRef: {
    code: 'scripps-spelling-bee-6-legacy-compatibility',
    version: '1.0.0',
  },
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

const SKILLS = [
  'snsb6-morphology-roots',
  'snsb6-orthographic-patterns',
  'snsb6-phoneme-grapheme-mapping',
  'snsb6-etymology-language-origins',
] as const;

/**
 * Thirteen bank metadata records, 96 private items in total: four lesson
 * banks (9 each), the unit bank (24, six per skill), four review banks (3
 * each) and four delayed-check banks (6 each). Index order: lesson banks, unit
 * bank, then per skill review and delayed-check.
 */
export const SPELLING_UNIT_1_ASSESSMENT_BANKS: readonly AssessmentBank[] = [
  ...SKILLS.map(lessonBank),
  AssessmentBankSchema.parse({
    code: 'snsb6-word-structure-unit-bank',
    version: bankVersion,
    targetRef: SPELLING_UNIT_1_UNIT_REF,
    policyProfileRef,
    coveredSkillRefs: SKILLS.map(skillRefOf),
    itemCount: 24,
    contentHash: bankDigest('snsb6-word-structure-unit-bank', bankVersion),
    provenance,
    review: bankReview,
  }),
  ...SKILLS.flatMap((skill) => [
    skillBank(skill, 'review-bank', 3),
    skillBank(skill, 'delayed-check-bank', 6),
  ]),
];
