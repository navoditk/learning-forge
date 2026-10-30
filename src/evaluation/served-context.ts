import type { TutorModel, TutorModelResult, TutorMoveInput } from '../contracts';

/**
 * SCI6-ITEMS-EVAL: the eval runner (pinned, unchanged) sends
 * `content:<id>; history:<n> synthetic entries` as the provider-visible skill
 * context, whereas the served hint route sends `content:<id>; skill:<code>`.
 * For cases that declare `problem.skillCode`, this wrapper rewrites only that
 * one string so the provider sees what production sends. Other cases pass
 * through untouched.
 */
export function withServedSkillContext(
  model: TutorModel,
  skillCodeByContentId: ReadonlyMap<string, string>,
): TutorModel {
  return {
    generateMove(input: TutorMoveInput): Promise<TutorModelResult> {
      const match = /^content:([a-z0-9-]+); history:\d+ synthetic entries$/.exec(
        input.redactedSkillContext,
      );
      const skillCode = match ? skillCodeByContentId.get(match[1]) : undefined;
      return model.generateMove(
        match && skillCode
          ? { ...input, redactedSkillContext: `content:${match[1]}; skill:${skillCode}` }
          : input,
      );
    },
    scoreConstructedResponse: (input) => model.scoreConstructedResponse(input),
  };
}
