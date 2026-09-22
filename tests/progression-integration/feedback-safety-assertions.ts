const SENSITIVE_MARKERS = [
  '2:3',
  '3:4',
  'Private prompt',
  'canonicalAnswer',
  'acceptedAnswers',
  'solutionMethod',
  'hintSteps',
] as const;

const TEMPORAL_FIELDS = new Set(['createdAt', 'occurredAt', 'scoredAt', 'startedAt', 'endedAt']);
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;

export function containsSensitiveFeedback(value: unknown, key?: string): boolean {
  if (key && TEMPORAL_FIELDS.has(key) && typeof value === 'string' && ISO_TIMESTAMP.test(value)) {
    return false;
  }
  if (typeof value === 'string') return SENSITIVE_MARKERS.some((marker) => value.includes(marker));
  if (Array.isArray(value)) return value.some((item) => containsSensitiveFeedback(item));
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([entryKey, entryValue]) =>
    containsSensitiveFeedback(entryValue, entryKey),
  );
}
