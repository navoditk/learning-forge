import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { createTutorTraceRecord } from '../../src/contracts';
import type { NotifierPort, NotifierResult, SafetyAlertInput } from '../../src/contracts';
import type { TutorResponse } from '../../src/tutor';
import { prisma } from '../../src/server/prisma';
import { recordTutorResponse, HouseholdIdentity } from '../../src/phase1/service';

class StubNotifier implements NotifierPort {
  public safetyAlerts: SafetyAlertInput[] = [];

  async sendWeeklyDigest(): Promise<NotifierResult> {
    return { status: 'logged' };
  }

  async sendSafetyAlert(input: SafetyAlertInput): Promise<NotifierResult> {
    this.safetyAlerts.push(input);
    return { status: 'sent' };
  }
}

class ThrowingNotifier implements NotifierPort {
  async sendWeeklyDigest(): Promise<NotifierResult> {
    return { status: 'logged' };
  }

  async sendSafetyAlert(): Promise<NotifierResult> {
    throw new Error('simulated provider outage');
  }
}

function buildResponse(safetyFlagged: boolean): TutorResponse {
  return {
    status: 'fallback',
    fallbackMessage: 'Let’s pause and try one small step together.',
    nextState: 'hint_1_strategy',
    masteryAdvanced: false,
    safetyFlagged,
    trace: createTutorTraceRecord({
      traceId: '00000000-0000-0000-0000-000000000000',
      policyVersion: 'policy-1',
      promptTemplateVersion: 'prompt-1',
      modelIdentifier: 'fake-tutor',
      latencyMs: 1,
      tokenUsage: { input: 1, output: 1, total: 2 },
      validationResult: 'fallback',
      outcome: 'fallback_returned',
    }),
  };
}

describe('safety-flag notification wiring', () => {
  let householdId: string;
  let identity: HouseholdIdentity;
  let sessionId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({ data: { householdId, role: 'LEARNER' } });
    const learner = await prisma.learnerProfile.create({
      data: { userId: user.id, householdId, gradeLevel: 6 },
    });
    identity = { householdId, learnerProfileId: learner.id };
    const session = await prisma.session.create({
      data: { householdId, learnerProfileId: learner.id, contentKey: 'unit-rates-1' },
    });
    sessionId = session.id;
  });

  afterAll(async () => {
    await prisma.household.delete({ where: { id: householdId } });
    await prisma.$disconnect();
  });

  it('calls sendSafetyAlert with trace metadata only when a response is safety-flagged', async () => {
    const notifier = new StubNotifier();

    await recordTutorResponse(identity, { sessionId, response: buildResponse(true) }, notifier);

    expect(notifier.safetyAlerts).toHaveLength(1);
    const alert = notifier.safetyAlerts[0];
    expect(alert.householdId).toBe(householdId);
    expect(alert.policyVersion).toBe('policy-1');
    expect(alert.traceId).toMatch(/^[0-9a-f-]{36}$/);
    // Never anything learner-text-shaped - only ids, a version string, and a
    // timestamp.
    expect(Object.keys(alert).sort()).toEqual([
      'householdId',
      'occurredAt',
      'policyVersion',
      'traceId',
    ]);
  });

  it('never calls sendSafetyAlert for a response that was not safety-flagged', async () => {
    const notifier = new StubNotifier();

    await recordTutorResponse(identity, { sessionId, response: buildResponse(false) }, notifier);

    expect(notifier.safetyAlerts).toHaveLength(0);
  });

  it('is best-effort: a notification failure never blocks recording the trace', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await recordTutorResponse(
      identity,
      { sessionId, response: buildResponse(true) },
      new ThrowingNotifier(),
    );

    expect(result.traceId).toMatch(/^[0-9a-f-]{36}$/);
    expect(errorSpy).toHaveBeenCalledWith('Safety alert notification failed', expect.any(Error));
    errorSpy.mockRestore();
  });
});
