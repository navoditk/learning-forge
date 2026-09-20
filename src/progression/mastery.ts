import { ProgressionPolicyProfile } from '../contracts/policy';

export type MasteryObservation = {
  itemId: string;
  correctness: boolean;
  assistanceOrdinal: number;
  context: string;
  occurredAt: Date;
  exposureCountBefore: number;
  independent: boolean;
};
export type MasteryResult = {
  estimate: number;
  evidenceMass: number;
  independentObservations: number;
  confidenceBand: 'LOW' | 'MEDIUM' | 'HIGH';
};

export function aggregateMastery(
  observations: readonly MasteryObservation[],
  profile: ProgressionPolicyProfile,
  now: Date,
): MasteryResult {
  const recent = observations.slice(-profile.aggregationWindow);
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
    if (observation.correctness) correctMass += weight;
  }
  const estimate = evidenceMass ? correctMass / evidenceMass : 0;
  const independentObservations = recent.filter((observation) => observation.independent).length;
  const high =
    independentObservations >= profile.minIndependentObservationsMedium &&
    estimate >= profile.minEstimateGate;
  const medium =
    evidenceMass >= profile.minEvidenceMassMedium &&
    independentObservations >= profile.minIndependentObservationsMedium &&
    estimate >= profile.minEstimateMedium;
  return {
    estimate,
    evidenceMass,
    independentObservations,
    confidenceBand: high ? 'HIGH' : medium ? 'MEDIUM' : 'LOW',
  };
}
