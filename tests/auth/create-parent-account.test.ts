import { PrismaClient } from '@prisma/client';
import { afterAll, describe, expect, it } from 'vitest';

import { createParentAccount } from '../../scripts/create-parent-account';
import { verifyParentCredentials } from '../../src/auth/verify-credentials';
import { deleteHouseholdEvidence } from '../../src/server/delete-household-evidence';

const prisma = new PrismaClient();
const testEmail = 'auth-test-parent@example.com';
let createdHouseholdId: string | undefined;

describe('parent account provisioning and credential verification', () => {
  afterAll(async () => {
    if (createdHouseholdId) {
      await deleteHouseholdEvidence(prisma, createdHouseholdId);
    }
    await prisma.$disconnect();
  });

  it('creates a household, parent, and learner profile with a hashed (not plaintext) password', async () => {
    const result = await createParentAccount({
      email: testEmail,
      password: 'correct horse battery staple',
      grade: 6,
      // Bypasses the single-real-account guard deliberately: this test must
      // not depend on whether some other real account already exists in
      // this database (it also must not collide with the synthetic fixture,
      // which the guard is specifically designed to ignore - see the next test).
      force: true,
    });
    expect(result.status).toBe('created');
    if (result.status !== 'created') throw new Error('unreachable');
    createdHouseholdId = result.householdId;

    const parentUser = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(parentUser?.role).toBe('PARENT');
    expect(parentUser?.passwordHash).toBeTruthy();
    expect(parentUser?.passwordHash).not.toBe('correct horse battery staple');

    const learnerProfile = await prisma.learnerProfile.findUnique({
      where: { id: result.learnerProfileId },
    });
    expect(learnerProfile?.gradeLevel).toBe(6);
    expect(learnerProfile?.householdId).toBe(createdHouseholdId);
  });

  it('refuses to create a second real parent account without --force', async () => {
    const result = await createParentAccount({
      email: 'someone-else@example.com',
      password: 'another-password',
      grade: 6,
      force: false,
    });
    expect(result.status).toBe('refused');

    const secondAccount = await prisma.user.findUnique({
      where: { email: 'someone-else@example.com' },
    });
    expect(secondAccount).toBeNull();
  });

  it('verifies correct credentials and rejects wrong password, unknown email, and malformed input', async () => {
    await expect(
      verifyParentCredentials(testEmail, 'correct horse battery staple'),
    ).resolves.toMatchObject({ email: testEmail, householdId: createdHouseholdId });

    await expect(verifyParentCredentials(testEmail, 'wrong password')).resolves.toBeNull();
    await expect(verifyParentCredentials('unknown@example.com', 'anything')).resolves.toBeNull();
    await expect(verifyParentCredentials(undefined, 'anything')).resolves.toBeNull();
    await expect(verifyParentCredentials(testEmail, undefined)).resolves.toBeNull();
    await expect(verifyParentCredentials(testEmail, '')).resolves.toBeNull();
  });
});
