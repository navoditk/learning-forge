import { WeeklyDigestInput, WeeklyDigestSummary } from '../contracts';

export function buildWeeklyDigest(input: WeeklyDigestInput): WeeklyDigestSummary {
  const attemptCount = input.attempts.length;
  const independentAttemptCount = input.attempts.filter(
    (attempt) => attempt.highestAssistance === 'INDEPENDENT',
  ).length;
  const correctCount = input.attempts.filter((attempt) => attempt.correctness === 'CORRECT').length;
  const masteryEstimate = input.mastery?.estimate ?? 0;
  const confidenceBand = input.mastery?.confidenceBand ?? 'LOW';
  const independentDelayedCheckComplete = input.mastery?.independentDelayedCheck ?? false;

  const headline =
    attemptCount === 0
      ? `${input.learnerName} has not attempted ${input.skill} yet this period.`
      : `${input.learnerName} completed ${attemptCount} attempt${attemptCount === 1 ? '' : 's'} on ${input.skill}: ${correctCount} correct, ${independentAttemptCount} without tutor assistance.`;

  return {
    learnerName: input.learnerName,
    skill: input.skill,
    attemptCount,
    independentAttemptCount,
    correctCount,
    masteryEstimate,
    confidenceBand,
    independentDelayedCheckComplete,
    headline,
  };
}
