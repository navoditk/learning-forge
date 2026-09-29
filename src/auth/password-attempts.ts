import bcrypt from 'bcryptjs';

/** D-72: consecutive failed password checks before the account locks. */
export const MAX_FAILED_PASSWORD_ATTEMPTS = 5;
/** D-72: how long a locked account refuses password checks. */
export const PASSWORD_LOCK_MINUTES = 15;

export type PasswordCheck = 'OK' | 'INVALID' | 'LOCKED';

/**
 * The minimal `user.update` surface `checkPasswordWithLockout` needs. A
 * structural type, not `Pick<PrismaClient, 'user'>`, so a test double can
 * supply just this method instead of the whole generated delegate.
 */
export type PasswordLockoutDatabase = {
  user: {
    update(args: {
      where: { id: string };
      data: {
        failedPasswordAttempts?: number | { increment: number };
        passwordLockedUntil?: Date | null;
      };
      select?: { failedPasswordAttempts: true };
    }): Promise<{ failedPasswordAttempts: number }>;
  };
};

/**
 * Checks a password for a user with D-72 lockout. A locked account is refused
 * without running bcrypt, so repeated guesses cost neither a comparison nor
 * CPU. A correct password clears the count; the fifth consecutive failure
 * locks the account for the lock period and restarts the count.
 */
export async function checkPasswordWithLockout(
  database: PasswordLockoutDatabase,
  user: {
    id: string;
    passwordHash: string | null;
    failedPasswordAttempts: number;
    passwordLockedUntil: Date | null;
  },
  password: string,
  now: Date = new Date(),
): Promise<PasswordCheck> {
  if (user.passwordLockedUntil && user.passwordLockedUntil > now) return 'LOCKED';
  if (!user.passwordHash) return 'INVALID';
  if (await bcrypt.compare(password, user.passwordHash)) {
    if (user.failedPasswordAttempts > 0 || user.passwordLockedUntil) {
      await database.user.update({
        where: { id: user.id },
        data: { failedPasswordAttempts: 0, passwordLockedUntil: null },
      });
    }
    return 'OK';
  }
  const updated = await database.user.update({
    where: { id: user.id },
    data: { failedPasswordAttempts: { increment: 1 } },
    select: { failedPasswordAttempts: true },
  });
  if (updated.failedPasswordAttempts >= MAX_FAILED_PASSWORD_ATTEMPTS) {
    await database.user.update({
      where: { id: user.id },
      data: {
        failedPasswordAttempts: 0,
        passwordLockedUntil: new Date(now.getTime() + PASSWORD_LOCK_MINUTES * 60_000),
      },
    });
  }
  return 'INVALID';
}
