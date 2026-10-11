import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { PrismaClient } from '@prisma/client';
import { afterAll, describe, expect, it } from 'vitest';

import {
  createPair,
  eraseSyntheticHousehold,
  seedHousehold,
} from '../persistence/teaching-delivery-fixtures';

// Seeded rollback/TRUNCATE probe. It needs its own scratch database because
// legacy TRUNCATE succeeds (and empties the table) when no evidence exists, and
// because seeded evidence would make unrelated down.sql files refuse. Wired in
// scripts/test-migrations.sh, which erases the seed by DELETE (asserted here)
// before the empty-schema down/reapply cycle. Same-role limit: an owner can
// DISABLE TRIGGER or DROP a guard; that is an operational control, not tested.

const prisma = new PrismaClient({ log: ['error'] });
afterAll(async () => {
  await prisma.$disconnect();
});

const SCRATCH_PSQL_URL = process.env.SCRATCH_PSQL_URL;
const DOWN_SQL = join(
  __dirname,
  '../../prisma/migrations/0018_add_teaching_delivery_context/down.sql',
);

async function counts() {
  const [row] = await prisma.$queryRawUnsafe<
    { contexts: bigint; linked: bigint; events: bigint; households: bigint; users: bigint }[]
  >(`SELECT (SELECT count(*) FROM "TeachingDeliveryContext") AS contexts,
            (SELECT count(*) FROM "LearningEvent" WHERE "deliveryContextId" IS NOT NULL) AS linked,
            (SELECT count(*) FROM "LearningEvent") AS events,
            (SELECT count(*) FROM "Household") AS households,
            (SELECT count(*) FROM "User") AS users`);
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value)]));
}

describe('seeded TRUNCATE and rollback guards (scratch database only)', () => {
  it('refuses to run against a populated database', async () => {
    expect(
      SCRATCH_PSQL_URL,
      'SCRATCH_PSQL_URL must be set by scripts/test-migrations.sh',
    ).toBeTruthy();
    expect((await counts()).households).toBe(0);
  });

  it('keeps legacy TRUNCATE of unlinked events working while no context exists', async () => {
    const household = await seedHousehold(prisma);
    await prisma.learningEvent.create({
      data: {
        householdId: household.householdId,
        learnerProfileId: household.learnerProfileId,
        skillCode: 'legacy-skill',
        skillVersion: '1.0.0',
        kind: 'INDEPENDENT_PRACTICE_EXPOSURE',
      },
    });
    expect((await counts()).events).toBe(1);
    await prisma.$executeRawUnsafe(`TRUNCATE "LearningEvent"`);
    expect((await counts()).events).toBe(0);
    await eraseSyntheticHousehold(prisma, household.householdId);
  });

  it('refuses every TRUNCATE form while evidence exists and refuses down.sql, then erases by DELETE', async () => {
    const household = await seedHousehold(prisma);
    await createPair(prisma, household);
    const before = await counts();
    expect(before).toMatchObject({ contexts: 1, linked: 1, households: 1 });

    const forms = [
      `TRUNCATE "LearningEvent"`,
      `TRUNCATE "TeachingDeliveryContext"`,
      `TRUNCATE "LearningEvent", "TeachingDeliveryContext"`,
      `TRUNCATE "TeachingDeliveryContext" CASCADE`,
      `TRUNCATE "LearningEvent" CASCADE`,
      `TRUNCATE "Household" CASCADE`,
      `TRUNCATE "LearnerProfile" CASCADE`,
      `TRUNCATE "User" CASCADE`,
    ];
    for (const form of forms) {
      // PostgreSQL itself refuses truncating a referenced table without its
      // referencing table; every other form must be stopped by our guard.
      const expected =
        form === `TRUNCATE "TeachingDeliveryContext"`
          ? /cannot truncate a table referenced in a foreign key constraint/
          : /teaching delivery evidence exists/;
      await expect(prisma.$executeRawUnsafe(form), form).rejects.toThrow(expected);
      expect(await counts(), form).toEqual(before);
    }

    const down = spawnSync(
      'psql',
      [SCRATCH_PSQL_URL as string, '-v', 'ON_ERROR_STOP=1', '-f', DOWN_SQL],
      {
        encoding: 'utf8',
      },
    );
    expect(down.status).not.toBe(0);
    expect(down.stderr).toContain('Cannot remove non-empty teaching delivery evidence');
    expect(await counts()).toEqual(before);
    const [still] = await prisma.$queryRawUnsafe<{ present: boolean }[]>(
      `SELECT to_regclass('"TeachingDeliveryContext"') IS NOT NULL AS present`,
    );
    expect(still.present).toBe(true);

    await eraseSyntheticHousehold(prisma, household.householdId);
    expect(await counts()).toMatchObject({
      contexts: 0,
      linked: 0,
      events: 0,
      households: 0,
      users: 0,
    });
  });
});
