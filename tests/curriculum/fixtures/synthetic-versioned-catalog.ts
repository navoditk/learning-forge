import { createHash } from 'node:crypto';

import type { ActiveSelection } from '../../../src/curriculum/catalog-versions';
import type { CourseCatalogInput } from '../../../src/curriculum/course-catalog';
import {
  AssessmentBankSchema,
  LessonSchema,
  ProgramSchema,
  UnitSchema,
  type AssessmentBank,
  type Lesson,
  type Program,
  type Ref,
  type Unit,
} from '../../../src/contracts/progression';

// Database-free synthetic versioned family (RAT-CATALOG-IMPL-1). Every code,
// title and hash is invented. Successor records use only `synthetic-versioned-*`
// codes so no real Grade 6 Math label is ever paired with a new version (§2.4).
const v1 = '1.0.0';
const v11 = '1.1.0';
const v2 = '2.0.0';
const policyProfileRef = { code: 'synthetic-versioned-default', version: v1 } as const;
const provenance = { origin: 'original', licenseStatus: 'owned' } as const;
const review = {
  status: 'reviewed',
  reviewer: 'Synthetic fixture reviewer',
  reviewedAt: '2026-10-20',
  originalityStatement: 'Synthetic test fixture with no real curriculum content.',
} as const;

export const SV_PROGRAM_CODE = 'synthetic-versioned-math';
export const SV_UNIT_CODE = 'synthetic-versioned-unit';
export const sv = (suffix: string): string => `synthetic-versioned-${suffix}`;
export const svSkill = (n: number): Ref => ({ code: sv(`s${n}`), version: v1 });

export const SV_PROGRAM_V1_REF: Ref = { code: SV_PROGRAM_CODE, version: v1 };
export const SV_PROGRAM_V11_REF: Ref = { code: SV_PROGRAM_CODE, version: v11 };
export const SV_UNIT_V1_REF: Ref = { code: SV_UNIT_CODE, version: v1 };
export const SV_UNIT_V2_REF: Ref = { code: SV_UNIT_CODE, version: v2 };

const hash = (seed: string): string => `sha256:${createHash('sha256').update(seed).digest('hex')}`;

const program = (version: string, unitRef: Ref): Program =>
  ProgramSchema.parse({
    code: SV_PROGRAM_CODE,
    version,
    label: 'Synthetic Versioned Math',
    available: false,
    subjectKind: 'enrichment-contest',
    skillCodePrefix: null,
    progressionMode: 'unit-sequenced',
    unitRefs: [unitRef],
    accessPolicyRef: { code: 'synthetic-versioned-access', version: v1 },
    legacyCompatibilityPolicyRef: null,
    defaultPolicyProfileRef: policyProfileRef,
  });

const lesson = (n: number, version: string, unitRef: Ref, bankRef: Ref, skills: Ref[]): Lesson =>
  LessonSchema.parse({
    code: sv(`l${n}`),
    unitRef,
    version,
    title: `Synthetic versioned lesson ${n}`,
    objectives: ['Exercise the versioned catalog with invented metadata.'],
    skillRefs: skills,
    teachingContentRefs: [],
    practiceContentRefs: [],
    assessmentBankRef: bankRef,
    policyProfileRef,
    provenance,
    review,
  });

const bank = (
  code: string,
  version: string,
  targetRef: Ref,
  covered: Ref[],
  itemCount = 3,
): AssessmentBank =>
  AssessmentBankSchema.parse({
    code,
    version,
    targetRef,
    policyProfileRef,
    coveredSkillRefs: covered,
    itemCount,
    contentHash: hash(`${code}@${version}`),
    provenance,
    review,
  });

const unit = (version: string, programRef: Ref, lessons: readonly Lesson[], bankRef: Ref): Unit =>
  UnitSchema.parse({
    code: SV_UNIT_CODE,
    programRef,
    version,
    title: 'Synthetic versioned unit',
    summary: 'Invented unit used only by versioned catalog tests.',
    lessonRefs: lessons.map(({ code, version: lessonVersion }) => ({
      code,
      version: lessonVersion,
    })),
    policyProfileRef,
    assessmentBankRef: bankRef,
    provenance,
    review,
  });

