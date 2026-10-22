/**
 * DORMANT teaching-content validation (RAT-CONTENT RC-T1, D-199;
 * docs/grade-6-math-catalog-versioning.md section 8, items 1-3).
 *
 * This module only validates teaching records. It serves nothing: it creates
 * no TEACHING grant, delivery context, learning event, teaching catalog
 * membership or archive. It must be imported only by tests and validation
 * scripts; `tests/content/teaching-validation-dormancy.test.ts` enforces that
 * it is not reachable from the live catalog, routes, tutor, site generator or
 * household export.
 */
import { z } from 'zod';

import { TeachingContentItemSchema } from '../contracts/progression';
import { skillCatalog, skillsByCode } from '../curriculum/catalog';
import { validateItemReadinessRefs } from '../curriculum/progression-catalog';
import { contentCatalog } from './catalog';

export type TeachingContentRecord = z.infer<typeof TeachingContentItemSchema>;

/** Storage convention: one JSON file per record under this directory. */
export const TEACHING_STORAGE_DIRECTORY = 'content/teaching/ratios';

const VERSION_PATTERN = /^content-[1-9][0-9]*$/;
const idPattern = (skillCode: string) =>
  new RegExp(`^${skillCode.replace(/[^a-z0-9-]/g, '')}-teaching-[1-9][0-9]*$`);

/** Ids of every live practice record (all versions share the id namespace). */
export function practiceIds(): ReadonlySet<string> {
  return new Set(contentCatalog.map((item) => item.id));
}

/**
 * Validates teaching records and returns them parsed. Throws on the first
 * violation with an error naming the record. `practiceIdSet` defaults to the
 * live practice catalog and is injectable for tests.
 */
export function validateTeachingRecords(
  records: readonly unknown[],
  practiceIdSet: ReadonlySet<string> = practiceIds(),
): TeachingContentRecord[] {
  const parsed = records.map((record, index) => {
    const result = TeachingContentItemSchema.safeParse(record);
    if (!result.success) {
      const id =
        record && typeof record === 'object' && 'id' in record
          ? String((record as { id: unknown }).id)
          : `#${index}`;
      throw new Error(
        `${id} is not a valid teaching record: ${result.error.issues
          .map((issue) => `${issue.path.join('.') || '(root)'} ${issue.message}`)
          .join('; ')}`,
      );
    }
    return result.data;
  });

  const seen = new Set<string>();
  for (const item of parsed) {
    const key = `${item.id}@${item.version}`;
    if (seen.has(key)) throw new Error('Teaching id@version references must be unique');
    seen.add(key);
  }

  for (const item of parsed) {
    if (!skillsByCode.has(item.skillRef.code)) {
      throw new Error(`${item.id} references unknown skill: ${item.skillRef.code}`);
    }
    const skill = skillsByCode.get(item.skillRef.code)!;
    if (!skill.difficultyBands.includes(item.difficulty)) {
      throw new Error(
        `${item.id} has difficulty "${item.difficulty}" not declared in ${skill.code}'s difficultyBands`,
      );
    }
    if (practiceIdSet.has(item.id)) {
      throw new Error(`${item.id} collides with a practice content id`);
    }
    if (!idPattern(item.skillRef.code).test(item.id)) {
      throw new Error(
        `${item.id} must be named <skill-code>-teaching-<n> for ${item.skillRef.code}`,
      );
    }
    if (!VERSION_PATTERN.test(item.version)) {
      throw new Error(`${item.id} version "${item.version}" must match content-<n>`);
    }
    // Same provenance rules the practice loader applies after its validator gate.
    if (item.provenance.origin === 'licensed') {
      throw new Error(`${item.id}: licensed content is not yet supported by this catalog`);
    }
    if (item.provenance.licenseStatus !== 'owned') {
      throw new Error(`${item.id} must be marked owned for the Phase 0 seed`);
    }
    // Review metadata shape (reviewed requires a date) is enforced by the
    // schema; validator-only checks are skipped: teaching has no validator.
  }

  // Readiness and owning-skill version pinning (shared with the live loader).
  validateItemReadinessRefs(
    parsed.map((item) => ({
      id: item.id,
      skillRef: item.skillRef,
      itemReadinessRefs: item.itemReadinessRefs,
    })),
    skillCatalog,
  );

  return parsed;
}
