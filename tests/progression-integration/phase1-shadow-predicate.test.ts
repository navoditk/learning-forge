import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  PHASE_1_MASTERY_VERSION,
  recordAttempt,
  recordIndependentCheck,
  startSession,
} from '../../src/phase1/service';
import { readCutoverReadiness } from '../../src/progression/cutover-readiness';
import { deleteHouseholdData } from '../../src/server/household-data';
import { prisma } from '../../src/server/prisma';

/**
 * Falsifiers for the Phase 1 shadow predicate: C3 records what C4 would
 * enforce, while the learner request itself is still served.
 */
describe('Phase 1 shadow predicate', () => {
  let householdId: string;
  let learnerProfileId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const profile = await prisma.learnerProfile.create({
      data: { householdId, userId: user.id, gradeLevel: 6 },
    });
    learnerProfileId = profile.id;
  });

  beforeEach(async () => {
    await prisma.shadowDecision.deleteMany({ where: { householdId } });
    await prisma.masteryEstimate.deleteMany({ where: { householdId } });
    await prisma.session.updateMany({
      where: { householdId, endedAt: null },
      data: { endedAt: new Date() },
    });
  });

  afterAll(async () => {
    await deleteHouseholdData(prisma, householdId);
    await prisma.$disconnect();
  });

  const identity = () => ({ householdId, learnerProfileId });
  const latestShadow = () =>
    prisma.shadowDecision.findFirstOrThrow({
      where: { householdId },
      orderBy: { occurredAt: 'desc' },
    });

  it('serves the session while recording a locked-prerequisite shadow denial', async () => {
    const session = await startSession(identity(), {
      contentId: 'unit-rates-1',
      activityKind: 'PRACTICE',
    });
    expect(session.sessionId).toBeTruthy();
    expect(await latestShadow()).toMatchObject({
      shadowDecision: 'DENY',
      shadowReasonCode: 'LOCKED_PREREQUISITE',
      actualBehavior: 'ALLOWED',
      divergent: true,
    });
  });

  it('ignores prerequisite mastery recorded under another algorithm version', async () => {
    await prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: 'ratio-language',
        estimate: 0.95,
        confidenceBand: 'HIGH',
        algorithmVersion: 'integration-other-version',
        independentDelayedCheck: true,
      },
    });
    await startSession(identity(), { contentId: 'unit-rates-1', activityKind: 'PRACTICE' });
    expect(await latestShadow()).toMatchObject({
      shadowDecision: 'DENY',
      shadowReasonCode: 'LOCKED_PREREQUISITE',
      algorithmVersion: PHASE_1_MASTERY_VERSION,
    });

    await prisma.masteryEstimate.create({
      data: {
        householdId,
        learnerProfileId,
        skillCode: 'ratio-language',
        estimate: 0.95,
        confidenceBand: 'HIGH',
        algorithmVersion: PHASE_1_MASTERY_VERSION,
        independentDelayedCheck: true,
      },
    });
    await startSession(identity(), { contentId: 'unit-rates-2', activityKind: 'PRACTICE' });
    expect(await latestShadow()).toMatchObject({ shadowDecision: 'ALLOW' });
  });

  it('denies assignment-free review of a unit-claimed skill in shadow only (D-62)', async () => {
    const session = await startSession(identity(), {
      contentId: 'ratio-language-1',
      activityKind: 'REVIEW',
    });
    expect(session.sessionId).toBeTruthy();
    expect(await latestShadow()).toMatchObject({
      activityKind: 'REVIEW',
      shadowDecision: 'DENY',
      shadowReasonCode: 'RUN_NOT_ACTIVE',
      actualBehavior: 'ALLOWED',
      divergent: true,
    });
  });

  it('allows assignment-free placement and review outside every unit (D-62)', async () => {
    for (const activityKind of ['PLACEMENT', 'REVIEW'] as const) {
      await startSession(identity(), { contentId: 'gcf-and-lcm-1', activityKind });
      expect(await latestShadow()).toMatchObject({
        activityKind,
        shadowDecision: 'ALLOW',
        divergent: false,
      });
    }
  });

  it('keeps assignment-free placement and review for skill-graph-only programs (D-62)', async () => {
    const before = (await readCutoverReadiness(prisma)).unboundOpenSessionCount;
    for (const activityKind of ['PLACEMENT', 'REVIEW'] as const) {
      await startSession(identity(), {
        contentId: 'mk6-multi-step-arithmetic-reasoning-1',
        program: 'math-kangaroo-6',
        activityKind,
      });
      expect(await latestShadow()).toMatchObject({
        activityKind,
        shadowDecision: 'ALLOW',
        divergent: false,
      });
    }
    expect((await readCutoverReadiness(prisma)).unboundOpenSessionCount).toBe(before);
  });

  it('authorizes the same-sitting independent check as practice (D-65)', async () => {
    const session = await startSession(identity(), {
      contentId: 'gcf-and-lcm-1',
      activityKind: 'PRACTICE',
    });
    const attempt = await recordAttempt(identity(), {
      sessionId: session.sessionId,
      learnerResponse: 'not the answer',
    });
    await prisma.tutorInteraction.create({
      data: {
        householdId,
        learnerProfileId,
        attemptId: attempt.attemptId,
        moveType: 'hint',
        assistanceLevel: 'SMALL_STRATEGIC_HINT',
        policyVersion: 'integration-policy',
      },
    });
    await recordIndependentCheck(identity(), {
      sessionId: session.sessionId,
      learnerResponse: '6',
    });
    expect(await latestShadow()).toMatchObject({
      activityKind: 'PRACTICE',
      shadowDecision: 'ALLOW',
      divergent: false,
    });
  });

  it('counts only unit-claimed assignment-free placement or review as unbound', async () => {
    const before = (await readCutoverReadiness(prisma)).unboundOpenSessionCount;
    await startSession(identity(), { contentId: 'gcf-and-lcm-1', activityKind: 'REVIEW' });
    expect((await readCutoverReadiness(prisma)).unboundOpenSessionCount).toBe(before);
    await startSession(identity(), { contentId: 'ratio-language-1', activityKind: 'PLACEMENT' });
    expect((await readCutoverReadiness(prisma)).unboundOpenSessionCount).toBe(before + 1);
  });
});