const lessonRef = (n: number, version: string): Ref => ({ code: sv(`l${n}`), version });
const lessonBankRef = (n: number, version: string): Ref => ({ code: sv(`l${n}-bank`), version });

// 1.0.0 family: three lessons (s1..s3).
export const SV_LESSONS_V1: readonly Lesson[] = [1, 2, 3].map((n) =>
  lesson(n, v1, SV_UNIT_V1_REF, lessonBankRef(n, v1), [svSkill(n)]),
);

// 2.0.0 family: five lessons (s1..s5). l1 shares its 1.0.0 bank (L-1);
// l2 and l3 use a bank per version (L-2); l4 and l5 are new.
export const SV_LESSONS_V2: readonly Lesson[] = [
  lesson(1, v2, SV_UNIT_V2_REF, lessonBankRef(1, v1), [svSkill(1)]),
  lesson(2, v2, SV_UNIT_V2_REF, lessonBankRef(2, v2), [svSkill(2)]),
  lesson(3, v2, SV_UNIT_V2_REF, lessonBankRef(3, v2), [svSkill(3)]),
  lesson(4, v2, SV_UNIT_V2_REF, lessonBankRef(4, v2), [svSkill(4)]),
  lesson(5, v2, SV_UNIT_V2_REF, lessonBankRef(5, v2), [svSkill(5)]),
];

export const SV_UNIT_V1: Unit = unit(v1, SV_PROGRAM_V1_REF, SV_LESSONS_V1, {
  code: sv('unit-bank'),
  version: v1,
});
export const SV_UNIT_V2: Unit = unit(v2, SV_PROGRAM_V11_REF, SV_LESSONS_V2, {
  code: sv('unit-bank'),
  version: v2,
});

export const SV_PROGRAM_V1: Program = program(v1, SV_UNIT_V1_REF);
export const SV_PROGRAM_V11: Program = program(v11, SV_UNIT_V2_REF);

export const SV_BANKS: readonly AssessmentBank[] = [
  // Lesson banks. l1 v1 is shared by l1@1.0.0 and l1@2.0.0 (L-1).
  bank(sv('l1-bank'), v1, lessonRef(1, v1), [svSkill(1)]),
  bank(sv('l2-bank'), v1, lessonRef(2, v1), [svSkill(2)]),
  bank(sv('l2-bank'), v2, lessonRef(2, v2), [svSkill(2)]),
  bank(sv('l3-bank'), v1, lessonRef(3, v1), [svSkill(3)]),
  bank(sv('l3-bank'), v2, lessonRef(3, v2), [svSkill(3)]),
  bank(sv('l4-bank'), v2, lessonRef(4, v2), [svSkill(4)]),
  bank(sv('l5-bank'), v2, lessonRef(5, v2), [svSkill(5)]),
  // Unit banks.
  bank(sv('unit-bank'), v1, SV_UNIT_V1_REF, [svSkill(1), svSkill(2), svSkill(3)], 6),
  bank(
    sv('unit-bank'),
    v2,
    SV_UNIT_V2_REF,
    [1, 2, 3, 4, 5].map((n) => svSkill(n)),
    10,
  ),
  // Skill-targeted banks; s3 has two delayed-check versions (second is the one selected).
  ...[1, 2, 3, 4, 5].flatMap((n) => [
    bank(sv(`s${n}-review-bank`), v1, svSkill(n), [svSkill(n)]),
    bank(sv(`s${n}-delayed-check-bank`), v1, svSkill(n), [svSkill(n)], 6),
    ...(n === 3 ? [bank(sv('s3-delayed-check-bank'), v2, svSkill(n), [svSkill(n)], 6)] : []),
  ]),
];

/** Every record this fixture exports, for the label-isolation guard (IG-4). */
export const SV_ALL_RECORDS: readonly { code: string; version: string }[] = [
  SV_PROGRAM_V1,
  SV_PROGRAM_V11,
  SV_UNIT_V1,
  SV_UNIT_V2,
  ...SV_LESSONS_V1,
  ...SV_LESSONS_V2,
  ...SV_BANKS,
];

