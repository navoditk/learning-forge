import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('accessibility', () => {
  test('learner page has no automatically detectable WCAG AA violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recommended next activities' })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('parent page has no automatically detectable WCAG AA violations', async ({ page }) => {
    await page.goto('/parent');
    await expect(page.getByRole('heading', { name: 'Parent evidence' })).toBeVisible();

    const beforeDigest = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(beforeDigest.violations).toEqual([]);

    await page.getByRole('button', { name: 'Get weekly digest' }).click();
    await expect(page.getByText(/completed \d+ attempts? across|has not attempted/)).toBeVisible();

    const afterDigest = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(afterDigest.violations).toEqual([]);
  });
});
