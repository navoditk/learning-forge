import { ProgressionPolicyProfile } from '../contracts/policy';

export type MasteryObservation = {
  itemId: string;
  attemptId?: string;
  sessionId?: string;
  correctness: boolean;
  rawScore?: number;
  assistanceOrdinal: number;
  context: string;
  occurredAt: Date;
  exposureCountBefore: number;
  independent: boolean;
  superseded?: boolean;
};
export type MasteryResult = {
  estimate: number | undefined;
  evidenceMass: number;
  independentObservations: number;
  confidenceBand: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceDegradedForStaleness: boolean;
};

export type DelayedCheckStatus = 'NOT_ATTEMPTED' | 'CONFIRMED' | 'LAPSED';

function normalizeObservations(observations: readonly MasteryObservation[]): MasteryObservation[] {
  const eligible = observations.filter((observation) => !observation.superseded);
  const grouped = new Map<string, MasteryObservation[]>();
  const ungrouped: MasteryObservation[] = [];
  for (const observation of eligible) {
    if (!observation.sessionId) {
      ungrouped.push(observation);
      continue;
    }
    const key = `${observation.sessionId}:${observation.itemId}`;
    const group = grouped.get(key) ?? [];
    group.push(observation);
    grouped.set(key, group);
  }
  const collapsed = [...ungrouped];
  for (const group of grouped.values()) {
    const ordered = [...group].sort(
      (left, right) => left.occurredAt.getTime() - right.occurredAt.getTime(),
    );
    const last = ordered[ordered.length - 1];
    if (!last) continue;
    collapsed.push({
      ...last,
      assistanceOrdinal: Math.max(...ordered.map(({ assistanceOrdinal }) => assistanceOrdinal)),
      independent: ordered.every(({ assistanceOrdinal }) => assistanceOrdinal === 0),
    });
  }
  return collapsed.sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
}

export function aggregateMastery(
  observations: readonly MasteryObservation[],
  profile: ProgressionPolicyProfile,
  now: Date,
  delayedCheckStatus: DelayedCheckStatus = 'NOT_ATTEMPTED',
): MasteryResult {
  const recent = normalizeObservations(observations).slice(-profile.aggregationWindow);
  let correctMass = 0;
  let evidenceMass = 0;
  for (const observation of recent) {
    const assistance =
      profile.assistanceWeight[
        Math.min(observation.assistanceOrdinal, profile.assistanceWeight.length - 1)
      ] ?? 0;
    const context = profile.contextWeight[observation.context] ?? 0;
    const repeat = profile.repeatDiscount ** observation.exposureCountBefore;
    const ageDays = Math.max(0, now.getTime() - observation.occurredAt.getTime()) / 86_400_000;
    const recency = 2 ** (-ageDays / profile.recencyHalfLifeDays);
    const weight = assistance * context * repeat * recency;
    evidenceMass += weight;
    const rawScore = observation.rawScore ?? (observation.correctness ? 1 : 0);
    correctMass += weight * Math.min(1, Math.max(0, rawScore));
  }
  const estimate = evidenceMass ? correctMass / evidenceMass : undefined;
  const independentObservations = recent.filter(
    (observation) => observation.assistanceOrdinal === 0,
  ).length;
  const high =
    independentObservations >= profile.minIndependentObservationsMedium &&
    estimate !== undefined &&
    estimate >= profile.minEstimateGate &&
    delayedCheckStatus === 'CONFIRMED';
  const medium =
    evidenceMass >= profile.minEvidenceMassMedium &&
    independentObservations >= profile.minIndependentObservationsMedium &&
    estimate !== undefined &&
    estimate >= profile.minEstimateMedium;
  return {
    estimate,
    evidenceMass,
    independentObservations,
    confidenceBand: high ? 'HIGH' : medium ? 'MEDIUM' : 'LOW',
    confidenceDegradedForStaleness: false,
  };
}

export function applyMasteryStaleness(
  result: MasteryResult,
  latestObservationAt: Date | undefined,
  now: Date,
  stalenessDays: number,
): MasteryResult {
  if (
    !latestObservationAt ||
    now.getTime() - latestObservationAt.getTime() < stalenessDays * 86_400_000
  ) {
    return result;
  }
  const confidenceBand =
    result.confidenceBand === 'HIGH'
      ? 'MEDIUM'
      : result.confidenceBand === 'MEDIUM'
        ? 'LOW'
        : 'LOW';
  return { ...result, confidenceBand, confidenceDegradedForStaleness: true };
}
