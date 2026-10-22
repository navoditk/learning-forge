import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { servableContentCatalog } from '../../src/content/catalog';
import { canonicalDigest } from '../../src/curriculum/catalog-registration-checks';
import { COURSE_CATALOG } from '../../src/curriculum/course-catalog';
import { PILOT_UNITS } from '../../src/curriculum/pilot-catalog';
import {
  matchesPlacementProbeRequirement,
  placementProbeBank,
} from '../../src/progression/placement-probe';
import {
  admitNewPlacementProbe,
  buildPlacementProbeSnapshot,
  matchesProbeRequirement,
  resolveHistoricalProbeBank,
  selectedItemsInSnapshot,
  verifyProbeSnapshot,
  type ProbeLookup,
  type ProbeManifestEntry,
  type ProbeSnapshot,
} from '../../src/progression/placement-probe-snapshot';
import {
  deepFreeze,
  itemRef,
  manifestEntryFor,
  probeIndex,
  probeItemId,
  probeLesson,
  probeSkill,
  probeUnit,
  rawFor,
  servedRecord,
  sha,
  sourceItem,
  spyLookup,
} from './fixtures/synthetic-probe-snapshot';

const contentHashOf = (projections: unknown[]): string =>
  `sha256:${createHash('sha256').update(JSON.stringify(projections)).digest('hex')}`;

function built(version = 'content-1', lessonCount = 3) {
  const lessons = Array.from({ length: lessonCount }, (_, i) =>
    probeLesson(i + 1, [itemRef(i + 1, version)]),
  );
  const served = Object.fromEntries(
    lessons.map((_, i) => [probeItemId(i + 1), servedRecord(i + 1, version)]),
  );
  const spy = spyLookup(served);
  const result = buildPlacementProbeSnapshot(
    probeUnit(version === 'content-1' ? '1.0.0' : '2.0.0', lessonCount),
    probeIndex(lessons),
    spy.lookup,
  );
  if (!result.ok) throw new Error(`fixture build failed: ${result.reason}`);
  return {
    ...result,
    lessons,
    spy,
    entry: manifestEntryFor(result.snapshot, result.snapshotDigest),
    serialized: JSON.parse(JSON.stringify(result.snapshot)) as ProbeSnapshot,
  };
}

/** Tamper helper: rewrite the digest chain as an attacker would, leaving the manifest alone. */
const rehash = (snapshot: ProbeSnapshot, recomputeContentHash: boolean): ProbeSnapshot => {
  for (const item of snapshot.items) item.projectionDigest = canonicalDigest(item.projection);
  if (recomputeContentHash) {
    snapshot.contentHash = contentHashOf(snapshot.items.map((item) => item.projection));
  }
  return snapshot;
};

describe('live equivalence on the pilot unit', () => {
  const liveLookup: ProbeLookup = (ref) => {
    const item = servableContentCatalog.find((candidate) => candidate.id === ref.id);
    if (!item) return undefined;
    const bytes = readFileSync(join(process.cwd(), 'content', 'ratios', `${ref.id}.json`));
    return {
      item: item as never,
      rawSha256: createHash('sha256').update(bytes).digest('hex'),
      servable: true,
    };
  };

  it('EQ-1 builds the same items as today and EQ-2 the same contentHash', () => {
    const unit = PILOT_UNITS[0]!;
    const live = placementProbeBank(unit)!;
    const result = buildPlacementProbeSnapshot(unit, COURSE_CATALOG, liveLookup);
    if (!result.ok) throw new Error(result.reason);
    expect(JSON.stringify(result.snapshot.items.map((item) => item.projection))).toBe(
      JSON.stringify(live.items),
    );
    expect(result.snapshot.contentHash).toBe(live.contentHash);
    expect(result.snapshot.bankRef).toEqual({ code: live.code, version: live.version });
  });
});

