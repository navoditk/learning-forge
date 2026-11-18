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
 *  1. `contentHash` of every bank is `SPELLING_BANK_DIGEST_PENDING` until the
 *     owner replaces it with the real digest of the stamped private package
 *     (the merge tool refuses a mismatching digest, so a sentinel can never
 *     validate a real package).
 *  2. Bank, lesson and unit `review.status` is `pending_review`; V-11
 *     (`checkClaimedSkillBanks`) reports every bank `NOT_REVIEWED` until a
 *     delegated or human review stamps it.
 *  3. Lesson practice refs pin the reviewed `content-1` records. The
 *     `content-2` corrections (D-135) are `pending_review` and unpinned; when
 *     accepted, the lessons are re-pinned, and the probe snapshot and
 *     structure manifest digests regenerated, before the selection moves.
 * Tests forbid selecting program `1.1.0` while any sentinel remains.
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

/** Marker for a bank digest the owner has not supplied yet. Never a real digest. */
export const SPELLING_BANK_DIGEST_PENDING = `sha256:${'0'.repeat(64)}`;

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
    contentHash: SPELLING_BANK_DIGEST_PENDING,
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
    contentHash: SPELLING_BANK_DIGEST_PENDING,
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
    contentHash: SPELLING_BANK_DIGEST_PENDING,
    provenance,
    review: bankReview,
  }),
  ...SKILLS.flatMap((skill) => [
    skillBank(skill, 'review-bank', 3),
    skillBank(skill, 'delayed-check-bank', 6),
  ]),
];
