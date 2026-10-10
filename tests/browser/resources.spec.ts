import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('curriculum resources reference index', () => {
  test('is reachable from the main page and filters by dossier with the keyboard', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    await nav.getByRole('link', { name: 'Curriculum resources' }).click();
    await expect(page).toHaveURL(/\/resources$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Curriculum resources' }),
    ).toBeVisible();

    await page.getByLabel('Search title, issuer, or address').focus();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Program / research dossier')).toBeFocused();
    // Native type-ahead commits an option directly; ArrowDown only opens the popup in Chromium.
    await page.keyboard.press('A');
    await expect(page.getByLabel('Program / research dossier')).toHaveValue('amc-8-research');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Source type')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Apply filters' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/dossier=amc-8-research/);
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('external links are labelled as leaving the app and unreviewed for children', async ({
    page,
  }) => {
    await page.goto('/resources?dossier=iac-national-geography-bee-grade-6-research');
    const external = page.locator('a[target="_blank"]');
    expect(await external.count()).toBeGreaterThan(0);
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
      await expect(link).toContainText('leaves Learning Forge');
    }
    await expect(page.getByText('not reviewed for children').first()).toBeVisible();
    await expect(page.getByText('Research pending content-owner review').first()).toBeVisible();
  });

  test('search shows an empty state and never turns input into a link', async ({ page }) => {
    await page.goto('/resources');
    await page.getByLabel('Search title, issuer, or address').fill('javascript:alert(1)');
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page.getByText('No resources match these filters')).toBeVisible();
    await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
  });

  test('is usable on a narrow phone viewport without horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/resources?dossier=amc-8-research');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [1280, 360]) {
      test(`passes WCAG 2.2 AA axe in ${scheme} at ${width}px`, async ({ page }, testInfo) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/resources?dossier=amc-8-research');
        await expect(page.getByRole('article').first()).toBeVisible();
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(results.violations).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`resources-${scheme}-${width}.png`),
          fullPage: true,
        });
      });
    }
  }

  test('the Permalink link opens a standalone, reloadable view of one resource', async ({
    page,
  }) => {
    await page.goto('/resources?dossier=amc-8-research');
    const first = page.getByRole('article').first();
    const id = (await first.getAttribute('id')) as string;
    expect(id).toMatch(/^amc-8-research-[0-9a-f]{8}/);
    await first.getByRole('link', { name: /Permalink/ }).click();
    await expect(page).toHaveURL(new RegExp(`/resources\\?ref=${id}$`));
    for (const phase of ['after click', 'after reload']) {
      if (phase === 'after reload') await page.reload();
      await expect(page.getByRole('article'), phase).toHaveCount(1);
      const card = page.locator(`article[id="${id}"]`);
      // The ?ref= view does not scroll or focus the card; it is below the intro and filters.
      await expect(card, phase).toBeVisible();
      await expect(card.locator('code').first(), phase).toHaveText(id);
    }
  });

  test('an unknown reference shows a notice instead of a silent empty result', async ({ page }) => {
    await page.goto('/resources?ref=does-not-exist');
    await expect(page.getByRole('status').filter({ hasText: 'was not found' })).toBeVisible();
  });
});
