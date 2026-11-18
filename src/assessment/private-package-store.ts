import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import {
  AssessmentContentItemSchema,
  RefSchema,
  ReviewContentItemSchema,
} from '../contracts/progression';
import type { AssessmentBank, Lesson, Ref, Unit } from '../contracts/progression';
import { COURSE_CATALOG_INDEX, VERSIONED_COURSE_CATALOG } from '../curriculum/course-catalog';
import { PROGRAM_REGISTRY } from '../curriculum/program-registry';
import type { AssessmentStore, HeldOutAssessmentBank } from './store';

export type RequiredBank = {
  code: string;
  version: string;
  minimumItems: number;
  requiredSkillRefs?: readonly Ref[];
  /** Validated when present; its assessment kind fails closed when absent. */
  optional?: boolean;
  /** Role every item in the bank must carry; defaults to `assessment`. */
  itemRole?: 'assessment' | 'review';
  /** Every item must belong to one of `requiredSkillRefs` (skill banks). */
  exclusiveSkills?: boolean;
};

type BankDerivationInput = {
  readonly lessons: readonly Pick<Lesson, 'assessmentBankRef'>[];
  readonly units: readonly Pick<Unit, 'assessmentBankRef'>[];
  readonly banks: readonly Pick<
    AssessmentBank,
    'code' | 'version' | 'targetRef' | 'coveredSkillRefs' | 'itemCount'
  >[];
};

const refKey = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;

/**
 * Derives the package bank list from every registered index bank (RI-3):
 * `minimumItems` from `itemCount`, coverage from `coveredSkillRefs`, and the
 * role from the bank kind. Lesson and unit banks are mandatory; skill review
 * and delayed-check banks are optional, exclusive to their skill, and a review
 * bank carries review items (D-50 as amended by D-67; D-63, D-43, D-27).
 * Index order is preserved. A bank of no recognised kind fails closed, so a
 * registered bank can never silently drop out of the integrity check.
 */
export function deriveRequiredBanks(catalog: BankDerivationInput): readonly RequiredBank[] {
  const lessonBanks = new Set(catalog.lessons.map((lesson) => refKey(lesson.assessmentBankRef)));
  const unitBanks = new Set(
    catalog.units.flatMap((unit) =>
      unit.assessmentBankRef ? [refKey(unit.assessmentBankRef)] : [],
    ),
  );
  return catalog.banks.map((bank): RequiredBank => {
    const base = {
      code: bank.code,
      version: bank.version,
      minimumItems: bank.itemCount,
      requiredSkillRefs: bank.coveredSkillRefs,
    };
    const key = refKey(bank);
    if (lessonBanks.has(key) || unitBanks.has(key)) return base;
    if (bank.code === `${bank.targetRef.code}-review-bank`) {
      return { ...base, optional: true, exclusiveSkills: true, itemRole: 'review' };
    }
    if (bank.code === `${bank.targetRef.code}-delayed-check-bank`) {
      return { ...base, optional: true, exclusiveSkills: true };
    }
    throw new Error(`Registered assessment bank has no recognised kind: ${key}`);
  });
}

const ALL_DERIVED_BANKS: readonly RequiredBank[] = deriveRequiredBanks(COURSE_CATALOG_INDEX);

/**
 * Pending-activation units (MATH-ST6): units introduced by a program version
 * registered AFTER the selected version of its code (declaration order in the
 * registry) are registered but not yet selected. Their banks must not become
 * mandatory (the store would refuse the whole package, taking Ratios held-out
 * assessments down with it) and must not be refused as unknown once the owner
 * merges them. Flipping the selection to that program version makes the
 * lesson and unit banks mandatory again (four for Statistics); review and
 * delayed-check banks stay optional under the existing skill-bank policy.
 */
