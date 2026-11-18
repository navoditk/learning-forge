import { describe, expect, it } from 'vitest';

import { newestServablePerId, resolveActive, resolveHistorical } from '../../src/content/resolvers';

const records = [
  { id: 'ratio-language', version: '1.0.0', review: { status: 'reviewed' as const } },
  { id: 'ratio-language', version: '2.0.0', review: { status: 'reviewed' as const } },
  { id: 'ratio-language', version: '3.0.0', review: { status: 'pending_review' as const } },
  { id: 'date-version', version: '2026-09', review: { status: 'reviewed' as const } },
  { id: 'date-version', version: '2026-10', review: { status: 'reviewed' as const } },
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
    expect(resolveActive(records, 'date-version').version).toBe('2026-10');
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

describe('newestServablePerId (MATH-GEO-6: prism-volume-2 content-2 and content-3 coexist)', () => {
  const both = [
    { id: 'prism-volume-2', version: 'content-2', review: { status: 'reviewed' as const } },
    { id: 'prism-volume-1', version: 'content-1', review: { status: 'reviewed' as const } },
    { id: 'prism-volume-2', version: 'content-3', review: { status: 'reviewed' as const } },
  ];

  it('lists each id once at its newest reviewed version, keeping first-seen order', () => {
    expect(newestServablePerId(both).map((r) => `${r.id}@${r.version}`)).toEqual([
      'prism-volume-2@content-3',
      'prism-volume-1@content-1',
    ]);
  });

  it('leaves a catalog with unique ids unchanged', () => {
    const unique = both.filter((r) => r.version !== 'content-2');
    expect(newestServablePerId(unique)).toEqual(unique);
  });
});