describe('historical resolution (PH-1 to PH-3)', () => {
  it('PH-1 resolves the original projection after the content moves on, without any lookup', () => {
    const v1 = built('content-1');
    const entry = v1.entry;
    // The content store now serves only content-2.
    const moved = spyLookup({
      [probeItemId(1)]: servedRecord(1, 'content-2'),
      [probeItemId(2)]: servedRecord(2, 'content-2'),
      [probeItemId(3)]: servedRecord(3, 'content-2'),
    });
    const resolved = resolveHistoricalProbeBank(v1.snapshot.bankRef, [v1.serialized], [entry]);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.bank.items.map((item) => item.version)).toEqual([
      'content-1',
      'content-1',
      'content-1',
    ]);
    expect(resolved.bank.contentHash).toBe(v1.snapshot.contentHash);
    const projection = resolved.bank.items[0]!;
    expect(
      selectedItemsInSnapshot(v1.serialized, [
        { id: projection.id, version: projection.version, hash: projection.hash },
      ]),
    ).toEqual({ ok: true });
    expect(moved.calls).toHaveLength(0);
  });

  it('PH-2 admits the successor and refuses the retired unit for new placements', () => {
    const v1 = built('content-1');
    const v2 = built('content-2');
    const moved = spyLookup({
      [probeItemId(1)]: servedRecord(1, 'content-2'),
      [probeItemId(2)]: servedRecord(2, 'content-2'),
      [probeItemId(3)]: servedRecord(3, 'content-2'),
    });
    expect(admitNewPlacementProbe(v2.snapshot, { unitAdmitted: true }, moved.lookup)).toEqual({
      ok: true,
    });
    expect(admitNewPlacementProbe(v1.snapshot, { unitAdmitted: true }, moved.lookup)).toEqual({
      ok: false,
      reason: 'ITEM_NOT_SERVABLE',
    });
    expect(admitNewPlacementProbe(v1.snapshot, { unitAdmitted: false }, moved.lookup)).toEqual({
      ok: false,
      reason: 'UNIT_NOT_ADMITTED',
    });
    // Each single-field divergence is refused on its own (the positive control above admits).
    const versionOnly = spyLookup({
      ...moved.current,
      [probeItemId(2)]: {
        item: sourceItem(2, 'content-3'),
        rawSha256: rawFor(2, 'content-2'),
        servable: true,
      },
    });
    expect(admitNewPlacementProbe(v2.snapshot, { unitAdmitted: true }, versionOnly.lookup)).toEqual(
      {
        ok: false,
        reason: 'ITEM_NOT_SERVABLE',
      },
    );
    const hashOnly = spyLookup({
      ...moved.current,
      [probeItemId(2)]: {
        item: sourceItem(2, 'content-2'),
        rawSha256: sha('different raw bytes'),
        servable: true,
      },
    });
    expect(admitNewPlacementProbe(v2.snapshot, { unitAdmitted: true }, hashOnly.lookup)).toEqual({
      ok: false,
      reason: 'ITEM_NOT_SERVABLE',
    });
    // Not servable is also refused.
    const unservable = spyLookup({
      ...moved.current,
      [probeItemId(2)]: servedRecord(2, 'content-2', false),
    });
    expect(admitNewPlacementProbe(v2.snapshot, { unitAdmitted: true }, unservable.lookup)).toEqual({
      ok: false,
      reason: 'ITEM_NOT_SERVABLE',
    });
    const missing = spyLookup({});
    expect(admitNewPlacementProbe(v2.snapshot, { unitAdmitted: true }, missing.lookup).ok).toBe(
      false,
    );
  });

  it('PH-3 reports a missing snapshot or manifest entry without mutating or looking anything up', () => {
    const v1 = built();
    const input = deepFreeze({
      ref: { ...v1.snapshot.bankRef },
      snapshots: [structuredClone(v1.serialized)],
      entries: [structuredClone(v1.entry)],
    });
    const before = structuredClone(input);
    expect(resolveHistoricalProbeBank(input.ref, [], input.entries)).toEqual({
      ok: false,
      reason: 'SNAPSHOT_MISSING',
    });
    expect(resolveHistoricalProbeBank(input.ref, input.snapshots, [])).toEqual({
      ok: false,
      reason: 'MANIFEST_ENTRY_MISSING',
    });
    expect(
      resolveHistoricalProbeBank(input.ref, [{ bankRef: null }, 7, null], input.entries),
    ).toEqual({
      ok: false,
      reason: 'SNAPSHOT_MISSING',
    });
    expect(input).toEqual(before);
    expect(resolveHistoricalProbeBank.length).toBe(3);
  });
});

