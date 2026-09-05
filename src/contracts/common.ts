import { z } from 'zod';

export const AssistanceLevelSchema = z.enum([
  'independent',
  'clarifying_question',
  'small_strategic_hint',
  'multiple_hints_representation',
  'analogous_worked_example',
  'guided_full_solution',
]);

export type AssistanceLevel = z.infer<typeof AssistanceLevelSchema>;

export const ContentModeSchema = z.enum(['core', 'depth', 'contest']);

export const AttemptContextSchema = z.enum(['diagnostic', 'practice', 'mastery_check']);

export const VersionSchema = z.string().trim().min(1).max(100);
