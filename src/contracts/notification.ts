export interface WeeklyDigestAttemptSummary {
  correctness: 'CORRECT' | 'INCORRECT' | 'PARTIAL' | 'UNSCORED';
  highestAssistance: string;
}

export interface WeeklyDigestMasterySummary {
  estimate: number;
  confidenceBand: string;
  independentDelayedCheck: boolean;
}

export interface WeeklyDigestInput {
  learnerName: string;
  skill: string;
  attempts: WeeklyDigestAttemptSummary[];
  mastery?: WeeklyDigestMasterySummary;
}

export interface WeeklyDigestSummary {
  learnerName: string;
  skill: string;
  attemptCount: number;
  independentAttemptCount: number;
  correctCount: number;
  masteryEstimate: number;
  confidenceBand: string;
  independentDelayedCheckComplete: boolean;
  headline: string;
}

export interface NotifierResult {
  status: 'logged' | 'sent';
}

export interface NotifierPort {
  sendWeeklyDigest(input: WeeklyDigestSummary): Promise<NotifierResult>;
}