describe('tamper detection (PH-4)', () => {
  const run = (mutate: (snapshot: ProbeSnapshot) => void, entry?: Partial<ProbeManifestEntry>) => {
    const base = built();
    const copy = structuredClone(base.serialized);
    mutate(copy);
    const calls = base.spy.calls.length;
    const result = verifyProbeSnapshot(copy, { ...base.entry, ...entry });
    expect(base.spy.calls.length).toBe(calls);
    expect(result.ok).toBe(false);
    return result.ok ? undefined : result.reason;
  };

  it('PH-4 (a)-(i) each tamper fails with the specified reason', () => {
    expect(run((s) => void (s.items[0]!.projection.prompt = 'Changed prompt.'))).toBe(
      'ITEM_PROJECTION_MISMATCH',
    ); // (a)
    expect(
      run((s) => {
        s.items[0]!.projection.prompt = 'Changed prompt.';
        rehash(s, false);
      }),
    ).toBe('CONTENT_HASH_MISMATCH'); // (b)
    expect(
      run((s) => {
        s.items[1]!.projection.hash = `sha256:${sha('other')}`;
        rehash(s, false);
      }),
    ).toBe('CONTENT_HASH_MISMATCH'); // (c)
    expect(run((s) => void s.items.reverse())).toBe('CONTENT_HASH_MISMATCH'); // (d)
    expect(run((s) => void s.items.pop())).toBe('CONTENT_HASH_MISMATCH'); // (e)
    expect(run((s) => void (s.contentHash = `sha256:${sha('x')}`))).toBe('CONTENT_HASH_MISMATCH'); // (f)
    expect(run((s) => void (s.bankRef.version = '9.9.9'))).toBe('SNAPSHOT_IDENTITY_MISMATCH'); // (g)
    expect(run((s) => void ((s as Record<string, unknown>).extra = true))).toBe(
      'SNAPSHOT_MALFORMED',
    ); // (h)
    expect(run(() => undefined, { sha256: sha('wrong') })).toBe('SNAPSHOT_DIGEST_MISMATCH'); // (i)
  });

  it('PH-4 a pristine snapshot verifies (positive control)', () => {
    const base = built();
    expect(verifyProbeSnapshot(base.serialized, base.entry).ok).toBe(true);
  });

  it('PH-4b a fully consistent rewrite is still caught by the manifest anchor', () => {
    expect(
      run((s) => {
        s.items[0]!.projection.prompt = 'Changed prompt.';
        rehash(s, true);
      }),
    ).toBe('SNAPSHOT_DIGEST_MISMATCH');
  });

  it('PH-4c manifest identity tampering fails even with the correct digest', () => {
    const none = () => undefined;
    expect(run(none, { unitCode: 'other-unit' })).toBe('SNAPSHOT_IDENTITY_MISMATCH'); // (j)
    expect(run(none, { unitVersion: '9.9.9' })).toBe('SNAPSHOT_IDENTITY_MISMATCH'); // (k)
    expect(run(none, { bankCode: 'other-unit-placement-probe' })).toBe(
      'SNAPSHOT_IDENTITY_MISMATCH',
    ); // (l)
    expect(run(none, { bankVersion: '9.9.9' })).toBe('SNAPSHOT_IDENTITY_MISMATCH'); // (m)
    expect(run(none, { unitCode: 'other-unit', bankCode: 'other-unit-placement-probe' })).toBe(
      'SNAPSHOT_IDENTITY_MISMATCH',
    ); // (n)

    // Through the resolver, keyed by the snapshot's bankRef.
    const base = built();
    const via = (entry: Partial<ProbeManifestEntry>) =>
      resolveHistoricalProbeBank(
        base.snapshot.bankRef,
        [base.serialized],
        [{ ...base.entry, ...entry }],
      );
    expect(via({ bankCode: 'other-unit-placement-probe' })).toEqual({
      ok: false,
      reason: 'MANIFEST_ENTRY_MISSING',
    });
    expect(via({ bankVersion: '9.9.9' })).toEqual({ ok: false, reason: 'MANIFEST_ENTRY_MISSING' });
    expect(via({ unitCode: 'other-unit', bankCode: 'other-unit-placement-probe' })).toEqual({
      ok: false,
      reason: 'MANIFEST_ENTRY_MISSING',
    });
    expect(via({ unitCode: 'other-unit' })).toEqual({
      ok: false,
      reason: 'SNAPSHOT_IDENTITY_MISMATCH',
    });
    expect(via({ unitVersion: '9.9.9' })).toEqual({
      ok: false,
      reason: 'SNAPSHOT_IDENTITY_MISMATCH',
    });
  });
});