export function pendingActivationBankKeys(
  selectedPrograms: readonly Ref[] = VERSIONED_COURSE_CATALOG.selection.programs,
): ReadonlySet<string> {
  const selected = new Map(selectedPrograms.map((ref) => [ref.code, ref.version]));
  const order = (code: string, version: string): number =>
    PROGRAM_REGISTRY.findIndex((p) => p.code === code && p.version === version);
  const pendingUnits = COURSE_CATALOG_INDEX.units.filter((unit) => {
    const chosen = selected.get(unit.programRef.code);
    return (
      chosen !== undefined &&
      order(unit.programRef.code, unit.programRef.version) > order(unit.programRef.code, chosen)
    );
  });
  const keys = new Set<string>();
  const skills = new Set<string>();
  for (const unit of pendingUnits) {
    if (unit.assessmentBankRef) keys.add(refKey(unit.assessmentBankRef));
    for (const lesson of COURSE_CATALOG_INDEX.lessonsOfUnit(unit)) {
      keys.add(refKey(lesson.assessmentBankRef));
      for (const skill of lesson.skillRefs) skills.add(refKey(skill));
    }
  }
  for (const bank of COURSE_CATALOG_INDEX.banks) {
    if (skills.has(refKey(bank.targetRef)) && /-(review|delayed-check)-bank$/u.test(bank.code)) {
      keys.add(refKey(bank));
    }
  }
  return keys;
}
const PENDING_KEYS = pendingActivationBankKeys();

/** Every bank the active Grade 6 Math package must or may contain, with its constraints. */
export const GRADE_6_MATH_PACKAGE_BANKS: readonly RequiredBank[] = ALL_DERIVED_BANKS.filter(
  (bank) => !PENDING_KEYS.has(refKey(bank)),
);

/**
 * Registered banks of not-yet-selected units: accepted (and fully validated)
 * when a package carries them, never required.
 */
export const PENDING_ACTIVATION_PACKAGE_BANKS: readonly RequiredBank[] = ALL_DERIVED_BANKS.filter(
  (bank) => PENDING_KEYS.has(refKey(bank)),
).map((bank) => ({ ...bank, optional: true }));

/** What the production store validates a mounted package against. */
export const PACKAGE_STORE_BANKS: readonly RequiredBank[] = [
  ...GRADE_6_MATH_PACKAGE_BANKS,
  ...PENDING_ACTIVATION_PACKAGE_BANKS,
];

const PackageBankSchema = z
  .object({
    code: z.string().trim().min(1),
    version: z.string().trim().min(1),
    contentHash: z.string().trim().min(1),
    items: z
      .array(
        z.discriminatedUnion('role', [
          AssessmentContentItemSchema.extend({ hash: z.string().trim().min(1).max(128) }),
          ReviewContentItemSchema.extend({ hash: z.string().trim().min(1).max(128) }),
        ]),
      )
      .min(1),
  })
  .strict()
  .superRefine((bank, context) => {
    for (const [index, item] of bank.items.entries()) {
      if (
        item.assessmentBankRef.code !== bank.code ||
        item.assessmentBankRef.version !== bank.version
      ) {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'assessmentBankRef'],
          message: 'Assessment item must reference its containing private bank',
        });
      }
      if (item.review.status !== 'reviewed') {
        context.addIssue({
          code: 'custom',
          path: ['items', index, 'review', 'status'],
          message: 'Private assessment items must be reviewed before serving',
        });
      }
    }
  });

export const PackageSchema = z.object({ banks: z.array(PackageBankSchema).min(1) }).strict();

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

function itemWithoutHash<T extends { hash: string }>(item: T): Omit<T, 'hash'> {
  const content = { ...item };
  Reflect.deleteProperty(content, 'hash');
  return content as Omit<T, 'hash'>;
}

