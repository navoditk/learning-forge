import { describe, expect, it, vi } from 'vitest';

import bcrypt from 'bcryptjs';

import {
  MAX_FAILED_PASSWORD_ATTEMPTS,
  PASSWORD_LOCK_MINUTES,
  checkPasswordWithLockout,
} from '../../src/auth/password-attempts';

/** An in-memory Prisma-shaped stub, enough to drive the lockout state machine. */
function fakeDatabase(user: {
  id: string;
  passwordHash: string | null;
  failedPasswordAttempts: number;
  passwordLockedUntil: Date | null;
}) {
  const state = { ...user };
  return {
    state,
    user: {
      update: vi.fn(
        async ({
          data,
        }: {
          data: {
            failedPasswordAttempts?: number | { increment: number };
            passwordLockedUntil?: Date | null;
          };
        }) => {
          if (data.failedPasswordAttempts !== undefined) {
            state.failedPasswordAttempts =
              typeof data.failedPasswordAttempts === 'number'
                ? data.failedPasswordAttempts
                : state.failedPasswordAttempts + data.failedPasswordAttempts.increment;
          }
          if ('passwordLockedUntil' in data) {
            state.passwordLockedUntil = data.passwordLockedUntil ?? null;
          }
          return { failedPasswordAttempts: state.failedPasswordAttempts };
        },
      ),
    },
  };
}

describe('password lockout (D-72)', () => {
  const now = new Date('2026-09-29T12:00:00Z');

  it('never runs bcrypt while locked, and refuses without comparing', async () => {
    const db = fakeDatabase({
      id: 'user-1',
      passwordHash: await bcrypt.hash('correct', 10),
      failedPasswordAttempts: 0,
      passwordLockedUntil: new Date(now.getTime() + 60_000),
    });
    const compareSpy = vi.spyOn(bcrypt, 'compare');
    expect(await checkPasswordWithLockout(db, db.state, 'correct', now)).toBe('LOCKED');
    expect(compareSpy).not.toHaveBeenCalled();
    compareSpy.mockRestore();
  });

  it('treats an expired lock as unlocked and lets a correct password through', async () => {
    const db = fakeDatabase({
      id: 'user-1',
      passwordHash: await bcrypt.hash('correct', 10),
      failedPasswordAttempts: 0,
      passwordLockedUntil: new Date(now.getTime() - 1000),
    });
    expect(await checkPasswordWithLockout(db, db.state, 'correct', now)).toBe('OK');
  });

  it('locks after the Nth consecutive failure and resets the count', async () => {
    const db = fakeDatabase({
      id: 'user-1',
      passwordHash: await bcrypt.hash('correct', 10),
      failedPasswordAttempts: 0,
      passwordLockedUntil: null,
    });
    for (let attempt = 1; attempt < MAX_FAILED_PASSWORD_ATTEMPTS; attempt += 1) {
      expect(await checkPasswordWithLockout(db, db.state, 'wrong', now)).toBe('INVALID');
      expect(db.state.passwordLockedUntil).toBeNull();
    }
    expect(await checkPasswordWithLockout(db, db.state, 'wrong', now)).toBe('INVALID');
    expect(db.state.failedPasswordAttempts).toBe(0);
    expect(db.state.passwordLockedUntil?.getTime()).toBe(
      now.getTime() + PASSWORD_LOCK_MINUTES * 60_000,
    );
    // The very next attempt is refused as LOCKED, whatever the password is.
    expect(await checkPasswordWithLockout(db, db.state, 'correct', now)).toBe('LOCKED');
  });

  it('resets the failure count on a correct password before the lock threshold', async () => {
    const db = fakeDatabase({
      id: 'user-1',
      passwordHash: await bcrypt.hash('correct', 10),
      failedPasswordAttempts: 0,
      passwordLockedUntil: null,
    });
    await checkPasswordWithLockout(db, db.state, 'wrong', now);
    await checkPasswordWithLockout(db, db.state, 'wrong', now);
    expect(db.state.failedPasswordAttempts).toBe(2);
    expect(await checkPasswordWithLockout(db, db.state, 'correct', now)).toBe('OK');
    expect(db.state.failedPasswordAttempts).toBe(0);
  });

  it('refuses with no password hash and never locks a null-hash account', async () => {
    const db = fakeDatabase({
      id: 'user-1',
      passwordHash: null,
      failedPasswordAttempts: 0,
      passwordLockedUntil: null,
    });
    expect(await checkPasswordWithLockout(db, db.state, 'anything', now)).toBe('INVALID');
    expect(db.user.update).not.toHaveBeenCalled();
  });
});
