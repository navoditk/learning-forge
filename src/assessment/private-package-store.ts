import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { AssessmentContentItemSchema, RefSchema } from '../contracts/progression';
import type { AssessmentContentItem, Ref } from '../contracts/progression';
import { PILOT_LESSONS } from '../curriculum/pilot-catalog';
import type { AssessmentStore, HeldOutAssessmentBank } from './store';

type RequiredBank = {
  code: string;
  version: string;
  minimumItems: number;
  requiredSkillRefs?: readonly Ref[];
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

const PackageBankSchema = z
  .object({
    code: z.string().trim().min(1),
    version: z.string().trim().min(1),
    contentHash: z.string().trim().min(1),
    items: z
      .array(AssessmentContentItemSchema.extend({ hash: z.string().trim().min(1).max(128) }))
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

function itemWithoutHash(item: AssessmentContentItem & { hash: string }): AssessmentContentItem {
  const content = { ...item };
  Reflect.deleteProperty(content, 'hash');
  return content as AssessmentContentItem;
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
    if (banks.length !== requiredBanks.length) {
      throw new Error(`Private assessment package requires ${requiredBanks.length} banks`);
    }
    for (const required of requiredBanks) {
      const bank = banks.find(
        (candidate) => candidate.code === required.code && candidate.version === required.version,
      );
      if (!bank) {
        throw new Error(
          `Private assessment package is missing bank: ${required.code}@${required.version}`,
        );
      }
      if (bank.items.length < required.minimumItems) {
        throw new Error(
          `Private assessment bank ${required.code}@${required.version} requires at least ${required.minimumItems} items`,
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
    ? new PrivateAssessmentPackageStore(packagePath, GRADE_6_MATH_REQUIRED_BANKS)
    : undefined;
}

export function validateAssessmentPackageBankRef(ref: unknown): Ref {
  return RefSchema.parse(ref);
}
