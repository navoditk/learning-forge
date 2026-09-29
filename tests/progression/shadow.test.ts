import { describe, expect, it } from 'vitest';

import { loadPolicyArtifacts } from '../../src/progression/artifacts';
import {
  buildShadowDecision,
  buildShadowReviewPacket,
  persistShadowNonEnforcing,
} from '../../src/progression/shadow';
import { policyHash } from '../../src/progression/policy';

describe('progression shadow decisions', () => {
  it('does not propagate persistence failures into learner behavior', async () => {
    const diagnostics: unknown[] = [];
    await expect(
      persistShadowNonEnforcing(
        async () => {
          throw new Error('database unavailable');
        },
        (error) => diagnostics.push(error),
      ),
    ).resolves.toBe(false);
    expect(diagnostics).toHaveLength(1);
  });

  it('bounds a shadow persistence stall without blocking learner behavior', async () => {
    const started = Date.now();
    const diagnostics: unknown[] = [];
    await expect(
      persistShadowNonEnforcing(
        () => new Promise<never>(() => undefined),
        (error) => diagnostics.push(error),
        10,
      ),
    ).resolves.toBe(false);
    expect(Date.now() - started).toBeLessThan(250);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({ message: 'SHADOW_PERSISTENCE_TIMEOUT' });
  });

  it('records divergence without changing the actual legacy behavior', () => {
    const { profiles, accessPolicies } = loadPolicyArtifacts();
    const profile = profiles.find((candidate) => candidate.code === 'grade-6-math-default');
    const accessPolicy = accessPolicies.find(
      (candidate) => candidate.code === 'grade-6-math-access' && candidate.version === '1.1.0',
    );
    if (!profile || !accessPolicy) throw new Error('Grade 6 Math policy artifacts are missing');

    const decision = buildShadowDecision({
      requestKind: 'test',
      targetCode: 'unit-rates',
      targetVersion: '1.0.0',
      activityKind: 'PRACTICE',
      prerequisiteSkillCodes: ['ratio-language'],
      masteredSkillCodes: new Set(),
      accessPolicy,
      claimedByAuthoredUnit: true,
      assignmentBound: false,
      policyProfile: profile,
      actualBehavior: 'ALLOWED',
      algorithmVersion: 'mastery-test-1',
    });

    expect(decision.shadowDecision).toBe('DENY');
    expect(decision.shadowReasonCode).toBe('LOCKED_PREREQUISITE');
    expect(decision.actualBehavior).toBe('ALLOWED');
    expect(decision.divergent).toBe(true);
    expect(decision.policyProfileHash).toBe(policyHash(profile));
    expect(decision.policyProfileHash).not.toContain('grade-6-math-default');
  });

  it('carries the actor and active run tuple into new shadow evidence', () => {
    const { profiles, accessPolicies } = loadPolicyArtifacts();
    const profile = profiles.find((candidate) => candidate.code === 'grade-6-math-default');
    const accessPolicy = accessPolicies.find(
      (candidate) => candidate.code === 'grade-6-math-access' && candidate.version === '1.1.0',
    );
    if (!profile || !accessPolicy) throw new Error('Grade 6 Math policy artifacts are missing');

    expect(
      buildShadowDecision({
        actorUserId: 'parent-1',
        actorRole: 'PARENT',
        activeRunOrSessionId: 'session-1',
        requestKind: 'start-session',
        targetCode: 'ratio-language-1',
        targetVersion: '1.0.0',
        activityKind: 'PRACTICE',
        prerequisiteSkillCodes: [],
        masteredSkillCodes: new Set(),
        accessPolicy,
        claimedByAuthoredUnit: true,
        assignmentBound: false,
        policyProfile: profile,
        actualBehavior: 'ALLOWED',
        algorithmVersion: 'mastery-test-1',
      }),
    ).toMatchObject({
      actorUserId: 'parent-1',
      actorRole: 'PARENT',
      activeRunOrSessionId: 'session-1',
    });
  });

  it('summarizes only divergent, non-sensitive evidence for independent review', () => {
    const decisions = [
      {
        id: 'shadow-1',
        actorUserId: 'parent-1',
        actorRole: 'PARENT' as const,
        activeRunOrSessionId: 'session-1',
        requestKind: 'practice',
        targetCode: 'unit-rates',
        targetVersion: '1.0.0',
        activityKind: 'PRACTICE' as const,
        shadowDecision: 'DENY' as const,
        shadowReasonCode: 'LOCKED_PREREQUISITE',
        actualBehavior: 'ALLOWED' as const,
        divergent: true,
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
        policyProfileHash: 'sha256:policy',
        algorithmVersion: 'mastery-1',
        occurredAt: new Date('2026-01-01T00:00:00Z'),
      },
      {
        id: 'shadow-2',
        actorUserId: 'parent-1',
        actorRole: 'PARENT' as const,
        activeRunOrSessionId: 'session-2',
        requestKind: 'practice',
        targetCode: 'ratio-language',
        targetVersion: '1.0.0',
        activityKind: 'PRACTICE' as const,
        shadowDecision: 'ALLOW' as const,
        shadowReasonCode: 'ALLOW',
        actualBehavior: 'ALLOWED' as const,
        divergent: false,
        policyProfileCode: 'grade-6-math-default',
        policyProfileVersion: '1.0.0',
        policyProfileHash: 'sha256:policy',
        algorithmVersion: 'mastery-1',
        occurredAt: new Date('2026-01-01T00:00:00Z'),
      },
    ];
    const packet = buildShadowReviewPacket(decisions, [
      { decisionId: 'shadow-1', status: 'EXPLAINED' },
    ]);
    expect(packet.totalDecisions).toBe(2);
    expect(packet.divergentDecisions).toBe(1);
    expect(packet.allowToDeny).toBe(0);
    expect(packet.denyToAllow).toBe(1);
    expect(packet.byReasonCode).toEqual({ LOCKED_PREREQUISITE: 1 });
    expect(packet.reviewComplete).toBe(true);
    expect(packet.divergences[0]).not.toHaveProperty('learnerProfileId');
    expect(packet.divergences[0]).not.toHaveProperty('actorUserId');
    expect(packet.divergences[0].requestContextComplete).toBe(true);
    expect(packet.divergences[0]).not.toHaveProperty('prompt');
  });

  it('does not report review completion with unresolved or remediation divergences', () => {
    const decision = {
      id: 'shadow-1',
      actorUserId: 'parent-1',
      actorRole: 'PARENT' as const,
      activeRunOrSessionId: 'session-1',
      requestKind: 'practice',
      targetCode: 'unit-rates',
      targetVersion: '1.0.0',
      activityKind: 'PRACTICE' as const,
      shadowDecision: 'DENY' as const,
      shadowReasonCode: 'LOCKED_PREREQUISITE',
      actualBehavior: 'ALLOWED' as const,
      divergent: true,
      policyProfileCode: 'grade-6-math-default',
      policyProfileVersion: '1.0.0',
      policyProfileHash: 'sha256:policy',
      algorithmVersion: 'mastery-1',
      occurredAt: new Date('2026-01-01T00:00:00Z'),
    };
    expect(buildShadowReviewPacket([decision]).reviewComplete).toBe(false);
    expect(
      buildShadowReviewPacket(
        [decision],
        [{ decisionId: 'shadow-1', status: 'REQUIRES_REMEDIATION' }],
      ),
    ).toMatchObject({
      reviewComplete: false,
      remediationDecisionIds: ['shadow-1'],
    });
  });
});
