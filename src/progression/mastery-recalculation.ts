import { Prisma, PrismaClient } from '@prisma/client';
import type { Ref } from '../contracts/progression';
import type { ProgressionPolicyProfile } from '../contracts/policy';
import {
  aggregateMastery,
  applyMasteryStaleness,
  type DelayedCheckStatus,
  type MasteryObservation,
  type MasteryResult,
} from './mastery';

export type MasteryEstimateSnapshot = MasteryResult & {
  learnerProfileId: string;
  skillCode: string;
  algorithmVersion: string;
  policyProfileRef: Ref;
  policyProfileHash: string;
  curriculumSnapshotHash: string;
  delayedCheckStatus: DelayedCheckStatus;
  calculatedAt: Date;
};

export type MasteryRecalculationInput = {
  learnerProfileId: string;
  skillCode: string;
  algorithmVersion: string;
  policyProfile: ProgressionPolicyProfile;
  policyProfileRef: Ref;
  policyProfileHash: string;
  curriculumSnapshotHash: string;
  observations: readonly MasteryObservation[];
  latestObservationAt?: Date;
  now: Date;
  delayedCheckStatus?: DelayedCheckStatus;
};

/**
 * Rebuilds an immutable, provenance-pinned estimate from evidence rows.
 * Persistence callers must insert the returned snapshot as a new algorithm
 * version row; this function never mutates or overwrites a prior snapshot.
 */
export function recalculateMastery(input: MasteryRecalculationInput): MasteryEstimateSnapshot {
  const aggregate = aggregateMastery(
    input.observations,
    input.policyProfile,
    input.now,
    input.delayedCheckStatus,
  );
  const result = applyMasteryStaleness(
    aggregate,
    input.latestObservationAt,
    input.now,
    input.policyProfile.stalenessDays,
  );
  const delayedCheckStatus = input.delayedCheckStatus ?? 'NOT_ATTEMPTED';
  return {
    ...result,
    learnerProfileId: input.learnerProfileId,
    skillCode: input.skillCode,
    algorithmVersion: input.algorithmVersion,
    policyProfileRef: input.policyProfileRef,
    policyProfileHash: input.policyProfileHash,
    curriculumSnapshotHash: input.curriculumSnapshotHash,
    delayedCheckStatus,
    calculatedAt: input.now,
  };
}

export async function persistMasteryEstimateSnapshot(
  database: PrismaClient | Prisma.TransactionClient,
  householdId: string,
  snapshot: MasteryEstimateSnapshot,
) {
  if (snapshot.estimate === undefined) {
    throw new Error('MASTERY_NOT_ASSESSED');
  }
  return database.masteryEstimate.create({
    data: {
      householdId,
      learnerProfileId: snapshot.learnerProfileId,
      skillCode: snapshot.skillCode,
      estimate: snapshot.estimate,
      confidenceBand: snapshot.confidenceBand,
      algorithmVersion: snapshot.algorithmVersion,
      policyProfileCode: snapshot.policyProfileRef.code,
      policyProfileVersion: snapshot.policyProfileRef.version,
      policyProfileHash: snapshot.policyProfileHash,
      curriculumSnapshotHash: snapshot.curriculumSnapshotHash,
      independentDelayedCheck: snapshot.delayedCheckStatus === 'CONFIRMED',
      createdAt: snapshot.calculatedAt,
    },
  });
}
