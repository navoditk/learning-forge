import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { Prisma } from '@prisma/client';

import { prisma } from '../../src/server/prisma';
import {
  DELIVERED_AT,
  DIGEST_A,
  contextData,
  createPair,
  eraseSyntheticHousehold,
  linkedEventData,
  seedExtraLearner,
  seedHousehold,
  type SeededHousehold,
} from './teaching-delivery-fixtures';

// Same-role constraint tests: the app and tests share one DATABASE_URL role, so
// these prove the guards bind the owner role, not that a privileged operator
// cannot DISABLE TRIGGER or DROP a guard. TRUNCATE guard probes and rollback
// probes live in tests/migrations (their own scratch database).

const created: string[] = [];

async function newHousehold(): Promise<SeededHousehold> {
  const household = await seedHousehold(prisma);
  created.push(household.householdId);
  return household;
}

async function expectRejected(operation: () => Promise<unknown>, pattern: RegExp) {
  await expect(operation()).rejects.toThrow(pattern);
}

describe('TeachingDeliveryContext persistence integrity', () => {
  let a: SeededHousehold;
  let b: SeededHousehold;

  beforeAll(async () => {
    a = await newHousehold();
    b = await newHousehold();
  });

  afterAll(async () => {
    for (const householdId of created) await eraseSyntheticHousehold(prisma, householdId);
    await prisma.$disconnect();
  });

  describe('tenant and actor foreign keys', () => {
    it('accepts a consistent context and event pair', async () => {
      const context = await createPair(prisma, a);
      const stored = await prisma.teachingDeliveryContext.findUniqueOrThrow({
        where: { id: context.id },
      });
      expect(stored.deliveredAt.getTime()).toBe(DELIVERED_AT.getTime());
    });

    it('rejects a learner from another household', async () => {
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({
            data: contextData({ ...a, learnerProfileId: b.learnerProfileId }),
          }),
        /foreign key/i,
      );
    });

    it('rejects a learner User id forged as a PARENT actor', async () => {
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({
            data: contextData({ ...a, parentId: a.learnerUserId }),
          }),
        /foreign key/i,
      );
    });

    it('rejects a parent from another household as actor', async () => {
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({
            data: contextData({ ...a, parentId: b.parentId }),
          }),
        /foreign key/i,
      );
    });

    it('rejects a non-PARENT actorRole by CHECK and by FK', async () => {
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({
            data: contextData(a, { actorRole: 'LEARNER', actorUserId: a.learnerUserId }),
          }),
        /actor_role_parent/,
      );
    });

    it('rejects a non-TEACHING activityKind', async () => {
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({
            data: contextData(a, { activityKind: 'PRACTICE' }),
          }),
        /activity_kind_teaching/,
      );
    });

    it('refuses deleting only the parent while a context references it (D-145 retained FK)', async () => {
      const household = await newHousehold();
      await createPair(prisma, household);
      await expectRejected(
        () => prisma.user.delete({ where: { id: household.parentId } }),
        /foreign key/i,
      );
    });

    it('refuses a later role change of the referenced parent', async () => {
      const household = await newHousehold();
      await createPair(prisma, household);
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `UPDATE "User" SET "role" = 'LEARNER' WHERE "id" = $1`,
            household.parentId,
          ),
        /foreign key/i,
      );
    });

    it('refuses moving the referenced parent or learner to another household', async () => {
      const household = await newHousehold();
      await createPair(prisma, household);
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `UPDATE "User" SET "householdId" = $1 WHERE "id" = $2`,
            b.householdId,
            household.parentId,
          ),
        /foreign key/i,
      );
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `UPDATE "LearnerProfile" SET "householdId" = $1 WHERE "id" = $2`,
            b.householdId,
            household.learnerProfileId,
          ),
        /foreign key/i,
      );
    });
  });

  describe('field format CHECKs', () => {
    const codeColumns = [
      'programCode',
      'unitCode',
      'lessonCode',
      'skillCode',
      'itemId',
      'teachingCatalogCode',
      'accessPolicyCode',
      'policyProfileCode',
      'retryWindowPolicyCode',
    ] as const;
    const versionColumns = [
      'programVersion',
      'unitVersion',
      'lessonVersion',
      'skillVersion',
      'itemVersion',
      'teachingCatalogVersion',
      'accessPolicyVersion',
      'policyProfileVersion',
      'retryWindowPolicyVersion',
    ] as const;

    it.each(codeColumns)('rejects a malformed %s', async (column) => {
      for (const value of ['has space', 'UPPER', '']) {
        await expectRejected(
          () =>
            prisma.teachingDeliveryContext.create({ data: contextData(a, { [column]: value }) }),
          /code_format/,
        );
      }
    });

    it.each(versionColumns)('rejects a padded, empty or oversized %s', async (column) => {
      for (const value of [' 1.0.0', '1.0.0 ', '', 'v'.repeat(101)]) {
        await expectRejected(
          () =>
            prisma.teachingDeliveryContext.create({ data: contextData(a, { [column]: value }) }),
          /version_format/,
        );
      }
    });

    it.each(['authoredHash', 'canonicalHash'] as const)(
      'rejects a malformed %s',
      async (column) => {
        const bad = [
          DIGEST_A.toUpperCase().replace('SHA256', 'sha256'),
          DIGEST_A.slice('sha256:'.length),
          DIGEST_A.slice(0, -1),
          `${DIGEST_A}a`,
        ];
        for (const value of bad) {
          await expectRejected(
            () =>
              prisma.teachingDeliveryContext.create({ data: contextData(a, { [column]: value }) }),
            /digest_format/,
          );
        }
      },
    );

    it('bounds operationKey and id lengths to the T1 1-200 range', async () => {
      await expectRejected(
        () => prisma.teachingDeliveryContext.create({ data: contextData(a, { operationKey: '' }) }),
        /operation_key_length/,
      );
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({
            data: contextData(a, { operationKey: 'k'.repeat(201) }),
          }),
        /operation_key_length/,
      );
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({ data: contextData(a, { id: 'i'.repeat(201) }) }),
        /id_length/,
      );
      const boundary = await createPair(prisma, a, { operationKey: 'k'.repeat(200) });
      expect(boundary.operationKey).toHaveLength(200);
    });

    it('has no default deliveredAt', async () => {
      const withoutTime: Partial<ReturnType<typeof contextData>> = contextData(a);
      delete withoutTime.deliveredAt;
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `INSERT INTO "TeachingDeliveryContext" ("id","householdId","learnerProfileId","actorUserId","actorRole","operationKey","activityKind","programCode","programVersion","unitCode","unitVersion","lessonCode","lessonVersion","skillCode","skillVersion","itemId","itemVersion","authoredHash","canonicalHash","teachingCatalogCode","teachingCatalogVersion","accessPolicyCode","accessPolicyVersion","policyProfileCode","policyProfileVersion","retryWindowPolicyCode","retryWindowPolicyVersion")
             VALUES ($1,$2,$3,$4,'PARENT'::"UserRole",'raw-key-no-time','TEACHING'::"ProgressionActivityKind",'p','1','u','1','l','1','s','1','i','1',$5,$6,'c','1','a','1','pp','1','r','1')`,
            withoutTime.id,
            a.householdId,
            a.learnerProfileId,
            a.parentId,
            DIGEST_A,
            DIGEST_A,
          ),
        /Code: `23502`/,
      );
    });
  });

  describe('uniqueness', () => {
    it('refuses a second operationKey per learner but allows it for another learner', async () => {
      const household = await newHousehold();
      const other = await seedExtraLearner(prisma, household.householdId);
      const first = await createPair(prisma, household, { operationKey: 'shared-opaque-key-1' });
      expect(first.operationKey).toBe('shared-opaque-key-1');
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.create({
            data: contextData(household, { operationKey: 'shared-opaque-key-1' }),
          }),
        /Unique constraint/i,
      );
      await createPair(
        prisma,
        { ...household, learnerProfileId: other.learnerProfileId },
        {
          operationKey: 'shared-opaque-key-1',
        },
      );
    });

    it('allows an operationKey equal to an assessment idempotencyKey string', async () => {
      const household = await newHousehold();
      await prisma.assessmentAssignment.create({
        data: {
          householdId: household.householdId,
          learnerProfileId: household.learnerProfileId,
          kind: 'LESSON_ASSESSMENT',
          targetKind: 'LESSON',
          targetCode: 'synthetic-lesson',
          targetVersion: '1.0.0',
          bankCode: 'synthetic-bank',
          bankVersion: '1.0.0',
          policyProfileCode: 'synthetic-profile',
          policyProfileVersion: '1.0.0',
          policyProfileHash: 'sha256:policy',
          algorithmVersion: 'mastery-1',
          curriculumSnapshotHash: 'sha256:curriculum',
          selectedItems: [],
          excludedItems: [],
          attemptOrdinal: 1,
          requiredCount: 1,
          idempotencyKey: 'equal-string-key-1',
        },
      });
      await createPair(prisma, household, { operationKey: 'equal-string-key-1' });
    });

    it('allows one event per kind per context only', async () => {
      const household = await newHousehold();
      const context = await createPair(prisma, household);
      await expectRejected(
        () => prisma.learningEvent.create({ data: linkedEventData(context) }),
        /Unique constraint/i,
      );
      const completed = await prisma.learningEvent.create({
        data: linkedEventData(context, {
          kind: 'TEACHING_COMPLETED',
          occurredAt: new Date(DELIVERED_AT.getTime() + 1),
        }),
      });
      expect(completed.deliveryContextId).toBe(context.id);
      await expectRejected(
        () =>
          prisma.learningEvent.create({
            data: linkedEventData(context, {
              kind: 'TEACHING_COMPLETED',
              occurredAt: new Date(DELIVERED_AT.getTime() + 2),
            }),
          }),
        /Unique constraint/i,
      );
    });
  });

  describe('event pins, null bypass and kind link', () => {
    let household: SeededHousehold;
    let other: { learnerProfileId: string };
    let context: Prisma.TeachingDeliveryContextUncheckedCreateInput;

    beforeAll(async () => {
      household = await newHousehold();
      other = await seedExtraLearner(prisma, household.householdId);
      context = await createPair(prisma, household);
    });

    const mismatches: [
      string,
      (c: typeof context) => Partial<Prisma.LearningEventUncheckedCreateInput>,
    ][] = [
      ['household', () => ({ householdId: b.householdId })],
      ['learner', () => ({ learnerProfileId: 'other-learner' })],
      ['skillCode', () => ({ skillCode: 'other-skill' })],
      ['skillVersion', () => ({ skillVersion: '9.9.9' })],
      ['contentId (itemId)', () => ({ contentId: 'other-item' })],
      ['contentVersion', () => ({ contentVersion: '9.9.9' })],
    ];

    it.each(mismatches)('rejects a linked event with a mismatched %s', async (name, mutate) => {
      const overrides = mutate(context);
      if (name === 'learner') overrides.learnerProfileId = other.learnerProfileId;
      await expectRejected(
        () =>
          prisma.learningEvent.create({
            data: linkedEventData(context, { kind: 'TEACHING_COMPLETED', ...overrides }),
          }),
        /LearningEvent_deliveryContextId_householdId_learnerProfile_fkey/,
      );
    });

    it('rejects linked events with null contentId or contentVersion (MATCH SIMPLE escape)', async () => {
      for (const kind of ['TEACHING_VIEWED', 'TEACHING_COMPLETED'] as const) {
        for (const nulls of [
          { contentId: null },
          { contentVersion: null },
          { contentId: null, contentVersion: null },
        ]) {
          await expectRejected(
            () =>
              prisma.learningEvent.create({
                data: linkedEventData(context, {
                  kind,
                  occurredAt:
                    kind === 'TEACHING_VIEWED'
                      ? DELIVERED_AT
                      : new Date(DELIVERED_AT.getTime() + 5),
                  ...nulls,
                }),
              }),
            /context_requires_content/,
          );
        }
      }
    });

    it('requires a context for teaching kinds and forbids it for other kinds', async () => {
      for (const kind of ['TEACHING_VIEWED', 'TEACHING_COMPLETED'] as const) {
        await expectRejected(
          () =>
            prisma.learningEvent.create({
              data: {
                householdId: household.householdId,
                learnerProfileId: household.learnerProfileId,
                skillCode: 'synthetic-skill',
                skillVersion: '1.0.0',
                kind,
              },
            }),
          /teaching_requires_context/,
        );
      }
      await expectRejected(
        () =>
          prisma.learningEvent.create({
            data: linkedEventData(context, { kind: 'INDEPENDENT_PRACTICE_EXPOSURE' }),
          }),
        /teaching_requires_context/,
      );
    });

    it('keeps legacy practice events with null context and null content valid', async () => {
      const event = await prisma.learningEvent.create({
        data: {
          householdId: household.householdId,
          learnerProfileId: household.learnerProfileId,
          skillCode: 'legacy-skill',
          skillVersion: '1.0.0',
          kind: 'INDEPENDENT_PRACTICE_EXPOSURE',
        },
      });
      expect(event.deliveryContextId).toBeNull();
      const updated = await prisma.learningEvent.update({
        where: { id: event.id },
        data: { occurredAt: new Date('2026-04-01T00:00:00.000Z') },
      });
      expect(updated.occurredAt.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    });
  });

  describe('time rule', () => {
    it('requires VIEWED occurredAt to equal deliveredAt and COMPLETED to be no earlier', async () => {
      const household = await newHousehold();
      const context = contextData(household);
      await prisma.$transaction(async (transaction) => {
        await transaction.teachingDeliveryContext.create({ data: context });
        for (const delta of [-1, 1]) {
          await transaction.$executeRawUnsafe(`SAVEPOINT s`);
          await expect(
            transaction.learningEvent.create({
              data: linkedEventData(context, {
                occurredAt: new Date(DELIVERED_AT.getTime() + delta),
              }),
            }),
          ).rejects.toThrow(/must equal the context deliveredAt/);
          await transaction.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT s`);
        }
        await transaction.learningEvent.create({ data: linkedEventData(context) });
        await transaction.$executeRawUnsafe(`SAVEPOINT s2`);
        await expect(
          transaction.learningEvent.create({
            data: linkedEventData(context, {
              kind: 'TEACHING_COMPLETED',
              occurredAt: new Date(DELIVERED_AT.getTime() - 1),
            }),
          }),
        ).rejects.toThrow(/must not precede the context deliveredAt/);
        await transaction.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT s2`);
        await transaction.learningEvent.create({
          data: linkedEventData(context, { kind: 'TEACHING_COMPLETED', occurredAt: DELIVERED_AT }),
        });
      });
      expect(await prisma.learningEvent.count({ where: { deliveryContextId: context.id } })).toBe(
        2,
      );
    });
  });

  describe('immutability', () => {
    it('refuses any update of any context column (Prisma and raw)', async () => {
      const household = await newHousehold();
      const context = await createPair(prisma, household);
      await expectRejected(
        () =>
          prisma.teachingDeliveryContext.update({
            where: { id: context.id },
            data: { programVersion: '2.0.0' },
          }),
        /TeachingDeliveryContext is immutable/,
      );
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `UPDATE "TeachingDeliveryContext" SET "deliveredAt" = "deliveredAt" WHERE "id" = $1`,
            context.id,
          ),
        /TeachingDeliveryContext is immutable/,
      );
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `UPDATE "TeachingDeliveryContext" SET "operationKey" = 'changed' WHERE "id" = $1`,
            context.id,
          ),
        /TeachingDeliveryContext is immutable/,
      );
    });

    it('freezes linked events and forbids linking or unlinking', async () => {
      const household = await newHousehold();
      const context = await createPair(prisma, household);
      const linked = await prisma.learningEvent.findFirstOrThrow({
        where: { deliveryContextId: context.id },
      });
      await expectRejected(
        () =>
          prisma.learningEvent.update({
            where: { id: linked.id },
            data: { occurredAt: new Date('2027-01-01T00:00:00.000Z') },
          }),
        /immutable/,
      );
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `UPDATE "LearningEvent" SET "deliveryContextId" = NULL WHERE "id" = $1`,
            linked.id,
          ),
        /immutable/,
      );
      const legacy = await prisma.learningEvent.create({
        data: {
          householdId: household.householdId,
          learnerProfileId: household.learnerProfileId,
          skillCode: context.skillCode,
          skillVersion: context.skillVersion,
          contentId: context.itemId,
          contentVersion: context.itemVersion,
          kind: 'INDEPENDENT_PRACTICE_EXPOSURE',
        },
      });
      await expectRejected(
        () =>
          prisma.$executeRawUnsafe(
            `UPDATE "LearningEvent" SET "deliveryContextId" = $1 WHERE "id" = $2`,
            context.id,
            legacy.id,
          ),
        /immutable/,
      );
    });
  });

  describe('pair integrity and deletion', () => {
    it('refuses to commit a context without its VIEWED event', async () => {
      const household = await newHousehold();
      const context = contextData(household);
      await expectRejected(
        () =>
          prisma.$transaction(async (transaction) => {
            await transaction.teachingDeliveryContext.create({ data: context });
          }),
        /requires its TEACHING_VIEWED event/,
      );
      expect(await prisma.teachingDeliveryContext.count({ where: { id: context.id } })).toBe(0);
    });

    it('refuses to commit a context whose only event is COMPLETED', async () => {
      const household = await newHousehold();
      const context = contextData(household);
      await expectRejected(
        () =>
          prisma.$transaction(async (transaction) => {
            await transaction.teachingDeliveryContext.create({ data: context });
            await transaction.learningEvent.create({
              data: linkedEventData(context, { kind: 'TEACHING_COMPLETED' }),
            });
          }),
        /requires its TEACHING_VIEWED event/,
      );
    });

    it('refuses to delete the VIEWED event alone at commit', async () => {
      const household = await newHousehold();
      const context = await createPair(prisma, household);
      await expectRejected(
        () => prisma.learningEvent.deleteMany({ where: { deliveryContextId: context.id } }),
        /requires its TEACHING_VIEWED event/,
      );
      expect(await prisma.learningEvent.count({ where: { deliveryContextId: context.id } })).toBe(
        1,
      );
    });

    it('refuses to delete a context that still has a linked event', async () => {
      const household = await newHousehold();
      const context = await createPair(prisma, household);
      await expectRejected(
        () => prisma.teachingDeliveryContext.delete({ where: { id: context.id } }),
        /foreign key/i,
      );
    });

    it('allows deleting the pair (event first, then context) in one transaction', async () => {
      const household = await newHousehold();
      const context = await createPair(prisma, household);
      await prisma.$transaction(async (transaction) => {
        await transaction.learningEvent.deleteMany({ where: { deliveryContextId: context.id } });
        await transaction.teachingDeliveryContext.delete({ where: { id: context.id } });
      });
      expect(await prisma.teachingDeliveryContext.count({ where: { id: context.id } })).toBe(0);
    });
  });

  describe('household cascade', () => {
    it('erases contexts, events, learners and users by a direct Household DELETE', async () => {
      const household = await newHousehold();
      const context = await createPair(prisma, household);
      await prisma.$executeRawUnsafe(
        `DELETE FROM "Household" WHERE "id" = $1`,
        household.householdId,
      );
      expect(await prisma.teachingDeliveryContext.count({ where: { id: context.id } })).toBe(0);
      expect(
        await prisma.learningEvent.count({ where: { householdId: household.householdId } }),
      ).toBe(0);
      expect(await prisma.user.count({ where: { householdId: household.householdId } })).toBe(0);
    });

    it('uses NO ACTION (not RESTRICT) on the actor and event FKs and MATCH SIMPLE', async () => {
      const rows = await prisma.$queryRawUnsafe<
        { conname: string; confdeltype: string; confupdtype: string; confmatchtype: string }[]
      >(
        `SELECT conname, confdeltype::text, confupdtype::text, confmatchtype::text FROM pg_constraint
         WHERE contype = 'f' AND (conrelid = '"TeachingDeliveryContext"'::regclass
           OR conname LIKE 'LearningEvent_deliveryContextId%') ORDER BY conname`,
      );
      expect(
        rows.map((row) => [row.conname, row.confdeltype, row.confupdtype, row.confmatchtype]),
      ).toEqual([
        ['LearningEvent_deliveryContextId_householdId_learnerProfile_fkey', 'a', 'a', 's'],
        ['TeachingDeliveryContext_actorUserId_householdId_actorRole_fkey', 'a', 'a', 's'],
        ['TeachingDeliveryContext_householdId_fkey', 'c', 'a', 's'],
        ['TeachingDeliveryContext_learnerProfileId_householdId_fkey', 'c', 'a', 's'],
      ]);
    });
  });
});
