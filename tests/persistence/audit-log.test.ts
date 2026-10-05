import { afterAll, describe, expect, it } from 'vitest';

import { prisma } from '../../src/server/prisma';
import { recordAuditEvent } from '../../src/server/audit-log';

describe('recordAuditEvent', () => {
  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { householdId: 'audit-log-test-household' } });
  });

  it('writes a row with the given event type and attribution', async () => {
    await recordAuditEvent(prisma, {
      eventType: 'HOUSEHOLD_EXPORT',
      householdId: 'audit-log-test-household',
      userId: 'audit-log-test-user',
    });
    const rows = await prisma.auditLog.findMany({
      where: { householdId: 'audit-log-test-household' },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      eventType: 'HOUSEHOLD_EXPORT',
      userId: 'audit-log-test-user',
    });
  });

  it('writes an unattributed row when no household/user is known', async () => {
    await recordAuditEvent(prisma, { eventType: 'LOGIN_FAILURE' });
    const rows = await prisma.auditLog.findMany({
      where: { eventType: 'LOGIN_FAILURE', householdId: null, userId: null },
      take: 1,
    });
    expect(rows).toHaveLength(1);
  });

  it('has no foreign-key relation on householdId/userId - an unknown id still writes', async () => {
    // This is the entire point of the table: it must remain writable and
    // readable for a household/user id that no longer exists.
    await expect(
      recordAuditEvent(prisma, {
        eventType: 'HOUSEHOLD_DELETE',
        householdId: 'does-not-exist-and-never-did',
        userId: 'does-not-exist-and-never-did',
      }),
    ).resolves.toBeUndefined();
    const rows = await prisma.auditLog.findMany({
      where: { householdId: 'does-not-exist-and-never-did' },
    });
    expect(rows).toHaveLength(1);
    await prisma.auditLog.deleteMany({ where: { householdId: 'does-not-exist-and-never-did' } });
  });

  it('is best-effort: a write failure is swallowed, not thrown', async () => {
    const failingClient = {
      auditLog: {
        create: () => Promise.reject(new Error('simulated database outage')),
      },
    } as unknown as Parameters<typeof recordAuditEvent>[0];
    await expect(
      recordAuditEvent(failingClient, { eventType: 'LOGIN_SUCCESS' }),
    ).resolves.toBeUndefined();
  });
});
