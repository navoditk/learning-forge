import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { AssessmentContentItemSchema, RefSchema } from '../contracts/progression';
import type { Ref } from '../contracts/progression';
import type { AssessmentStore, HeldOutAssessmentBank } from './store';

const PackageBankSchema = z
  .object({
    code: z.string().trim().min(1),
    version: z.string().trim().min(1),
    contentHash: z.string().trim().min(1),
    items: z.array(AssessmentContentItemSchema.extend({ hash: z.string().trim().min(1).max(128) })),
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
    }
  });

const PackageSchema = z.object({ banks: z.array(PackageBankSchema).min(1) }).strict();

/**
 * Loads a reviewed held-out package mounted outside the public repository.
 * Missing, malformed, or mismatched packages fail closed; public practice
 * content is never used as a fallback.
 */
export class PrivateAssessmentPackageStore implements AssessmentStore {
  private readonly banks: Map<string, HeldOutAssessmentBank>;

  constructor(packagePath: string) {
    const parsed = PackageSchema.parse(JSON.parse(readFileSync(packagePath, 'utf8')));
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
