import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Request } from '@playwright/test';

// Python predict-the-output learner UI (PYTHON-IMPLEMENT C7, dossier 5.1, 7.2).
// No Python item exists in the served catalog, so the server session is wrapped
// here with a SYNTHETIC code listing and answer kind, and the attempt route is
// fulfilled by the test. Nothing in this file registers, serves or scores
// curriculum content, and no code is ever run: correctness below is whatever the
// fixture says, and the UI under test never computes it.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const TITLE = 'Synthetic python output item';

const LISTING = {
  language: 'python',
  languageVersion: '3.14',
  source: 'for i in range(2):\n    print("a long literal that forces horizontal scrolling")',
  showLineNumbers: true,
  structureDescription: 'A loop header on line 1; line 2 is indented four spaces inside the loop.',
};

async function mockPythonSession(page: Page) {
  await page.route('**/api/phase1/session*', async (route) => {
    const response = await route.fetch();
    if (!response.ok()) return route.fulfill({ response });
    const json = await response.json();
    delete json.latestAttempt;
    delete json.latestCheck;
    json.hintCount = 0;
    json.completed = false;
    json.content = {
      ...json.content,
      title: TITLE,
      prompt: 'What does this program print? This is a synthetic test question.',
      accessibleAlternative: 'A loop runs twice and prints one fixed sentence each time.',
      answerKind: 'python_output',
      codeListing: LISTING,
    };
    delete json.content.figure;
    delete json.content.responseSpec;
    return route.fulfill({ response, json });
  });
}

type Recorded = { url: string; body: Record<string, unknown> };
const record = (request: Request): Recorded => ({
  url: new URL(request.url()).pathname,
  body: request.postDataJSON(),
});

async function open(page: Page) {
  await mockPythonSession(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: TITLE })).toBeVisible();
}

