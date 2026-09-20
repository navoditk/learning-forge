import { AssessmentKind, Correctness } from '@prisma/client';

export type ScoredAssessmentItem = {
  correctness: Correctness | 'UNSCORED';
  skillCode?: string;
};

/**
 * Applies the ordinary pass bar and, for lesson assessments, requires at
 * least one correct item for every covered skill.
 */
export function assessmentPasses(input: {
  kind: AssessmentKind;
  items: readonly ScoredAssessmentItem[];
  requiredCorrect: number;
  coveredSkillCodes: readonly string[];
}): boolean {
  const correct = input.items.filter((item) => item.correctness === 'CORRECT');
  if (correct.length < input.requiredCorrect) return false;
  if (input.kind !== 'LESSON_ASSESSMENT') return true;
  const correctSkills = new Set(
    correct.flatMap((item) => (item.skillCode ? [item.skillCode] : [])),
  );
  return input.coveredSkillCodes.every((skillCode) => correctSkills.has(skillCode));
}
