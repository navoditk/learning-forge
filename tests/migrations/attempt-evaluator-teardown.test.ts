import { EventEmitter } from 'node:events';

import { describe, expect, it, vi } from 'vitest';

import {
  assertScratchDatabaseUrls,
  disconnectWithDeadline,
  runAttemptEvaluatorTeardown,
  type TeardownChild,
} from './attempt-evaluator-teardown';

class SyntheticChild extends EventEmitter implements TeardownChild {
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;

  constructor(private readonly signal: () => boolean) {
    super();
  }

  kill(): boolean {
    return this.signal();
  }
}

async function observeUnhandledRejections(run: () => Promise<unknown>) {
  const unhandled: unknown[] = [];
  const onUnhandled = (reason: unknown) => unhandled.push(reason);
  process.on('unhandledRejection', onUnhandled);
  try {
    await run();
    await new Promise<void>((resolve) => setImmediate(resolve));
  } finally {
    process.off('unhandledRejection', onUnhandled);
  }
  return unhandled;
}

function failureMessages(error: unknown): string[] {
  if (!(error instanceof Error)) return [String(error)];
  const nested = error instanceof AggregateError ? error.errors.flatMap(failureMessages) : [];
  const cause = error.cause === undefined ? [] : failureMessages(error.cause);
  return [error.message, ...cause, ...nested];
}

describe('attempt-evaluator teardown fault injection (no database)', () => {
  it('handles a failed signal without an unhandled close-promise rejection', async () => {
    const child = new SyntheticChild(() => false);
    const terminateBackends = vi.fn(async () => undefined);
    const eraseHousehold = vi.fn(async () => undefined);
    const unhandled = await observeUnhandledRejections(async () => {
      await expect(
        runAttemptEvaluatorTeardown({
          children: [child],
          terminateBackends,
          householdIds: ['synthetic-household'],
          eraseHousehold,
        }),
      ).rejects.toMatchObject({ name: 'AggregateError' });
    });

    expect(unhandled).toEqual([]);
    expect(terminateBackends).toHaveBeenCalledOnce();
    expect(eraseHousehold).toHaveBeenCalledWith('synthetic-household');
  });

  it('handles a child error event without an unhandled rejection', async () => {
    const child = new SyntheticChild(() => {
      child.emit('error', new Error('synthetic child error'));
      return true;
    });
    const unhandled = await observeUnhandledRejections(async () => {
      await expect(
        runAttemptEvaluatorTeardown({
          children: [child],
          terminateBackends: vi.fn(async () => undefined),
          householdIds: [],
          eraseHousehold: vi.fn(async () => undefined),
        }),
      ).rejects.toMatchObject({ name: 'AggregateError' });
    });

    expect(unhandled).toEqual([]);
  });

  it('reports all failures and still attempts backend and every household cleanup', async () => {
    const calls: string[] = [];
    const child = new SyntheticChild(() => {
      calls.push('signal');
      throw new Error('synthetic EPERM');
    });
    const terminateBackends = vi.fn(async () => {
      calls.push('backends');
      throw new Error('synthetic backend failure');
    });
    const eraseHousehold = vi.fn(async (householdId: string) => {
      calls.push(householdId);
      if (householdId === 'synthetic-household-fails') {
        throw new Error('synthetic household failure');
      }
    });

    let failure: unknown;
    try {
      await runAttemptEvaluatorTeardown({
        children: [child],
        terminateBackends,
        householdIds: ['synthetic-household-fails', 'synthetic-household-succeeds'],
        eraseHousehold,
      });
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(AggregateError);
    const message = failureMessages(failure).join('\n');
    expect(message).toContain('children to exit after SIGKILL failed');
    expect(message).toContain('synthetic EPERM');
    expect(message).toContain('terminating test backends failed');
    expect(message).toContain('synthetic backend failure');
    expect(message).toContain('erasing synthetic households failed');
    expect(message).toContain('synthetic household failure');
    expect(calls).toEqual([
      'signal',
      'backends',
      'synthetic-household-fails',
      'synthetic-household-succeeds',
    ]);
  });

  it('surfaces a mocked Prisma disconnect failure and accepts only matching generated scratch URLs', async () => {
    const disconnect = vi.fn(async () => {
      throw new Error('synthetic disconnect failure');
    });
    await expect(disconnectWithDeadline(disconnect, 100)).rejects.toThrow(
      'synthetic disconnect failure',
    );
    expect(disconnect).toHaveBeenCalledOnce();

    const databaseUrl = 'postgresql://user@localhost/learning_forge_migration_test_123_456';
    const scratchUrl =
      'postgresql://user@localhost/learning_forge_migration_test_123_456?application_name=test';
    expect(() => assertScratchDatabaseUrls(databaseUrl, scratchUrl)).not.toThrow();
    expect(() =>
      assertScratchDatabaseUrls(
        'postgresql://user@localhost/learning_forge',
        'postgresql://user@localhost/learning_forge',
      ),
    ).toThrow(/refusing any other target/);
    expect(() =>
      assertScratchDatabaseUrls(
        databaseUrl,
        'postgresql://user@localhost/learning_forge_migration_test_999_888',
      ),
    ).toThrow(/same generated/);
  });

  it('does not signal a child that already exited', async () => {
    const child = new SyntheticChild(() => {
      throw new Error('must not signal an exited child');
    });
    child.exitCode = 0;
    await expect(
      runAttemptEvaluatorTeardown({
        children: [child],
        terminateBackends: vi.fn(async () => undefined),
        householdIds: [],
        eraseHousehold: vi.fn(async () => undefined),
      }),
    ).resolves.toBeUndefined();
  });
});
