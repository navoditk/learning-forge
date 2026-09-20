import type { AssessmentContentItem, Ref } from '../contracts';
import { createPrivateAssessmentPackageStoreFromEnvironment } from './private-package-store';

export type HeldOutAssessmentBank = {
  code: string;
  version: string;
  contentHash: string;
  items: readonly (AssessmentContentItem & { hash: string })[];
};

export interface AssessmentStore {
  getBank(ref: Ref): Promise<HeldOutAssessmentBank>;
}

export class AssessmentStoreUnavailableError extends Error {
  readonly code = 'ASSESSMENT_STORE_UNAVAILABLE';

  constructor() {
    super('The private held-out assessment store is unavailable.');
  }
}

/**
 * Production default until the reviewed private package is installed. It is
 * deliberately fail-closed: no assessment endpoint may fall back to public
 * practice content or infer bank membership.
 */
export class UnavailableAssessmentStore implements AssessmentStore {
  async getBank(ref: Ref): Promise<HeldOutAssessmentBank> {
    void ref;
    throw new AssessmentStoreUnavailableError();
  }
}

export function createAssessmentStore(): AssessmentStore {
  return createPrivateAssessmentPackageStoreFromEnvironment() ?? new UnavailableAssessmentStore();
}

export function createInMemoryAssessmentStore(
  banks: readonly HeldOutAssessmentBank[],
): AssessmentStore {
  const byRef = new Map(banks.map((bank) => [`${bank.code}@${bank.version}`, bank]));
  return {
    async getBank(ref) {
      const bank = byRef.get(`${ref.code}@${ref.version}`);
      if (!bank) throw new AssessmentStoreUnavailableError();
      return bank;
    },
  };
}
