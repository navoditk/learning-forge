import { AccessPolicy, ActivityKind, ProgressionPolicyProfile } from '../contracts/policy';
import { authorizeProgramActivity } from './policy';
import { policyHash } from './policy';

/**
 * Shadow mode is diagnostic only. A persistence failure must never change the
 * outcome of the learner operation that produced the observation.
 */
export async function persistShadowNonEnforcing<T>(
  write: () => Promise<T>,
  onFailure: (error: unknown) => void = (error) => {
    // Keep diagnostics structured and free of request text or learner data.
    console.error('Progression shadow persistence failed', {
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
  },
  timeoutMs = 250,
): Promise<boolean> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      write(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('SHADOW_PERSISTENCE_TIMEOUT')), timeoutMs);
      }),
    ]);
    return true;
  } catch (error) {
    onFailure(error);
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export type ShadowDecisionInput = {
  requestKind: string;
  targetCode: string;
  targetVersion: string;
  skillCode?: string;
  activityKind: ActivityKind;
  prerequisiteSkillCodes: readonly string[];
  masteredSkillCodes: ReadonlySet<string>;
  accessPolicy: AccessPolicy | undefined;
  legacyCompatibilityPolicy?: AccessPolicy;
  skillClaimedByUnit?: boolean;
  policyProfile: ProgressionPolicyProfile;
  actualBehavior: 'ALLOWED' | 'DENIED';
  algorithmVersion: string;
};

export function buildShadowDecision(input: ShadowDecisionInput) {
  const decision = authorizeProgramActivity({
    activityKind: input.activityKind,
    skillCode: input.skillCode ?? input.targetCode,
    prerequisiteSkillCodes: [...input.prerequisiteSkillCodes],
    masteredSkillCodes: input.masteredSkillCodes,
    skillClaimedByUnit: input.skillClaimedByUnit ?? true,
    accessPolicy: input.accessPolicy,
    legacyCompatibilityPolicy: input.legacyCompatibilityPolicy,
  });
  return {
    requestKind: input.requestKind,
    targetCode: input.targetCode,
    targetVersion: input.targetVersion,
    activityKind: input.activityKind,
    shadowDecision: decision.allowed ? ('ALLOW' as const) : ('DENY' as const),
    shadowReasonCode: decision.reasonCode,
    actualBehavior: input.actualBehavior,
    divergent: (decision.allowed ? 'ALLOWED' : 'DENIED') !== input.actualBehavior,
    policyProfileCode: input.policyProfile.code,
    policyProfileVersion: input.policyProfile.version,
    policyProfileHash: policyHash(input.policyProfile),
    algorithmVersion: input.algorithmVersion,
  };
}

export type ShadowDecisionForReview = {
  id: string;
  requestKind: string;
  targetCode: string;
  targetVersion: string;
  activityKind: ActivityKind;
  shadowDecision: 'ALLOW' | 'DENY';
  shadowReasonCode: string;
  actualBehavior: 'ALLOWED' | 'DENIED';
  divergent: boolean;
  policyProfileCode: string;
  policyProfileVersion: string;
  policyProfileHash: string;
  algorithmVersion: string;
  occurredAt: Date;
};

export type ShadowReviewDisposition = {
  decisionId: string;
  status: 'EXPLAINED' | 'REQUIRES_REMEDIATION';
};

export type ShadowReviewPacket = {
  totalDecisions: number;
  divergentDecisions: number;
  allowToDeny: number;
  denyToAllow: number;
  byReasonCode: Record<string, number>;
  unresolvedDecisionIds: string[];
  remediationDecisionIds: string[];
  reviewComplete: boolean;
  divergences: Array<{
    id: string;
    requestKind: string;
    targetCode: string;
    targetVersion: string;
    activityKind: ActivityKind;
    shadowDecision: 'ALLOW' | 'DENY';
    shadowReasonCode: string;
    actualBehavior: 'ALLOWED' | 'DENIED';
    policyProfileCode: string;
    policyProfileVersion: string;
    policyProfileHash: string;
    algorithmVersion: string;
    occurredAt: Date;
    reviewStatus: ShadowReviewDisposition['status'] | 'UNREVIEWED';
  }>;
};

/**
 * Produces the redacted, reason-code-only packet an independent reviewer can
 * inspect before C4. It never treats the packet as approval and never includes
 * learner text, prompts, answers, or household identifiers.
 */
export function buildShadowReviewPacket(
  decisions: readonly ShadowDecisionForReview[],
  dispositions: readonly ShadowReviewDisposition[] = [],
): ShadowReviewPacket {
  const divergent = decisions.filter((decision) => decision.divergent);
  const dispositionById = new Map(
    dispositions.map((disposition) => [disposition.decisionId, disposition.status]),
  );
  const byReasonCode: Record<string, number> = {};
  let allowToDeny = 0;
  let denyToAllow = 0;
  const packet = divergent.map((decision) => {
    byReasonCode[decision.shadowReasonCode] = (byReasonCode[decision.shadowReasonCode] ?? 0) + 1;
    if (decision.shadowDecision === 'ALLOW') allowToDeny += 1;
    else denyToAllow += 1;
    const reviewStatus: ShadowReviewPacket['divergences'][number]['reviewStatus'] =
      dispositionById.get(decision.id) ?? 'UNREVIEWED';
    return {
      id: decision.id,
      requestKind: decision.requestKind,
      targetCode: decision.targetCode,
      targetVersion: decision.targetVersion,
      activityKind: decision.activityKind,
      shadowDecision: decision.shadowDecision,
      shadowReasonCode: decision.shadowReasonCode,
      actualBehavior: decision.actualBehavior,
      policyProfileCode: decision.policyProfileCode,
      policyProfileVersion: decision.policyProfileVersion,
      policyProfileHash: decision.policyProfileHash,
      algorithmVersion: decision.algorithmVersion,
      occurredAt: decision.occurredAt,
      reviewStatus,
    };
  });
  const unresolvedDecisionIds = packet
    .filter(({ reviewStatus }) => reviewStatus === 'UNREVIEWED')
    .map(({ id }) => id);
  const remediationDecisionIds = packet
    .filter(({ reviewStatus }) => reviewStatus === 'REQUIRES_REMEDIATION')
    .map(({ id }) => id);
  return {
    totalDecisions: decisions.length,
    divergentDecisions: divergent.length,
    allowToDeny,
    denyToAllow,
    byReasonCode,
    unresolvedDecisionIds,
    remediationDecisionIds,
    reviewComplete: unresolvedDecisionIds.length === 0 && remediationDecisionIds.length === 0,
    divergences: packet,
  };
}
