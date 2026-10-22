import { createHash } from 'node:crypto';

import type { AssessmentBank, ItemRef, Lesson, Ref, Unit } from '../contracts/progression';
import type { CourseCatalog } from './course-catalog';
import type { VersionedCourseCatalog } from './catalog-versions';

/**
 * Dormant library (RAT-CATALOG-IMPL-1): pure registration checks. Nothing in
 * production imports this module. Hash convention: `canonicalDigest` and the
 * lookup `rawSha256` are bare lowercase 64-character hex; `ItemRef.hash`
 * carries a `sha256:` prefix, always added explicitly when comparing.
 */

const refKey = (ref: { code: string; version: string }): string => `${ref.code}@${ref.version}`;

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    // Visit every index: Array.prototype.map skips holes, JSON.stringify writes them as null.
    const entries: string[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const entry: unknown = value[index];
      entries.push(entry === undefined ? 'null' : canonicalJson(entry));
    }
    return `[${entries.join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const members = Object.keys(record)
      .sort()
      .filter((key) => record[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`);
    return `{${members.join(',')}}`;
  }
  const encoded = JSON.stringify(value);
  return encoded === undefined ? 'null' : encoded;
}

/**
 * Bare lowercase SHA-256 hex of the UTF-8 JSON form with object keys sorted
 * recursively, array order kept, no whitespace and undefined-valued keys
 * omitted. Independent of key order and formatting.
 */
export function canonicalDigest(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex');
}

// ---------------------------------------------------------------- V-2

export type ResolvedItemRecord = { version: string; rawSha256: string };
export type ItemRecordLookup = (ref: ItemRef) => ResolvedItemRecord | undefined;
/** `lesson` is `code@version`; `ref` is `id@version`. */
export type ItemRefException = { lesson: string; ref: string };

export type ItemRefViolationReason = 'UNRESOLVED' | 'HASH_MISMATCH' | 'VERSION_MISMATCH';
export type ItemRefViolation = { lesson: string; ref: string; reason: ItemRefViolationReason };
export type AcceptedItemRefException = { lesson: string; ref: string; recordVersion: string };
export type StaleItemRefException = { lesson: string; ref: string };

export type ItemRefLabelCheck = {
  violations: ItemRefViolation[];
  acceptedExceptions: AcceptedItemRefException[];
  staleExceptions: StaleItemRefException[];
};

/**
 * V-2. Evaluated per occurrence: a lesson may list the same `id@version`
 * more than once with different hashes, and each occurrence is judged on its
 * own. The "accepted diagnostics and violations never name the same ref"
 * invariant therefore holds per occurrence, not per identity; a repeated
 * identity can legitimately appear in both lists, and registration still
 * blocks because a violation exists.
 */
export function checkItemRefLabels(
  lessons: readonly Pick<
    Lesson,
    'code' | 'version' | 'practiceContentRefs' | 'teachingContentRefs'
  >[],
  lookup: ItemRecordLookup,
  exceptions: readonly ItemRefException[],
): ItemRefLabelCheck {
  const exceptionKeys = new Set(exceptions.map((entry) => `${entry.lesson}|${entry.ref}`));
  const consumed = new Set<string>();
  const violations: ItemRefViolation[] = [];
  const acceptedExceptions: AcceptedItemRefException[] = [];

  for (const lesson of lessons) {
    const lessonKey = refKey(lesson);
    for (const ref of [...lesson.practiceContentRefs, ...lesson.teachingContentRefs]) {
      const itemKey = `${ref.id}@${ref.version}`;
      const record = lookup(ref);
      if (!record) {
        violations.push({ lesson: lessonKey, ref: itemKey, reason: 'UNRESOLVED' });
        continue;
      }
      const hashOk = ref.hash === `sha256:${record.rawSha256}`;
      const versionDiffers = ref.version !== record.version;
      const excepted = exceptionKeys.has(`${lessonKey}|${itemKey}`);
      // Consumption is independent of which violation fires.
      if (versionDiffers && excepted) consumed.add(`${lessonKey}|${itemKey}`);
      if (!hashOk) {
        violations.push({ lesson: lessonKey, ref: itemKey, reason: 'HASH_MISMATCH' });
      } else if (versionDiffers && !excepted) {
        violations.push({ lesson: lessonKey, ref: itemKey, reason: 'VERSION_MISMATCH' });
      } else if (versionDiffers && excepted) {
        acceptedExceptions.push({
          lesson: lessonKey,
          ref: itemKey,
          recordVersion: record.version,
        });
      }
    }
  }

  const staleExceptions = exceptions
    .filter((entry) => !consumed.has(`${entry.lesson}|${entry.ref}`))
    .map((entry) => ({ lesson: entry.lesson, ref: entry.ref }));
  return { violations, acceptedExceptions, staleExceptions };
}

/** Registration is blocked by any violation or stale exception; accepted entries never block. */
export function itemRefLabelCheckBlocks(result: ItemRefLabelCheck): boolean {
  return result.violations.length > 0 || result.staleExceptions.length > 0;
}

// --------------------------------------------------------------- V-10

export type PlacementCapacityViolation = 'PROBE_ITEM_COUNT' | 'DISTINCT_SKILL_COUNT';
export type PlacementCapacityCheck = {
  ok: boolean;
  probeItemCount: number;
  distinctSkillCount: number;
  maxItems: number;
  violations: PlacementCapacityViolation[];
};

