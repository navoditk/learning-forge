import type { PrismaClient } from '@prisma/client';

import { prisma } from '../server/prisma';

export function isUnboundSession(session: {
  activityKind: unknown;
  targetCode: string | null;
  targetVersion: string | null;
  assignmentId: string | null;
  policyProfileCode?: string | null;
  policyProfileVersion: string | null;
}) {
  const requiresAssignment = [
    'PLACEMENT',
    'LESSON_ASSESSMENT',
    'UNIT_ASSESSMENT',
    'DELAYED_CHECK',
    'REVIEW',
  ].includes(String(session.activityKind));
  return (
    session.activityKind === null ||
    session.targetCode === null ||
    session.targetVersion === null ||
    (requiresAssignment && session.assignmentId === null) ||
    session.policyProfileCode == null ||
    session.policyProfileVersion === null
  );
}

/**
 * Ends explicitly selected legacy sessions without changing their attempts or
 * inferring a progression binding. The caller must select exact session IDs;
 * there is intentionally no bulk/age-based default.
 */
export async function drainUnboundLegacySessions(
  sessionIds: readonly string[],
  database: PrismaClient = prisma,
) {
  if (sessionIds.length === 0) throw new Error('At least one session ID is required');
  const uniqueSessionIds = [...new Set(sessionIds)];
  if (uniqueSessionIds.length !== sessionIds.length) {
    throw new Error('Duplicate session IDs are not allowed');
  }

  return database.$transaction(async (transaction) => {
    const sessions = await transaction.session.findMany({
      where: { id: { in: uniqueSessionIds }, endedAt: null },
      select: {
        id: true,
        activityKind: true,
        targetCode: true,
        targetVersion: true,
        assignmentId: true,
        policyProfileCode: true,
        policyProfileVersion: true,
      },
    });
    if (sessions.length !== uniqueSessionIds.length) {
      throw new Error('Every selected session must exist and still be open');
    }
    if (!sessions.every(isUnboundSession)) {
      throw new Error('The drain command may only end unbound legacy sessions');
    }

    const endedAt = new Date();
    await transaction.session.updateMany({
      where: { id: { in: uniqueSessionIds }, endedAt: null },
      data: { endedAt },
    });
    return { drainedCount: uniqueSessionIds.length, endedAt };
  });
}
