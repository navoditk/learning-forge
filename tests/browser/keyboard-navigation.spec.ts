import { expect, test } from '@playwright/test';

test.describe('keyboard operability', () => {
  test('learner can complete the core loop using only the keyboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();

    await page.getByLabel('Your answer').focus();
    await expect(page.getByLabel('Your answer')).toBeFocused();
    await page.keyboard.type('15');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Submit answer' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Correct — nice work.')).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Ask for a small hint' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Tutor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ask for the next hint' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('What stays the same as both quantities change?')).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Start independent check' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Independent check: correct.')).toBeVisible();
  });

  test('parent can request the weekly digest using only the keyboard', async ({ page }) => {
    await page.goto('/parent');
    await expect(page.getByRole('heading', { name: 'Parent evidence' })).toBeVisible();

    await page.getByRole('button', { name: 'Get weekly digest' }).focus();
    await expect(page.getByRole('button', { name: 'Get weekly digest' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/completed \d+ attempts? across|has not attempted/)).toBeVisible();
  });
});
