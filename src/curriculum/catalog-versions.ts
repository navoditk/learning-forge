import { z } from 'zod';

import { VersionSchema } from '../contracts/common';
import type { AssessmentBank, Program, Ref, Unit } from '../contracts/progression';
import { RefSchema } from '../contracts/progression';
import type { CourseCatalog, CourseCatalogInput } from './course-catalog';
import { createCourseCatalog } from './course-catalog';

/**
 * Dormant library (RAT-CATALOG-IMPL-1): a version index plus an explicit
 * active selection (design P-A). Nothing in production imports this module;
 * the import-graph test pins that. Live adoption is gated at RAT-INTEGRATE.
 */

/** Names exactly one active version per program and per skill-bank code. */
export const ActiveSelectionSchema = z
  .object({
    version: VersionSchema,
    programs: z.array(RefSchema),
    skillBanks: z.array(RefSchema),
  })
  .strict();
export type ActiveSelection = z.infer<typeof ActiveSelectionSchema>;

export type ReservedLabelKind = 'program' | 'unit' | 'lesson' | 'bank';
export type ReservedLabel = { kind: ReservedLabelKind; code: string; version: string };

export type SkillBankKind = 'DELAYED_CHECK' | 'REVIEW';

export type VersionedCourseCatalogInput = {
  records: CourseCatalogInput;
  selection: ActiveSelection;
  reservedLabels?: readonly ReservedLabel[];
};

export type VersionedCourseCatalog = {
  /** The existing catalog over every indexed version. */
  readonly index: CourseCatalog;
  readonly selection: ActiveSelection;
  /** Exact program lookup across all indexed versions. */
  programByRef(ref: Ref): Program | undefined;
  /** The selected program version for a code. */
  activeProgram(code: string): Program | undefined;
  /** One selected program per code, in index order. */
  activePrograms(): Program[];
  isActiveUnit(ref: Ref): boolean;
  isActiveLesson(ref: Ref): boolean;
  /** The selected skill bank for the skill, never chosen by array order. */
  activeSkillBank(kind: SkillBankKind, skillRef: Ref): AssessmentBank | undefined;
  /** A CourseCatalog whose code-keyed program lookups mean "currently selected". */
  activeView(): CourseCatalog;
};

const refKey = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;

const SKILL_BANK_SUFFIX: Record<SkillBankKind, string> = {
  DELAYED_CHECK: 'delayed-check-bank',
  REVIEW: 'review-bank',
};

function isSkillBankCode(bank: AssessmentBank): boolean {
  return (
    bank.code === `${bank.targetRef.code}-${SKILL_BANK_SUFFIX.REVIEW}` ||
    bank.code === `${bank.targetRef.code}-${SKILL_BANK_SUFFIX.DELAYED_CHECK}`
  );
}

function reservedKeys(
  reservedLabels: readonly ReservedLabel[],
  kind: ReservedLabelKind,
): Set<string> {
  return new Set(reservedLabels.filter((label) => label.kind === kind).map(refKey));
}

/**
 * Builds the version index and validates the active selection. Every
 * selection rule is a fail-closed load error. Precedence: schema, reserved
 * labels, S-1, S-2, S-3, S-4; within a rule the first offending record in
 * index order is reported.
 */
