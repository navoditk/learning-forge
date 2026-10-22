import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const NOTE =
  'Grade 6 Science rows come from practice checks on provided cell models, two items per topic. They do not show mastery of a full science standard, investigation skills or building models.';

const MATH_ROW = {
  skillCode: 'unit-rates',
  estimate: 1,
  confidenceBand: 'MEDIUM',
  independentDelayedCheck: false,
};
const SCIENCE_ROW = {
  skillCode: 'sci6-cells-evidence-of-life',
  estimate: 0.55,
  confidenceBand: 'LOW',
  independentDelayedCheck: true,
};

const MATH_TEXT =
  'Skill: unit-rates — estimate 1, confidence medium. Independent confirmation still needed.';
const SCIENCE_TEXT =
  'Skill: sci6-cells-evidence-of-life — estimate 0.55, confidence low. Independently confirmed.';

/** Synthetic fixture for the evidence endpoint; no real household data. */
async function mockEvidence(page: Page, mastery: unknown[]) {
  await page.route('**/api/phase1/parent', (route) =>
    route.fulfill({ json: { learnerName: 'Synthetic learner', attempts: [], mastery } }),
  );
}

test.describe('parent Science evidence note (SU-E5)', () => {
  test('fixture 1: empty mastery shows no note', async ({ page }) => {
    await mockEvidence(page, []);
    await page.goto('/parent');
    await expect(page.getByText('No mastery evidence yet.')).toBeVisible();
    await expect(page.getByText(NOTE)).toHaveCount(0);
  });

  test('fixture 2: Math-only mastery shows the exact row and no note', async ({ page }) => {
    await mockEvidence(page, [MATH_ROW]);
    await page.goto('/parent');
    await expect(page.getByRole('listitem').filter({ hasText: 'Skill: unit-rates' })).toHaveText(
      MATH_TEXT,
    );
    await expect(page.getByText(NOTE)).toHaveCount(0);
  });

  test('fixture 3: Math plus Science shows both rows and the note exactly once', async ({
    page,
  }) => {
    await mockEvidence(page, [MATH_ROW, SCIENCE_ROW]);
    await page.goto('/parent');
    await expect(page.getByRole('listitem').filter({ hasText: 'Skill: unit-rates' })).toHaveText(
      MATH_TEXT,
    );
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Skill: sci6-cells-evidence-of-life' }),
    ).toHaveText(SCIENCE_TEXT);
    await expect(page.getByText(NOTE, { exact: true })).toHaveCount(1);
    await expect(page.getByText(NOTE, { exact: true })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
