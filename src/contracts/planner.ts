import { z } from 'zod';

import { ContentModeSchema } from './common';
import { DifficultyBand } from './curriculum';

export type ContentMode = z.infer<typeof ContentModeSchema>;

export interface PlannerContentItem {
  id: string;
  skillCode: string;
  mode: ContentMode;
  difficulty: DifficultyBand;
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
