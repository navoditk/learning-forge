import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { clearNeedsHelpLesson, seedNeedsHelpLesson } from '../../playwright/seed-needs-help';
import { E2E_TEST_PARENT_PASSWORD } from '../../playwright/test-account';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('D-70 parent-facing step-up and override', () => {
  let lessonTitle: string;

  test.beforeAll(async () => {
    ({ lessonTitle } = await seedNeedsHelpLesson());
  });

  test.afterAll(async () => {
    await clearNeedsHelpLesson();
  });

  test.afterEach(async () => {
    // Each test starts from a fresh NEEDS_HELP state; re-seed in case a
    // prior test in this file cleared it via a successful override.
    await seedNeedsHelpLesson();
  });

  test('shows the override control only for the lesson that needs help', async ({ page }) => {
    await page.goto('/parent');
    await expect(
      page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }),
    ).toBeVisible();
    // Every other pilot lesson's remediation is NONE and must not show one.
    const overrideButtons = page.getByRole('button', { name: /^Clear “needs help” for/ });
    await expect(overrideButtons).toHaveCount(1);
  });

  test('moves focus into the password form, rejects a wrong password with role=alert, then accepts the right one', async ({
    page,
  }) => {
    await page.goto('/parent');
    await page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }).click();

    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toBeFocused();

    await passwordInput.fill('definitely-the-wrong-password');
    await page.getByRole('button', { name: 'Continue' }).click();
    // Next.js's own route announcer is also role="alert"; scope to ours.
    await expect(page.getByRole('alert').filter({ hasText: /password/i })).toBeVisible();
    // Still on the password step - a wrong password never reaches the
    // override endpoint with a reason attached.
    await expect(passwordInput).toBeVisible();

    await passwordInput.fill(E2E_TEST_PARENT_PASSWORD);
    await page.getByRole('button', { name: 'Continue' }).click();

    const reasonInput = page.getByLabel('Reason', { exact: true });
    await expect(reasonInput).toBeVisible();
    await expect(reasonInput).toBeFocused();
  });

  test('requires a non-empty reason, then applies the override with a role=status confirmation', async ({
    page,
  }) => {
    await page.goto('/parent');
    await page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }).click();
    await page.getByLabel('Password').fill(E2E_TEST_PARENT_PASSWORD);
    await page.getByRole('button', { name: 'Continue' }).click();

    const reasonInput = page.getByLabel('Reason', { exact: true });
    const submit = page.getByRole('button', { name: 'Clear “needs help”' });
    await expect(submit).toBeDisabled();

    await reasonInput.fill('Reviewed the attempts together; learner understands now.');
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page.getByRole('status')).toContainText(`${lessonTitle} is no longer marked`);
    await expect(
      page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }),
    ).toHaveCount(0);
  });

  test('Escape-free keyboard path: Tab reaches the control and Enter activates it', async ({
    page,
  }) => {
    await page.goto('/parent');
    const overrideButton = page.getByRole('button', {
      name: `Clear “needs help” for ${lessonTitle}`,
    });
    await overrideButton.focus();
    await expect(overrideButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Password')).toBeFocused();
  });

  test('cancel returns to the closed state without applying anything', async ({ page }) => {
    await page.goto('/parent');
    await page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(
      page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }),
    ).toBeVisible();
    await expect(page.getByLabel('Password')).toHaveCount(0);
  });

  test('has no automatically detectable WCAG AA violations, closed or mid-flow', async ({
    page,
  }) => {
    await page.goto('/parent');
    await expect(
      page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }),
    ).toBeVisible();
    const closedResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(closedResults.violations).toEqual([]);

    await page.getByRole('button', { name: `Clear “needs help” for ${lessonTitle}` }).click();
    await expect(page.getByLabel('Password')).toBeVisible();
    const passwordStepResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(passwordStepResults.violations).toEqual([]);

    await page.getByLabel('Password').fill(E2E_TEST_PARENT_PASSWORD);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByLabel('Reason', { exact: true })).toBeVisible();
    const reasonStepResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(reasonStepResults.violations).toEqual([]);
  });
});
