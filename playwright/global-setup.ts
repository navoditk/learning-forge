import { chromium, type FullConfig } from '@playwright/test';

import { createParentAccount } from '../scripts/create-parent-account';
import { deleteHouseholdEvidence } from '../src/server/delete-household-evidence';
import { prisma } from '../src/server/prisma';
import {
  AUTH_STORAGE_STATE_PATH,
  E2E_TEST_PARENT_EMAIL,
  E2E_TEST_PARENT_PASSWORD,
} from './test-account';

async function removeStaleTestAccount() {
  const existing = await prisma.user.findUnique({ where: { email: E2E_TEST_PARENT_EMAIL } });
  if (existing) {
    await deleteHouseholdEvidence(prisma, existing.householdId);
  }
}

export default async function globalSetup(config: FullConfig) {
  await removeStaleTestAccount();

  // force: true because this is a disposable e2e test account, not the
  // single real household ADR-0008 scopes the product to; the "only one
  // real account" guard is a product policy for provisioning, not a
  // constraint on repeatable test runs.
  const result = await createParentAccount({
    email: E2E_TEST_PARENT_EMAIL,
    password: E2E_TEST_PARENT_PASSWORD,
    grade: 6,
    force: true,
  });
  if (result.status !== 'created') {
    throw new Error(`Failed to provision the e2e test parent account: ${result.reason}`);
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://127.0.0.1:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Email').fill(E2E_TEST_PARENT_EMAIL);
  await page.getByLabel('Password').fill(E2E_TEST_PARENT_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`${baseURL}/`);
  await page.context().storageState({ path: AUTH_STORAGE_STATE_PATH });
  await browser.close();

  await prisma.$disconnect();
}
