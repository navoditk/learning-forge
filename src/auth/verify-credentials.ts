import bcrypt from 'bcryptjs';

import { prisma } from '../server/prisma';

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

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  return { userId: user.id, email, householdId: user.householdId };
}
