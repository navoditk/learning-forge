import { createHash } from 'node:crypto';

import { Prisma, PrismaClient } from '@prisma/client';
import { afterAll, describe, expect, it } from 'vitest';

import { PINNED_TEACHING_FUNCTIONS } from './teaching-pinned-functions';

// Independent pg_catalog assertion for the raw CHECK/trigger/function objects
// that schema.prisma cannot express and that Prisma diff silence does not
// verify. Not selected by `npm test` or `npm run test:integration`: it is wired
// into scripts/test-migrations.sh, which runs it against a scratch database
// after the forward migration and again after down/reapply.

const prisma = new PrismaClient({ log: ['error'] });
afterAll(async () => {
  await prisma.$disconnect();
});

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
];
const versionDefinition = `CHECK ((${versionColumns
  .map(
    (column) =>
      `((char_length("${column}") >= 1) AND (char_length("${column}") <= 100)) AND ("${column}" = btrim("${column}"))`,
  )
  .join(' AND ')}))`;
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
];
const codeDefinition = `CHECK ((${codeColumns
  .map((column) => `("${column}" ~ '^[a-z0-9-]+$'::text)`)
  .join(' AND ')}))`;

// relation, name, type, convalidated, confdeltype, confupdtype, confmatchtype, definition
const EXPECTED_CONSTRAINTS: [string, string, string, string, string, string, string][] = [
  [
    'LearningEvent',
    'LearningEvent_context_requires_content',
    'c',
    '',
    '',
    '',
    `CHECK ((("deliveryContextId" IS NULL) OR (("contentId" IS NOT NULL) AND ("contentVersion" IS NOT NULL))))`,
  ],
  [
    'LearningEvent',
    'LearningEvent_deliveryContextId_householdId_learnerProfile_fkey',
    'f',
    'a',
    'a',
    's',
    `FOREIGN KEY ("deliveryContextId", "householdId", "learnerProfileId", "skillCode", "skillVersion", "contentId", "contentVersion") REFERENCES "TeachingDeliveryContext"(id, "householdId", "learnerProfileId", "skillCode", "skillVersion", "itemId", "itemVersion")`,
  ],
  [
    'LearningEvent',
    'LearningEvent_teaching_requires_context',
    'c',
    '',
    '',
    '',
    `CHECK (((kind = ANY (ARRAY['TEACHING_VIEWED'::"LearningEventKind", 'TEACHING_COMPLETED'::"LearningEventKind"])) = ("deliveryContextId" IS NOT NULL)))`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_activity_kind_teaching',
    'c',
    '',
    '',
    '',
    `CHECK (("activityKind" = 'TEACHING'::"ProgressionActivityKind"))`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_actorUserId_householdId_actorRole_fkey',
    'f',
    'a',
    'a',
    's',
    `FOREIGN KEY ("actorUserId", "householdId", "actorRole") REFERENCES "User"(id, "householdId", role)`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_actor_role_parent',
    'c',
    '',
    '',
    '',
    `CHECK (("actorRole" = 'PARENT'::"UserRole"))`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_code_format',
    'c',
    '',
    '',
    '',
    codeDefinition,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_digest_format',
    'c',
    '',
    '',
    '',
    `CHECK ((("authoredHash" ~ '^sha256:[a-f0-9]{64}$'::text) AND ("canonicalHash" ~ '^sha256:[a-f0-9]{64}$'::text)))`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_householdId_fkey',
    'f',
    'c',
    'a',
    's',
    `FOREIGN KEY ("householdId") REFERENCES "Household"(id) ON DELETE CASCADE`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_id_length',
    'c',
    '',
    '',
    '',
    `CHECK (((char_length(id) >= 1) AND (char_length(id) <= 200)))`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_learnerProfileId_householdId_fkey',
    'f',
    'c',
    'a',
    's',
    `FOREIGN KEY ("learnerProfileId", "householdId") REFERENCES "LearnerProfile"(id, "householdId") ON DELETE CASCADE`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_operation_key_length',
    'c',
    '',
    '',
    '',
    `CHECK (((char_length("operationKey") >= 1) AND (char_length("operationKey") <= 200)))`,
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_version_format',
    'c',
    '',
    '',
    '',
    versionDefinition,
  ],
];

