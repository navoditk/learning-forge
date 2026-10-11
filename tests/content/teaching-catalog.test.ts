import { describe, expect, it } from 'vitest';

import { ItemRefSchema, TeachingContentItemSchema } from '../../src/contracts/progression';
import {
  Sha256DigestSchema,
  TeachingCatalogSchema,
  TeachingItemRefSchema,
} from '../../src/contracts/teaching-catalog';
import {
  SYNTHETIC_SPELLING_ITEM,
  SYNTHETIC_TEACHING_CATALOG,
  SYNTHETIC_VOCABULARY_ITEM,
  authoredHashOf,
} from '../curriculum/fixtures/synthetic-teaching';

// Shape only: these tests do not show the catalog equals any active lesson's
// teaching refs, that members resolve to records, or that hashes match bytes
// beyond the fixture's own computation.
const digest = (character: string) => `sha256:${character.repeat(64)}`;
const itemRef = { id: 'synthetic-one', version: '1.0.0', hash: digest('a') };
const catalogRef = { code: 'synthetic-teaching-catalog', version: '1.0.0' };

describe('teaching catalog shape', () => {
  it('parses a fixture catalog of nonmath, non-assessment teaching items', () => {
    expect(TeachingCatalogSchema.parse(SYNTHETIC_TEACHING_CATALOG)).toEqual(
      SYNTHETIC_TEACHING_CATALOG,
    );
    expect(SYNTHETIC_TEACHING_CATALOG.items.map(({ id }) => id)).toEqual([
      SYNTHETIC_SPELLING_ITEM.id,
      SYNTHETIC_VOCABULARY_ITEM.id,
    ]);
  });

  it('reviews fixture items with the existing teaching schema and no practice fields', () => {
    for (const item of [SYNTHETIC_SPELLING_ITEM, SYNTHETIC_VOCABULARY_ITEM]) {
      expect(TeachingContentItemSchema.parse(item).role).toBe('teaching');
      expect(item.review.status).toBe('reviewed');
      expect(item).not.toHaveProperty('prompt');
      expect(item).not.toHaveProperty('hintSteps');
      expect(item).not.toHaveProperty('assessmentBankRef');
    }
    expect(
      TeachingContentItemSchema.safeParse({ ...SYNTHETIC_SPELLING_ITEM, role: 'practice' }).success,
    ).toBe(false);
  });

  it('computes fixture authored hashes from exact JSON bytes', () => {
    expect(SYNTHETIC_TEACHING_CATALOG.items[0]!.hash).toBe(authoredHashOf(SYNTHETIC_SPELLING_ITEM));
    expect(authoredHashOf(SYNTHETIC_SPELLING_ITEM)).not.toBe(
      authoredHashOf(SYNTHETIC_VOCABULARY_ITEM),
    );
  });

  it('rejects duplicate id@version but allows another version of the same id', () => {
    const duplicate = { ref: catalogRef, items: [itemRef, { ...itemRef, hash: digest('b') }] };
    const result = TeachingCatalogSchema.safeParse(duplicate);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['items', 1]);
    expect(
      TeachingCatalogSchema.safeParse({
        ref: catalogRef,
        items: [itemRef, { ...itemRef, version: '2.0.0', hash: digest('b') }],
      }).success,
    ).toBe(true);
  });

  it('accepts an empty membership list and rejects extra tenant or policy fields', () => {
    expect(TeachingCatalogSchema.safeParse({ ref: catalogRef, items: [] }).success).toBe(true);
    for (const extra of [
      { householdId: 'h' },
      { retryWindowSeconds: 60 },
      { policyRef: catalogRef },
    ]) {
      expect(
        TeachingCatalogSchema.safeParse({ ref: catalogRef, items: [], ...extra }).success,
      ).toBe(false);
      expect(TeachingItemRefSchema.safeParse({ ...itemRef, ...extra }).success).toBe(false);
    }
  });
});

describe('teaching catalog padding regressions', () => {
  const paddings = (value: string) => [` ${value}`, `${value} `, `${value}\n`, `${value}\r`];

  it('rejects padded catalog ref code and version', () => {
    for (const field of ['code', 'version'] as const) {
      for (const value of paddings(catalogRef[field])) {
        expect(
          TeachingCatalogSchema.safeParse({ ref: { ...catalogRef, [field]: value }, items: [] })
            .success,
        ).toBe(false);
      }
    }
  });

  it('rejects padded member id and version', () => {
    for (const field of ['id', 'version'] as const) {
      for (const value of paddings(itemRef[field])) {
        expect(TeachingItemRefSchema.safeParse({ ...itemRef, [field]: value }).success).toBe(false);
        expect(
          TeachingCatalogSchema.safeParse({
            ref: catalogRef,
            items: [{ ...itemRef, [field]: value }],
          }).success,
        ).toBe(false);
      }
    }
  });
});

describe('teaching digest format', () => {
  it.each([
    ['empty', ''],
    ['arbitrary text', 'not-a-hash'],
    ['no prefix', 'a'.repeat(64)],
    ['uppercase hex', `sha256:${'A'.repeat(64)}`],
    ['short', `sha256:${'a'.repeat(63)}`],
    ['long', `sha256:${'a'.repeat(65)}`],
    ['non-hex', `sha256:${'g'.repeat(64)}`],
    ['padded', ` ${digest('a')}`],
    ['trailing newline', `${digest('a')}\n`],
    ['trailing carriage return', `${digest('a')}\r`],
    ['wrong algorithm', `sha512:${'a'.repeat(64)}`],
  ])('rejects %s at the new boundary', (_label, hash) => {
    expect(Sha256DigestSchema.safeParse(hash).success).toBe(false);
    expect(TeachingItemRefSchema.safeParse({ ...itemRef, hash }).success).toBe(false);
  });

  it('leaves the existing ItemRefSchema semantics unchanged', () => {
    expect(ItemRefSchema.safeParse({ ...itemRef, hash: 'not-a-hash' }).success).toBe(true);
    expect(TeachingItemRefSchema.parse(itemRef)).toEqual(itemRef);
  });
});