export function syntheticVersionedInput(
  programOrder: 'v1-first' | 'v11-first' = 'v1-first',
): CourseCatalogInput {
  return {
    programs:
      programOrder === 'v1-first'
        ? [SV_PROGRAM_V1, SV_PROGRAM_V11]
        : [SV_PROGRAM_V11, SV_PROGRAM_V1],
    units: [SV_UNIT_V1, SV_UNIT_V2],
    lessons: [...SV_LESSONS_V1, ...SV_LESSONS_V2],
    banks: SV_BANKS,
  };
}

/** Selection naming program 1.1.0 and one bank per skill-bank code (s3 delayed-check at 2.0.0). */
export function selectionFor(
  overrides: Partial<ActiveSelection> & { programVersion?: string } = {},
): ActiveSelection {
  const { programVersion = v11, ...rest } = overrides;
  return {
    version: 'synthetic-selection-1',
    programs: [{ code: SV_PROGRAM_CODE, version: programVersion }],
    skillBanks: [1, 2, 3, 4, 5].flatMap((n) => [
      { code: sv(`s${n}-review-bank`), version: v1 },
      { code: sv(`s${n}-delayed-check-bank`), version: n === 3 ? v2 : v1 },
    ]),
    ...rest,
  };
}

/**
 * A naive integration: program 1.0.0 is edited in place to list unit 2.0.0
 * and the 1.0.0 unit and lessons are dropped, so history stops resolving.
 */
export function naiveReplacementInput(): CourseCatalogInput {
  const editedProgram = ProgramSchema.parse({ ...SV_PROGRAM_V1, unitRefs: [SV_UNIT_V2_REF] });
  const editedUnit = UnitSchema.parse({ ...SV_UNIT_V2, programRef: SV_PROGRAM_V1_REF });
  return {
    programs: [editedProgram],
    units: [editedUnit],
    lessons: SV_LESSONS_V2,
    banks: SV_BANKS,
  };
}

/** The naive input that keeps the 1.0.0 records but has nothing listing them. */
export function naiveKeepingHistoryInput(): CourseCatalogInput {
  const naive = naiveReplacementInput();
  return {
    ...naive,
    units: [SV_UNIT_V1, ...naive.units],
    lessons: [...SV_LESSONS_V1, ...naive.lessons],
  };
}

/**
 * One-unit family with a lesson per entry of `skillSets` (skill numbers), for
 * placement-capacity tests. Skill banks are not needed by the capacity check.
 */
export function capacityInput(skillSets: readonly (readonly number[])[]): {
  input: CourseCatalogInput;
  unit: Unit;
} {
  const capProgramRef = { code: sv('cap-program'), version: v1 };
  const capUnitRef = { code: sv('cap-unit'), version: v1 };
  const capSkill = (n: number): Ref => ({ code: sv(`cap-s${n}`), version: v1 });
  const lessons = skillSets.map((skills, index) =>
    LessonSchema.parse({
      code: sv(`cap-l${index + 1}`),
      unitRef: capUnitRef,
      version: v1,
      title: `Synthetic capacity lesson ${index + 1}`,
      objectives: ['Exercise placement capacity with invented metadata.'],
      skillRefs: skills.map(capSkill),
      teachingContentRefs: [],
      practiceContentRefs: [],
      assessmentBankRef: { code: sv(`cap-l${index + 1}-bank`), version: v1 },
      policyProfileRef,
      provenance,
      review,
    }),
  );
  const capUnit = UnitSchema.parse({
    code: capUnitRef.code,
    programRef: capProgramRef,
    version: v1,
    title: 'Synthetic capacity unit',
    summary: 'Invented unit used only by capacity tests.',
    lessonRefs: lessons.map(({ code }) => ({ code, version: v1 })),
    policyProfileRef,
    provenance,
    review,
  });
  const capProgram = ProgramSchema.parse({
    ...program(v1, capUnitRef),
    code: capProgramRef.code,
  });
  return {
    input: {
      programs: [capProgram],
      units: [capUnit],
      lessons,
      banks: lessons.map((entry) =>
        bank(entry.assessmentBankRef.code, v1, { code: entry.code, version: v1 }, [
          ...entry.skillRefs,
        ]),
      ),
    },
    unit: capUnit,
  };
}
