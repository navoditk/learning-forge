import type { AuditEventType, PrismaClient } from '@prisma/client';

export type { AuditEventType };

/**
 * Best-effort security audit write. A logging failure must never break the
 * login/export/deletion request that triggered it - errors are swallowed
 * and reported structurally only, with no request or credential content.
 */
export async function recordAuditEvent(
  prisma: Pick<PrismaClient, 'auditLog'>,
  event: { eventType: AuditEventType; householdId?: string; userId?: string },
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        eventType: event.eventType,
        householdId: event.householdId,
        userId: event.userId,
      },
    });
  } catch (error) {
    console.error('Audit log write failed', {
      eventType: event.eventType,
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
  }
}
