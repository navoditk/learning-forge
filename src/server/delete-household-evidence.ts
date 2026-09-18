import { PrismaClient } from '@prisma/client';

import { deleteHouseholdData } from './household-data';

/** Compatibility wrapper for existing local/test callers. */
export async function deleteHouseholdEvidence(prisma: PrismaClient, householdId: string) {
  await deleteHouseholdData(prisma, householdId);
}