describe('builder rules (PH-5, SN-*)', () => {
  it('PH-5 never falls through to a later ref', () => {
    const lessons = [probeLesson(1, [itemRef(1), itemRef(4)])];
    const spy = spyLookup({
      [probeItemId(1)]: servedRecord(1, 'content-1', false),
      [probeItemId(4)]: servedRecord(4),
    });
    const result = buildPlacementProbeSnapshot(
      probeUnit('1.0.0', 1),
      probeIndex(lessons),
      spy.lookup,
    );
    expect(result).toEqual({ ok: false, reason: 'FIRST_REF_NOT_SERVABLE', lessonIndex: 0 });
    // Negative control: today's .find chain over servable records picks the second ref.
    const picked = lessons[0]!.practiceContentRefs.find((ref) => spy.current[ref.id]?.servable);
    expect(picked?.id).toBe(probeItemId(4));
  });

  it('SN-1 and HX-1 reject a raw hash that differs or carries the wrong prefix form', () => {
    const lessons = [probeLesson(1)];
    const differs = spyLookup({
      [probeItemId(1)]: { ...servedRecord(1), rawSha256: sha('different') },
    });
    expect(
      buildPlacementProbeSnapshot(probeUnit('1.0.0', 1), probeIndex(lessons), differs.lookup),
    ).toEqual({
      ok: false,
      reason: 'HASH_MISMATCH',
      lessonIndex: 0,
    });
    const prefixed = spyLookup({
      [probeItemId(1)]: { ...servedRecord(1), rawSha256: `sha256:${rawFor(1, 'content-1')}` },
    });
    expect(
      buildPlacementProbeSnapshot(probeUnit('1.0.0', 1), probeIndex(lessons), prefixed.lookup),
    ).toMatchObject({
      ok: false,
      reason: 'HASH_MISMATCH',
    });
  });

  it('SN-2 refuses a multi-skill lesson', () => {
    const lesson = { skillRefs: [probeSkill(1), probeSkill(2)], practiceContentRefs: [itemRef(1)] };
    const spy = spyLookup({ [probeItemId(1)]: servedRecord(1) });
    expect(
      buildPlacementProbeSnapshot(probeUnit('1.0.0', 1), probeIndex([lesson]), spy.lookup),
    ).toMatchObject({
      ok: false,
      reason: 'MULTI_SKILL_LESSON_UNSUPPORTED',
    });
  });

  it('SN-3 refuses ineligible first items and lessons without practice refs', () => {
    const wrongRole = spyLookup({
      [probeItemId(1)]: { ...servedRecord(1), item: sourceItem(1, 'content-1', 'assessment') },
    });
    expect(
      buildPlacementProbeSnapshot(
        probeUnit('1.0.0', 1),
        probeIndex([probeLesson(1)]),
        wrongRole.lookup,
      ),
    ).toMatchObject({
      ok: false,
      reason: 'FIRST_REF_NOT_ELIGIBLE',
    });
    const wrongSkill = spyLookup({
      [probeItemId(1)]: { ...servedRecord(1), item: { ...sourceItem(1), skillRef: probeSkill(2) } },
    });
    expect(
      buildPlacementProbeSnapshot(
        probeUnit('1.0.0', 1),
        probeIndex([probeLesson(1)]),
        wrongSkill.lookup,
      ),
    ).toMatchObject({
      ok: false,
      reason: 'FIRST_REF_NOT_ELIGIBLE',
    });
    const none = spyLookup({});
    expect(
      buildPlacementProbeSnapshot(
        probeUnit('1.0.0', 1),
        probeIndex([probeLesson(1, [])]),
        none.lookup,
      ),
    ).toMatchObject({
      ok: false,
      reason: 'NO_PRACTICE_REF',
    });
    expect(buildPlacementProbeSnapshot(probeUnit('1.0.0', 0), probeIndex([]), none.lookup)).toEqual(
      {
        ok: false,
        reason: 'EMPTY_UNIT',
      },
    );
  });
});

