import { z } from 'zod';

import { VersionSchema } from '../contracts/common';
import { ContentFigureSchema } from '../contracts/content';
import type { Session } from './components/activity-panel';
import type { DiagnosticPlan, LearnerProgress, Plan, ReviewQueue } from './learner-chapters';

// Runtime shape checks for the read-only responses the learner page renders.
// A response that does not match is treated as an error (never as an empty
// success), so a malformed or unexpected payload cannot render as data.
const SkillProgressSchema = z.object({
  skillCode: z.string().min(1),
  title: z.string().min(1),
  domain: z.string().min(1),
  status: z.enum(['NOT_STARTED', 'PRACTICING', 'INDEPENDENTLY_CONFIRMED']),
  summary: z.string(),
});

export const LearnerProgressSchema = z.object({
  skills: z.array(SkillProgressSchema),
  recentStrengths: z.array(
    z.object({
      attemptId: z.string(),
      skillCode: z.string(),
      skillTitle: z.string(),
      achievedAt: z.string(),
    }),
  ),
  nextActivity: z
    .object({
      contentId: z.string(),
      title: z.string(),
      skillTitle: z.string(),
      reason: z.string(),
    })
    .nullable(),
}) satisfies z.ZodType<LearnerProgress>;

export const PlanSchema = z.object({
  items: z.array(
    z.object({
      contentId: z.string(),
      skillCode: z.string(),
      title: z.string(),
      skillTitle: z.string(),
      reason: z.string(),
      estimatedMinutes: z.number(),
    }),
  ),
  totalMinutes: z.number(),
  blockedSkills: z.array(z.string()),
  unavailableSkills: z.array(z.string()),
}) satisfies z.ZodType<Plan>;

export const DiagnosticPlanSchema = z.object({
  items: z.array(
    z.object({
      contentId: z.string(),
      skillCode: z.string(),
      title: z.string(),
      skillTitle: z.string(),
    }),
  ),
}) satisfies z.ZodType<DiagnosticPlan>;

export const ReviewQueueSchema = z.object({
  items: z.array(
    z.object({
      contentId: z.string(),
      skillCode: z.string(),
      title: z.string(),
      skillTitle: z.string(),
      dueSince: z.string(),
    }),
  ),
}) satisfies z.ZodType<ReviewQueue>;

const RecordedAttemptSchema = z.object({
  attemptId: z.string().min(1),
  correctness: z.string().min(1),
});

// Every field the page or activity panel reads is validated; fields the UI
// never uses are dropped rather than passed through. An optional field may be
// omitted but, when present, must be valid - an invalid figure or recorded
// attempt rejects the whole session so the learner gets a retry, not a guess.
export const SessionSchema = z.object({
  sessionId: z.string().min(1),
  resumed: z.boolean(),
  completed: z.boolean(),
  hintCount: z.number().int().min(0),
  latestAttempt: RecordedAttemptSchema.optional(),
  latestCheck: RecordedAttemptSchema.optional(),
  learner: z.object({ displayName: z.string() }),
  content: z.object({
    id: z.string().min(1),
    version: VersionSchema.optional(),
    title: z.string(),
    skillCode: z.string().min(1),
    prompt: z.string(),
    accessibilityNotes: z.string(),
    figure: ContentFigureSchema.optional(),
  }),
}) satisfies z.ZodType<Session>;
