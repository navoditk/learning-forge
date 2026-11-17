import type { ChildProcess } from 'node:child_process';
import type { EventEmitter } from 'node:events';

export type TeardownChild = Pick<ChildProcess, 'exitCode' | 'signalCode' | 'kill'> &
  Pick<EventEmitter, 'once' | 'removeListener'>;

export function assertScratchDatabaseUrls(databaseUrl: string, scratchPsqlUrl: string): void {
  const scratchDatabasePattern = /^learning_forge_migration_test_\d+_\d+$/;
  const databaseNames = [databaseUrl, scratchPsqlUrl].map((value) => {
    try {
      return decodeURIComponent(new URL(value).pathname.slice(1));
    } catch {
      return '';
    }
  });
  if (
    databaseNames.some((name) => !scratchDatabasePattern.test(name)) ||
    databaseNames[0] !== databaseNames[1]
  ) {
    throw new Error(
      'DATABASE_URL and SCRATCH_PSQL_URL must both target the same generated learning_forge_migration_test_<random>_<pid> database from scripts/test-migrations.sh; refusing any other target.',
    );
  }
}

function waitForChildExit(child: TeardownChild, timeoutMs: number): Promise<Error | undefined> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.removeListener('close', onClose);
      child.removeListener('error', onError);
      resolve(error);
    };
    const onClose = () => finish();
    const onError = (error: Error) => finish(error);

    const timer = setTimeout(
      () => finish(new Error(`Timed out after ${timeoutMs} ms waiting for child exit`)),
      timeoutMs,
    );
    child.once('close', onClose);
    child.once('error', onError);

    try {
      const signalled = child.kill('SIGKILL');
      if (!signalled && child.exitCode === null && child.signalCode === null) {
        finish(new Error('SIGKILL could not be sent to a live child process'));
      } else if (child.exitCode !== null || child.signalCode !== null) {
        finish();
      }
    } catch (error) {
      finish(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

async function runBounded(
  label: string,
  operation: () => Promise<unknown>,
  deadline: number,
  maxMs: number,
): Promise<Error | undefined> {
  const ms = Math.max(1, Math.min(maxMs, deadline - Date.now()));
  let rejectTimeout: (error: Error) => void = () => {};
  const timeout = new Promise<never>((_, reject) => {
    rejectTimeout = reject;
  });
  const timer = setTimeout(
    () => rejectTimeout(new Error(`Timed out after ${ms} ms: ${label}`)),
    ms,
  );
  try {
    await Promise.race([operation(), timeout]);
    return undefined;
  } catch (error) {
    return new Error(`${label} failed`, { cause: error });
  } finally {
    clearTimeout(timer);
  }
}

export async function runAttemptEvaluatorTeardown({
  children,
  terminateBackends,
  householdIds,
  eraseHousehold,
  timeoutMs = 15_000,
}: {
  children: readonly TeardownChild[];
  terminateBackends: () => Promise<unknown>;
  householdIds: readonly string[];
  eraseHousehold: (householdId: string) => Promise<unknown>;
  timeoutMs?: number;
}): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const errors: Error[] = [];

  const childError = await runBounded(
    'children to exit after SIGKILL',
    async () => {
      const results = await Promise.allSettled(
        children.map(async (child) => {
          const error = await waitForChildExit(child, Math.min(4_000, timeoutMs));
          if (error) throw error;
        }),
      );
      const failures = results.flatMap((result) =>
        result.status === 'rejected' ? [result.reason] : [],
      );
      if (failures.length > 0) {
        throw new AggregateError(failures, 'One or more child processes did not exit cleanly');
      }
    },
    deadline,
    4_500,
  );
  if (childError) errors.push(childError);

  const backendError = await runBounded(
    'terminating test backends',
    terminateBackends,
    deadline,
    5_000,
  );
  if (backendError) errors.push(backendError);

  const householdError = await runBounded(
    'erasing synthetic households',
    async () => {
      const results = await Promise.allSettled(
        householdIds.map((householdId) => eraseHousehold(householdId)),
      );
      const failures = results.flatMap((result) =>
        result.status === 'rejected' ? [result.reason] : [],
      );
      if (failures.length > 0) {
        throw new AggregateError(failures, 'One or more synthetic households were not erased');
      }
    },
    deadline,
    5_000,
  );
  if (householdError) errors.push(householdError);

  if (errors.length > 0) {
    throw new AggregateError(errors, 'PY-R8 test teardown failed');
  }
}

export async function disconnectWithDeadline(
  disconnect: () => Promise<unknown>,
  timeoutMs: number,
): Promise<void> {
  let rejectTimeout: (error: Error) => void = () => {};
  const timeout = new Promise<never>((_, reject) => {
    rejectTimeout = reject;
  });
  const timer = setTimeout(
    () => rejectTimeout(new Error(`Timed out after ${timeoutMs} ms: disconnecting Prisma`)),
    timeoutMs,
  );
  try {
    await Promise.race([disconnect(), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
