import { z } from 'zod';

import { ContentModeSchema } from './common';
import { DifficultyBand } from './curriculum';

export type ContentMode = z.infer<typeof ContentModeSchema>;

/**
 * A documented, per-content-item contest-readiness contract. When a contest
 * (non-core) `PlannerContentItem` carries this field, the planner must treat
 * it as gated: it is only ever planned once the owning skill's mastery
 * record clears every bar declared here (see
 * `docs/curriculum-sources.md`'s AMC 8 readiness-gate note). This is a
 * typed contract on the content item itself, not a skill-code prefix
 * heuristic, so any program can opt a contest record into the stricter gate
 * the same way AMC 8 does. Content items without this field keep the
 * generic "any mastery evidence unlocks one challenge item" behavior used
 * by Grade 6 Math, Math Kangaroo, and MOEMS.
 */
export interface PlannerContestReadinessRequirement {
  /** Minimum mastery `estimate` required (the documented secure-core threshold). */
  minEstimate: number;
  /** Reject a `LOW` confidence band even if the estimate clears the threshold. */
  disallowLowConfidence: boolean;
  /** Require at least one independent, delayed re-check before this item unlocks. */
  requireIndependentDelayedCheck: boolean;
}

export interface PlannerContentItem {
  id: string;
  skillCode: string;
  mode: ContentMode;
  difficulty: DifficultyBand;
  contestReadinessRequirement?: PlannerContestReadinessRequirement;
}

export interface PlannerMasteryRecord {
  estimate: number;
  confidenceBand: 'LOW' | 'MEDIUM' | 'HIGH';
  independentDelayedCheck: boolean;
}

export interface PlannerSkill {
  code: string;
  prerequisiteSkillCodes: string[];
}

export interface PlannerInput {
  skills: PlannerSkill[];
  content: PlannerContentItem[];
  masteryBySkillCode: Record<string, PlannerMasteryRecord | undefined>;
  timeBudgetMinutes: number;
  estimatedMinutesPerItem?: number;
  maxItemsPerSkill?: number;
  secureThreshold?: number;
}

export interface PlannedActivity {
  contentId: string;
  skillCode: string;
  mode: ContentMode;
  reason: string;
  estimatedMinutes: number;
}

export interface PlanResult {
  items: PlannedActivity[];
  totalMinutes: number;
  blockedSkills: string[];
  unavailableSkills: string[];
}
