import { createHash } from 'node:crypto';

import type { ItemRef, Lesson, Ref } from '../../../src/contracts/progression';
import type {
  ProbeLessonSource,
  ProbeLookup,
  ProbeLookupRecord,
  ProbeManifestEntry,
  ProbeSnapshot,
  ProbeSourceItem,
} from '../../../src/progression/placement-probe-snapshot';

// Database-free synthetic fixtures (RAT-CATALOG-IMPL-2). All codes, prompts and hashes are invented.
export const sha = (text: string): string => createHash('sha256').update(text).digest('hex');

export const probeSkill = (n: number): Ref => ({ code: `synthetic-probe-s${n}`, version: '1.0.0' });
export const probeItemId = (n: number): string => `synthetic-probe-p${n}`;

/** Raw-content digest for an item at a content version (bare hex). */
export const rawFor = (n: number, version: string): string => sha(`raw:${n}:${version}`);

export function sourceItem(n: number, version = 'content-1', role = 'practice'): ProbeSourceItem {
  return {
    id: probeItemId(n),
    version,
    title: `Synthetic probe item ${n}`,
    role,
    skillRef: probeSkill(n),
    prompt: `Invented prompt ${n} (${version}).`,
    deterministicValidator: {
      type: 'numeric',
      canonicalAnswer: String(n),
      acceptedAnswers: [String(n)],
      equivalenceNotes: 'Invented validator.',
    },
    accessibilityNotes: 'Invented accessibility note.',
    accessibleAlternative: `Invented alternative ${n}.`,
  };
}

export function itemRef(n: number, version = 'content-1'): ItemRef {
  return { id: probeItemId(n), version, hash: `sha256:${rawFor(n, version)}` };
}

export type ProbeLessonShape = Pick<Lesson, 'skillRefs' | 'practiceContentRefs'>;

/** A single-skill lesson; `refs` lists its practice refs (the first one is probed). */
export function probeLesson(n: number, refs: ItemRef[] = [itemRef(n)]): ProbeLessonShape {
  return { skillRefs: [probeSkill(n)], practiceContentRefs: refs };
}

export function probeUnit(version: string, lessonCount: number) {
  return {
    code: 'synthetic-probe-unit',
    version,
    lessonRefs: Array.from({ length: lessonCount }, (_, i) => ({
      code: `synthetic-probe-lesson-${i + 1}`,
      version,
    })),
  };
}

export const probeIndex = (lessons: readonly ProbeLessonShape[]): ProbeLessonSource => ({
  lessonsOfUnit: () => lessons,
});

/** Lookup with a call spy. `current` maps item id to the record the "content store" serves now. */
export function spyLookup(current: Record<string, ProbeLookupRecord>) {
  const calls: ItemRef[] = [];
  const lookup: ProbeLookup = (ref) => {
    calls.push(ref);
    return current[ref.id];
  };
  return { lookup, calls, current };
}

export function servedRecord(n: number, version = 'content-1', servable = true): ProbeLookupRecord {
  return { item: sourceItem(n, version), rawSha256: rawFor(n, version), servable };
}

export function manifestEntryFor(snapshot: ProbeSnapshot, sha256: string): ProbeManifestEntry {
  return {
    bankCode: snapshot.bankRef.code,
    bankVersion: snapshot.bankRef.version,
    unitCode: snapshot.unitRef.code,
    unitVersion: snapshot.unitRef.version,
    sha256,
  };
}

export const deepFreeze = <T>(value: T): T => {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};
