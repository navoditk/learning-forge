import type { Prisma } from '@prisma/client';

export type AssessmentAssignmentWithRuntime = Prisma.AssessmentAssignmentGetPayload<{
  include: { runState: true; lease: true; sessions: true };
}>;

/**
 * Public assignment metadata deliberately excludes selected/excluded item
 * identities. Item prompts are delivered only by the server-side item path.
 */
export function projectAssessmentAssignmentResponse(input: {
  assignment: AssessmentAssignmentWithRuntime;
  replayed: boolean;
}) {
  const { assignment } = input;
  const session = assignment.sessions[0] ?? null;
  return {
    replayed: input.replayed,
    assignment: {
      id: assignment.id,
      kind: assignment.kind,
      targetKind: assignment.targetKind,
      targetCode: assignment.targetCode,
      targetVersion: assignment.targetVersion,
      bankCode: assignment.bankCode,
      bankVersion: assignment.bankVersion,
      policyProfileCode: assignment.policyProfileCode,
      policyProfileVersion: assignment.policyProfileVersion,
      attemptOrdinal: assignment.attemptOrdinal,
      requiredCount: assignment.requiredCount,
      runState: assignment.runState
        ? {
            id: assignment.runState.id,
            status: assignment.runState.status,
            currentOrdinal: assignment.runState.currentOrdinal,
            expiresAt: assignment.runState.expiresAt,
            lastActivityAt: assignment.runState.lastActivityAt,
            submittedAt: assignment.runState.submittedAt,
          }
        : null,
      session: session
        ? {
            id: session.id,
            activityKind: session.activityKind,
            targetCode: session.targetCode,
            targetVersion: session.targetVersion,
          }
        : null,
    },
  };
}
