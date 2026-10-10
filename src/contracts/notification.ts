export interface WeeklyDigestAttemptSummary {
  correctness: 'CORRECT' | 'INCORRECT' | 'PARTIAL' | 'UNSCORED';
  highestAssistance: string;
}

export interface WeeklyDigestMasterySummary {
  estimate: number;
  confidenceBand: string;
  independentDelayedCheck: boolean;
}

export interface WeeklyDigestSkillInput {
  skillCode: string;
  attempts: WeeklyDigestAttemptSummary[];
  mastery?: WeeklyDigestMasterySummary;
}

export interface WeeklyDigestSkillSummary {
  skillCode: string;
  attemptCount: number;
  independentAttemptCount: number;
  correctCount: number;
  masteryEstimate: number;
  confidenceBand: string;
  independentDelayedCheckComplete: boolean;
}

export interface WeeklyDigestInput {
  learnerName: string;
  skills: WeeklyDigestSkillInput[];
}

export interface WeeklyDigestSummary {
  learnerName: string;
  skills: WeeklyDigestSkillSummary[];
  totalAttempts: number;
  totalCorrect: number;
  headline: string;
}

export interface NotifierResult {
  status: 'logged' | 'sent';
}

export interface SafetyAlertInput {
  traceId: string;
  householdId: string;
  policyVersion: string;
  occurredAt: string;
}

export interface NotifierPort {
  sendWeeklyDigest(input: WeeklyDigestSummary): Promise<NotifierResult>;
  /**
   * Fired when a tutor turn is flagged needs_human_review and suppressed.
   * Implementations must never be passed raw learner/child text - only
   * trace metadata - so there is nothing sensitive to redact here.
   */
  sendSafetyAlert(input: SafetyAlertInput): Promise<NotifierResult>;
}
