/**
 * Bounds worst-case real-provider spend from a bug or retry loop, not normal
 * single-household usage. No per-session/per-day cost cap or spend
 * monitoring exists yet (ADR-0011's explicit non-decision) - this is a
 * minimal backstop, not a substitute for real usage limits or billing
 * alerts.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_CALLS_PER_WINDOW = 60;

let windowStart = Date.now();
let callsInWindow = 0;

export function checkRateLimit(
  now: number = Date.now(),
  maxCallsPerWindow: number = MAX_CALLS_PER_WINDOW,
): void {
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    callsInWindow = 0;
  }
  callsInWindow += 1;
  if (callsInWindow > maxCallsPerWindow) {
    throw new Error(
      `Anthropic adapter rate limit exceeded: more than ${maxCallsPerWindow} calls in the last hour`,
    );
  }
}

/** Test-only: resets the module-level window so tests don't interfere with each other. */
export function resetRateLimitForTests(): void {
  windowStart = Date.now();
  callsInWindow = 0;
}
