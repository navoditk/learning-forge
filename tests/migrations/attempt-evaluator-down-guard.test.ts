import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PrismaClient } from '@prisma/client';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

import { eraseSyntheticHousehold, seedHousehold } from '../persistence/teaching-delivery-fixtures';

// PYTHON-IMPLEMENT PY-R2/PY-R8: 0019 down.sql must not silently discard
// evaluator provenance. Scratch database only (scripts/test-migrations.sh sets
// SCRATCH_PSQL_URL and runs this before the empty-schema down/reapply cycle).
// Synthetic rows only; no learner data.

const prisma = new PrismaClient({ log: ['error'] });
afterAll(async () => {
  await prisma.$disconnect();
});

const SCRATCH_PSQL_URL = process.env.SCRATCH_PSQL_URL as string;
const DIR = join(__dirname, '../../prisma/migrations/0019_add_attempt_evaluator_version');
const DOWN_SQL = join(DIR, 'down.sql');
const UP_SQL = join(DIR, 'migration.sql');

const OP_MS = 10_000; // every asynchronous operation is bounded by this deadline
const POLL_MS = 15_000;

const psqlFile = (file: string) =>
  spawnSync('psql', [SCRATCH_PSQL_URL, '-v', 'ON_ERROR_STOP=1', '-f', file], {
    encoding: 'utf8',
    timeout: OP_MS,
  });

/** Rejects if `promise` does not settle within `ms`; the timer never outlives it. */
function withDeadline<T>(promise: Promise<T>, what: string, ms = OP_MS): Promise<T> {
  let timer: NodeJS.Timeout;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms} ms: ${what}`)), ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

/** Polls a condition; each evaluation is itself bounded, as is the whole wait. */
async function poll(condition: () => Promise<boolean>, what: string, timeoutMs = POLL_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await withDeadline(condition(), `evaluating ${what}`)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${what}`);
}

/**
 * Every child the test starts is registered here and torn down by afterEach,
 * which Vitest runs even after a test timeout (a timeout does not unwind a
 * suspended callback into its own `finally`). The teardown kills and awaits the
 * children FIRST (no database call involved), then terminates backends and
 * erases households, each under a deadline, so a stalled query cannot leave
 * processes or sessions behind.
 */
const liveChildren = new Set<ChildProcess>();
const cleanupHouseholds: string[] = [];
const APP_NAMES = ['py6-down-guard-writer', 'py6-down-guard-down'] as const;

function track(child: ChildProcess): Promise<number | null> {
  liveChildren.add(child);
  return new Promise<number | null>((resolve, reject) => {
    child.once('error', (error) => {
      liveChildren.delete(child);
      reject(error);
    });
    child.once('close', (code) => {
      liveChildren.delete(child);
      resolve(code);
    });
  });
}

