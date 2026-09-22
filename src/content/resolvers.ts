type ReviewableRecord = {
  id: string;
  version: string;
  review: { status: 'pending_review' | 'reviewed' };
  servable?: boolean;
};

function compareVersions(left: string, right: string): number {
  const leftParts = left.split('.').map((part) => Number(part));
  const rightParts = right.split('.').map((part) => Number(part));
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
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

/** Resolves an exact archived version without consulting serving eligibility. */
export function resolveHistorical<T extends ReviewableRecord>(
  records: readonly T[],
  id: string,
  version: string,
): T | undefined {
  return records.find((record) => record.id === id && record.version === version);
}
