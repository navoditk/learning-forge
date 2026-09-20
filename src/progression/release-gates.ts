/**
 * Progression remains closed until the independent and manual release gates
 * are recorded. Tests and an explicitly approved deployment may opt in.
 */
export function isProgressionReleaseGateOpen(
  value: string | undefined = process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN,
): boolean {
  return value === 'true';
}
