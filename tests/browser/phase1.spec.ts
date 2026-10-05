import { expect, test } from '@playwright/test';

test.describe('synthetic Phase 1 journeys', () => {
  test('learner submits a ratios answer and requests a bounded hint', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Course progress' })).toBeVisible();
    await expect(
      page.getByRole('article').getByText('Ratio language', { exact: true }),
    ).toBeVisible();
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

  test('learner can switch to a different skill from the chapter sidebar', async ({ page }) => {
    await page.goto('/');
    const toc = page.getByRole('navigation', { name: 'Course table of contents' });

    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await toc.getByRole('button', { name: 'Ratio language' }).click();

    // Ratio language practices from a small rotating pool of problems, so
    // this asserts the navigation state moved (not a specific problem
    // title): the sidebar highlights the new skill, the chapter pager
    // agrees, and the old activity is gone.
    await expect(toc.getByRole('button', { name: 'Ratio language' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(page.getByText('Skill 1 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toHaveCount(0);
  });

  test('learner can page forward and backward through a chapter', async ({ page }) => {
    await page.goto('/');
    const pager = page.getByRole('navigation', {
      name: 'Ratios & Proportional Reasoning navigation',
    });

    // The default activity (Bicycle pace) practices unit rates, skill 2 of
    // 5 in the Ratios chapter - shown even though unit rates has an unmet
    // prerequisite, since it's the activity actually loaded.
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await expect(page.getByText('Skill 2 of 5')).toBeVisible();

    // Paging back reaches ratio language (skill 1), which has a queued
    // practice item (problem title not asserted - it rotates).
    await pager.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Skill 1 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toHaveCount(0);

    // Paging forward past unit rates now shows its locked status instead
    // of the stale ratio-language activity - Back/Next keeps the whole
    // chapter browsable without ever showing the wrong activity under the
    // wrong skill.
    await pager.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Skill 2 of 5')).toBeVisible();
    await expect(page.getByText('Finish earlier skills in this chapter first')).toBeVisible();

    await pager.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Skill 1 of 5')).toBeVisible();
  });

  test('learner can switch programs without mixing curriculum activities', async ({ page }) => {
    await page.goto('/');

    const toc = page.getByRole('navigation', { name: 'Course table of contents' });

    await page.getByLabel('Subject').selectOption('math-kangaroo-6');
    await expect(page.getByRole('heading', { name: 'Bake sale change' })).toBeVisible();
    await expect(toc.getByText('Multi-step arithmetic reasoning')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Garden rows' })).toHaveCount(0);

    await page.getByLabel('Subject').selectOption('moems-6');
    await expect(page.getByRole('heading', { name: 'Two-digit lock code' })).toBeVisible();
    await expect(toc.getByText('Number and place-value reasoning')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bake sale change' })).toHaveCount(0);

    await page.getByLabel('Subject').selectOption('amc-8');
    await expect(
      page.getByRole('heading', { name: 'Spinner complement probability' }),
    ).toBeVisible();
    await expect(toc.getByText('Counting and probability')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Two-digit lock code' })).toHaveCount(0);

    await page.getByLabel('Subject').selectOption('mathcounts-6');
    await expect(page.getByRole('heading', { name: 'Largest identical bouquets' })).toBeVisible();
    await expect(toc.getByText('Number theory fundamentals')).toBeVisible();
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
