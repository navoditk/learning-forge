import { createHmac, timingSafeEqual } from 'node:crypto';

import type { PrismaClient } from '@prisma/client';

import { recordAuditEvent } from '../server/audit-log';
import { checkPasswordWithLockout, type PasswordCheck } from './password-attempts';

/**
 * D-06 step-up re-authentication. A signed-in parent re-enters their password;
 * the server returns a short-lived token bound to that user, household, and
 * issue time. The D-47 lifetime is enforced where the token is consumed, and
 * single use is enforced by a unique index on the override it authorizes.
 */
export type StepUpClaims = { userId: string; householdId: string; issuedAt: Date };

/**
 * Re-verifies the signed-in parent's own password within their household,
 * with D-72 lockout shared with sign-in.
 */
export async function verifyStepUpPassword(
  database: Pick<PrismaClient, 'user' | 'auditLog'>,
  input: { userId: string; householdId: string; password: unknown },
): Promise<PasswordCheck> {
  if (typeof input.password !== 'string' || input.password.length === 0) return 'INVALID';
  const user = await database.user.findUnique({ where: { id: input.userId } });
  if (!user || user.role !== 'PARENT' || user.householdId !== input.householdId) return 'INVALID';
  const check = await checkPasswordWithLockout(database, user, input.password);
  await recordAuditEvent(database, {
    eventType:
      check === 'OK'
        ? 'STEP_UP_SUCCESS'
        : check === 'LOCKED'
          ? 'STEP_UP_LOCKED'
          : 'STEP_UP_FAILURE',
    householdId: user.householdId,
    userId: user.id,
  });
  return check;
}

function signature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(`step-up:${payload}`).digest('base64url');
}

function requireSecret(secret: string | undefined): string {
  if (!secret || secret.length < 32) throw new Error('STEP_UP_SECRET_UNAVAILABLE');
  return secret;
}

export function issueStepUpToken(claims: StepUpClaims, secret: string | undefined): string {
  const payload = Buffer.from(
    JSON.stringify({
      userId: claims.userId,
      householdId: claims.householdId,
      issuedAt: claims.issuedAt.toISOString(),
    }),
  ).toString('base64url');
  return `${payload}.${signature(payload, requireSecret(secret))}`;
}

/**
 * Returns the token's issue time only when its signature is valid and it was
 * issued to this user in this household; anything else is rejected.
 */
export function verifyStepUpToken(
  token: unknown,
  secret: string | undefined,
  expected: { userId: string; householdId: string },
): Date | undefined {
  if (typeof token !== 'string') return undefined;
  const [payload, provided, ...rest] = token.split('.');
  if (!payload || !provided || rest.length > 0) return undefined;
  const expectedSignature = Buffer.from(signature(payload, requireSecret(secret)));
  const providedSignature = Buffer.from(provided);
  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    return undefined;
  }
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >;
    if (claims.userId !== expected.userId || claims.householdId !== expected.householdId) {
      return undefined;
    }
    const issuedAt = typeof claims.issuedAt === 'string' ? new Date(claims.issuedAt) : undefined;
    return issuedAt && !Number.isNaN(issuedAt.getTime()) ? issuedAt : undefined;
  } catch {
    return undefined;
  }
}
