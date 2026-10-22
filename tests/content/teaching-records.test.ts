import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  TEACHING_STORAGE_DIRECTORY,
  practiceIds,
  validateTeachingRecords,
} from '../../src/content/teaching-validation';

// D-218: the dormant teaching drafts are validated here (tests only; nothing
// serves them). Any change to a record must re-pin its hash below.
const ROOT = resolve(__dirname, '../..');
const DIRECTORY = resolve(ROOT, TEACHING_STORAGE_DIRECTORY);

const PINNED_SHA256: Record<string, string> = {
  'double-number-lines-teaching-1.json':
    'a1826b1cfc8959172e5d12916fbc8d65cf4f8d659187ca3191c4c2a65b5bd128',
  'percent-applications-teaching-1.json':
    '3c735fa642fe8fc9cd40d941c433a9220e6ab2d40b8aaf69d0e8211e5b783be1',
  'ratio-language-teaching-1.json':
    'ab40b0deea2c90c0d16d6b0247e29ee3bc45c5c3f7f8b5125af8daba0ad29cb2',
  'ratio-tables-teaching-1.json':
    '1ceba67f31544c5bb8b3d1c950f25cbd74b1714ef5b69e7b8a2dc4a9439f07dd',
  'unit-rates-teaching-1.json': '8ddf3e2d41237b8d1699ac2779c94031336b3603c4dc1082333bb474540fed0a',
};

const files = readdirSync(DIRECTORY).sort();
const bytes = (name: string) => readFileSync(resolve(DIRECTORY, name));

describe('real dormant teaching records (D-218)', () => {
  it('contains exactly the pinned file set and nothing else under content/teaching', () => {
    expect(files).toEqual(Object.keys(PINNED_SHA256).sort());
    expect(readdirSync(resolve(ROOT, 'content/teaching'))).toEqual(['ratios']);
  });

  it('pins each file by sha256 (re-pin on any change)', () => {
    for (const name of files) {
      expect([name, createHash('sha256').update(bytes(name)).digest('hex')]).toEqual([
        name,
        PINNED_SHA256[name],
      ]);
    }
  });

  it('validates every record against the live practice ids', () => {
    const records = files.map((name) => JSON.parse(bytes(name).toString('utf8')) as unknown);
    const parsed = validateTeachingRecords(records, practiceIds());
    expect(parsed.map((record) => `${record.id}@${record.version}`).sort()).toEqual(
      [
        'double-number-lines-teaching-1@content-1',
        'percent-applications-teaching-1@content-1',
        'ratio-language-teaching-1@content-1',
        'ratio-tables-teaching-1@content-1',
        'unit-rates-teaching-1@content-1',
      ].sort(),
    );
  });

  it('keeps each file named after its record id', () => {
    for (const name of files) {
      const record = JSON.parse(bytes(name).toString('utf8')) as { id: string };
      expect(`${record.id}.json`).toBe(name);
    }
  });
});
