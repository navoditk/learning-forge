import { describe, expect, it } from 'vitest';

import {
  RecallCardContentIdSchema,
  RecallCardIdentitySchema,
  findRecallCardContentIdCollisions,
  makeRecallCardContentId,
} from '../../src/content/recall-card-identity';

describe('recall-card identity helpers', () => {
  it('round-trips canonical identities while preserving the version separately', () => {
    const identity = RecallCardIdentitySchema.parse({
      id: 'ratio-language-1',
      version: '1.0.0',
    });

    expect(identity).toEqual({ id: 'ratio-language-1', version: '1.0.0' });
    expect(makeRecallCardContentId(identity.id)).toBe('recall-card:ratio-language-1');
    expect(RecallCardContentIdSchema.parse('recall-card:ratio-language-1')).toBe(identity.id);
  });

  it.each(['wrong-prefix:ratio-language-1', 'recall-card:', 'recall-card:ratio-language-1:extra'])(
    'rejects invalid content ids %s',
    (contentId) => {
      expect(RecallCardContentIdSchema.safeParse(contentId).success).toBe(false);
    },
  );

  it('rejects noncanonical identifiers and empty versions', () => {
    expect(
      RecallCardIdentitySchema.safeParse({
        id: 'Ratio Language 1',
        version: '1.0.0',
      }).success,
    ).toBe(false);
    expect(
      RecallCardIdentitySchema.safeParse({
        id: 'ratio-language-1',
        version: '',
      }).success,
    ).toBe(false);
  });

  it('finds collisions only for the actual mapped content ids', () => {
    expect(
      findRecallCardContentIdCollisions(
        ['ratio-language-1', 'unit-rates-1', 'unused-card'],
        [
          'recall-card:unit-rates-1',
          'recall-card:ratio-language-1:extra',
          'recall-card:other-card',
        ],
      ),
    ).toEqual(['recall-card:unit-rates-1']);
  });

  it.each(['', ' Card ', 'UPPER', 'recall-card:nested'])(
    'rejects noncanonical id %s in mapping and collision checks',
    (id) => {
      expect(() => makeRecallCardContentId(id)).toThrow();
      expect(() => findRecallCardContentIdCollisions([id], [])).toThrow();
    },
  );
});
