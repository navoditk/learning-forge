import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/server/prisma';
import { enforceTutorUsageLimits, TutorUsageLimitError } from '../../src/phase1/tutor-usage';
import { buildTutorUsageReport } from '../../src/phase1/tutor-usage-report';

describe('tutor usage limits', () => {
  let householdId: string;
  let learnerProfileId: string;
  let sessionId: string;

  beforeAll(async () => {
    const household = await prisma.household.create({ data: {} });
    householdId = household.id;
    const user = await prisma.user.create({
      data: { householdId, role: 'LEARNER' },
    });
    const learner = await prisma.learnerProfile.create({
      data: { userId: user.id, householdId, gradeLevel: 6 },
    });
    learnerProfileId = learner.id;
    const session = await prisma.session.create({
      data: { householdId, learnerProfileId, contentKey: 'unit-rates-1' },
    });
    sessionId = session.id;
    process.env.TUTOR_SESSION_HINT_LIMIT = '2';
    process.env.TUTOR_DAILY_HINT_LIMIT = '3';
  });

  afterAll(async () => {
    delete process.env.TUTOR_SESSION_HINT_LIMIT;
    delete process.env.TUTOR_DAILY_HINT_LIMIT;
    await prisma.household.delete({ where: { id: householdId } });
    await prisma.$disconnect();
  });

  it('rejects a session after its configured number of recorded traces', async () => {
    await prisma.tutorTrace.createMany({
      data: [
        {
          householdId,
          learnerProfileId,
          sessionId,
          policyVersion: 'policy-1',
          promptTemplateVersion: 'prompt-1',
          modelIdentifier: 'fake-tutor',
          latencyMs: 1,
          inputTokens: 1,
          outputTokens: 1,
          totalTokens: 2,
          validationResult: 'VALIDATED',
          outcome: 'MOVE_RETURNED',
        },
        {
          householdId,
          learnerProfileId,
          sessionId,
          policyVersion: 'policy-1',
          promptTemplateVersion: 'prompt-1',
          modelIdentifier: 'fake-tutor',
          latencyMs: 1,
          inputTokens: 1,
          outputTokens: 1,
          totalTokens: 2,
          validationResult: 'VALIDATED',
          outcome: 'MOVE_RETURNED',
        },
      ],
    });

    await expect(enforceTutorUsageLimits({ householdId, sessionId })).rejects.toEqual(
      expect.objectContaining({ scope: 'session', limit: 2 }),
    );
  });

  it('rejects a household after its daily configured limit', async () => {
    const otherSession = await prisma.session.create({
      data: { householdId, learnerProfileId, contentKey: 'unit-rates-2' },
    });
    await prisma.tutorTrace.create({
      data: {
        householdId,
        learnerProfileId,
        sessionId: otherSession.id,
        policyVersion: 'policy-1',
        promptTemplateVersion: 'prompt-1',
        modelIdentifier: 'fake-tutor',
        latencyMs: 1,
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
        validationResult: 'VALIDATED',
        outcome: 'MOVE_RETURNED',
      },
    });

    await expect(
      enforceTutorUsageLimits({ householdId, sessionId: otherSession.id }),
    ).rejects.toEqual(expect.objectContaining({ scope: 'household', limit: 3 }));
  });

  it('exposes a learner-safe limit message', () => {
    expect(new TutorUsageLimitError('session', 2).message).toMatch(/start another activity/i);
  });

  it('aggregates privacy-safe metrics and recent limit utilization', () => {
    const until = new Date('2026-09-13T22:00:00.000Z');
    const report = buildTutorUsageReport(
      [
        {
          householdId: 'household-a',
          sessionId: 'session-a',
          modelIdentifier: 'claude',
          latencyMs: 100,
          inputTokens: 10,
          outputTokens: 5,
          totalTokens: 15,
          validationResult: 'VALIDATED',
          outcome: 'MOVE_RETURNED',
          createdAt: new Date('2026-09-13T21:00:00.000Z'),
        },
        {
          householdId: 'household-a',
          sessionId: 'session-a',
          modelIdentifier: 'claude',
          latencyMs: 300,
          inputTokens: 20,
          outputTokens: 10,
          totalTokens: 30,
          validationResult: 'FALLBACK',
          outcome: 'ERROR',
          createdAt: new Date('2026-09-13T20:00:00.000Z'),
        },
        {
          householdId: 'household-b',
          sessionId: null,
          modelIdentifier: 'fake-tutor',
          latencyMs: 10,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          validationResult: 'VALIDATED',
          outcome: 'MOVE_RETURNED',
          createdAt: new Date('2026-09-10T20:00:00.000Z'),
        },
      ],
      {
        since: new Date('2026-09-06T22:00:00.000Z'),
        until,
        limits: { householdDaily: 4, session: 3 },
      },
    );

    expect(report.totals).toMatchObject({
      requests: 3,
      totalTokens: 45,
      averageLatencyMs: 136.67,
      p95LatencyMs: 300,
      fallbackCount: 1,
      errorCount: 1,
    });
    expect(report.byModel).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ modelIdentifier: 'fake-tutor', requests: 1 }),
      ]),
    );
    expect(report.householdUsage[0]).toMatchObject({
      householdId: 'household-a',
      requestsLast24Hours: 2,
      dailyLimitUtilization: 0.5,
      sessionsLast24Hours: 1,
    });
    expect(report.sessionUsage[0]).toMatchObject({
      sessionId: 'session-a',
      sessionLimitUtilization: 0.67,
    });
  });

  it('excludes traces outside the requested reporting period', () => {
    const until = new Date('2026-09-13T22:00:00.000Z');
    const report = buildTutorUsageReport(
      [
        {
          householdId: 'old-household',
          sessionId: null,
          modelIdentifier: 'fake-tutor',
          latencyMs: 1,
          inputTokens: 100,
          outputTokens: 100,
          totalTokens: 200,
          validationResult: 'VALIDATED',
          outcome: 'MOVE_RETURNED',
          createdAt: new Date('2026-09-01T00:00:00.000Z'),
        },
      ],
      {
        since: new Date('2026-09-12T22:00:00.000Z'),
        until,
        limits: { householdDaily: 4, session: 3 },
      },
    );

    expect(report.totals.requests).toBe(0);
    expect(report.householdUsage).toEqual([]);
  });
});
