/**
 * Client-safe shapes and key helpers for the C7-A course-progress
 * presentation (RAT-INTEGRATE RI-4, D-230). This module is imported by both
 * the learner and parent pages, so it must not import `src/server/**`,
 * `@prisma/client` or any module that does; the response shape below mirrors
 * `PilotProgression` in `src/progression/pilot-progress.ts` and
 * `tests/progression/pilot-progress-history.test.ts` pins the match.
 */

export type CourseProgressSkillRef = { code: string; version: string };

export type CourseProgressLesson = {
  code: string;
  version: string;
  title: string;
  completionStatus: string;
  remediationStatus: string;
  latestAssessment?: { outcome: string; resultId: string; scoredAt: string };
  skillRefs: CourseProgressSkillRef[];
};

export type CourseProgressUnit = {
  code: string;
  version: string;
  title: string;
  status: string;
  lessons: CourseProgressLesson[];
};

export type CourseProgress = {
  /** Active unit versions only: one per code. */
  units: CourseProgressUnit[];
  /**
   * Earlier (non-active) versions of an active unit's code, listing only the
   * lessons the learner has a state row for. Absent or empty in
   * single-version operation.
   */
  history?: CourseProgressUnit[];
};

/** React key for a code and version; version-qualified so versions never collide. */
export function progressKey(code: string, version: string): string {
  return `${code}@${version}`;
}

/** Heading id for an earlier-version unit: `course-history-<code>-v<version with "." as "-">`. */
export function historyHeadingId(code: string, version: string): string {
  return `course-history-${code}-v${version.replaceAll('.', '-')}`;
}

/** Visible title for an earlier lesson's override control, unique per version. */
export function historicalLessonLabel(title: string, unitVersion: string): string {
  return `${title} (earlier version ${unitVersion})`;
}
