export type ReassessmentRun = {
  outcome: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'INVALIDATED';
  scoredAt: Date;
  selectedItemKeys: readonly string[];
};

export type ReassessmentEligibility =
  | { eligible: true; excludedItemKeys: ReadonlySet<string> }
  | {
      eligible: false;
      reasonCode: 'MAX_REASSESSMENTS_REACHED' | 'REASSESSMENT_COOLDOWN';
      excludedItemKeys: ReadonlySet<string>;
    };

export function reassessmentEligibility(input: {
  priorRuns: readonly ReassessmentRun[];
  now: Date;
  maxReassessments: number;
  cooldownHours: number;
}): ReassessmentEligibility {
  const failedRuns = input.priorRuns.filter((run) => run.outcome === 'FAIL');
  const excludedItemKeys = new Set(failedRuns.flatMap((run) => run.selectedItemKeys));
  // D-27 counts consecutive reassessments: a pass resets the count, and the
  // initial run plus `maxReassessments` reassessments may all be attempted.
  const latestPass = input.priorRuns
    .filter((run) => run.outcome === 'PASS')
    .reduce<Date | undefined>(
      (latest, run) => (!latest || run.scoredAt > latest ? run.scoredAt : latest),
      undefined,
    );
  const consecutiveFailures = failedRuns.filter(
    (run) => !latestPass || run.scoredAt > latestPass,
  ).length;
  if (consecutiveFailures > input.maxReassessments) {
    return {
      eligible: false,
      reasonCode: 'MAX_REASSESSMENTS_REACHED',
      excludedItemKeys,
    };
  }
  const latestFailure = failedRuns.reduce<ReassessmentRun | undefined>(
    (latest, run) => (!latest || run.scoredAt > latest.scoredAt ? run : latest),
    undefined,
  );
  if (
    latestFailure &&
    input.now.getTime() < latestFailure.scoredAt.getTime() + input.cooldownHours * 3_600_000
  ) {
    return {
      eligible: false,
      reasonCode: 'REASSESSMENT_COOLDOWN',
      excludedItemKeys,
    };
  }
  return { eligible: true, excludedItemKeys };
}