describe('serialization (RT-1, RT-2)', () => {
  it('RT-1 survives JSON and Prettier-style round trips with the digests intact', () => {
    const base = built();
    for (const text of [JSON.stringify(base.snapshot), JSON.stringify(base.snapshot, null, 2)]) {
      const parsed = JSON.parse(text) as ProbeSnapshot;
      expect(verifyProbeSnapshot(parsed, base.entry).ok).toBe(true);
      expect(parsed.contentHash).toBe(contentHashOf(parsed.items.map((item) => item.projection)));
      for (const item of parsed.items)
        expect(canonicalDigest(item.projection)).toBe(item.projectionDigest);
      expect(canonicalDigest(parsed)).toBe(base.snapshotDigest);
    }
    expect('snapshotDigest' in base.snapshot).toBe(false);
  });

  it('RT-2 rejects a snapshot digest stored inside the envelope', () => {
    const base = built();
    const injected = { ...structuredClone(base.serialized), snapshotDigest: base.snapshotDigest };
    expect(verifyProbeSnapshot(injected, base.entry)).toEqual({
      ok: false,
      reason: 'SNAPSHOT_MALFORMED',
    });
  });

  it('EQ-3 key order of the stored projection follows the live probe projection', () => {
    const base = built();
    expect(Object.keys(base.snapshot.items[0]!.projection)).toEqual([
      'id',
      'version',
      'hash',
      'title',
      'role',
      'skillRef',
      'prompt',
      'deterministicValidator',
      'accessibilityNotes',
      'accessibleAlternative',
    ]);
  });
});

describe('selected items (SEL-*)', () => {
  const projection = () => built().snapshot.items[0]!.projection;
  const snapshot = () => built().snapshot;

  it('SEL-1 accepts exact matches', () => {
    const p = projection();
    expect(
      selectedItemsInSnapshot(snapshot(), [{ id: p.id, version: p.version, hash: p.hash }]),
    ).toEqual({ ok: true });
  });

  it('SEL-2 to SEL-4 report absent, version and hash mismatches', () => {
    const p = projection();
    expect(
      selectedItemsInSnapshot(snapshot(), [{ id: 'nope', version: p.version, hash: p.hash }]),
    ).toEqual({
      ok: false,
      reason: 'SELECTED_ITEM_ABSENT',
    });
    expect(
      selectedItemsInSnapshot(snapshot(), [{ id: p.id, version: 'content-2', hash: p.hash }]),
    ).toEqual({
      ok: false,
      reason: 'SELECTED_ITEM_VERSION_MISMATCH',
    });
    expect(
      selectedItemsInSnapshot(snapshot(), [{ id: p.id, version: p.version, hash: 'x' }]),
    ).toEqual({
      ok: false,
      reason: 'SELECTED_ITEM_HASH_MISMATCH',
    });
    expect(
      selectedItemsInSnapshot(snapshot(), [
        { id: p.id, version: p.version, hash: p.hash.replace('sha256:', '') },
      ]),
    ).toEqual({ ok: false, reason: 'SELECTED_ITEM_HASH_MISMATCH' });
  });

  it('SEL-5 refuses empty and duplicate selections', () => {
    const p = projection();
    const item = { id: p.id, version: p.version, hash: p.hash };
    expect(selectedItemsInSnapshot(snapshot(), [])).toEqual({
      ok: false,
      reason: 'SELECTION_EMPTY',
    });
    expect(selectedItemsInSnapshot(snapshot(), [item, item])).toEqual({
      ok: false,
      reason: 'SELECTION_DUPLICATE',
    });
  });
});

describe('matcher parity (SN-M1)', () => {
  it('SN-M1 agrees with the live matcher over all 32 combinations', () => {
    let cases = 0;
    for (let mask = 0; mask < 32; mask += 1) {
      const bit = (n: number) => (mask & (1 << n)) !== 0;
      const ref = { id: 'p', version: 'content-1' };
      const skill = { code: 's', version: '1.0.0' };
      const item = {
        id: bit(0) ? 'p' : 'q',
        version: bit(1) ? 'content-1' : 'content-2',
        role: bit(2) ? 'practice' : 'review',
        skillRef: { code: bit(3) ? 's' : 't', version: bit(4) ? '1.0.0' : '2.0.0' },
      };
      expect(matchesProbeRequirement(item, ref, skill)).toBe(
        matchesPlacementProbeRequirement(item, ref, skill),
      );
      cases += 1;
    }
    expect(cases).toBe(32);
    const noSkill = { id: 'p', version: 'content-1', role: 'practice' };
    expect(
      matchesProbeRequirement(
        noSkill,
        { id: 'p', version: 'content-1' },
        { code: 's', version: '1' },
      ),
    ).toBe(false);
    expect(
      matchesPlacementProbeRequirement(
        noSkill,
        { id: 'p', version: 'content-1' },
        { code: 's', version: '1' },
      ),
    ).toBe(false);
  });
});