export function createVersionedCourseCatalog(
  input: VersionedCourseCatalogInput,
): VersionedCourseCatalog {
  const selection = ActiveSelectionSchema.parse(input.selection);
  const index = createCourseCatalog(input.records);
  const { programs, units, lessons, banks } = input.records;
  const reservedLabels = input.reservedLabels ?? [];

  // Reserved labels (ID-2), in the index and then in the selection.
  for (const [kind, records] of [
    ['program', programs],
    ['unit', units],
    ['lesson', lessons],
    ['bank', banks],
  ] as const) {
    const reserved = reservedKeys(reservedLabels, kind);
    for (const record of records) {
      if (reserved.has(refKey(record)))
        throw new Error(`Reserved label is indexed: ${kind} ${refKey(record)}`);
    }
  }
  const reservedPrograms = reservedKeys(reservedLabels, 'program');
  for (const ref of selection.programs) {
    if (reservedPrograms.has(refKey(ref)))
      throw new Error(`Reserved label is selected: program ${refKey(ref)}`);
  }
  const reservedBanks = reservedKeys(reservedLabels, 'bank');
  for (const ref of selection.skillBanks) {
    if (reservedBanks.has(refKey(ref)))
      throw new Error(`Reserved label is selected: bank ${refKey(ref)}`);
  }

  const programsByRef = new Map<string, Program>();
  for (const program of programs) {
    if (!programsByRef.has(refKey(program))) programsByRef.set(refKey(program), program);
  }

  // S-1: every indexed program code is named exactly once.
  const selectedCodes = new Map<string, Ref>();
  for (const ref of selection.programs) {
    if (selectedCodes.has(ref.code))
      throw new Error(`Selection names program code more than once: ${ref.code}`);
    selectedCodes.set(ref.code, ref);
  }
  for (const program of programs) {
    if (!selectedCodes.has(program.code))
      throw new Error(`Selection does not name program code: ${program.code}`);
  }
  // S-2: every selected program ref resolves exactly.
  for (const ref of selection.programs) {
    if (!programsByRef.has(refKey(ref)))
      throw new Error(`Selected program does not resolve: ${refKey(ref)}`);
  }

  // S-3: classify banks as lesson/unit-targeted or skill-targeted.
  const skillBanks: AssessmentBank[] = [];
  const skillBankKeys = new Set<string>();
  for (const bank of banks) {
    if (index.lessonByRef(bank.targetRef) || index.unitByRef(bank.targetRef)) continue;
    if (!isSkillBankCode(bank))
      throw new Error(`Assessment bank ${refKey(bank)} target does not resolve`);
    skillBanks.push(bank);
    skillBankKeys.add(refKey(bank));
  }

  // S-4: exactly one selection entry per skill-targeted bank code.
  const selectedBanks = new Map<string, Ref>();
  for (const ref of selection.skillBanks) {
    if (selectedBanks.has(ref.code))
      throw new Error(`Selection names skill bank code more than once: ${ref.code}`);
    selectedBanks.set(ref.code, ref);
    if (!skillBankKeys.has(refKey(ref)))
      throw new Error(`Selected skill bank is not a skill-targeted bank: ${refKey(ref)}`);
  }
  for (const bank of skillBanks) {
    if (!selectedBanks.has(bank.code))
      throw new Error(`Selection does not name skill bank code: ${bank.code}`);
  }

  const activeProgram = (code: string): Program | undefined => {
    const ref = selectedCodes.get(code);
    return ref ? programsByRef.get(refKey(ref)) : undefined;
  };
  const activePrograms = (): Program[] =>
    programs.filter((program) => {
      const ref = selectedCodes.get(program.code);
      return ref !== undefined && refKey(ref) === refKey(program);
    });

  const activeUnitKeys = (): Set<string> =>
    new Set(activePrograms().flatMap((program) => program.unitRefs.map(refKey)));
  const activeLessonKeys = (): Set<string> => {
    const keys = new Set<string>();
    for (const unitRef of activePrograms().flatMap((program) => program.unitRefs)) {
      const unit = index.unitByRef(unitRef);
      for (const lessonRef of unit?.lessonRefs ?? []) keys.add(refKey(lessonRef));
    }
    return keys;
  };

  const activeSkillBank = (kind: SkillBankKind, skillRef: Ref): AssessmentBank | undefined => {
    const selected = selectedBanks.get(`${skillRef.code}-${SKILL_BANK_SUFFIX[kind]}`);
    const bank = selected ? index.bankByRef(selected) : undefined;
    return bank && refKey(bank.targetRef) === refKey(skillRef) ? bank : undefined;
  };

  const activeView = (): CourseCatalog => ({
    ...index,
    programs: activePrograms(),
    programByCode: activeProgram,
    unitsOfProgram: (code) =>
      (activeProgram(code)?.unitRefs ?? []).flatMap((ref) => {
        const unit: Unit | undefined = index.unitByRef(ref);
        return unit ? [unit] : [];
      }),
  });

  return {
    index,
    selection,
    programByRef: (ref) => programsByRef.get(refKey(ref)),
    activeProgram,
    activePrograms,
    isActiveUnit: (ref) => activeUnitKeys().has(refKey(ref)),
    isActiveLesson: (ref) => activeLessonKeys().has(refKey(ref)),
    activeSkillBank,
    activeView,
  };
}
