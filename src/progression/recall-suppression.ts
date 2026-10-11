import { z } from 'zod';

import { isTerminalAssessmentStatus } from './assessment-state';

const AssessmentRunStatusValues = [
  'PENDING',
  'IN_PROGRESS',
  'SUBMITTED',
  'SCORED',
  'EXPIRED',
  'ABANDONED',
  'INVALIDATED',
] as const;

const AssessmentRunStatusSchema = z.enum(AssessmentRunStatusValues);

const RecallSessionSchema = z
  .object({
    endedAt: z.date().nullable(),
    kind: z.unknown().nullable().optional(),
  })
  .passthrough();

const RecallAssessmentRunSchema = z
  .object({
    status: z.unknown(),
  })
  .passthrough();

export const RecallSuppressionSnapshotSchema = z
  .object({
    sessions: z.array(RecallSessionSchema),
    assessmentRuns: z.array(RecallAssessmentRunSchema),
  })
  .strict();

export type RecallSuppressionSnapshot = z.infer<typeof RecallSuppressionSnapshotSchema>;

export type RecallSuppressionReasonCode =
  'ALLOW' | 'UNFINISHED_SESSION' | 'NON_TERMINAL_ASSESSMENT' | 'MALFORMED_STATE';

export type RecallSuppressionDecision = {
  suppressed: boolean;
  reasonCode: RecallSuppressionReasonCode;
};

function hasMalformedSnapshotState(snapshot: RecallSuppressionSnapshot): boolean {
  for (const run of snapshot.assessmentRuns) {
    const parsedStatus = AssessmentRunStatusSchema.safeParse(run.status);
    if (!parsedStatus.success) return true;
  }

  return false;
}

/** Clears only suppression, never catalog, exposure, review or release authorization. */
export function decideRecallSuppression(snapshot: unknown): RecallSuppressionDecision {
  const parsedSnapshot = RecallSuppressionSnapshotSchema.safeParse(snapshot);
  if (!parsedSnapshot.success) {
    return { suppressed: true, reasonCode: 'MALFORMED_STATE' };
  }

  if (hasMalformedSnapshotState(parsedSnapshot.data)) {
    return { suppressed: true, reasonCode: 'MALFORMED_STATE' };
  }

  if (parsedSnapshot.data.sessions.some((session) => session.endedAt === null)) {
    return { suppressed: true, reasonCode: 'UNFINISHED_SESSION' };
  }

  if (
    parsedSnapshot.data.assessmentRuns.some((run) => {
      const status = AssessmentRunStatusSchema.parse(run.status);
      return !isTerminalAssessmentStatus(status);
    })
  ) {
    return { suppressed: true, reasonCode: 'NON_TERMINAL_ASSESSMENT' };
  }

  return { suppressed: false, reasonCode: 'ALLOW' };
}
