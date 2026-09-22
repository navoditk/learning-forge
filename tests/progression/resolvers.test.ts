import { describe, expect, it } from 'vitest';

import { resolveActive, resolveHistorical } from '../../src/content/resolvers';

const records = [
  { id: 'ratio-language', version: '1.0.0', review: { status: 'reviewed' as const } },
  { id: 'ratio-language', version: '2.0.0', review: { status: 'reviewed' as const } },
  { id: 'ratio-language', version: '3.0.0', review: { status: 'pending_review' as const } },
  {
    id: 'retired-item',
    version: '1.0.0',
    review: { status: 'reviewed' as const },
    servable: false,
  },
];

describe('active and historical content resolution', () => {
  it('serves the newest reviewed version and excludes retired or pending versions', () => {
    expect(resolveActive(records, 'ratio-language').version).toBe('2.0.0');
    expect(() => resolveActive(records, 'retired-item')).toThrow('Active content unavailable');
    expect(() => resolveActive(records, 'missing-item')).toThrow('Active content unavailable');
  });

  it('resolves an exact archived version regardless of current serving eligibility', () => {
    expect(resolveHistorical(records, 'ratio-language', '3.0.0')).toMatchObject({
      version: '3.0.0',
      review: { status: 'pending_review' },
    });
    expect(resolveHistorical(records, 'retired-item', '1.0.0')).toMatchObject({
      servable: false,
    });
    expect(resolveHistorical(records, 'missing-item', '1.0.0')).toBeUndefined();
  });
});
