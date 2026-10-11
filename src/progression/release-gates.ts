/**
 * Progression remains closed until the independent and manual release gates
 * are recorded. Tests and an explicitly approved deployment may opt in.
 */
export function isProgressionReleaseGateOpen(
  value: string | undefined = process.env.COURSE_PROGRESSION_RELEASE_GATE_OPEN,
): boolean {
  return value === 'true';
}

/**
 * Stage C4 step 3 ("reject residue" - architecture.md §11.4a). Separate from
 * the release gate above: that gate controls whether the /api/progression/*
 * UI-facing routes are reachable at all, while this one controls whether
 * startSession (the legacy, assignment-free entry point real learners use
 * today) actually refuses an unbound request instead of just recording the
 * divergence in shadow mode.
 *
 * Default is OFF, matching every other provider/notifier selector in this
 * codebase (fail closed to current behavior). Turning this on is the C4
 * cutover itself, step 3-5 combined - it must not happen until
 * docs/course-progression-review/manual-gate-record.md's shadow-divergence
 * row is signed and docs/course-progression-review/c4-cutover-runbook.md's
 * preconditions are met. Do not set this from application code; it is an
 * operator action at cutover time, not a feature flag code toggles.
 */
export function isC4SessionBindingEnforced(
  value: string | undefined = process.env.COURSE_PROGRESSION_C4_SESSION_BINDING_ENFORCED,
): boolean {
  return value === 'true';
}