afterEach(async () => {
  const exiting: Promise<void>[] = [];
  for (const child of liveChildren) {
    exiting.push(
      new Promise<void>((resolve) => {
        child.once('close', () => resolve());
        child.once('error', () => resolve());
        if (child.exitCode !== null || child.signalCode !== null) resolve();
        else child.kill('SIGKILL');
      }),
    );
  }
  await withDeadline(Promise.all(exiting), 'children to exit after SIGKILL', 5_000).catch(
    () => undefined,
  );
  liveChildren.clear();
  await withDeadline(
    prisma.$queryRawUnsafe(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
         WHERE application_name IN (${APP_NAMES.map((name) => `'${name}'`).join(',')})
           AND datname = current_database() AND pid <> pg_backend_pid()`,
    ),
    'terminating test backends',
    5_000,
  ).catch(() => undefined);
  for (const householdId of cleanupHouseholds.splice(0)) {
    await withDeadline(eraseSyntheticHousehold(prisma, householdId), 'erasing the household').catch(
      () => undefined,
    );
  }
});

async function columnPresent() {
  const [row] = await withDeadline(
    prisma.$queryRawUnsafe<{ present: boolean }[]>(
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns
         WHERE table_name = 'Attempt' AND column_name = 'evaluatorVersion') AS present`,
    ),
    'the column check',
  );
  return row.present;
}

async function seedAttempt(
  household: { householdId: string; learnerProfileId: string },
  evaluatorVersion: string | null,
) {
  return prisma.attempt.create({
    data: {
      householdId: household.householdId,
      learnerProfileId: household.learnerProfileId,
      contentKey: 'synthetic-item',
      contentVersion: '1',
      learnerResponse: 'x',
      correctness: 'INCORRECT',
      scoringMethod: 'DETERMINISTIC',
      attemptNumber: 1,
      elapsedSeconds: 0,
      highestAssistance: 'INDEPENDENT',
      context: 'PRACTICE',
      policyVersion: 'synthetic',
      evaluatorVersion,
    },
  });
}

describe('0019 down.sql guard (scratch database only)', () => {
  it('is one transaction that locks the table before the check and holds it through the drop', () => {
    const sql = readFileSync(DOWN_SQL, 'utf8')
      .split('\n')
      .filter((line) => !line.startsWith('--'))
      .join('\n');
    const at = (needle: string) => sql.indexOf(needle);
    const order = [
      at('BEGIN;'),
      at('LOCK TABLE "public"."Attempt" IN SHARE ROW EXCLUSIVE MODE;'),
      at('"evaluatorVersion" IS NOT NULL'),
      at('DROP COLUMN "evaluatorVersion"'),
      at('COMMIT;'),
    ];
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('refuses, and keeps the column and the value, while any attempt records a version', async () => {
    expect(SCRATCH_PSQL_URL, 'SCRATCH_PSQL_URL must be set by test-migrations.sh').toBeTruthy();
    const household = await seedHousehold(prisma);
    cleanupHouseholds.push(household.householdId);
    const attempt = await seedAttempt(household, 'python-output-1');
    const down = psqlFile(DOWN_SQL);
    expect(down.status).not.toBe(0);
    expect(down.stderr).toContain('Cannot remove Attempt.evaluatorVersion');
    expect(await columnPresent()).toBe(true);
    const row = await prisma.attempt.findUniqueOrThrow({ where: { id: attempt.id } });
    expect(row.evaluatorVersion).toBe('python-output-1');
  });

  it('a writer in flight is waited for, so a version committed before the check is never dropped', async () => {
    const household = await seedHousehold(prisma);
    cleanupHouseholds.push(household.householdId);
    await seedAttempt(household, null);
    const [WRITER, DOWN] = APP_NAMES;
    // The writer holds its transaction open until THIS test releases it: it
    // reads SQL from stdin, so there is no timed window to race.
    // Attempt rows are immutable (UPDATE is blocked), so the writer inserts.
    const writer = spawn('psql', [SCRATCH_PSQL_URL, '-At', '-v', 'ON_ERROR_STOP=1'], {
      env: { ...process.env, PGAPPNAME: WRITER },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const writerClosed = track(writer);
    let writerOut = '';
    let writerErr = '';
    writer.stdout.on('data', (chunk) => (writerOut += String(chunk)));
    writer.stderr.on('data', (chunk) => (writerErr += String(chunk)));
    writer.stdin.write(
      `BEGIN;
INSERT INTO "Attempt" ("id","householdId","learnerProfileId","contentKey","contentVersion",
  "learnerResponse","correctness","scoringMethod","attemptNumber","elapsedSeconds",
  "highestAssistance","context","policyVersion","evaluatorVersion")
VALUES (gen_random_uuid()::text,'${household.householdId}','${household.learnerProfileId}',
  'synthetic-item','1','x','INCORRECT','DETERMINISTIC',1,0,'INDEPENDENT','PRACTICE',
  'synthetic','python-output-1');
SELECT 'PID=' || pg_backend_pid();
`,
    );
    await poll(async () => /PID=\d+/.test(writerOut), 'the writer to report its backend pid');
    const writerPid = Number(/PID=(\d+)/.exec(writerOut)![1]);

    // Identify the writer backend by pid, database and application name, holding
    // a granted row-level write lock on the exact relation, inside its transaction.
    const [held] = await withDeadline(
      prisma.$queryRawUnsafe<{ n: bigint }[]>(
        `SELECT count(*) AS n FROM pg_locks l JOIN pg_stat_activity a ON a.pid = l.pid
             WHERE l.pid = ${writerPid} AND a.datname = current_database()
               AND a.application_name = '${WRITER}' AND a.state = 'idle in transaction'
               AND l.relation = '"Attempt"'::regclass AND l.granted
               AND l.mode = 'RowExclusiveLock'`,
      ),
      'the writer lock query',
    );
    expect(Number(held.n)).toBe(1);

    const down = spawn('psql', [SCRATCH_PSQL_URL, '-v', 'ON_ERROR_STOP=1', '-f', DOWN_SQL], {
      env: { ...process.env, PGAPPNAME: DOWN },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const downClosed = track(down);
    let downErr = '';
    down.stderr.on('data', (chunk) => (downErr += String(chunk)));

    // The down script's backend (found by application name and database) must
    // be blocked, not granted, on the exact relation and lock mode.
    await poll(
      async () =>
        (
          await prisma.$queryRawUnsafe<unknown[]>(
            `SELECT 1 FROM pg_locks l JOIN pg_stat_activity a ON a.pid = l.pid
                 WHERE a.application_name = '${DOWN}' AND a.datname = current_database()
                   AND l.relation = '"Attempt"'::regclass
                   AND l.mode = 'ShareRowExclusiveLock' AND NOT l.granted`,
          )
        ).length > 0,
      'down.sql to wait on the Attempt table lock',
    );
    // While blocked, nothing has been dropped.
    expect(await columnPresent()).toBe(true);

    // Release the writer explicitly; only now may the lock be granted.
    writer.stdin.write('COMMIT;\n\\q\n');
    writer.stdin.end();
    expect(await withDeadline(writerClosed, 'the writer to exit'), writerErr).toBe(0);
    expect(await withDeadline(downClosed, 'down.sql to exit')).not.toBe(0);
    expect(downErr).toContain('Cannot remove Attempt.evaluatorVersion');
    expect(await columnPresent()).toBe(true);
    const rows = await withDeadline(
      prisma.attempt.findMany({ where: { householdId: household.householdId } }),
      'reading the attempts',
    );
    expect(rows.map((row) => row.evaluatorVersion).sort()).toEqual([null, 'python-output-1']);
  }, 90_000); // Longer than the sum of the bounded waits above (each <= 15 s, typically ms).

  it('succeeds when every value is NULL, and the forward migration restores the column', async () => {
    const household = await seedHousehold(prisma);
    cleanupHouseholds.push(household.householdId);
    await seedAttempt(household, null);
    const down = psqlFile(DOWN_SQL);
    expect(down.status, down.stderr).toBe(0);
    expect(await columnPresent()).toBe(false);
    const up = psqlFile(UP_SQL);
    expect(up.status, up.stderr).toBe(0);
    expect(await columnPresent()).toBe(true);
  });
});
