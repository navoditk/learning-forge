import { expect, test } from '@playwright/test';

import { E2E_TEST_PARENT_EMAIL, E2E_TEST_PARENT_PASSWORD } from '../../playwright/test-account';

test.describe('authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unauthenticated visitors are redirected to the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

    await page.goto('/parent');
    await expect(page).toHaveURL(/\/login/);
  });

  test('wrong password is rejected and the visitor stays logged out', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_TEST_PARENT_EMAIL);
    await page.getByLabel('Password').fill('definitely-the-wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Incorrect email or password.')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('correct credentials sign the parent in', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(E2E_TEST_PARENT_EMAIL);
    await page.getByLabel('Password').fill(E2E_TEST_PARENT_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/');
  });

  test('after being redirected from a protected page, login sends the parent back there', async ({
    page,
  }) => {
    await page.goto('/parent');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fparent/);

    await page.getByLabel('Email').fill(E2E_TEST_PARENT_EMAIL);
    await page.getByLabel('Password').fill(E2E_TEST_PARENT_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/parent');
  });
});