// relation, name, tgtype, deferrable, initially deferred, function.
// tgtype: 1 ROW, 2 BEFORE, 4 INSERT, 8 DELETE, 16 UPDATE, 32 TRUNCATE.
const EXPECTED_TRIGGERS: [string, string, number, boolean, boolean, string][] = [
  [
    'LearningEvent',
    'LearningEvent_link_immutable',
    19,
    false,
    false,
    'prevent_learning_event_link_update',
  ],
  ['LearningEvent', 'LearningEvent_link_time', 7, false, false, 'check_learning_event_link_time'],
  [
    'LearningEvent',
    'LearningEvent_truncate_guard',
    34,
    false,
    false,
    'prevent_teaching_evidence_truncate',
  ],
  [
    'LearningEvent',
    'LearningEvent_viewed_not_orphaned',
    9,
    true,
    true,
    'require_teaching_context_viewed',
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_immutable',
    19,
    false,
    false,
    'prevent_teaching_delivery_context_update',
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_requires_viewed',
    5,
    true,
    true,
    'require_teaching_context_viewed',
  ],
  [
    'TeachingDeliveryContext',
    'TeachingDeliveryContext_truncate_guard',
    34,
    false,
    false,
    'prevent_teaching_evidence_truncate',
  ],
];

type DbClient = PrismaClient | Prisma.TransactionClient;

interface FunctionRow {
  proname: string;
  prosrc: string;
  lanname: string;
  prorettype: string;
  prosecdef: boolean;
  pronargs: number;
  proconfig: string[] | null;
}

async function readFunctions(client: DbClient): Promise<FunctionRow[]> {
  return client.$queryRawUnsafe<FunctionRow[]>(
    `SELECT p.proname, p.prosrc, l.lanname, p.prorettype::regtype::text AS prorettype,
       p.prosecdef, p.pronargs::int AS pronargs, p.proconfig
     FROM pg_proc p JOIN pg_language l ON l.oid = p.prolang
     WHERE p.pronamespace = 'public'::regnamespace AND p.proname = ANY($1) ORDER BY p.proname`,
    PINNED_TEACHING_FUNCTIONS.map((fn) => fn.name),
  );
}

// Exact trimmed-text and digest comparison against the independent pin; never
// derived from the migration. Returns the names whose live definition differs.
function functionsDifferingFromPins(rows: FunctionRow[]): string[] {
  const differing: string[] = [];
  for (const pin of PINNED_TEACHING_FUNCTIONS) {
    const row = rows.find((candidate) => candidate.proname === pin.name);
    const source = row?.prosrc.trim();
    if (
      !row ||
      source !== pin.body ||
      createHash('sha256')
        .update(source ?? '')
        .digest('hex') !== pin.sha256 ||
      row.lanname !== 'plpgsql' ||
      row.prorettype !== 'trigger' ||
      row.prosecdef ||
      row.pronargs !== 0 ||
      row.proconfig !== null
    ) {
      differing.push(pin.name);
    }
  }
  return differing;
}