test.describe('python predict-the-output answer UI', () => {
  test('keeps the indentation and exposes a labelled, keyboard-scrollable listing', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await open(page);

    const text = await page.locator('.code-listing code').evaluate((element) => {
      return (element as HTMLElement).innerText;
    });
    expect(text).toContain('for i in range(2):');
    expect(text).toContain('    print("a long literal');

    const region = page.getByRole('region', { name: `Python code: ${TITLE}` });
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(region).toHaveAccessibleDescription(/indented four spaces inside the loop/);
    await expect(page.locator('.code-listing pre code')).toHaveCount(1);
    await expect(page.getByRole('button', { name: /run|copy/i })).toHaveCount(0);

    // Reachable by keyboard and scrollable at 320 CSS px.
    await region.focus();
    await expect(region).toBeFocused();
    const outline = await region.evaluate((element) => getComputedStyle(element).outlineWidth);
    expect(outline).toBe('3px');
    const before = await region.evaluate((element) => element.scrollLeft);
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => region.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(before);

    // The page itself never scrolls sideways; only the listing region does.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    // Gutter numbers are generated content: not part of the selectable text.
    expect(text).not.toMatch(/^\s*1\s*for/m);
  });

  test('the answer control is a multi-line textarea with no autocapitalize, autocorrect or spellcheck', async ({
    page,
  }) => {
    await open(page);
    const answer = page.getByLabel('What does this program print?');
    await expect(answer).toHaveJSProperty('tagName', 'TEXTAREA');
    await expect(answer).toHaveAttribute('autocapitalize', 'off');
    await expect(answer).toHaveAttribute('autocorrect', 'off');
    await expect(answer).toHaveAttribute('spellcheck', 'false');
    await expect(answer).toHaveAccessibleDescription(/each printed line on its own line/);
    const family = await answer.evaluate((element) => getComputedStyle(element).fontFamily);
    expect(family.toLowerCase()).toMatch(/mono|menlo|consolas|courier/);
    await expect(page.locator('#learner-response')).toHaveCount(0);
    // No model hint control for a python item.
    await expect(page.getByRole('button', { name: /hint/i })).toHaveCount(0);

    await answer.focus();
    await page.keyboard.type('a');
    await page.keyboard.press('Enter');
    await page.keyboard.type('b');
    await expect(answer).toHaveValue('a\nb');
  });

  test('sends the raw text untrimmed through the submit button', async ({ page }) => {
    await open(page);
    const seen: Recorded[] = [];
    await page.route('**/api/phase1/attempt', async (route) => {
      seen.push(record(route.request()));
      await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'INCORRECT' } });
    });
    await page.getByLabel('What does this program print?').fill('  a\nb\n');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();
    expect(seen).toHaveLength(1);
    expect(seen[0].body).toEqual({
      sessionId: seen[0].body.sessionId,
      pythonResponse: '  a\nb\n',
    });
  });

  test('an invalid response is announced, keeps the text and focus, and says nothing about correctness', async ({
    page,
  }) => {
    await open(page);
    await page.route('**/api/phase1/attempt', async (route) => {
      await route.fulfill({
        status: 422,
        json: {
          error: 'Use plain keyboard characters and straight quotes.',
          reasonCode: 'INVALID_RESPONSE',
          reason: 'DISALLOWED_CHARACTER',
        },
      });
    });
    const answer = page.getByLabel('What does this program print?');
    await answer.fill('“hi”');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'plain keyboard characters' });
    await expect(alert).toHaveText('Use plain keyboard characters and straight quotes.');
    await expect(answer).toHaveAttribute('aria-invalid', 'true');
    await expect(answer).toHaveAccessibleDescription(/straight quotes/);
    await expect(answer).toBeFocused();
    await expect(answer).toHaveValue('“hi”');
    await expect(page.locator('.activity-panel').getByText(/correct|not yet/i)).toHaveCount(0);

    // Editing clears the message.
    await page.keyboard.type('x');
    await expect(alert).toHaveCount(0);
  });

  test('Tab order reaches the listing region, then the textarea, then Submit (real key presses)', async ({
    page,
  }) => {
    await open(page);
    const region = page.getByRole('region', { name: `Python code: ${TITLE}` });
    const answer = page.getByLabel('What does this program print?');
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    let reached = false;
    for (let presses = 0; presses < 120 && !reached; presses += 1) {
      await page.keyboard.press('Tab');
      reached = await region.evaluate((element) => element === document.activeElement);
    }
    expect(reached, 'the listing region is reachable with Tab').toBe(true);
    await page.keyboard.press('Tab');
    await expect(answer).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Submit answer' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(answer).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(region).toBeFocused();
  });

  test('stays usable at the viewport equivalent of 200% zoom (640 CSS px wide)', async ({
    page,
  }) => {
    // A 1280 px wide window at 200% zoom exposes 640 CSS px; this is the
    // viewport-equivalent check, not a screen-reader or browser-zoom proof.
    await page.setViewportSize({ width: 640, height: 400 });
    await open(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole('region', { name: `Python code: ${TITLE}` })).toBeVisible();
    const answer = page.getByLabel('What does this program print?');
    await answer.scrollIntoViewIfNeeded();
    await expect(answer).toBeVisible();
    await answer.fill('a\nb');
    const submit = page.getByRole('button', { name: 'Submit answer' });
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeVisible();
    expect((await answer.boundingBox())!.width).toBeLessThanOrEqual(640);
  });

  test('axe finds no WCAG 2.2 AA violations, including in the error state', async ({ page }) => {
    await open(page);
    const scan = async () => {
      // Let the button's hover transition finish so contrast is measured at rest.
      await page.mouse.move(0, 0);
      await page.waitForTimeout(400);
      return new AxeBuilder({ page }).withTags(WCAG_TAGS).include('.activity-panel').analyze();
    };
    expect((await scan()).violations).toEqual([]);

    await page.route('**/api/phase1/attempt', async (route) => {
      await route.fulfill({
        status: 422,
        json: { error: 'x', reasonCode: 'INVALID_RESPONSE', reason: 'EMPTY' },
      });
    });
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'Type at least one line.' }),
    ).toBeVisible();
    expect((await scan()).violations).toEqual([]);

    await page.setViewportSize({ width: 320, height: 800 });
    expect((await scan()).violations).toEqual([]);
  });
});
