import type { PrismaClient, ProgressionActivityKind } from '@prisma/client';

import { prisma } from '../server/prisma';
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
 * nullable progression binding is missing; this intentionally uses the
 * stronger all-bindings-present condition and invents no activity timeout.
 */
export async function readCutoverReadiness(
  database: PrismaClient = prisma,
  dispositions: readonly ShadowReviewDisposition[] = [],
): Promise<CutoverReadiness> {
  const [unboundOpenSessionCount, decisions] = await Promise.all([
    database.session.count({
      where: {
        endedAt: null,
        OR: [
          { activityKind: null },
          { targetCode: null },
          { targetVersion: null },
          { assignmentId: null },
          { policyProfileVersion: null },
        ],
      },
    }),
    database.shadowDecision.findMany({
      orderBy: { occurredAt: 'asc' },
      select: {
        id: true,
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