describe('teaching delivery catalog objects (pg_catalog)', () => {
  it('has exactly the expected constraints with action, match type and validation', async () => {
    const rows = await prisma.$queryRawUnsafe<
      {
        relname: string;
        conname: string;
        contype: string;
        convalidated: boolean;
        confdeltype: string;
        confupdtype: string;
        confmatchtype: string;
        definition: string;
      }[]
    >(`SELECT c.relname, k.conname, k.contype::text, k.convalidated, k.confdeltype::text,
         k.confupdtype::text, k.confmatchtype::text, pg_get_constraintdef(k.oid) AS definition
       FROM pg_constraint k JOIN pg_class c ON c.oid = k.conrelid
       WHERE c.relname IN ('TeachingDeliveryContext', 'LearningEvent')
         AND k.contype IN ('c', 'f')
         AND k.conname NOT IN ('LearningEvent_householdId_fkey', 'LearningEvent_learnerProfileId_fkey')
       ORDER BY c.relname, k.conname`);
    const actual = rows.map((row) => [
      row.relname,
      row.conname,
      row.contype,
      row.contype === 'f' ? row.confdeltype : '',
      row.contype === 'f' ? row.confupdtype : '',
      row.contype === 'f' ? row.confmatchtype : '',
      row.definition,
    ]);
    expect(actual).toEqual(EXPECTED_CONSTRAINTS);
    expect(rows.every((row) => row.convalidated)).toBe(true);
  });

  it('has exactly the expected non-internal triggers: enabled, with the expected deferral', async () => {
    const rows = await prisma.$queryRawUnsafe<
      {
        relname: string;
        tgname: string;
        tgenabled: string;
        tgtype: number;
        tgdeferrable: boolean;
        tginitdeferred: boolean;
        proname: string;
      }[]
    >(`SELECT c.relname, t.tgname, t.tgenabled::text, t.tgtype::int AS tgtype, t.tgdeferrable,
         t.tginitdeferred, p.proname
       FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_proc p ON p.oid = t.tgfoid
       WHERE NOT t.tgisinternal AND c.relname IN ('TeachingDeliveryContext', 'LearningEvent')
       ORDER BY c.relname, t.tgname`);
    expect(
      rows.map((row) => [
        row.relname,
        row.tgname,
        row.tgtype,
        row.tgdeferrable,
        row.tginitdeferred,
        row.proname,
      ]),
    ).toEqual(EXPECTED_TRIGGERS);
    expect(rows.map((row) => row.tgenabled)).toEqual(rows.map(() => 'O'));
  });

  it('pins the five reviewed function bodies and digests independently of the migration', async () => {
    for (const pin of PINNED_TEACHING_FUNCTIONS) {
      expect(createHash('sha256').update(pin.body).digest('hex'), pin.name).toBe(pin.sha256);
    }
    const rows = await readFunctions(prisma);
    expect(rows.map((row) => row.proname)).toEqual(
      PINNED_TEACHING_FUNCTIONS.map((fn) => fn.name).sort(),
    );
    expect(functionsDifferingFromPins(rows)).toEqual([]);
  });

  // Controlled mutants are applied inside a transaction that is always rolled
  // back, so the scratch database keeps its reviewed definitions.
  it.each([
    [
      'no-op immutability body that keeps the expected token only in a comment',
      'prevent_teaching_delivery_context_update',
      'BEGIN RETURN NEW; -- TeachingDeliveryContext is immutable\nEND;',
    ],
    [
      'truncate guard that never raises',
      'prevent_teaching_evidence_truncate',
      'BEGIN RETURN NULL; END;',
    ],
    ['whitespace-only edit of the link-time function', 'check_learning_event_link_time', null],
  ])('detects a changed function: %s', async (_label, name, replacement) => {
    const pin = PINNED_TEACHING_FUNCTIONS.find((fn) => fn.name === name)!;
    const body = replacement ?? `${pin.body.replace('BEGIN', 'BEGIN\n')}`;
    const rollback = new Error('rollback mutant');
    let seen: string[] | undefined;
    await prisma
      .$transaction(async (tx) => {
        await tx.$executeRawUnsafe(
          `CREATE OR REPLACE FUNCTION "public"."${name}"() RETURNS trigger LANGUAGE plpgsql AS $mutant$${body}$mutant$`,
        );
        seen = functionsDifferingFromPins(await readFunctions(tx));
        throw rollback;
      })
      .catch((error: unknown) => {
        if (error !== rollback) throw error;
      });
    expect(seen).toEqual([name]);
    expect(functionsDifferingFromPins(await readFunctions(prisma))).toEqual([]);
  });

  it('has the reviewed unique indexes and no default on deliveredAt', async () => {
    const indexes = await prisma.$queryRawUnsafe<{ indexname: string; indexdef: string }[]>(
      `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND indexname IN (
         'TeachingDeliveryContext_learnerProfileId_operationKey_key',
         'TeachingDeliveryContext_id_householdId_learnerProfileId_ski_key',
         'User_id_householdId_role_key', 'LearnerProfile_id_householdId_key',
         'LearningEvent_deliveryContextId_kind_key') ORDER BY indexname`,
    );
    expect(indexes.map((index) => index.indexname)).toEqual([
      'LearnerProfile_id_householdId_key',
      'LearningEvent_deliveryContextId_kind_key',
      'TeachingDeliveryContext_id_householdId_learnerProfileId_ski_key',
      'TeachingDeliveryContext_learnerProfileId_operationKey_key',
      'User_id_householdId_role_key',
    ]);
    for (const index of indexes) {
      expect(index.indexdef).toMatch(/^CREATE UNIQUE INDEX/);
      expect(index.indexdef).not.toContain('NULLS NOT DISTINCT');
    }
    const [column] = await prisma.$queryRawUnsafe<
      { column_default: string | null; is_nullable: string }[]
    >(
      `SELECT column_default, is_nullable FROM information_schema.columns
       WHERE table_name = 'TeachingDeliveryContext' AND column_name = 'deliveredAt'`,
    );
    expect(column).toEqual({ column_default: null, is_nullable: 'NO' });
    const [link] = await prisma.$queryRawUnsafe<
      { column_default: string | null; is_nullable: string }[]
    >(
      `SELECT column_default, is_nullable FROM information_schema.columns
       WHERE table_name = 'LearningEvent' AND column_name = 'deliveryContextId'`,
    );
    expect(link).toEqual({ column_default: null, is_nullable: 'YES' });
  });
});
