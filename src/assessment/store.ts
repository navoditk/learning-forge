import type { AssessmentContentItem, Ref } from '../contracts';
import type { ReviewContentItem } from '../contracts/progression';
import { createPrivateAssessmentPackageStoreFromEnvironment } from './private-package-store';
import { placementProbeBankFor } from '../progression/placement-probe';

/**
 * A reviewed public practice item projected for a placement probe (D-64).
 * It keeps its `practice` role: it is assessed in placement but never becomes
 * held-out assessment content.
 */
export type PlacementProbeItem = Pick<
  AssessmentContentItem,
  | 'id'
  | 'version'
  | 'title'
  | 'skillRef'
  | 'prompt'
  | 'deterministicValidator'
  | 'accessibilityNotes'
  | 'figure'
> & {
  role: 'practice';
  hash: string;
  accessibleAlternative?: string;
};

/** A bank of items an assignment selects from; held-out except for placement. */
export type HeldOutAssessmentBank = {
  code: string;
  version: string;
  contentHash: string;
  items: readonly (
    ((AssessmentContentItem | ReviewContentItem) & { hash: string }) | PlacementProbeItem
  )[];
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

function createHeldOutStore(): AssessmentStore {
  try {
    return createPrivateAssessmentPackageStoreFromEnvironment() ?? new UnavailableAssessmentStore();
  } catch {
    // A missing, malformed, or unreviewed mounted package is an unavailable
    // held-out store. Never surface parser details or fall back to public data.
    return new UnavailableAssessmentStore();
  }
}

/**
 * Placement probes (D-64) resolve to the public practice projection; every
 * other bank comes only from the held-out store, which fails closed.
 */
export function createAssessmentStore(): AssessmentStore {
  const heldOut = createHeldOutStore();
  return {
    async getBank(ref) {
      return placementProbeBankFor(ref) ?? heldOut.getBank(ref);
    },
  };
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
