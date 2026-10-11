import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { KNOWN_BASELINE_DRIFT, classifyPrismaDrift } from '../../scripts/classify-prisma-drift';

const baselineScript = KNOWN_BASELINE_DRIFT.map((s) => `-- RenameIndex\n${s};`).join('\n\n');

describe('prisma drift classifier (database-free)', () => {
  it('accepts a healthy empty diff without requiring any baseline debt', () => {
    for (const script of ['', '\n', '-- This is an empty migration.\n']) {
      expect(classifyPrismaDrift(script)).toEqual({ baseline: [], unexpected: [], owned: [] });
    }
  });

  it('tolerates exactly the known baseline renames, in any subset', () => {
    expect(classifyPrismaDrift(baselineScript).unexpected).toEqual([]);
    expect(classifyPrismaDrift(baselineScript).baseline).toHaveLength(KNOWN_BASELINE_DRIFT.length);
    expect(classifyPrismaDrift(`${KNOWN_BASELINE_DRIFT[0]};`).unexpected).toEqual([]);
  });

  it('rejects an unknown rename and reports it as unexpected, not as owned', () => {
    const result = classifyPrismaDrift('ALTER INDEX "Other_idx" RENAME TO "Other_idx_2";');
    expect(result.unexpected).toEqual(['ALTER INDEX "Other_idx" RENAME TO "Other_idx_2"']);
    expect(result.owned).toEqual([]);
  });

  it.each([
    'DROP INDEX "User_id_householdId_role_key";',
    'DROP INDEX "LearnerProfile_id_householdId_key";',
    'ALTER TABLE "LearningEvent" DROP COLUMN "deliveryContextId";',
    'ALTER TABLE "TeachingDeliveryContext" DROP CONSTRAINT "x";',
    'CREATE UNIQUE INDEX "TeachingDeliveryContext_learnerProfileId_operationKey_key" ON "TeachingDeliveryContext"("a");',
  ])('rejects owned-object drift with or without baseline noise: %s', (statement) => {
    for (const script of [statement, `${baselineScript}\n\n${statement}`]) {
      const result = classifyPrismaDrift(script);
      expect(result.unexpected).toHaveLength(1);
      expect(result.owned).toHaveLength(1);
    }
  });

  it('does not let a tolerated statement hide a changed one with the same prefix', () => {
    const changed = KNOWN_BASELINE_DRIFT[0].replace('RENAME TO "', 'RENAME TO "x');
    expect(classifyPrismaDrift(`${changed};`).unexpected).toHaveLength(1);
  });

  it('is wired into the migration runner without a baseline-debt requirement', () => {
    const runner = readFileSync(join(__dirname, '../../scripts/test-migrations.sh'), 'utf8');
    expect(runner).toContain('scripts/classify-prisma-drift.ts');
    expect(runner).not.toMatch(/grep -q 'RENAME TO'/);
    expect(runner).not.toMatch(/vacuous/);
  });

  describe('command line', () => {
    const run = (input: string) =>
      spawnSync('npx', ['tsx', 'scripts/classify-prisma-drift.ts'], {
        input,
        encoding: 'utf8',
        cwd: join(__dirname, '../..'),
      });

    it('exits zero for the empty-migration comment and for baseline-only output', () => {
      expect(run('-- This is an empty migration.\n').status).toBe(0);
      expect(run(baselineScript).status).toBe(0);
    });

    it('fails when prisma produced no output at all, so a crashed diff cannot pass', () => {
      expect(run('').status).toBe(1);
    });

    it('fails on owned-object drift and names the object', () => {
      const result = run('DROP INDEX "User_id_householdId_role_key";');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('Teaching delivery objects drift');
    });
  });
});
