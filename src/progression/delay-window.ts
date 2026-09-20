import { skillExposureAt, type ExposureEvent } from './exposure';

export type DelayedCheckEligibility =
  | {
      eligible: false;
      reasonCode: 'NO_PRIOR_EXPOSURE';
      exposureAt?: undefined;
      eligibleAt?: undefined;
    }
  | {
      eligible: false;
      reasonCode: 'DELAY_NOT_MET';
      exposureAt: Date;
      eligibleAt: Date;
    }
  | { eligible: true; reasonCode: 'ELIGIBLE'; exposureAt: Date; eligibleAt: Date };

/**
 * A delayed check is eligible only after a persisted exposure and the
 * approved elapsed-time separation from the most recent exposure.
 */
export function delayedCheckEligibility(
  events: readonly ExposureEvent[],
  skillCode: string,
  now: Date,
  minDelayHours: number,
): DelayedCheckEligibility {
  const exposureAt = skillExposureAt(events, skillCode);
  if (!exposureAt) return { eligible: false, reasonCode: 'NO_PRIOR_EXPOSURE' };

  const eligibleAt = new Date(exposureAt.getTime() + minDelayHours * 60 * 60 * 1000);
  if (now.getTime() < eligibleAt.getTime()) {
    return { eligible: false, reasonCode: 'DELAY_NOT_MET', exposureAt, eligibleAt };
  }
  return { eligible: true, reasonCode: 'ELIGIBLE', exposureAt, eligibleAt };
}
