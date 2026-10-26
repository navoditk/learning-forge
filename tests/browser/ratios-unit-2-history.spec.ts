import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { clearNeedsHelpLesson, seedNeedsHelpLesson } from '../../playwright/seed-needs-help';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const HISTORY_SECTION = 'section[aria-labelledby="course-history-heading"]';
const ACTIVE_SECTION = 'section[aria-labelledby="course-progress-heading"]';

/**
 * RAT-INTEGRATE RI-5 (D-255): the learner and parent earlier-version (history)
 * sections after grade-6-math@1.1.0 activation, keyboard reach of the
 * historical override, and an axe check of the history section. The history
 * state is a synthetic NEEDS_HELP row on ratio-language-lesson@1.0.0.
 */
test.describe('Ratios unit 2.0.0 earlier-version history (C7-A)', () => {
  let lessonTitle: string;
  let overrideName: string;

  test.beforeAll(async () => {
    ({ lessonTitle } = await seedNeedsHelpLesson('1.0.0'));
    overrideName = `Clear “needs help” for ${lessonTitle} (earlier version 1.0.0)`;
  });

  test.afterAll(async () => {
    await clearNeedsHelpLesson('1.0.0');
  });

  async function tabUntilFocused(page: Page, target: Locator): Promise<number> {
    for (let presses = 1; presses <= 150; presses += 1) {
      await page.keyboard.press('Tab');
      if (await target.evaluate((element) => element === document.activeElement)) return presses;
    }
    throw new Error('The historical override control was not reachable with Tab');
  }

  test('parent sees the active 2.0.0 section and a separate earlier-versions section', async ({
    page,
  }) => {
    await page.goto('/parent');
    const active = page.locator(ACTIVE_SECTION);
    await expect(active.getByRole('heading', { name: 'Course progression' })).toBeVisible();
    await expect(active.getByText('Double number lines')).toBeVisible();
    await expect(active.getByText('Percent applications')).toBeVisible();
    // Active lessons keep unqualified labels; no active lesson needs help here.
    await expect(active.getByRole('button', { name: /^Clear “needs help” for/ })).toHaveCount(0);

    const history = page.locator(HISTORY_SECTION);
    await expect(page.getByRole('heading', { name: 'Earlier course versions' })).toBeVisible();
    await expect(
      history.getByRole('heading', {
        name: 'Earlier version 1.0.0: Ratios and proportional reasoning',
      }),
    ).toBeVisible();
    await expect(history.locator('strong', { hasText: lessonTitle })).toBeVisible();
    await expect(history.getByRole('button', { name: overrideName, exact: true })).toBeVisible();
  });

  test('learner sees a read-only earlier-versions section with no override', async ({ page }) => {
    await page.goto('/');
    const history = page.locator(HISTORY_SECTION);
    await expect(history.getByRole('heading', { name: 'Earlier course versions' })).toBeVisible();
    await expect(history.locator('strong', { hasText: lessonTitle })).toBeVisible();
    await expect(history.getByRole('button')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Clear “needs help”/ })).toHaveCount(0);
    await expect(
      page
        .locator(ACTIVE_SECTION)
        .getByRole('heading', { name: 'Ratios and proportional reasoning' }),
    ).toBeVisible();
  });

  test('page ids stay unique with both sections present', async ({ page }) => {
    for (const path of ['/', '/parent']) {
      await page.goto(path);
      await expect(page.locator(HISTORY_SECTION)).toBeVisible();
      const duplicates = await page.evaluate(() => {
        const seen = new Map<string, number>();
        for (const element of document.querySelectorAll('[id]')) {
          seen.set(element.id, (seen.get(element.id) ?? 0) + 1);
        }
        return [...seen].filter(([, count]) => count > 1).map(([id]) => id);
      });
      expect(duplicates, path).toEqual([]);
    }
  });

  test('keyboard: Tab reaches the historical override and Enter opens the password step', async ({
    page,
  }) => {
    await page.goto('/parent');
    const button = page.getByRole('button', { name: overrideName, exact: true });
    await expect(button).toBeVisible();
    await tabUntilFocused(page, button);
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByLabel('Password')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  });

  test('the history section has no automatically detectable WCAG AA violations', async ({
    page,
  }) => {
    for (const path of ['/', '/parent']) {
      await page.goto(path);
      await expect(page.locator(HISTORY_SECTION)).toBeVisible();
      const results = await new AxeBuilder({ page })
        .include(HISTORY_SECTION)
        .withTags(WCAG_TAGS)
        .analyze();
      expect(results.violations, path).toEqual([]);
    }
    // The whole parent page with the history section present.
    await page.goto('/parent');
    await expect(page.locator(HISTORY_SECTION)).toBeVisible();
    const full = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(full.violations).toEqual([]);
  });
});
