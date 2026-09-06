import { PrismaClient } from '@prisma/client';

/**
 * Deletes a household and everything under it. `MasteryContribution.attempt`
 * uses `onDelete: Restrict` deliberately, to protect evidence integrity in
 * real use - so contribution/estimate rows must be deleted before the
 * household cascade reaches `Attempt`, or Postgres rejects it with a foreign
 * key violation. Test/local-only cleanup, not a production deletion workflow.
 */
export async function deleteHouseholdEvidence(prisma: PrismaClient, householdId: string) {
  await prisma.masteryContribution.deleteMany({ where: { attempt: { householdId } } });
  await prisma.masteryEstimate.deleteMany({ where: { householdId } });
  // deleteMany (not delete): safe to call even if the household doesn't
  // exist yet, which callers rely on for idempotent setup/teardown.
  await prisma.household.deleteMany({ where: { id: householdId } });
}
