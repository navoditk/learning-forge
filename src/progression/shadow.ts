import { AccessPolicy, ActivityKind, ProgressionPolicyProfile } from '../contracts/policy';
import { authorizeActivity } from './policy';
import { policyHash } from './policy';

export type ShadowDecisionInput = {
  requestKind: string;
  targetCode: string;
  targetVersion: string;
  activityKind: ActivityKind;
  prerequisiteSkillCodes: readonly string[];
  masteredSkillCodes: ReadonlySet<string>;
  accessPolicy: AccessPolicy | undefined;
  policyProfile: ProgressionPolicyProfile;
  actualBehavior: 'ALLOWED' | 'DENIED';
  algorithmVersion: string;
};

export function buildShadowDecision(input: ShadowDecisionInput) {
  const decision = authorizeActivity({
    activityKind: input.activityKind,
    skillCode: input.targetCode,
    prerequisiteSkillCodes: [...input.prerequisiteSkillCodes],
    masteredSkillCodes: input.masteredSkillCodes,
    policy: input.accessPolicy,
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
