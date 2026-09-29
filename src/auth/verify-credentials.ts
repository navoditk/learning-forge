import bcrypt from 'bcryptjs';

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
  if (!user || user.role !== 'PARENT' || !user.passwordHash) return null;

  // D-72: a locked account is refused without a password comparison.
  const check = await checkPasswordWithLockout(prisma, user, password);
  if (check !== 'OK') return null;

  return { userId: user.id, email, householdId: user.householdId };
}
