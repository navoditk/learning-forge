import { expect, test, type Page } from '@playwright/test';

// SP-2 / H-2 (D-339): model hints are disabled for snsb6- items. These run
// against the real served Spelling item (no content is added or scored here);
// the session is only rewritten for the stale-client case.

const HONEST = 'Hints are not available for this activity yet.';
const SPELLING_URL =
  '/?program=scripps-spelling-bee-6&domain=snsb6-orthography&skill=snsb6-orthographic-patterns';

async function openSpelling(page: Page, patch?: Record<string, unknown>) {
  if (patch) {
    await page.route('**/api/phase1/session*', async (route) => {
      const response = await route.fetch();
      if (!response.ok()) return route.fulfill({ response });
      const json = await response.json();
      json.content = { ...json.content, ...patch };
      return route.fulfill({ response, json });
    });
  }
  await page.goto(SPELLING_URL);
  await expect(page.getByLabel('Your answer')).toBeVisible();
}

async function submitWrongAnswer(page: Page) {
  await page.getByLabel('Your answer').fill('wrong answer');
  await page.getByRole('button', { name: 'Submit answer' }).click();
  await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();
}

// A fresh learner meets the Spelling skill as a placement item (no hint control
// in that mode); once that attempt is recorded the same skill opens as practice.
async function openSpellingPractice(page: Page, patch?: Record<string, unknown>) {
  await openSpelling(page, patch);
  await page.getByLabel('Your answer').fill('wrong answer');
  await page.getByRole('button', { name: 'Submit answer' }).click();
  const placement = page.getByText('recorded for placement');
  const practice = page.getByText('Not yet. Your attempt is recorded.');
  await expect(placement.or(practice)).toBeVisible();
  if (await placement.isVisible()) {
    await page.goto(SPELLING_URL);
    await submitWrongAnswer(page);
  }
}

test.describe('Spelling hint suppression (SP-2 H-2)', () => {
  test('a snsb6- activity has no hint control and says so honestly', async ({ page }) => {
    let hintCalls = 0;
    await page.route('**/api/phase1/hint', (route) => {
      hintCalls += 1;
      return route.abort();
    });
    await openSpellingPractice(page);
    await expect(page.getByText(HONEST)).toBeVisible();
    await expect(page.getByRole('button', { name: /hint/i })).toHaveCount(0);
    await expect(page.getByText('comes from a computer program')).toHaveCount(0);
    expect(hintCalls).toBe(0);
  });

  test('a forced MODEL_TUTORING_DISABLED 403 shows the same wording', async ({ page }) => {
    // A stale client that still shows the control: the flag is forced true.
    await page.route('**/api/phase1/hint', (route) =>
      route.fulfill({
        status: 403,
        json: {
          error: 'Model-generated hints are not available for this activity.',
          reasonCode: 'MODEL_TUTORING_DISABLED',
        },
      }),
    );
    await openSpellingPractice(page, { modelHintsAvailable: true });
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.locator('#learner-response-error')).toHaveText(HONEST);
    await expect(page.getByText('The tutor could not respond.')).toHaveCount(0);
  });

  test('another failure still says the tutor could not respond', async ({ page }) => {
    await page.route('**/api/phase1/hint', (route) =>
      route.fulfill({ status: 500, json: { error: 'boom' } }),
    );
    await page.goto('/');
    await submitWrongAnswer(page);
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.locator('#learner-response-error')).toHaveText(
      'The tutor could not respond.',
    );
  });

  test('a hint 403 that arrives after the learner moved on shows no message', async ({ page }) => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let answered = false;
    await page.route('**/api/phase1/hint', async (route) => {
      await gate;
      answered = true;
      await route.fulfill({
        status: 403,
        json: { error: 'x', reasonCode: 'MODEL_TUTORING_DISABLED' },
      });
    });
    await page.goto('/');
    await submitWrongAnswer(page);
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    const toc = page.getByRole('navigation', { name: 'Course table of contents' });
    await toc.getByRole('button', { name: 'Ratio language' }).click();
    await expect(page.getByText('Skill 1 of 5')).toBeVisible();
    release();
    await expect.poll(() => answered).toBe(true);
    await page.waitForTimeout(300);
    await expect(page.getByText(HONEST)).toHaveCount(0);
    await expect(page.getByText('The tutor could not respond.')).toHaveCount(0);
  });

  test('a Math activity still shows the hint control', async ({ page }) => {
    await page.goto('/');
    await submitWrongAnswer(page);
    await expect(page.getByRole('button', { name: 'Ask for a small hint' })).toBeVisible();
    await expect(page.getByText(HONEST)).toHaveCount(0);
  });

  test('the Spelling answer input switches off correction aids; Math keeps defaults', async ({
    page,
  }) => {
    await openSpelling(page);
    const input = page.getByLabel('Your answer');
    await expect(input).toHaveAttribute('spellcheck', 'false');
    await expect(input).toHaveAttribute('autocorrect', 'off');
    await expect(input).toHaveAttribute('autocapitalize', 'off');
    await expect(input).toHaveAttribute('autocomplete', 'off');
  });

  test('the Math answer input does not gain the spelling attributes', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Your answer');
    await expect(input).not.toHaveAttribute('spellcheck', 'false');
    await expect(input).not.toHaveAttribute('autocorrect', 'off');
    await expect(input).not.toHaveAttribute('autocapitalize', 'off');
  });
});
