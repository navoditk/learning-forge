import { createHash } from 'node:crypto';

import { z } from 'zod';

import { ContentFigureSchema, DeterministicValidatorSchema } from '../contracts/content';
import type { AssessmentContentItem, ItemRef, Lesson, Ref, Unit } from '../contracts/progression';
import { RefSchema } from '../contracts/progression';
import { canonicalDigest } from '../curriculum/catalog-registration-checks';

/**
 * Dormant library (RAT-CATALOG-IMPL-2, design H-1): immutable placement-probe
 * snapshots. Pure: content and raw-hash lookups are injected. Nothing in
 * production imports this module, and it must never import the live
 * `placement-probe` or the assessment store (import-graph test IG-5).
 *
 * Hash conventions: `ItemRef.hash`, projection `hash` and `contentHash` are
 * `sha256:` + hex; lookup `rawSha256`, `projectionDigest`, the snapshot digest
 * and manifest `sha256` are bare hex.
 */

/** Structural twin of `PlacementProbeItem` (src/assessment/store.ts), declared here to stay dependency-free. */
export type ProbeProjection = Pick<
  AssessmentContentItem,
  | 'id'
  | 'version'
  | 'title'
  | 'skillRef'
  | 'prompt'
  | 'deterministicValidator'
  | 'accessibilityNotes'
  | 'figure'
> & {
  role: 'practice';
  hash: string;
  accessibleAlternative?: string;
};

export type ProbeSnapshot = {
  schemaVersion: 1;
  bankRef: { code: string; version: string };
  unitRef: { code: string; version: string };
  items: { projection: ProbeProjection; projectionDigest: string }[];
  contentHash: string;
};

export type ProbeManifestEntry = {
  bankCode: string;
  bankVersion: string;
  unitCode: string;
  unitVersion: string;
  /** Bare hex snapshot digest. */
  sha256: string;
};

/** A servable source item as the injected lookup reports it. */
export type ProbeSourceItem = Pick<
  AssessmentContentItem,
  'id' | 'version' | 'title' | 'prompt' | 'deterministicValidator' | 'accessibilityNotes' | 'figure'
> & {
  role: string;
  skillRef?: { code: string; version: string };
  accessibleAlternative?: string;
};
export type ProbeLookupRecord = { item: ProbeSourceItem; rawSha256: string; servable: boolean };
export type ProbeLookup = (ref: ItemRef) => ProbeLookupRecord | undefined;

const HEX = /^[0-9a-f]{64}$/;

const ProjectionSchema = z
  .object({
    id: z.string(),
    version: z.string(),
    hash: z.string(),
    title: z.string(),
    role: z.literal('practice'),
    skillRef: RefSchema,
    prompt: z.string(),
    deterministicValidator: DeterministicValidatorSchema,
    accessibilityNotes: z.string(),
    accessibleAlternative: z.string().optional(),
    figure: ContentFigureSchema.optional(),
  })
  .strict();

const SnapshotSchema = z
  .object({
    schemaVersion: z.literal(1),
    bankRef: RefSchema,
    unitRef: RefSchema,
    items: z
      .array(
        z
          .object({ projection: ProjectionSchema, projectionDigest: z.string().regex(HEX) })
          .strict(),
      )
      .min(1),
    contentHash: z.string(),
  })
  .strict();

const PLACEMENT_PROBE_SUFFIX = '-placement-probe';

const sha256Hex = (text: string): string => createHash('sha256').update(text).digest('hex');
const contentHashOf = (projections: readonly unknown[]): string =>
  `sha256:${sha256Hex(JSON.stringify(projections))}`;

/**
 * Same rule as the live `matchesPlacementProbeRequirement`: exact id and
 * version, the practice role, and a skill with equal code and version.
 * Parity with the live function is asserted by a test, not by an import.
 */
export function matchesProbeRequirement(
  item: { id: string; version: string; role: string; skillRef?: { code: string; version: string } },
  ref: { id: string; version: string },
  skillRef: { code: string; version: string },
): boolean {
  return (
    item.id === ref.id &&
    item.version === ref.version &&
    item.role === 'practice' &&
    item.skillRef !== undefined &&
    item.skillRef.code === skillRef.code &&
    item.skillRef.version === skillRef.version
  );
}

// ---------------------------------------------------------------- build

export type ProbeLessonSource = {
  lessonsOfUnit(
    unit: Pick<Unit, 'lessonRefs'>,
  ): readonly Pick<Lesson, 'skillRefs' | 'practiceContentRefs'>[];
};

export type BuildFailureReason =
  | 'EMPTY_UNIT'
  | 'MULTI_SKILL_LESSON_UNSUPPORTED'
  | 'NO_PRACTICE_REF'
  | 'FIRST_REF_NOT_SERVABLE'
  | 'FIRST_REF_NOT_ELIGIBLE'
  | 'HASH_MISMATCH';

