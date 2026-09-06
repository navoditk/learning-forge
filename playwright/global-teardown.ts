import { prisma } from '../src/server/prisma';
import { E2E_TEST_PARENT_EMAIL } from './test-account';

export default async function globalTeardown() {
  const existing = await prisma.user.findUnique({ where: { email: E2E_TEST_PARENT_EMAIL } });
  if (existing) {
    await prisma.household.delete({ where: { id: existing.householdId } });
  }
  await prisma.$disconnect();
}
