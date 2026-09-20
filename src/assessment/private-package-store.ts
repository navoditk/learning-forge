import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { AssessmentContentItemSchema, RefSchema } from '../contracts/progression';
import type { AssessmentContentItem, Ref } from '../contracts/progression';
import type { AssessmentStore, HeldOutAssessmentBank } from './store';

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

function validatePackageIntegrity(banks: readonly z.infer<typeof PackageBankSchema>[]): void {
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
}

/**
 * Loads a reviewed held-out package mounted outside the public repository.
 * Missing, malformed, or mismatched packages fail closed; public practice
 * content is never used as a fallback.
 */
export class PrivateAssessmentPackageStore implements AssessmentStore {
  private readonly banks: Map<string, HeldOutAssessmentBank>;

  constructor(packagePath: string) {
    const parsed = PackageSchema.parse(JSON.parse(readFileSync(packagePath, 'utf8')));
    validatePackageIntegrity(parsed.banks);
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
  return packagePath ? new PrivateAssessmentPackageStore(packagePath) : undefined;
}

export function validateAssessmentPackageBankRef(ref: unknown): Ref {
  return RefSchema.parse(ref);
}