export type BuildResult =
  | { ok: true; snapshot: ProbeSnapshot; snapshotDigest: string }
  | { ok: false; reason: BuildFailureReason; lessonIndex?: number };

function projectionOf(item: ProbeSourceItem, hash: string, skillRef: Ref): ProbeProjection {
  // Key order matches the live probe projection; absent optionals are omitted.
  return {
    id: item.id,
    version: item.version,
    hash,
    title: item.title,
    role: 'practice',
    skillRef,
    prompt: item.prompt,
    deterministicValidator: item.deterministicValidator,
    accessibilityNotes: item.accessibilityNotes,
    ...(item.accessibleAlternative === undefined
      ? {}
      : { accessibleAlternative: item.accessibleAlternative }),
    ...(item.figure === undefined ? {} : { figure: item.figure }),
  };
}

/**
 * Builds the snapshot from each lesson's exact first practice ref. It never
 * falls through to a later ref, and refuses multi-skill lessons.
 */
export function buildPlacementProbeSnapshot(
  unit: Pick<Unit, 'code' | 'version' | 'lessonRefs'>,
  index: ProbeLessonSource,
  lookup: ProbeLookup,
): BuildResult {
  const items: ProbeSnapshot['items'] = [];
  const lessons = index.lessonsOfUnit(unit);
  for (const [lessonIndex, lesson] of lessons.entries()) {
    if (lesson.skillRefs.length !== 1) {
      return { ok: false, reason: 'MULTI_SKILL_LESSON_UNSUPPORTED', lessonIndex };
    }
    const skillRef = lesson.skillRefs[0]!;
    const ref = lesson.practiceContentRefs[0];
    if (!ref) return { ok: false, reason: 'NO_PRACTICE_REF', lessonIndex };
    const record = lookup(ref);
    if (!record || !record.servable) {
      return { ok: false, reason: 'FIRST_REF_NOT_SERVABLE', lessonIndex };
    }
    if (!matchesProbeRequirement(record.item, ref, skillRef)) {
      return { ok: false, reason: 'FIRST_REF_NOT_ELIGIBLE', lessonIndex };
    }
    if (ref.hash !== `sha256:${record.rawSha256}`) {
      return { ok: false, reason: 'HASH_MISMATCH', lessonIndex };
    }
    const projection = projectionOf(record.item, ref.hash, skillRef);
    items.push({ projection, projectionDigest: canonicalDigest(projection) });
  }
  if (items.length === 0) return { ok: false, reason: 'EMPTY_UNIT' };
  const snapshot: ProbeSnapshot = {
    schemaVersion: 1,
    bankRef: { code: `${unit.code}${PLACEMENT_PROBE_SUFFIX}`, version: unit.version },
    unitRef: { code: unit.code, version: unit.version },
    items,
    contentHash: contentHashOf(items.map((entry) => entry.projection)),
  };
  return { ok: true, snapshot, snapshotDigest: canonicalDigest(snapshot) };
}

// --------------------------------------------------------------- verify

export type VerifyFailureReason =
  | 'SNAPSHOT_MALFORMED'
  | 'SNAPSHOT_IDENTITY_MISMATCH'
  | 'ITEM_PROJECTION_MISMATCH'
  | 'CONTENT_HASH_MISMATCH'
  | 'SNAPSHOT_DIGEST_MISMATCH';

export type VerifyResult =
  | { ok: true; snapshot: ProbeSnapshot }
  | { ok: false; reason: VerifyFailureReason; itemIndex?: number };

/**
 * Verifies a serialized snapshot against its manifest entry. Digests are
 * recomputed from the parsed JSON values themselves, so a JSON round trip
 * (including Prettier formatting) preserves every one of them.
 */
export function verifyProbeSnapshot(value: unknown, entry: ProbeManifestEntry): VerifyResult {
  if (!SnapshotSchema.safeParse(value).success) {
    return { ok: false, reason: 'SNAPSHOT_MALFORMED' };
  }
  const snapshot = value as ProbeSnapshot;
  const identityOk =
    snapshot.bankRef.code === `${snapshot.unitRef.code}${PLACEMENT_PROBE_SUFFIX}` &&
    snapshot.bankRef.version === snapshot.unitRef.version &&
    entry.bankCode === snapshot.bankRef.code &&
    entry.bankVersion === snapshot.bankRef.version &&
    entry.unitCode === snapshot.unitRef.code &&
    entry.unitVersion === snapshot.unitRef.version &&
    entry.bankCode === `${entry.unitCode}${PLACEMENT_PROBE_SUFFIX}` &&
    entry.bankVersion === entry.unitVersion;
  if (!identityOk) return { ok: false, reason: 'SNAPSHOT_IDENTITY_MISMATCH' };
  for (const [itemIndex, item] of snapshot.items.entries()) {
    if (canonicalDigest(item.projection) !== item.projectionDigest) {
      return { ok: false, reason: 'ITEM_PROJECTION_MISMATCH', itemIndex };
    }
  }
  if (contentHashOf(snapshot.items.map((item) => item.projection)) !== snapshot.contentHash) {
    return { ok: false, reason: 'CONTENT_HASH_MISMATCH' };
  }
  if (canonicalDigest(snapshot) !== entry.sha256) {
    return { ok: false, reason: 'SNAPSHOT_DIGEST_MISMATCH' };
  }
  return { ok: true, snapshot };
}

