export type ExposureEvent = {
  skillCode: string;
  kind:
    | 'TEACHING_VIEWED'
    | 'TEACHING_COMPLETED'
    | 'ASSISTANCE_GIVEN'
    | 'REMEDIATION_DELIVERED'
    | 'INDEPENDENT_PRACTICE_EXPOSURE';
  occurredAt: Date;
};
export function skillExposureAt(
  events: readonly ExposureEvent[],
  skillCode: string,
): Date | undefined {
  const matches = events.filter((event) => event.skillCode === skillCode);
  return matches.length
    ? new Date(Math.max(...matches.map((event) => event.occurredAt.getTime())))
    : undefined;
}
