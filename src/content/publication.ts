import type { ContentRecord } from '../contracts/progression';

/**
 * Content records accepted by the public-site projection. Existing role-less
 * records are treated as practice only for publication purposes.
 */
export type CurriculumSiteContentItem = ContentRecord;

/**
 * The only content projection allowed to feed the public curriculum site.
 * Pending records and assessment/review records are excluded by construction.
 */
export function publishableContentProjection(
  items: readonly CurriculumSiteContentItem[],
): CurriculumSiteContentItem[] {
  return items.filter(
    (item) =>
      item.review.status === 'reviewed' &&
      (!('role' in item) || item.role === 'teaching' || item.role === 'practice'),
  );
}