// -------------------------------------------------------------- resolve

export type HistoricalProbeBank = {
  code: string;
  version: string;
  contentHash: string;
  items: ProbeProjection[];
};

export type ResolveResult =
  | { ok: true; bank: HistoricalProbeBank }
  | { ok: false; reason: 'SNAPSHOT_MISSING' | 'MANIFEST_ENTRY_MISSING' | VerifyFailureReason };

const bankRefOf = (value: unknown): { code?: unknown; version?: unknown } | undefined => {
  if (value === null || typeof value !== 'object') return undefined;
  const bankRef = (value as { bankRef?: unknown }).bankRef;
  return bankRef !== null && typeof bankRef === 'object' ? bankRef : undefined;
};

/**
 * Resolves a historical probe bank from committed snapshots only. It has no
 * lookup parameter: servability, the active catalog and later refs are never
 * consulted.
 */
export function resolveHistoricalProbeBank(
  bankRef: Ref,
  snapshots: readonly unknown[],
  manifestEntries: readonly ProbeManifestEntry[],
): ResolveResult {
  const snapshot = snapshots.find((candidate) => {
    const ref = bankRefOf(candidate);
    return ref?.code === bankRef.code && ref?.version === bankRef.version;
  });
  if (snapshot === undefined) return { ok: false, reason: 'SNAPSHOT_MISSING' };
  const entry = manifestEntries.find(
    (candidate) => candidate.bankCode === bankRef.code && candidate.bankVersion === bankRef.version,
  );
  if (!entry) return { ok: false, reason: 'MANIFEST_ENTRY_MISSING' };
  const verified = verifyProbeSnapshot(snapshot, entry);
  if (!verified.ok) return { ok: false, reason: verified.reason };
  const { bankRef: ref, contentHash, items } = verified.snapshot;
  return {
    ok: true,
    bank: {
      code: ref.code,
      version: ref.version,
      contentHash,
      items: items.map((item) => item.projection),
    },
  };
}

// ------------------------------------------------------------ selection

export type SelectionFailureReason =
  | 'SELECTION_EMPTY'
  | 'SELECTION_DUPLICATE'
  | 'SELECTED_ITEM_ABSENT'
  | 'SELECTED_ITEM_VERSION_MISMATCH'
  | 'SELECTED_ITEM_HASH_MISMATCH';

/** Every selected `{id, version, hash}` must equal a snapshot projection exactly; nothing is repinned. */
export function selectedItemsInSnapshot(
  snapshot: Pick<ProbeSnapshot, 'items'>,
  selectedItems: readonly { id: string; version: string; hash: string }[],
): { ok: true } | { ok: false; reason: SelectionFailureReason } {
  if (selectedItems.length === 0) return { ok: false, reason: 'SELECTION_EMPTY' };
  if (new Set(selectedItems.map((item) => item.id)).size !== selectedItems.length) {
    return { ok: false, reason: 'SELECTION_DUPLICATE' };
  }
  for (const selected of selectedItems) {
    const projection = snapshot.items.find(
      (item) => item.projection.id === selected.id,
    )?.projection;
    if (!projection) return { ok: false, reason: 'SELECTED_ITEM_ABSENT' };
    if (projection.version !== selected.version) {
      return { ok: false, reason: 'SELECTED_ITEM_VERSION_MISMATCH' };
    }
    if (projection.hash !== selected.hash) {
      return { ok: false, reason: 'SELECTED_ITEM_HASH_MISMATCH' };
    }
  }
  return { ok: true };
}

// ----------------------------------------------------------------- admit

/**
 * Whether a snapshot may be used for a new placement. The caller decides
 * `unitAdmitted`; this library never decides which units are admitted.
 */
export function admitNewPlacementProbe(
  snapshot: Pick<ProbeSnapshot, 'items'>,
  context: { unitAdmitted: boolean },
  lookup: ProbeLookup,
): { ok: true } | { ok: false; reason: 'UNIT_NOT_ADMITTED' | 'ITEM_NOT_SERVABLE' } {
  if (!context.unitAdmitted) return { ok: false, reason: 'UNIT_NOT_ADMITTED' };
  for (const { projection } of snapshot.items) {
    const record = lookup({
      id: projection.id,
      version: projection.version,
      hash: projection.hash,
    });
    if (
      !record ||
      !record.servable ||
      record.item.version !== projection.version ||
      `sha256:${record.rawSha256}` !== projection.hash
    ) {
      return { ok: false, reason: 'ITEM_NOT_SERVABLE' };
    }
  }
  return { ok: true };
}
