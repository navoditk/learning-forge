import bcrypt from 'bcryptjs';

import { recordAuditEvent } from '../server/audit-log';
import { prisma } from '../server/prisma';
import { checkPasswordWithLockout } from './password-attempts';

export type AuthenticatedParent = {
  userId: string;
  email: string;
  householdId: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyParentCredentials(
  email: unknown,
  password: unknown,
): Promise<AuthenticatedParent | null> {
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  if (email.length === 0 || password.length === 0) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'PARENT' || !user.passwordHash) {
    // No household/user to attribute this to - deliberately not logging the
    // attempted email (minimization), but a count of unattributed failures
    // is still useful for spotting enumeration attempts.
    await recordAuditEvent(prisma, { eventType: 'LOGIN_FAILURE' });
    return null;
  }

  // D-72: a locked account is refused without a password comparison.
  const check = await checkPasswordWithLockout(prisma, user, password);
  if (check !== 'OK') {
    await recordAuditEvent(prisma, {
      eventType: check === 'LOCKED' ? 'LOGIN_LOCKED' : 'LOGIN_FAILURE',
      householdId: user.householdId,
      userId: user.id,
    });
    return null;
  }

  await recordAuditEvent(prisma, {
    eventType: 'LOGIN_SUCCESS',
    householdId: user.householdId,
    userId: user.id,
  });
  return { userId: user.id, email, householdId: user.householdId };
}
