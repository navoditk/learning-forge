type ReviewableRecord = {
  id: string;
  version: string;
  review: { status: 'pending_review' | 'reviewed' };
  servable?: boolean;
};

function compareVersions(left: string, right: string): number {
  const numericVersion = /^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))*$/u;
  if (numericVersion.test(left) && numericVersion.test(right)) {
    const leftParts = left.split('.').map(Number);
    const rightParts = right.split('.').map(Number);
    for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
      const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
      if (difference !== 0) return difference;
    }
    return 0;
  }
  // The repository historically permits opaque version labels such as
  // `content-1`; use a deterministic natural string order for those labels
  // rather than allowing NaN to make selection insertion-order dependent.
  return left.localeCompare(right, 'en', { numeric: true, sensitivity: 'base' });
}

/** Resolves the newest reviewed version that is allowed to serve new work. */
export function resolveActive<T extends ReviewableRecord>(records: readonly T[], id: string): T {
  const active = records
    .filter(
      (record) =>
        record.id === id && record.review.status === 'reviewed' && record.servable !== false,
    )
    .sort((left, right) => compareVersions(right.version, left.version))[0];
  if (!active) throw new Error(`Active content unavailable: ${id}`);
  return active;
}

/**
 * Keeps only the newest reviewed servable version of each id, in first-seen
 * position. Planning surfaces list items by id, so a superseded version that is
 * still registered for history (`prism-volume-2@content-2` beside `content-3`,
 * MATH-GEO-6) must not be offered twice.
 */
export function newestServablePerId<T extends ReviewableRecord>(records: readonly T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const record of records) {
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    result.push(resolveActive(records, record.id));
  }
  return result;
}

/** Resolves an exact archived version without consulting serving eligibility. */
export function resolveHistorical<T extends ReviewableRecord>(
  records: readonly T[],
  id: string,
  version: string,
): T | undefined {
  return records.find((record) => record.id === id && record.version === version);
}
