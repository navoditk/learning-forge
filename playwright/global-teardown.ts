import { deleteHouseholdEvidence } from '../src/server/delete-household-evidence';
import { prisma } from '../src/server/prisma';
import { E2E_TEST_PARENT_EMAIL } from './test-account';

export default async function globalTeardown() {
  const existing = await prisma.user.findUnique({ where: { email: E2E_TEST_PARENT_EMAIL } });
  if (existing) {
    await deleteHouseholdEvidence(prisma, existing.householdId);
  }
  await prisma.$disconnect();
}