/**
 * V-10. The probe-item count is the sum of lesson skillRefs in lessonRefs
 * order (what the placement probe emits); it and the distinct skill count
 * must both be within `maxItems`. No override parameter exists.
 */
export function checkPlacementCapacity(
  unit: Pick<Unit, 'lessonRefs'>,
  index: Pick<CourseCatalog, 'lessonsOfUnit'>,
  maxItems: number,
): PlacementCapacityCheck {
  const skillRefs = index.lessonsOfUnit(unit).flatMap((lesson) => lesson.skillRefs);
  const probeItemCount = skillRefs.length;
  const distinctSkillCount = new Set(skillRefs.map(refKey)).size;
  const violations: PlacementCapacityViolation[] = [];
  if (probeItemCount > maxItems) violations.push('PROBE_ITEM_COUNT');
  if (distinctSkillCount > maxItems) violations.push('DISTINCT_SKILL_COUNT');
  return { ok: violations.length === 0, probeItemCount, distinctSkillCount, maxItems, violations };
}

// --------------------------------------------------------------- V-11

export type ClaimedBankRole = 'UNIT' | 'LESSON' | 'REVIEW' | 'DELAYED_CHECK';
export type ClaimedBankReason = 'MISSING' | 'UNRESOLVED' | 'NOT_REVIEWED' | 'COVERAGE';
export type ClaimedBankViolation = {
  unit: string;
  role: ClaimedBankRole;
  reason: ClaimedBankReason;
  /** `code@version` of the lesson for LESSON violations. */
  lesson?: string;
  /** `code@version` of the skill for skill-bank violations. */
  skill?: string;
  /** `code@version` of the bank when one was found or named. */
  bank?: string;
};

function bankReason(
  bank: AssessmentBank | undefined,
  covers: (bank: AssessmentBank) => boolean,
  missing: ClaimedBankReason,
): ClaimedBankReason | undefined {
  if (!bank) return missing;
  if (bank.review.status !== 'reviewed') return 'NOT_REVIEWED';
  return covers(bank) ? undefined : 'COVERAGE';
}

/**
 * V-11 (D-62). For each unit of the program version: the unit bank and every
 * lesson bank resolve, are reviewed and cover the skills; every claimed skill
 * has a reviewed REVIEW and DELAYED_CHECK bank selected for exactly that
 * skill. Unclaimed skills are not inspected. Item-count floors are not checked.
 */
export function checkClaimedSkillBanks(
  versioned: VersionedCourseCatalog,
  programRef: Ref,
): ClaimedBankViolation[] {
  const program = versioned.programByRef(programRef);
  if (!program) throw new Error(`Program does not resolve: ${refKey(programRef)}`);
  const { index } = versioned;
  const violations: ClaimedBankViolation[] = [];

  for (const unitRef of program.unitRefs) {
    const unit = index.unitByRef(unitRef);
    if (!unit) throw new Error(`Unit does not resolve: ${refKey(unitRef)}`);
    const unitKey = refKey(unit);
    const unitLessons = index.lessonsOfUnit(unit);
    const unitSkills = unitLessons.flatMap((lesson) => lesson.skillRefs);

    const coversAll = (skills: readonly Ref[]) => (bank: AssessmentBank) => {
      const covered = new Set(bank.coveredSkillRefs.map(refKey));
      return skills.every((skill) => covered.has(refKey(skill)));
    };

    const unitBank = unit.assessmentBankRef ? index.bankByRef(unit.assessmentBankRef) : undefined;
    const unitReason = unit.assessmentBankRef
      ? bankReason(unitBank, coversAll(unitSkills), 'UNRESOLVED')
      : 'MISSING';
    if (unitReason) {
      violations.push({
        unit: unitKey,
        role: 'UNIT',
        reason: unitReason,
        ...(unit.assessmentBankRef ? { bank: refKey(unit.assessmentBankRef) } : {}),
      });
    }

    for (const lesson of unitLessons) {
      const lessonBank = index.bankByRef(lesson.assessmentBankRef);
      const reason = bankReason(lessonBank, coversAll(lesson.skillRefs), 'UNRESOLVED');
      if (reason) {
        violations.push({
          unit: unitKey,
          role: 'LESSON',
          reason,
          lesson: refKey(lesson),
          bank: refKey(lesson.assessmentBankRef),
        });
      }
    }

    const unitClaimed = new Map<string, Ref>();
    for (const skill of unitSkills) unitClaimed.set(refKey(skill), skill);
    for (const skill of unitClaimed.values()) {
      for (const role of ['REVIEW', 'DELAYED_CHECK'] as const) {
        const bank = versioned.activeSkillBank(role, skill);
        const reason = bankReason(
          bank,
          (candidate) =>
            candidate.coveredSkillRefs.length === 1 &&
            refKey(candidate.coveredSkillRefs[0]!) === refKey(skill),
          'MISSING',
        );
        if (reason) {
          violations.push({
            unit: unitKey,
            role,
            reason,
            skill: refKey(skill),
            ...(bank ? { bank: refKey(bank) } : {}),
          });
        }
      }
    }
  }
  return violations;
}
