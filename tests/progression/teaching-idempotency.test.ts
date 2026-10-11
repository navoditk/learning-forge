import { describe, expect, it } from 'vitest';

import { TeachingDeliveryContextSchema } from '../../src/contracts/teaching-delivery';
import {
  SYNTHETIC_SPELLING_CONTEXT,
  SYNTHETIC_SPELLING_LESSON_V2_CONTEXT,
  SYNTHETIC_VOCABULARY_CONTEXT,
  operationBindingOf as bindingOf,
  servedBindingOf,
} from '../curriculum/fixtures/synthetic-teaching';

// T1 covers operation-key and binding SHAPE only. D-102 is unapproved, so no
// retry window, expiry, replay outcome or conflict result is evaluated, and
// nothing here claims (learnerProfileId, operationKey) uniqueness in a database.
describe('teaching operation key and binding shape', () => {
  it('preserves opaque keys exactly', () => {
    for (const operationKey of ['a', 'op key:with/odd chars-ü', 'K'.repeat(200)]) {
      const parsed = TeachingDeliveryContextSchema.parse({
        ...SYNTHETIC_SPELLING_CONTEXT,
        operationKey,
      });
      expect(parsed.operationKey).toBe(operationKey);
    }
  });

  it('rejects empty, blank, padded and oversize keys instead of normalizing them', () => {
    for (const operationKey of [
      '',
      ' ',
      ' key',
      'key ',
      '\nkey',
      'key\n',
      'key\r',
      'K'.repeat(201),
    ]) {
      expect(
        TeachingDeliveryContextSchema.safeParse({ ...SYNTHETIC_SPELLING_CONTEXT, operationKey })
          .success,
      ).toBe(false);
    }
  });

  it('keeps the key outside the binding so one key can pair with distinct bindings', () => {
    const sameKey = { ...SYNTHETIC_VOCABULARY_CONTEXT, operationKey: 'shared-key' };
    const other = { ...SYNTHETIC_SPELLING_CONTEXT, operationKey: 'shared-key' };
    expect(bindingOf(sameKey)).not.toHaveProperty('operationKey');
    expect(bindingOf(sameKey)).not.toEqual(bindingOf(other));
  });

  it('gives equal operation bindings but distinct served bindings when only canonicalHash differs', () => {
    const changed = {
      ...SYNTHETIC_SPELLING_CONTEXT,
      id: 'ctx-other',
      operationKey: 'op-other',
      deliveredAt: new Date('2026-10-11T00:00:00.000Z'),
      canonicalHash: `sha256:${'d'.repeat(64)}`,
    };
    expect(bindingOf(changed)).toEqual(bindingOf(SYNTHETIC_SPELLING_CONTEXT));
    expect(servedBindingOf(changed)).not.toEqual(servedBindingOf(SYNTHETIC_SPELLING_CONTEXT));
  });

  it('distinguishes lesson versions that pin the same teaching item', () => {
    const first = bindingOf(SYNTHETIC_SPELLING_CONTEXT);
    const second = bindingOf(SYNTHETIC_SPELLING_LESSON_V2_CONTEXT);
    expect(second.itemRef).toEqual(first.itemRef);
    expect(second).not.toEqual(first);
  });

  it('carries the retry window only as a code/version reference', () => {
    expect(SYNTHETIC_SPELLING_CONTEXT.retryWindowPolicyRef).toEqual({
      code: 'synthetic-retry-window',
      version: '1.0.0',
    });
    for (const extra of [{ seconds: 600 }, { delayMs: 1000 }]) {
      expect(
        TeachingDeliveryContextSchema.safeParse({
          ...SYNTHETIC_SPELLING_CONTEXT,
          retryWindowPolicyRef: { ...SYNTHETIC_SPELLING_CONTEXT.retryWindowPolicyRef, ...extra },
        }).success,
      ).toBe(false);
    }
    expect(
      TeachingDeliveryContextSchema.safeParse({
        ...SYNTHETIC_SPELLING_CONTEXT,
        retryWindowPolicyRef: 600,
      }).success,
    ).toBe(false);
  });
});
