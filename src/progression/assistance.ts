import type { AssistanceLevel } from '@prisma/client';

export const ASSISTANCE_ORDINAL: Record<AssistanceLevel, number> = {
  INDEPENDENT: 0,
  CLARIFYING_QUESTION: 1,
  SMALL_STRATEGIC_HINT: 2,
  MULTIPLE_HINTS_REPRESENTATION: 3,
  ANALOGOUS_WORKED_EXAMPLE: 4,
  GUIDED_FULL_SOLUTION: 5,
};

/** Derives the maximum assistance from immutable events, never from a summary column. */
export function deriveHighestAssistance(
  events: readonly { level: AssistanceLevel }[],
  fallback: AssistanceLevel = 'INDEPENDENT',
): AssistanceLevel {
  if (events.length === 0) return fallback;
  return events.reduce(
    (highest, event) =>
      ASSISTANCE_ORDINAL[event.level] > ASSISTANCE_ORDINAL[highest] ? event.level : highest,
    events[0]!.level,
  );
}
