/**
 * Server-side literal-true parser for the recall-card capability.
 *
 * The caller owns wiring; this helper only interprets the supplied value.
 */
export function isRecallCardsEnabled(value: string | undefined): boolean {
  return value === 'true';
}
