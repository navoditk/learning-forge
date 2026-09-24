import type { AssessmentContentItem, Ref } from '../contracts';
import type { ReviewContentItem } from '../contracts/progression';
import { createPrivateAssessmentPackageStoreFromEnvironment } from './private-package-store';

export type HeldOutAssessmentBank = {
  code: string;
  version: string;
  contentHash: string;
  items: readonly ((AssessmentContentItem | ReviewContentItem) & { hash: string })[];
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
  try {
    return createPrivateAssessmentPackageStoreFromEnvironment() ?? new UnavailableAssessmentStore();
  } catch {
    // A missing, malformed, or unreviewed mounted package is an unavailable
    // held-out store. Never surface parser details or fall back to public data.
    return new UnavailableAssessmentStore();
  }
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