export function validatePackageIntegrity(
  banks: readonly z.infer<typeof PackageBankSchema>[],
  requiredBanks: readonly RequiredBank[] = [],
): void {
  const seenBanks = new Set<string>();
  const seenItems = new Set<string>();
  const itemIdVersions = new Map<string, string>();
  for (const bank of banks) {
    const bankRef = `${bank.code}@${bank.version}`;
    if (seenBanks.has(bankRef)) throw new Error(`Duplicate private assessment bank: ${bankRef}`);
    seenBanks.add(bankRef);

    for (const item of bank.items) {
      // Never-reused ids: across versions of one bank code an item id is
      // served from exactly one version (D-231 L-2), so a later version
      // cannot re-serve an earlier version's item.
      const idKey = `${bank.code}\u0000${item.id}`;
      const earlier = itemIdVersions.get(idKey);
      if (earlier !== undefined && earlier !== bank.version) {
        throw new Error(
          `Private assessment item id is reused across versions of ${bank.code}: ${item.id} (${earlier}, ${bank.version})`,
        );
      }
      itemIdVersions.set(idKey, bank.version);
      const itemRef = `${item.id}@${item.version}`;
      if (seenItems.has(itemRef)) {
        throw new Error(`Duplicate private assessment item: ${itemRef}`);
      }
      seenItems.add(itemRef);
      if (item.hash !== sha256(itemWithoutHash(item))) {
        throw new Error(`Private assessment item hash mismatch: ${item.id}`);
      }
    }
    if (bank.contentHash !== sha256(bank.items)) {
      throw new Error(`Private assessment bank hash mismatch: ${bankRef}`);
    }
  }

  if (requiredBanks.length > 0) {
    for (const bank of banks) {
      if (
        !requiredBanks.some(
          (required) => required.code === bank.code && required.version === bank.version,
        )
      ) {
        throw new Error(
          `Private assessment package has an unknown bank: ${bank.code}@${bank.version}`,
        );
      }
    }
    for (const required of requiredBanks) {
      const bank = banks.find(
        (candidate) => candidate.code === required.code && candidate.version === required.version,
      );
      if (!bank && required.optional) continue;
      if (!bank) {
        throw new Error(
          `Private assessment package is missing bank: ${required.code}@${required.version}`,
        );
      }
      const role = required.itemRole ?? 'assessment';
      if (bank.items.some((item) => item.role !== role)) {
        throw new Error(
          `Private assessment bank ${required.code}@${required.version} must contain only ${role} items`,
        );
      }
      if (bank.items.length < required.minimumItems) {
        throw new Error(
          `Private assessment bank ${required.code}@${required.version} requires at least ${required.minimumItems} items`,
        );
      }
      if (
        required.exclusiveSkills &&
        bank.items.some(
          (item) =>
            !(required.requiredSkillRefs ?? []).some(
              (ref) => ref.code === item.skillRef.code && ref.version === item.skillRef.version,
            ),
        )
      ) {
        throw new Error(
          `Private assessment bank ${required.code}@${required.version} contains an item for another skill`,
        );
      }
      for (const skillRef of required.requiredSkillRefs ?? []) {
        if (
          !bank.items.some(
            (item) =>
              item.skillRef.code === skillRef.code && item.skillRef.version === skillRef.version,
          )
        ) {
          throw new Error(
            `Private assessment bank ${required.code}@${required.version} is missing coverage for skill ${skillRef.code}@${skillRef.version}`,
          );
        }
      }
    }
  }
}

/**
 * Loads a reviewed held-out package mounted outside the public repository.
 * Missing, malformed, or mismatched packages fail closed; public practice
 * content is never used as a fallback.
 */
export class PrivateAssessmentPackageStore implements AssessmentStore {
  private readonly banks: Map<string, HeldOutAssessmentBank>;

  constructor(packagePath: string, requiredBanks: readonly RequiredBank[] = []) {
    const parsed = PackageSchema.parse(JSON.parse(readFileSync(packagePath, 'utf8')));
    validatePackageIntegrity(parsed.banks, requiredBanks);
    this.banks = new Map(
      parsed.banks.map((bank) => [
        `${bank.code}@${bank.version}`,
        bank satisfies HeldOutAssessmentBank,
      ]),
    );
  }

  async getBank(ref: Ref): Promise<HeldOutAssessmentBank> {
    const bank = this.banks.get(`${ref.code}@${ref.version}`);
    if (!bank)
      throw new Error(`Held-out assessment bank is unavailable: ${ref.code}@${ref.version}`);
    return bank;
  }
}

export function createPrivateAssessmentPackageStoreFromEnvironment(): AssessmentStore | undefined {
  const packagePath = process.env.LEARNING_FORGE_ASSESSMENT_PACKAGE_PATH;
  return packagePath
    ? new PrivateAssessmentPackageStore(packagePath, PACKAGE_STORE_BANKS)
    : undefined;
}

export function validateAssessmentPackageBankRef(ref: unknown): Ref {
  return RefSchema.parse(ref);
}
