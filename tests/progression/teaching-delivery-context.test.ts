import { describe, expect, it } from 'vitest';

import {
  TeachingDeliveryContextSchema,
  TeachingEventLinkSchema,
  TeachingOperationBindingSchema,
} from '../../src/contracts/teaching-delivery';
import {
  SYNTHETIC_SPELLING_CONTEXT,
  SYNTHETIC_SPELLING_LESSON_V2_CONTEXT,
  SYNTHETIC_VOCABULARY_CONTEXT,
  operationBindingOf,
  servedBindingOf,
} from '../curriculum/fixtures/synthetic-teaching';

// Shape only: no test here shows a digest matches bytes, a context belongs to
// an event, a grant authorizes delivery, or any uniqueness is database-enforced.
const contexts = [SYNTHETIC_SPELLING_CONTEXT, SYNTHETIC_VOCABULARY_CONTEXT];
const without = (record: object, key: string) =>
  Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));
const digest = (character: string) => `sha256:${character.repeat(64)}`;

describe('teaching delivery context shape', () => {
  it('parses graded and enrichment synthetic contexts with a PARENT actor', () => {
    for (const context of contexts) {
      const parsed = TeachingDeliveryContextSchema.parse(context);
      expect(parsed).toEqual(context);
      expect(parsed.actorRole).toBe('PARENT');
      expect(parsed.activityKind).toBe('TEACHING');
      expect(parsed.itemRef.hash).not.toBe(parsed.canonicalHash);
    }
  });

  it.each(Object.keys(SYNTHETIC_SPELLING_CONTEXT))('rejects a context missing %s', (key) => {
    expect(
      TeachingDeliveryContextSchema.safeParse(without(SYNTHETIC_SPELLING_CONTEXT, key)).success,
    ).toBe(false);
  });

  it.each(['OPERATOR', 'LEARNER', 'parent', ''])('rejects actor role %j', (actorRole) => {
    expect(
      TeachingDeliveryContextSchema.safeParse({ ...SYNTHETIC_SPELLING_CONTEXT, actorRole }).success,
    ).toBe(false);
  });

  it.each(['PRACTICE', 'ASSESSMENT', 'teaching', ''])('rejects activity kind %j', (kind) => {
    expect(
      TeachingDeliveryContextSchema.safeParse({ ...SYNTHETIC_SPELLING_CONTEXT, activityKind: kind })
        .success,
    ).toBe(false);
  });

  it.each([
    { sessionId: 's' },
    { assignmentId: 'a' },
    { answer: 'x' },
    { hints: [] },
    { masteryThreshold: 0.8 },
    { retryWindowSeconds: 600 },
    { expiresAt: new Date() },
    { learnerProfile: { name: 'x' } },
  ])('rejects extra property %j', (extra) => {
    expect(
      TeachingDeliveryContextSchema.safeParse({ ...SYNTHETIC_SPELLING_CONTEXT, ...extra }).success,
    ).toBe(false);
  });

  it('rejects invalid dates and non-date times', () => {
    for (const deliveredAt of [new Date('nope'), '2026-10-10T12:00:00.000Z', 1760097600000, null]) {
      expect(
        TeachingDeliveryContextSchema.safeParse({ ...SYNTHETIC_SPELLING_CONTEXT, deliveredAt })
          .success,
      ).toBe(false);
    }
  });

  it('rejects malformed authored and canonical digests', () => {
    const itemRef = SYNTHETIC_SPELLING_CONTEXT.itemRef;
    for (const hash of ['x', digest('A'), 'a'.repeat(64)]) {
      expect(
        TeachingDeliveryContextSchema.safeParse({
          ...SYNTHETIC_SPELLING_CONTEXT,
          itemRef: { ...itemRef, hash },
        }).success,
      ).toBe(false);
      expect(
        TeachingDeliveryContextSchema.safeParse({
          ...SYNTHETIC_SPELLING_CONTEXT,
          canonicalHash: hash,
        }).success,
      ).toBe(false);
    }
  });

  it.each(['id', 'householdId', 'learnerProfileId', 'actorUserId', 'operationKey'])(
    'rejects empty, blank and padded %s without normalizing',
    (field) => {
      for (const value of ['', '   ', ' padded', 'padded ', '\tpadded\n', 'padded\n', 'padded\r']) {
        expect(
          TeachingDeliveryContextSchema.safeParse({ ...SYNTHETIC_SPELLING_CONTEXT, [field]: value })
            .success,
        ).toBe(false);
      }
    },
  );

  it('preserves exact opaque versions', () => {
    const version = '2026.10-rc.1+build.7';
    const parsed = TeachingDeliveryContextSchema.parse({
      ...SYNTHETIC_SPELLING_CONTEXT,
      lessonRef: { ...SYNTHETIC_SPELLING_CONTEXT.lessonRef, version },
    });
    expect(parsed.lessonRef.version).toBe(version);
  });

  it('keeps the same item under two lesson versions distinguishable with no link', () => {
    const [first, second] = [SYNTHETIC_SPELLING_CONTEXT, SYNTHETIC_SPELLING_LESSON_V2_CONTEXT];
    expect(second.itemRef).toEqual(first.itemRef);
    expect(second.lessonRef.code).toBe(first.lessonRef.code);
    expect(second.lessonRef.version).not.toBe(first.lessonRef.version);
    expect(second.id).not.toBe(first.id);
    expect(second.operationKey).not.toBe(first.operationKey);
    expect(second).not.toHaveProperty('previousContextId');
    expect(second).not.toHaveProperty('lessonId');
  });
});

