import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import {
  AssessmentContentItemSchema,
  RefSchema,
  ReviewContentItemSchema,
} from '../contracts/progression';
import type { Ref } from '../contracts/progression';
import { PILOT_LESSONS } from '../curriculum/pilot-catalog';
import type { AssessmentStore, HeldOutAssessmentBank } from './store';

type RequiredBank = {
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

const pilotSkillRefs = (codes: readonly string[]): readonly Ref[] =>
  codes.map((code) => ({ code, version: '1.0.0' }));

const GRADE_6_MATH_REQUIRED_BANKS: readonly RequiredBank[] = [
  {
    code: 'ratio-language-lesson-bank',
    version: '1.0.0',
    minimumItems: 9,
    requiredSkillRefs: pilotSkillRefs(PILOT_LESSONS[0]!.skillRefs.map((ref) => ref.code)),
  },
  {
    code: 'unit-rates-lesson-bank',
    version: '1.0.0',
    minimumItems: 9,
    requiredSkillRefs: pilotSkillRefs(PILOT_LESSONS[1]!.skillRefs.map((ref) => ref.code)),
  },
  {
    code: 'ratio-tables-lesson-bank',
    version: '1.0.0',
    minimumItems: 9,
    requiredSkillRefs: pilotSkillRefs(PILOT_LESSONS[2]!.skillRefs.map((ref) => ref.code)),
  },
  {
    code: 'ratios-proportional-reasoning-unit-bank',
    version: '1.0.0',
    minimumItems: 18,
    requiredSkillRefs: pilotSkillRefs(
      PILOT_LESSONS.flatMap((lesson) => lesson.skillRefs.map((ref) => ref.code)),
    ),
  },
];

const PILOT_SKILL_CODES = [
  ...new Set(PILOT_LESSONS.flatMap((lesson) => lesson.skillRefs.map((ref) => ref.code))),
];

/**
 * Skill-targeted banks: three review items per skill (D-50 as amended by D-67)
 * and a dedicated delayed-check bank of
 * delayedCheckItemsPerAttempt × (1 + maxReassessments) items per skill (D-63,
 * D-43, D-27).
 */
const GRADE_6_MATH_SKILL_BANKS: readonly RequiredBank[] = PILOT_SKILL_CODES.flatMap((code) => [
  {
    code: `${code}-review-bank`,
    version: '1.0.0',
    minimumItems: 3,
    requiredSkillRefs: pilotSkillRefs([code]),
    optional: true,
    exclusiveSkills: true,
    itemRole: 'review' as const,
  },
  {
    code: `${code}-delayed-check-bank`,
    version: '1.0.0',
    minimumItems: 6,
    requiredSkillRefs: pilotSkillRefs([code]),
    optional: true,
    exclusiveSkills: true,
  },
]);

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

const PackageSchema = z.object({ banks: z.array(PackageBankSchema).min(1) }).strict();

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

function validatePackageIntegrity(
  banks: readonly z.infer<typeof PackageBankSchema>[],
  requiredBanks: readonly RequiredBank[] = [],
): void {
  const seenBanks = new Set<string>();
  const seenItems = new Set<string>();
  for (const bank of banks) {
    const bankRef = `${bank.code}@${bank.version}`;
    if (seenBanks.has(bankRef)) throw new Error(`Duplicate private assessment bank: ${bankRef}`);
    seenBanks.add(bankRef);

    for (const item of bank.items) {
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
    ? new PrivateAssessmentPackageStore(packagePath, [
        ...GRADE_6_MATH_REQUIRED_BANKS,
        ...GRADE_6_MATH_SKILL_BANKS,
      ])
    : undefined;
}

export function validateAssessmentPackageBankRef(ref: unknown): Ref {
  return RefSchema.parse(ref);
}
