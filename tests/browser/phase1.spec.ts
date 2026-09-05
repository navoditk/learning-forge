import { expect, test } from '@playwright/test';

test.describe('synthetic Phase 1 journeys', () => {
  test('learner submits a ratios answer and requests a bounded hint', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await page.getByLabel('Your answer').fill('15');
    await page.getByRole('button', { name: 'Submit answer' }).click();

    await expect(page.getByText('Correct — nice work.')).toBeVisible();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.getByRole('heading', { name: 'Tutor' })).toBeVisible();
    await expect(page.getByText('What do you already know?')).toBeVisible();
  });

  test('parent can see evidence linked to the learner attempt', async ({ page }) => {
    await page.goto('/parent');

    await expect(page.getByRole('heading', { name: 'Parent evidence' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Synthetic learner' })).toBeVisible();
    await expect(page.getByText('Skill: unit-rates')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent attempts' })).toBeVisible();
  });
});
