import { createHash } from 'node:crypto';

import type { HeldOutAssessmentBank, PlacementProbeItem } from '../assessment/store';
import type { Ref, Unit } from '../contracts/progression';
import { servableContentCatalog } from '../content/catalog';
import { COURSE_CATALOG } from '../curriculum/course-catalog';
import STRUCTURE_MANIFEST from '../curriculum/grade-6-math-structure-manifest.json';
import RATIOS_UNIT_1_PROBE_SNAPSHOT from '../curriculum/probe-snapshots/ratios-and-proportional-reasoning-placement-probe@1.0.0.json';
import RATIOS_UNIT_2_PROBE_SNAPSHOT from '../curriculum/probe-snapshots/ratios-and-proportional-reasoning-placement-probe@2.0.0.json';
import {
  admitNewPlacementProbe,
  resolveHistoricalProbeBank,
  type ProbeLookup,
  type ProbeManifestEntry,
} from './placement-probe-snapshot';

const PLACEMENT_PROBE_SUFFIX = '-placement-probe';

/**
 * H-1 (D-229): committed, immutable probe snapshots, one per registered unit
 * version. Historical resolution reads only these and the manifest anchor.
 */
const PROBE_SNAPSHOTS: readonly unknown[] = [
  RATIOS_UNIT_1_PROBE_SNAPSHOT,
  RATIOS_UNIT_2_PROBE_SNAPSHOT,
];
const PROBE_MANIFEST_ENTRIES = STRUCTURE_MANIFEST.probeSnapshots as readonly ProbeManifestEntry[];

export function placementProbeBankRef(unit: Pick<Unit, 'code' | 'version'>): Ref {
  return { code: `${unit.code}${PLACEMENT_PROBE_SUFFIX}`, version: unit.version };
}

/** The unit's lessons in authored order. */
export function unitLessons(unit: Pick<Unit, 'lessonRefs'>) {
  return COURSE_CATALOG.lessonsOfUnit(unit);
}

/**
 * Whether a servable catalog item is eligible as the placement-probe item for
 * `ref` (a lesson's `practiceContentRefs` entry) on `skillRef` (the unit
 * skill being probed): exact id and version match, the `practice` role (so
 * an assessment/review item with a hint-free schema is never mistaken for
 * one), and the skill code and version both match the authored requirement.
 * Exported separately from `placementProbeBank` so the matching rule itself
 * is directly testable against synthetic catalog entries.
 */
export function matchesPlacementProbeRequirement(
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

/**
 * Live composition (D-64): one item per unit skill, in lesson order, using
 * each lesson's exact first authored practice ref. It never falls through to
 * a later ref (H-1, PH-5). Returns undefined (fail closed) when a first ref
 * is not a reviewed, servable practice item for its skill at the pinned
 * version, or has no pinned hash. This is the source a snapshot is built
 * from; learner-facing resolution goes through the committed snapshot.
 */
export function placementProbeBank(unit: Unit): HeldOutAssessmentBank | undefined {
  const items: PlacementProbeItem[] = [];
  for (const lesson of unitLessons(unit)) {
    for (const skillRef of lesson.skillRefs) {
      const ref = lesson.practiceContentRefs[0];
      if (!ref) return undefined;
      const record = servableContentCatalog.find(
        (item) =>
          'skillRef' in item &&
          matchesPlacementProbeRequirement(
            { id: item.id, version: item.version, role: item.role, skillRef: item.skillRef },
            ref,
            skillRef,
          ),
      );
      if (!record || !('skillRef' in record)) return undefined;
      if (!ref.hash) return undefined;
      items.push({
        id: record.id,
        version: record.version,
        hash: ref.hash,
        title: record.title,
        role: 'practice',
        skillRef: record.skillRef,
        prompt: record.prompt,
        deterministicValidator: record.deterministicValidator,
        accessibilityNotes: record.accessibilityNotes,
        accessibleAlternative:
          'accessibleAlternative' in record ? record.accessibleAlternative : undefined,
        figure: 'figure' in record ? record.figure : undefined,
      });
    }
  }
  if (items.length === 0) return undefined;
  const { code, version } = placementProbeBankRef(unit);
  return {
    code,
    version,
    contentHash: `sha256:${createHash('sha256').update(JSON.stringify(items)).digest('hex')}`,
    items,
  };
}

/** Whether a bank reference names a placement-probe bank. */
export function isPlacementProbeBankRef(ref: Ref): boolean {
  return ref.code.endsWith(PLACEMENT_PROBE_SUFFIX);
}

/**
 * Historical resolution (H-1 rule 2): the bank comes only from the committed
 * snapshot verified against the manifest, regardless of the unit's active
 * status or the items' current servability. Undefined on any failure, with
 * no substitution of an active item, a later ref or an archived row.
 */
export function placementProbeBankFor(ref: Ref): HeldOutAssessmentBank | undefined {
  if (!isPlacementProbeBankRef(ref)) return undefined;
  const resolved = resolveHistoricalProbeBank(ref, PROBE_SNAPSHOTS, PROBE_MANIFEST_ENTRIES);
  return resolved.ok ? resolved.bank : undefined;
}

/**
 * Servability lookup for new-placement admission. The loaded record must be
 * reviewed at the exact pinned version. The runtime has no raw file bytes, so
 * the raw hash is the registration pin of the unit's lessons for that
 * `id@version`; build-time tests (V-2) assert every pin equals the file
 * bytes. A pin that moved no longer equals the snapshot hash and refuses.
 */
function liveProbeLookup(unit: Pick<Unit, 'lessonRefs'>): ProbeLookup {
  const lessons = unitLessons(unit);
  return (ref) => {
    const item = servableContentCatalog.find(
      (candidate) => candidate.id === ref.id && candidate.version === ref.version,
    );
    if (!item || !('skillRef' in item)) return undefined;
    const pin = lessons
      .flatMap((lesson) => lesson.practiceContentRefs)
      .find((candidate) => candidate.id === ref.id && candidate.version === ref.version)?.hash;
    if (!pin?.startsWith('sha256:')) return undefined;
    return {
      item: item as never,
      rawSha256: pin.slice('sha256:'.length),
      servable: true,
    };
  };
}

/**
 * New placement (H-1 rule 3): the unit's snapshot, admitted only while every
 * snapshot item is still reviewed and servable at exactly the pinned version
 * and hash. The caller has already established that the unit is active.
 * Undefined means refuse (fail closed, no fall-through).
 */
export function admittedPlacementProbeBank(unit: Unit): HeldOutAssessmentBank | undefined {
  const ref = placementProbeBankRef(unit);
  const resolved = resolveHistoricalProbeBank(ref, PROBE_SNAPSHOTS, PROBE_MANIFEST_ENTRIES);
  if (!resolved.ok) return undefined;
  const admitted = admitNewPlacementProbe(
    // Admission reads only each projection; the digest was verified by the resolver.
    { items: resolved.bank.items.map((projection) => ({ projection, projectionDigest: '' })) },
    { unitAdmitted: true },
    liveProbeLookup(unit),
  );
  return admitted.ok ? resolved.bank : undefined;
}
