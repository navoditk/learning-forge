import type { PrismaClient, ProgressionActivityKind } from '@prisma/client';

import { prisma } from '../server/prisma';
import {
  ALWAYS_ASSIGNMENT_BOUND_KINDS,
  contentSessionRequiresAssignment,
  UNIT_ASSIGNMENT_BOUND_KINDS,
} from './assignment-binding';
import {
  buildShadowReviewPacket,
  type ShadowDecisionForReview,
  type ShadowReviewDisposition,
  type ShadowReviewPacket,
} from './shadow';

export type CutoverReadiness = {
  generatedAt: Date;
  unboundOpenSessionCount: number;
  drainComplete: boolean;
  shadowReview: ShadowReviewPacket;
  readyForIndependentReview: boolean;
};

/**
 * Summarizes only C4 prerequisites. It does not enable enforcement, mutate
 * sessions, or treat the report as approval.
 */
export function summarizeCutoverReadiness(input: {
  unboundOpenSessionCount: number;
  shadowDecisions: readonly ShadowDecisionForReview[];
  dispositions?: readonly ShadowReviewDisposition[];
  generatedAt?: Date;
}): CutoverReadiness {
  const shadowReview = buildShadowReviewPacket(input.shadowDecisions, input.dispositions);
  const drainComplete = input.unboundOpenSessionCount === 0;
  return {
    generatedAt: input.generatedAt ?? new Date(),
    unboundOpenSessionCount: input.unboundOpenSessionCount,
    drainComplete,
    shadowReview,
    readyForIndependentReview:
      drainComplete && shadowReview.totalDecisions > 0 && shadowReview.reviewComplete,
  };
}

/**
 * Reads the expand/drain and shadow-review evidence without returning
 * household or learner identifiers. An open session is unbound when any
 * nullable progression binding is missing, or when a D-62 assessment
 * assignment is required and absent. Assessment activities require an
 * assignment; ordinary practice/teaching sessions do not. This invents no
 * activity timeout.
 */
export async function readCutoverReadiness(
  database: PrismaClient = prisma,
  dispositions: readonly ShadowReviewDisposition[] = [],
): Promise<CutoverReadiness> {
  const [baseUnboundCount, unitBoundCandidates, decisions] = await Promise.all([
    database.session.count({
      where: {
        endedAt: null,
        OR: [
          { activityKind: null },
          { targetCode: null },
          { targetVersion: null },
          {
            AND: [
              {
                activityKind: {
                  in: [...ALWAYS_ASSIGNMENT_BOUND_KINDS] as ProgressionActivityKind[],
                },
              },
              { assignmentId: null },
            ],
          },
          { policyProfileCode: null },
          { policyProfileVersion: null },
        ],
      },
    }),
    // Otherwise-bound, assignment-free placement/review sessions: whether each
    // is unbound depends on whether an authored unit claims its skill (D-62).
    database.session.findMany({
      where: {
        endedAt: null,
        assignmentId: null,
        activityKind: { in: [...UNIT_ASSIGNMENT_BOUND_KINDS] as ProgressionActivityKind[] },
        targetCode: { not: null },
        targetVersion: { not: null },
        policyProfileCode: { not: null },
        policyProfileVersion: { not: null },
      },
      select: { activityKind: true, targetCode: true },
    }),
    database.shadowDecision.findMany({
      orderBy: { occurredAt: 'asc' },
      select: {
        id: true,
        actorUserId: true,
        actorRole: true,
        activeRunOrSessionId: true,
        requestKind: true,
        targetCode: true,
        targetVersion: true,
        activityKind: true,
        shadowDecision: true,
        shadowReasonCode: true,
        actualBehavior: true,
        divergent: true,
        policyProfileCode: true,
        policyProfileVersion: true,
        policyProfileHash: true,
        algorithmVersion: true,
        occurredAt: true,
      },
    }),
  ]);

  const unboundOpenSessionCount =
    baseUnboundCount +
    unitBoundCandidates.filter((session) =>
      contentSessionRequiresAssignment(
        session.activityKind as ProgressionActivityKind,
        session.targetCode as string,
      ),
    ).length;
  const reviewDecisions: ShadowDecisionForReview[] = decisions.map((decision) => ({
    ...decision,
    activityKind: decision.activityKind as ProgressionActivityKind,
    shadowDecision: decision.shadowDecision,
    actualBehavior: decision.actualBehavior,
  }));
  return summarizeCutoverReadiness({
    unboundOpenSessionCount,
    shadowDecisions: reviewDecisions,
    dispositions,
  });
}
