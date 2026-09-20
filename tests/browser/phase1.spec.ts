import { expect, test } from '@playwright/test';

test.describe('synthetic Phase 1 journeys', () => {
  test('learner submits a ratios answer and requests a bounded hint', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Course progress' })).toBeVisible();
    await expect(
      page.getByRole('article').getByText('Ratio language', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recommended next activities' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await page.getByLabel('Your answer').fill('15');
    await page.getByRole('button', { name: 'Submit answer' }).click();

    await expect(page.getByText('Correct — nice work.')).toBeVisible();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.getByRole('heading', { name: 'Tutor' })).toBeVisible();
    await expect(page.getByText('What do you already know?')).toBeVisible();
    await page.getByRole('button', { name: 'Ask for the next hint' }).click();
    await expect(page.getByText('What stays the same as both quantities change?')).toBeVisible();
    await page.getByRole('button', { name: 'Start independent check' }).click();
    await expect(page.getByText('Independent check: correct.')).toBeVisible();
  });

  test('learner can switch to a recommended activity from the plan', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await page
      .getByRole('region', { name: 'Recommended next activities' })
      .getByRole('button', { name: 'Garden rows' })
      .click();
    await expect(page.getByRole('heading', { name: 'Garden rows' })).toBeVisible();
  });

  test('learner can switch programs without mixing curriculum activities', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Subject').selectOption('math-kangaroo-6');
    await expect(page.getByRole('heading', { name: 'Bake sale change' })).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Recommended next activities' })
        .getByText('Multi-step arithmetic reasoning'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Garden rows' })).toHaveCount(0);

    await page.getByLabel('Subject').selectOption('moems-6');
    await expect(page.getByRole('heading', { name: 'Two-digit lock code' })).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Recommended next activities' })
        .getByText('Number and place-value reasoning'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bake sale change' })).toHaveCount(0);

    await page.getByLabel('Subject').selectOption('amc-8');
    await expect(
      page.getByRole('heading', { name: 'Spinner complement probability' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Recommended next activities' })
        .getByText('Counting and probability'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Two-digit lock code' })).toHaveCount(0);

    await page.getByLabel('Subject').selectOption('mathcounts-6');
    await expect(page.getByRole('heading', { name: 'Largest identical bouquets' })).toBeVisible();
    await expect(
      page
        .getByRole('region', { name: 'Recommended next activities' })
        .getByText('Number theory fundamentals'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Spinner complement probability' })).toHaveCount(
      0,
    );
  });

  test('parent can see evidence linked to the learner attempt', async ({ page }) => {
    await page.goto('/parent');

    await expect(page.getByRole('heading', { name: 'Parent evidence' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Course progression' })).toBeVisible();
    await expect(page.getByText('Ratios and proportional reasoning')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Learner' })).toBeVisible();
    await expect(page.getByText('Skill: unit-rates')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent attempts' })).toBeVisible();

    await page.getByRole('button', { name: 'Get weekly digest' }).click();
    await expect(page.getByText(/completed \d+ attempts? across/)).toBeVisible();
  });
});
