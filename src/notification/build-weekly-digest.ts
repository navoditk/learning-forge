import {
  WeeklyDigestInput,
  WeeklyDigestSkillInput,
  WeeklyDigestSkillSummary,
  WeeklyDigestSummary,
} from '../contracts';

export function buildSkillDigest(input: WeeklyDigestSkillInput): WeeklyDigestSkillSummary {
  const attemptCount = input.attempts.length;
  const independentAttemptCount = input.attempts.filter(
    (attempt) => attempt.highestAssistance === 'INDEPENDENT',
  ).length;
  const correctCount = input.attempts.filter((attempt) => attempt.correctness === 'CORRECT').length;

  return {
    skillCode: input.skillCode,
    attemptCount,
    independentAttemptCount,
    correctCount,
    masteryEstimate: input.mastery?.estimate ?? 0,
    confidenceBand: input.mastery?.confidenceBand ?? 'LOW',
    independentDelayedCheckComplete: input.mastery?.independentDelayedCheck ?? false,
  };
}

export function buildWeeklyDigest(input: WeeklyDigestInput): WeeklyDigestSummary {
  const skills = input.skills.map(buildSkillDigest);
  const totalAttempts = skills.reduce((sum, skill) => sum + skill.attemptCount, 0);
  const totalCorrect = skills.reduce((sum, skill) => sum + skill.correctCount, 0);

  const headline =
    totalAttempts === 0
      ? `${input.learnerName} has not attempted any skills yet this period.`
      : `${input.learnerName} completed ${totalAttempts} attempt${totalAttempts === 1 ? '' : 's'} across ${skills.length} skill${skills.length === 1 ? '' : 's'} this period: ${totalCorrect} correct.`;

  return { learnerName: input.learnerName, skills, totalAttempts, totalCorrect, headline };
}
