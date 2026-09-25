import { createHash } from 'node:crypto';

import type { HeldOutAssessmentBank, PlacementProbeItem } from '../assessment/store';
import type { Ref, Unit } from '../contracts/progression';
import { servableContentCatalog } from '../content/catalog';
import { PILOT_LESSONS, PILOT_UNITS } from '../curriculum/pilot-catalog';

const PLACEMENT_PROBE_SUFFIX = '-placement-probe';

export function placementProbeBankRef(unit: Pick<Unit, 'code' | 'version'>): Ref {
  return { code: `${unit.code}${PLACEMENT_PROBE_SUFFIX}`, version: unit.version };
}

/** The unit's lessons in authored order. */
export function unitLessons(unit: Pick<Unit, 'lessonRefs'>) {
  return unit.lessonRefs.flatMap((ref) =>
    PILOT_LESSONS.filter((lesson) => lesson.code === ref.code && lesson.version === ref.version),
  );
}

/**
 * D-64: a placement probe draws from the unit's reviewed, public practice
 * items, not a held-out bank. One item per unit skill, in lesson order, using
 * each lesson's first authored practice item for that skill. Returns undefined
 * (fail closed) when any skill has no reviewed practice item at the pinned
 * version.
 */
export function placementProbeBank(unit: Unit): HeldOutAssessmentBank | undefined {
  const items: PlacementProbeItem[] = [];
  for (const lesson of unitLessons(unit)) {
    for (const skillRef of lesson.skillRefs) {
      const record = lesson.practiceContentRefs
        .map((ref) =>
          servableContentCatalog.find(
            (item) =>
              item.id === ref.id &&
              item.version === ref.version &&
              item.role === 'practice' &&
              'skillRef' in item &&
              item.skillRef.code === skillRef.code &&
              item.skillRef.version === skillRef.version,
          ),
        )
        .find((item) => item !== undefined);
      if (!record || !('skillRef' in record)) return undefined;
      const hash = lesson.practiceContentRefs.find((ref) => ref.id === record.id)?.hash;
      if (!hash) return undefined;
      items.push({
        id: record.id,
        version: record.version,
        hash,
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

/** Resolves a placement-probe bank reference to its pilot unit's projection. */
export function placementProbeBankFor(ref: Ref): HeldOutAssessmentBank | undefined {
  if (!ref.code.endsWith(PLACEMENT_PROBE_SUFFIX)) return undefined;
  const unit = PILOT_UNITS.find(
    (candidate) =>
      placementProbeBankRef(candidate).code === ref.code && candidate.version === ref.version,
  );
  return unit ? placementProbeBank(unit) : undefined;
}
