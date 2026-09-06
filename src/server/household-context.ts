import { auth } from '../auth';
import { prisma } from './prisma';

export type HouseholdContext = { householdId: string; learnerProfileId: string };

/**
 * Resolves the calling parent's real household/learner from the session
 * (ADR-0010). Only meaningful when invoked from a route handler that Next.js
 * itself is dispatching a real HTTP request to - `auth()` relies on ambient
 * request context, so this cannot be called from a bare unit test that
 * imports a route handler and invokes it directly.
 */
export async function requireHouseholdContext(): Promise<HouseholdContext> {
  const session = await auth();
  const householdId = session?.user?.householdId;
  if (!householdId) throw new Error('Unauthorized');

  const learnerProfile = await prisma.learnerProfile.findFirst({ where: { householdId } });
  if (!learnerProfile) throw new Error('No learner profile for this household');

  return { householdId, learnerProfileId: learnerProfile.id };
}