describe('teaching context padding regressions', () => {
  const refKeys = [
    'programRef',
    'unitRef',
    'lessonRef',
    'skillRef',
    'teachingCatalogRef',
    'accessPolicyRef',
    'policyProfileRef',
    'retryWindowPolicyRef',
  ] as const;
  const paddings = (value: string) => [` ${value}`, `${value} `, `${value}\n`, `${value}\r`];
  const accepts = (value: object) => TeachingDeliveryContextSchema.safeParse(value).success;

  it('rejects padded code and version in every context ref', () => {
    for (const key of refKeys) {
      const ref = SYNTHETIC_SPELLING_CONTEXT[key];
      for (const field of ['code', 'version'] as const) {
        for (const value of paddings(ref[field])) {
          expect(
            accepts({ ...SYNTHETIC_SPELLING_CONTEXT, [key]: { ...ref, [field]: value } }),
          ).toBe(false);
        }
      }
    }
  });

  it('rejects padded item id and version', () => {
    const itemRef = SYNTHETIC_SPELLING_CONTEXT.itemRef;
    for (const field of ['id', 'version'] as const) {
      for (const value of paddings(itemRef[field])) {
        expect(
          accepts({ ...SYNTHETIC_SPELLING_CONTEXT, itemRef: { ...itemRef, [field]: value } }),
        ).toBe(false);
      }
    }
  });

  it('rejects a digest followed by a newline or carriage return', () => {
    const itemRef = SYNTHETIC_SPELLING_CONTEXT.itemRef;
    for (const suffix of ['\n', '\r', ' ']) {
      expect(
        accepts({
          ...SYNTHETIC_SPELLING_CONTEXT,
          itemRef: { ...itemRef, hash: `${itemRef.hash}${suffix}` },
        }),
      ).toBe(false);
      expect(
        accepts({
          ...SYNTHETIC_SPELLING_CONTEXT,
          canonicalHash: `${SYNTHETIC_SPELLING_CONTEXT.canonicalHash}${suffix}`,
        }),
      ).toBe(false);
    }
  });
});

