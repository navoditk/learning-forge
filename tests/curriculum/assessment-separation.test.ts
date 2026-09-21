import { describe, expect, it } from 'vitest';

import { contentCatalog } from '../../src/content/catalog';

describe('assessment and instructional content separation', () => {
  it('keeps assessment and review roles out of the public catalog', () => {
    const roles = contentCatalog.map((item) => item.role as string);
    expect(roles.some((role) => role === 'assessment' || role === 'review')).toBe(false);
  });
});