describe('teaching operation binding shape', () => {
  it('reuses context fields and excludes id, key, time and canonical digest', () => {
    const binding = operationBindingOf(SYNTHETIC_SPELLING_CONTEXT);
    expect(Object.keys(binding).sort()).toEqual(
      Object.keys(SYNTHETIC_SPELLING_CONTEXT)
        .filter((key) => !['id', 'operationKey', 'canonicalHash', 'deliveredAt'].includes(key))
        .sort(),
    );
  });

  it('is strict and requires every pin', () => {
    const binding = operationBindingOf(SYNTHETIC_SPELLING_CONTEXT);
    for (const extra of [
      { id: 'x' },
      { deliveredAt: new Date() },
      { canonicalHash: digest('a') },
    ]) {
      expect(TeachingOperationBindingSchema.safeParse({ ...binding, ...extra }).success).toBe(
        false,
      );
    }
    for (const key of Object.keys(binding)) {
      expect(TeachingOperationBindingSchema.safeParse(without(binding, key)).success).toBe(false);
    }
  });

  it('serves-binding adds only the canonical digest', () => {
    const served = servedBindingOf(SYNTHETIC_SPELLING_CONTEXT);
    expect(Object.keys(served).sort()).toEqual(
      [...Object.keys(operationBindingOf(SYNTHETIC_SPELLING_CONTEXT)), 'canonicalHash'].sort(),
    );
    expect(served.canonicalHash).toBe(SYNTHETIC_SPELLING_CONTEXT.canonicalHash);
  });

  it('parses distinct bindings for actor, tenant, versions, hashes and policy refs', () => {
    const base = operationBindingOf(SYNTHETIC_SPELLING_CONTEXT);
    const ref = (code: string) => ({ code, version: '9.9.9' });
    const variants = [
      { householdId: 'other-household' },
      { learnerProfileId: 'other-learner' },
      { actorUserId: 'other-parent' },
      { programRef: ref('other') },
      { unitRef: ref('other') },
      { lessonRef: { ...base.lessonRef, version: '9.9.9' } },
      { skillRef: { ...base.skillRef, version: '9.9.9' } },
      { itemRef: { ...base.itemRef, version: '9.9.9' } },
      { itemRef: { ...base.itemRef, hash: digest('c') } },
      { teachingCatalogRef: { ...base.teachingCatalogRef, version: '9.9.9' } },
      { accessPolicyRef: { ...base.accessPolicyRef, version: '9.9.9' } },
      { policyProfileRef: { ...base.policyProfileRef, version: '9.9.9' } },
      { retryWindowPolicyRef: { ...base.retryWindowPolicyRef, version: '9.9.9' } },
    ];
    for (const variant of variants) {
      const parsed = TeachingOperationBindingSchema.parse({ ...base, ...variant });
      expect(JSON.stringify(parsed)).not.toBe(JSON.stringify(base));
    }
  });

  it('differs between the two synthetic subjects', () => {
    expect(operationBindingOf(SYNTHETIC_VOCABULARY_CONTEXT)).not.toEqual(
      operationBindingOf(SYNTHETIC_SPELLING_CONTEXT),
    );
  });
});

describe('teaching event link shape', () => {
  it('parses the two event kinds without implying acknowledgement or a writer', () => {
    for (const kind of ['TEACHING_VIEWED', 'TEACHING_COMPLETED']) {
      expect(TeachingEventLinkSchema.parse({ deliveryContextId: 'ctx-1', kind })).toEqual({
        deliveryContextId: 'ctx-1',
        kind,
      });
    }
  });

  it('rejects other kinds, padding, null links and extra fields', () => {
    const link = { deliveryContextId: 'ctx-1', kind: 'TEACHING_VIEWED' };
    expect(TeachingEventLinkSchema.safeParse({ ...link, kind: 'ATTEMPT' }).success).toBe(false);
    expect(
      TeachingEventLinkSchema.safeParse({ ...link, deliveryContextId: ' ctx-1' }).success,
    ).toBe(false);
    expect(TeachingEventLinkSchema.safeParse(null).success).toBe(false);
    expect(TeachingEventLinkSchema.safeParse({ ...link, lessonRef: {} }).success).toBe(false);
  });
});
