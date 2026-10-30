import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Request, type Route } from '@playwright/test';

// Structured-response learner UI (docs/structured-response-scoring-contract.md
// 3.4, PA-10). No structured item exists in the served catalog, so the server
// session is wrapped here with a SYNTHETIC responseSpec and the attempt, hint
// and check routes are fulfilled by the test. Nothing in this file registers,
// serves or scores curriculum content; correctness below is whatever the test
// fixture says, and the UI under test never computes it.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SCREENSHOT_DIR = process.env.PF_SCREENSHOT_DIR;

const SPEC = {
  mode: 'structured-fields',
  modeVersion: '1',
  fields: [
    {
      key: 'first-term',
      kind: 'number',
      label: 'First term of the ratio',
      representations: ['integer'],
      simplestForm: false,
    },
    {
      key: 'share',
      kind: 'number',
      label: 'Fraction of the bar shaded',
      representations: ['integer', 'fraction', 'mixed-number'],
      simplestForm: true,
    },
    {
      key: 'rate',
      kind: 'number',
      label: 'Speed',
      unitLabel: 'miles per hour',
      representations: ['integer', 'decimal'],
      simplestForm: false,
    },
    {
      key: 'unit',
      kind: 'choice',
      label: 'Which unit names the speed?',
      options: [
        { id: 'opt-1', label: 'miles per hour' },
        { id: 'opt-2', label: 'hours per mile' },
        { id: 'opt-3', label: 'miles' },
      ],
    },
  ],
};

const FIGURE = {
  svgMarkup:
    '<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="10" width="196" height="40" fill="#dddddd" stroke="#222222"/><rect x="2" y="10" width="98" height="40" fill="#7fc2b8" stroke="#222222"/></svg>',
  altText: 'A bar split into equal parts with some parts shaded.',
  caption: 'Synthetic bar model.',
  width: 400,
  height: 120,
};

const TEXT_ALTERNATIVE =
  'The bar has equal parts. Some are shaded. Name the first term, the shaded fraction and the speed with its unit.';

type Mocks = { enabled: boolean; spec: unknown };

async function mockStructuredSession(page: Page, mocks: Mocks = { enabled: true, spec: SPEC }) {
  await page.route('**/api/phase1/session*', async (route) => {
    const response = await route.fetch();
    if (!mocks.enabled || !response.ok()) return route.fulfill({ response });
    const json = await response.json();
    delete json.latestAttempt;
    delete json.latestCheck;
    json.hintCount = 0;
    json.completed = false;
    json.content = {
      ...json.content,
      title: 'Synthetic mixed-answer check',
      prompt: 'Answer each part. This is a synthetic test question.',
      figure: FIGURE,
      accessibleAlternative: TEXT_ALTERNATIVE,
      responseSpec: mocks.spec,
    };
    return route.fulfill({ response, json });
  });
}

type Recorded = { url: string; body: Record<string, unknown> };

function record(request: Request): Recorded {
  return { url: new URL(request.url()).pathname, body: request.postDataJSON() };
}

const MALFORMED = {
  error: 'Check the answer fields and try again.',
  reasonCode: 'MALFORMED_RESPONSE',
  fieldErrors: [
    { key: 'first-term', code: 'NOT_A_NUMBER' },
    { key: 'share', code: 'FORM_NOT_ALLOWED' },
  ],
};

async function fillAll(page: Page) {
  await page.getByLabel('First term of the ratio').fill('3');
  await page.getByLabel('Fraction of the bar shaded').fill('3/4');
  await page.getByLabel('Speed').fill('12.5');
  await page.getByLabel('miles per hour', { exact: true }).check();
}

async function shot(page: Page, name: string) {
  if (!SCREENSHOT_DIR) return;
  await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}.png`, fullPage: true });
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe('structured practice answer fields', () => {
  test('renders labeled controls, hints, units, figure and complete text alternative', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();

    const group = page.getByRole('group', { name: /Your answer: Synthetic mixed-answer check/ });
    await expect(group).toBeVisible();

    const first = page.getByLabel('First term of the ratio');
    const share = page.getByLabel('Fraction of the bar shaded');
    const speed = page.getByLabel('Speed');
    for (const input of [first, share, speed]) {
      await expect(input).toHaveAttribute('type', 'text');
      await expect(input).toHaveAttribute('autocomplete', 'off');
    }
    // Input mode follows the enumerated forms (A-3, R-5).
    await expect(first).toHaveAttribute('inputmode', 'numeric');
    await expect(speed).toHaveAttribute('inputmode', 'decimal');
    await expect(share).toHaveAttribute('inputmode', 'text');

    // Format hint limited to enumerated forms; simplest form only where set.
    await expect(first).toHaveAccessibleDescription('Type a whole number.');
    await expect(share).toHaveAccessibleDescription(
      'Type a whole number, a fraction like 3/4, or a mixed number like 1 1/2. Write it in simplest form.',
    );
    // Unit is visible text and part of the description (A-2).
    await expect(page.getByText('miles per hour', { exact: true }).first()).toBeVisible();
    await expect(speed).toHaveAccessibleDescription(
      'Type a whole number, or a decimal. miles per hour',
    );

    // Choice is a native radio group in its own fieldset.
    const radios = page.getByRole('radiogroup', { name: 'Which unit names the speed?' });
    await expect(radios.getByRole('radio')).toHaveCount(3);
    await expect(radios.locator('input[type=radio]').first()).toHaveAttribute('value', 'opt-1');

    // Figure alt text, caption and the complete text alternative (A-9).
    await expect(page.getByRole('img', { name: FIGURE.altText })).toBeVisible();
    await expect(page.getByText(FIGURE.caption)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Text version of this question' }),
    ).toBeVisible();
    await expect(page.getByText(TEXT_ALTERNATIVE)).toBeVisible();

    // No legacy single-string input in structured mode.
    await expect(page.locator('#learner-response')).toHaveCount(0);
    await shot(page, 'structured-wide-initial');
  });

  test('keyboard-only order follows the authored field order with visible focus', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    const seen: Recorded[] = [];
    await page.route('**/api/phase1/attempt', async (route) => {
      seen.push(record(route.request()));
      await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'INCORRECT' } });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();

    await page.getByLabel('First term of the ratio').focus();
    await page.keyboard.type('3');
    const outline = await page
      .getByLabel('First term of the ratio')
      .evaluate((element) => getComputedStyle(element).outlineWidth);
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Fraction of the bar shaded')).toBeFocused();
    await page.keyboard.type('1 1/2');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Speed')).toBeFocused();
    await page.keyboard.type('12.5');
    await page.keyboard.press('Tab');
    // Native radio group: one tab stop, arrows move and select.
    await expect(page.getByRole('radio', { name: 'miles per hour' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'hours per mile' })).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Submit answer' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();

    expect(outline).toBe('3px');
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toBe('/api/phase1/attempt');
  });

  test('slash and space entry is sent exactly as typed, in structured mode', async ({ page }) => {
    await mockStructuredSession(page);
    const seen: Recorded[] = [];
    await page.route('**/api/phase1/attempt', async (route) => {
      seen.push(record(route.request()));
      await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'CORRECT' } });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();

    const share = page.getByLabel('Fraction of the bar shaded');
    await share.focus();
    await page.keyboard.type('3/4');
    await expect(share).toHaveValue('3/4');
    await page.getByLabel('First term of the ratio').fill('3');
    await page.getByLabel('Speed').fill('4');
    await page.getByLabel('miles per hour', { exact: true }).check();
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Correct — nice work.')).toBeVisible();

    await share.fill('');
    await share.focus();
    await page.keyboard.type('1 1/2');
    await expect(share).toHaveValue('1 1/2');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect.poll(() => seen.length).toBe(2);

    const sessionId = seen[0].body.sessionId;
    expect(seen[0].body).toEqual({
      sessionId,
      structuredResponse: {
        mode: 'structured-fields',
        modeVersion: '1',
        fields: { 'first-term': '3', share: '3/4', rate: '4', unit: 'opt-1' },
      },
    });
    expect(seen[1].body.structuredResponse).toMatchObject({ fields: { share: '1 1/2' } });
    // Mode is never inferred from answer text: no legacy key is sent.
    for (const request of seen) expect(request.body).not.toHaveProperty('learnerResponse');
  });

  test('a format refusal shows an accessible summary, keeps values and retries cleanly', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    const seen: Recorded[] = [];
    await page.route('**/api/phase1/attempt', async (route) => {
      seen.push(record(route.request()));
      if (seen.length === 1) {
        await route.fulfill({ status: 422, json: MALFORMED });
      } else {
        await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'INCORRECT' } });
      }
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();

    await page.getByLabel('First term of the ratio').fill('abc');
    await page.getByLabel('Fraction of the bar shaded').fill('0.5');
    await page.getByLabel('Speed').fill('12.5');
    await page.getByLabel('miles per hour', { exact: true }).check();
    await page.getByRole('button', { name: 'Submit answer' }).click();

    // Summary is an alert, lists each message and receives focus (A-5).
    const summary = page.getByRole('alert').filter({ hasText: 'Check your answer' });
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('listitem')).toHaveCount(2);
    await expect(summary).toContainText(
      'First term of the ratio: That is not a number we can read.',
    );
    await expect(summary).toContainText(
      'Fraction of the bar shaded: This way of writing the number',
    );

    // Each invalid field is flagged and described; valid ones are not.
    const first = page.getByLabel('First term of the ratio');
    await expect(first).toHaveAttribute('aria-invalid', 'true');
    await expect(first).toHaveAccessibleDescription(/Error: That is not a number we can read\./);
    await expect(page.getByLabel('Speed')).not.toHaveAttribute('aria-invalid', 'true');

    // Values preserved; nothing recorded, advanced or scored.
    await expect(first).toHaveValue('abc');
    await expect(page.getByLabel('Fraction of the bar shaded')).toHaveValue('0.5');
    await expect(page.getByRole('radio', { name: 'miles per hour' })).toBeChecked();
    await expect(page.getByText(/Correct —|Not yet\./)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /hint/i })).toHaveCount(0);
    // Refusal text carries no correctness, answers or submitted values.
    const summaryText = (await summary.textContent()) ?? '';
    expect(summaryText).not.toMatch(/correct|wrong|should be|abc|0\.5/i);

    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
    await shot(page, 'structured-wide-error');

    // The summary link moves focus to the field.
    await summary.getByRole('link', { name: /^First term of the ratio/ }).click();
    await expect(first).toBeFocused();

    // Editing clears that field's message only; the other stays announced.
    await first.fill('3');
    await expect(first).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Fraction of the bar shaded')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await page.getByLabel('Fraction of the bar shaded').fill('1/2');
    await expect(summary).toHaveCount(0);

    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();
    expect(seen).toHaveLength(2);
    expect(seen[1].body.structuredResponse).toMatchObject({
      fields: { 'first-term': '3', share: '1/2' },
    });
  });

  test('a choice refusal flags the radio group and non-field refusals are general', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    let call = 0;
    await page.route('**/api/phase1/attempt', async (route) => {
      call += 1;
      if (call === 1) {
        await route.fulfill({
          status: 422,
          json: {
            error: 'x',
            reasonCode: 'MALFORMED_RESPONSE',
            fieldErrors: [{ key: 'unit', code: 'NOT_AN_OPTION' }],
          },
        });
      } else {
        await route.fulfill({
          status: 422,
          json: { error: 'x', reasonCode: 'RESPONSE_MODE_MISMATCH' },
        });
      }
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();

    const group = page.getByRole('radiogroup', { name: 'Which unit names the speed?' });
    await expect(group).toHaveAccessibleDescription(/Choose one of the choices\./);
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    const summary = page.getByRole('alert').filter({ hasText: 'Check your answer' });
    await expect(summary).toBeFocused();
    await summary.getByRole('link', { name: /Which unit names the speed/ }).click();
    await expect(page.getByRole('radio', { name: 'miles per hour' })).toBeFocused();
    // Correcting the choice clears the invalid state; focus stays on the radio.
    await page.getByRole('radio', { name: 'hours per mile' }).check();
    await expect(group).not.toHaveAttribute('aria-invalid', 'true');
    await expect(group).not.toHaveAccessibleDescription(/Choose one/);
    await expect(page.getByRole('radio', { name: 'hours per mile' })).toBeFocused();
    await page.getByRole('radio', { name: 'miles per hour' }).check();

    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(summary).toContainText('needs to be reloaded');
    await expect(summary.getByRole('link')).toHaveCount(0);
    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
  });

  test('empty parts are reported without sending a request or recording an attempt', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    const seen: Recorded[] = [];
    await page.route('**/api/phase1/attempt', async (route) => {
      seen.push(record(route.request()));
      await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'CORRECT' } });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();

    await page.getByLabel('First term of the ratio').fill('3');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    const summary = page.getByRole('alert').filter({ hasText: 'Check your answer' });
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('listitem')).toHaveCount(3);
    await expect(summary).toContainText('Enter an answer for this part.');
    // REQUIRED on the choice group exposes the invalid state too (A-5).
    await expect(
      page.getByRole('radiogroup', { name: 'Which unit names the speed?' }),
    ).toHaveAttribute('aria-invalid', 'true');
    expect(seen).toHaveLength(0);
    await expect(page.getByText(/Correct —|Not yet\./)).toHaveCount(0);
  });

  test('a pending submission cannot be duplicated and recovers afterwards', async ({ page }) => {
    await mockStructuredSession(page);
    const seen: Recorded[] = [];
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/phase1/attempt', async (route: Route) => {
      seen.push(record(route.request()));
      await gate;
      await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'CORRECT' } });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);

    const submit = page.getByRole('button', { name: 'Submit answer' });
    await submit.click();
    const pending = page.getByRole('button', { name: 'Submitting…' });
    await expect(pending).toHaveAttribute('aria-disabled', 'true');
    await expect(pending).toBeFocused();
    // Playwright treats aria-disabled as not actionable; force real clicks.
    await pending.click({ force: true });
    await pending.click({ force: true });
    await page.getByLabel('Speed').press('Enter');
    await page.waitForTimeout(250);
    expect(seen).toHaveLength(1);

    release();
    await expect(page.getByText('Correct — nice work.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit answer' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(seen).toHaveLength(1);
  });

  test('feedback stays item-level: no per-field correctness is shown', async ({ page }) => {
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', async (route) => {
      await route.fulfill({
        json: {
          attemptId: crypto.randomUUID(),
          correctness: 'INCORRECT',
          // Not part of the contract; if a server ever sent it the UI must not render it.
          fieldResults: { 'first-term': 'CORRECT', share: 'INCORRECT' },
        },
      });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();

    const status = page
      .getByRole('status')
      .filter({ hasText: 'Not yet. Your attempt is recorded.' });
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('main')).not.toContainText(/fieldResults|CORRECT|INCORRECT/);
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await shot(page, 'structured-wide-result');
  });

  test('hint and independent check carry structured entries; a check refusal keeps values', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    const seen: Recorded[] = [];
    await page.route('**/api/phase1/attempt', async (route) => {
      await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'INCORRECT' } });
    });
    await page.route('**/api/phase1/hint', async (route) => {
      seen.push(record(route.request()));
      await route.fulfill({
        json: {
          response: {
            status: 'ok',
            move: { learnerMessage: 'Synthetic hint.', question: 'What do you notice?' },
          },
        },
      });
    });
    await page.route('**/api/phase1/check', async (route) => {
      seen.push(record(route.request()));
      if (seen.filter((entry) => entry.url.endsWith('/check')).length === 1) {
        await route.fulfill({ status: 422, json: MALFORMED });
      } else {
        await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'CORRECT' } });
      }
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.getByText('Synthetic hint.')).toBeVisible();
    expect(seen[0].body.learnerMessage).toBe(
      'First term of the ratio: 3; Fraction of the bar shaded: 3/4; Speed: 12.5 miles per hour; Which unit names the speed?: miles per hour',
    );

    await page.getByRole('button', { name: 'Start independent check' }).click();
    const summary = page.getByRole('alert').filter({ hasText: 'Check your answer' });
    await expect(summary).toBeFocused();
    await expect(page.getByLabel('First term of the ratio')).toHaveValue('3');
    await expect(page.getByText(/Independent check:/)).toHaveCount(0);
    expect(seen[1].body.structuredResponse).toMatchObject({ mode: 'structured-fields' });
    expect(seen[1].body).not.toHaveProperty('learnerResponse');

    await page.getByLabel('First term of the ratio').fill('3');
    await page.getByLabel('Fraction of the bar shaded').fill('3/4');
    await page.getByRole('button', { name: 'Start independent check' }).click();
    await expect(page.getByText('Independent check: correct.')).toBeVisible();
  });

  test('a session whose descriptor carries an answer-bearing key is refused, not rendered', async ({
    page,
  }) => {
    const sentinel = 'SENTINEL-ANSWER-7731';
    const leaky = {
      ...SPEC,
      fields: [{ ...SPEC.fields[0], correctValue: sentinel }, ...SPEC.fields.slice(1)],
    };
    await mockStructuredSession(page, { enabled: true, spec: leaky });
    await page.goto('/');
    await expect(page.getByText('The learning activity could not be loaded.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit answer' })).toHaveCount(0);
    expect(await page.content()).not.toContain(sentinel);
  });

  test('switching topics resets structured entries and keeps the course navigation', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await page.getByLabel('First term of the ratio').fill('99');

    const toc = page.getByRole('navigation', { name: 'Course table of contents' });
    await toc.getByRole('button', { name: 'Ratio language' }).click();
    await expect(toc.getByRole('button', { name: 'Ratio language' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(page.getByText('Skill 1 of 5')).toBeVisible();
    await expect(page.getByLabel('First term of the ratio')).toHaveValue('');
    await expect(page.getByRole('navigation', { name: /Ratios.*navigation/ })).toBeVisible();
  });
});

test.describe('structured items follow the server-authorized topic state', () => {
  // The default landing activity is whatever session the server issues; the
  // existing page shows an already-authorized session even when the advisory
  // course plan lists its topic as blocked (docs/learner-presentation-design.md).
  // The structured form must neither add to nor hide that honest topic status.
  test('the topic status notice is identical for legacy and structured sessions', async ({
    page,
  }) => {
    // The default session's topic may or may not be offered depending on the
    // shared household's earlier evidence, so assert parity, not a fixed state.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await expect(page.getByLabel('Your answer')).toBeVisible();
    const topicHeading = page.getByText(/^Topic: /);
    await expect(topicHeading).toHaveCount(1);
    const legacyTopic = await topicHeading.textContent();
    const legacyBlocked = await page.getByText('Not offered yet').count();

    const structured = await page.context().newPage();
    await mockStructuredSession(structured);
    await structured.goto('/');
    await expect(
      structured.getByRole('heading', { name: 'Synthetic mixed-answer check' }),
    ).toBeVisible();
    await expect(structured.getByText(/^Topic: /)).toHaveText(legacyTopic ?? '');
    await expect(structured.getByText('Not offered yet')).toHaveCount(legacyBlocked);
    await structured.close();
  });

  test('a structured item opened from an offered topic shows no blocked notice', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    const toc = page.getByRole('navigation', { name: 'Course table of contents' });
    await toc.getByRole('button', { name: 'Ratio language' }).click();
    await expect(page.getByText('Skill 1 of 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await expect(page.getByText('Not offered yet')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Submit answer' })).toBeVisible();
    await shot(page, 'structured-wide-offered-topic');
  });
});

// Stale-response and failure handling. `__bodyGate` makes response BODY parsing
// wait (headers have already arrived), the exact window where a late response
// for activity A used to attach to activity B.
async function installBodyGate(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __bodyGate?: Promise<void>;
      __openGate?: () => void;
    };
    const realFetch = window.fetch.bind(window);
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await realFetch(...args);
      const url = String(args[0] instanceof Request ? args[0].url : args[0]);
      const gate = w.__bodyGate;
      if (!gate || !/\/api\/phase1\/(attempt|check|hint)/.test(url)) return res;
      return new Proxy(res, {
        get(target, prop) {
          if (prop === 'json') {
            return async () => {
              await gate;
              return target.json();
            };
          }
          const value = Reflect.get(target, prop);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    };
  });
}

async function closeGate(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __bodyGate?: Promise<void>; __openGate?: () => void };
    w.__bodyGate = new Promise<void>((resolve) => {
      w.__openGate = resolve;
    });
  });
}

async function openGate(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __bodyGate?: Promise<void>; __openGate?: () => void };
    w.__openGate?.();
    w.__bodyGate = undefined;
  });
}

async function switchToOtherActivity(page: Page) {
  const toc = page.getByRole('navigation', { name: 'Course table of contents' });
  await toc.getByRole('button', { name: 'Ratio language' }).click();
  await expect(page.getByText('Skill 1 of 5')).toBeVisible();
  await expect(page.getByLabel('First term of the ratio')).toHaveValue('');
}

test.describe('late responses never cross activities, and failures are announced', () => {
  const json = (correctness: string) => ({ json: { attemptId: crypto.randomUUID(), correctness } });

  test('a late successful attempt body for activity A does not attach to B; same-session control commits', async ({
    page,
  }) => {
    await installBodyGate(page);
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', (route) => route.fulfill(json('CORRECT')));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();

    // Positive control: same session, delayed body still commits.
    await fillAll(page);
    await closeGate(page);
    const done = page.waitForResponse('**/api/phase1/attempt');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await done;
    await expect(page.getByRole('button', { name: 'Submitting…' })).toBeVisible();
    await openGate(page);
    await expect(page.getByText('Correct — nice work.')).toBeVisible();

    // Negative: switch A -> B before the body resolves.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await closeGate(page);
    const late = page.waitForResponse('**/api/phase1/attempt');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await late;
    await switchToOtherActivity(page);
    await openGate(page);
    await page.waitForTimeout(300);
    await expect(page.getByText(/Correct —|Not yet\./)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Submit answer' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    // B is fully usable with its own state.
    await page.route('**/api/phase1/attempt', (route) => route.fulfill(json('INCORRECT')));
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();
  });

  test('a late refusal body for A shows no summary on B', async ({ page }) => {
    await installBodyGate(page);
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', (route) =>
      route.fulfill({ status: 422, json: MALFORMED }),
    );
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await closeGate(page);
    const late = page.waitForResponse('**/api/phase1/attempt');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await late;
    await switchToOtherActivity(page);
    await openGate(page);
    await page.waitForTimeout(300);
    await expect(page.getByText('Check your answer')).toHaveCount(0);
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await expect(page.getByLabel('First term of the ratio')).not.toBeFocused();
  });

  test('a late hint body for A adds no tutor message or hint count to B', async ({ page }) => {
    await installBodyGate(page);
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', (route) => route.fulfill(json('INCORRECT')));
    await page.route('**/api/phase1/hint', (route) =>
      route.fulfill({
        json: {
          response: {
            status: 'ok',
            move: { learnerMessage: 'Synthetic hint for A.', question: 'Q?' },
          },
        },
      }),
    );
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();

    // Positive control first: an undelayed hint still works for the same session.
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.getByText('Synthetic hint for A.')).toBeVisible();

    await closeGate(page);
    const late = page.waitForResponse('**/api/phase1/hint');
    await page.getByRole('button', { name: 'Ask for the next hint' }).click();
    await late;
    await switchToOtherActivity(page);
    await openGate(page);
    await page.waitForTimeout(300);
    await expect(page.getByText('Synthetic hint for A.')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Tutor' })).toHaveCount(0);
    // B starts at hint count 0: after its own attempt the button offers the first hint.
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByRole('button', { name: 'Ask for a small hint' })).toBeVisible();
  });

  test('a late independent-check result for A neither completes nor annotates B', async ({
    page,
  }) => {
    await installBodyGate(page);
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', (route) => route.fulfill(json('INCORRECT')));
    await page.route('**/api/phase1/hint', (route) =>
      route.fulfill({
        json: { response: { status: 'ok', move: { learnerMessage: 'H', question: 'Q?' } } },
      }),
    );
    await page.route('**/api/phase1/check', (route) => route.fulfill(json('CORRECT')));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.getByRole('button', { name: 'Start independent check' })).toBeVisible();

    await closeGate(page);
    const late = page.waitForResponse('**/api/phase1/check');
    await page.getByRole('button', { name: 'Start independent check' }).click();
    await late;
    await switchToOtherActivity(page);
    await openGate(page);
    await page.waitForTimeout(300);
    await expect(page.getByText(/Independent check/)).toHaveCount(0);
    await expect(page.getByText(/this activity is complete/)).toHaveCount(0);
  });

  test('same-session delayed check body completes the activity (positive control)', async ({
    page,
  }) => {
    await installBodyGate(page);
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', (route) => route.fulfill(json('INCORRECT')));
    await page.route('**/api/phase1/hint', (route) =>
      route.fulfill({
        json: { response: { status: 'ok', move: { learnerMessage: 'H', question: 'Q?' } } },
      }),
    );
    await page.route('**/api/phase1/check', (route) => route.fulfill(json('CORRECT')));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    // SU-H7-FIX2 rev4: wait for the hint body to render before closing the
    // body gate (as the sibling test above does). Without this, closeGate can
    // win the race against the mocked hint body's json(), the hint never
    // resolves and 'Start independent check' never appears (iso-validation-21).
    await expect(page.getByRole('button', { name: 'Start independent check' })).toBeVisible();
    await closeGate(page);
    const sent = page.waitForResponse('**/api/phase1/check');
    await page.getByRole('button', { name: 'Start independent check' }).click();
    await sent;
    await openGate(page);
    await expect(page.getByText('Independent check: correct.')).toBeVisible();
    await expect(page.getByText(/this activity is complete/)).toBeVisible();
  });

  test('a rejected check request is announced, keeps entries and retries without false completion', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', (route) => route.fulfill(json('INCORRECT')));
    await page.route('**/api/phase1/hint', (route) =>
      route.fulfill({
        json: { response: { status: 'ok', move: { learnerMessage: 'H', question: 'Q?' } } },
      }),
    );
    let calls = 0;
    await page.route('**/api/phase1/check', (route) => {
      calls += 1;
      return calls === 1 ? route.abort('failed') : route.fulfill(json('CORRECT'));
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await page.getByRole('button', { name: 'Start independent check' }).click();

    const summary = page.getByRole('alert').filter({ hasText: 'could not be completed' });
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(page.getByLabel('First term of the ratio')).toHaveValue('3');
    await expect(page.getByText(/Independent check:|this activity is complete/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Start independent check' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await page.getByRole('button', { name: 'Start independent check' }).click();
    await expect(page.getByText('Independent check: correct.')).toBeVisible();
    expect(calls).toBe(2);
  });

  test('a rejected submit and a rejected hint are announced for the active activity only', async ({
    page,
  }) => {
    await mockStructuredSession(page);
    let submits = 0;
    await page.route('**/api/phase1/attempt', (route) => {
      submits += 1;
      return submits === 1 ? route.abort('failed') : route.fulfill(json('INCORRECT'));
    });
    await page.route('**/api/phase1/hint', (route) => route.abort('failed'));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'could not be submitted' }),
    ).toBeVisible();
    await expect(page.getByLabel('Fraction of the bar shaded')).toHaveValue('3/4');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'The tutor could not respond.' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tutor' })).toHaveCount(0);
  });

  test('a late transport error for A is not shown on B', async ({ page }) => {
    await mockStructuredSession(page);
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/phase1/attempt', async (route) => {
      await gate;
      await route.abort('failed').catch(() => undefined);
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByRole('button', { name: 'Submitting…' })).toBeVisible();
    await switchToOtherActivity(page);
    release();
    await page.waitForTimeout(300);
    await expect(page.getByRole('alert').filter({ hasText: 'could not be submitted' })).toHaveCount(
      0,
    );
    await expect(page.getByRole('button', { name: 'Submit answer' })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});

// Browser-measured boundary contrast of every structured text input matching
// `selector`, against its own fill and the nearest opaque surrounding surface.
async function measureBorders(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((inputs) => {
    const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const c = [r, g, b].map((v) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (a: number[], b: number[]) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const opaqueAncestor = (element: Element | null): number[] => {
      for (let node = element; node; node = node.parentElement) {
        const rgba = parse(getComputedStyle(node).backgroundColor);
        if (rgba.length === 3 || (rgba.length === 4 && rgba[3] > 0)) return rgba.slice(0, 3);
      }
      return [255, 255, 255];
    };
    return inputs.map((input) => {
      const style = getComputedStyle(input);
      const border = parse(style.borderTopColor).slice(0, 3);
      return {
        focused: document.activeElement === input,
        disabled: (input as HTMLInputElement).disabled,
        width: style.borderTopWidth,
        vsInside: ratio(border, parse(style.backgroundColor).slice(0, 3)),
        vsOutside: ratio(border, opaqueAncestor(input.parentElement)),
      };
    });
  });
}

test.describe('structured input boundaries meet 3:1 in both themes', () => {
  for (const scheme of ['light', 'dark'] as const) {
    test(`normal controls, ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await mockStructuredSession(page);
      await page.goto('/');
      await expect(
        page.getByRole('heading', { name: 'Synthetic mixed-answer check' }),
      ).toBeVisible();
      await page.waitForTimeout(400);
      const ratios = await measureBorders(page, '.structured-fields input[type=text]');
      expect(ratios.length).toBe(3);
      for (const entry of ratios) {
        expect(entry.vsInside).toBeGreaterThanOrEqual(3);
        expect(entry.vsOutside).toBeGreaterThanOrEqual(3);
      }
      console.log(`CONTRAST normal ${scheme} ${JSON.stringify(ratios)}`);
      await shot(page, `structured-normal-controls-${scheme}`);
    });

    test(`unfocused invalid inputs after REQUIRED and format refusals, ${scheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await mockStructuredSession(page);
      await page.route('**/api/phase1/attempt', (route) =>
        route.fulfill({ status: 422, json: MALFORMED }),
      );
      await page.goto('/');
      await expect(
        page.getByRole('heading', { name: 'Synthetic mixed-answer check' }),
      ).toBeVisible();
      const invalid = '.structured-fields input[type=text][aria-invalid=true]';

      // REQUIRED (client precheck): leave Speed and the choice empty.
      await page.getByLabel('First term of the ratio').fill('3');
      await page.getByLabel('Fraction of the bar shaded').fill('3/4');
      await page.getByRole('button', { name: 'Submit answer' }).click();
      const summary = page.getByRole('alert').filter({ hasText: 'Check your answer' });
      await expect(summary).toBeFocused();
      await expect(page.getByLabel('Speed')).toHaveAttribute('aria-invalid', 'true');
      await page.waitForTimeout(400);
      const required = await measureBorders(page, invalid);
      expect(required.length).toBe(1);
      console.log(`CONTRAST required ${scheme} ${JSON.stringify(required)}`);
      await shot(page, `structured-invalid-required-${scheme}`);

      // Format refusal from the server for two number fields.
      await page.getByLabel('Speed').fill('12.5');
      await page.getByLabel('miles per hour', { exact: true }).check();
      await page.getByLabel('First term of the ratio').fill('abc');
      await page.getByLabel('Fraction of the bar shaded').fill('0.5');
      await page.getByRole('button', { name: 'Submit answer' }).click();
      await expect(summary).toContainText('not a number we can read');
      await expect(summary).toBeFocused();
      await page.waitForTimeout(400);
      const format = await measureBorders(page, invalid);
      expect(format.length).toBe(2);
      console.log(`CONTRAST format ${scheme} ${JSON.stringify(format)}`);
      await shot(page, `structured-invalid-format-${scheme}`);

      for (const entry of [...required, ...format]) {
        expect(entry.focused).toBe(false);
        expect(entry.disabled).toBe(false);
        expect(entry.width).toBe('2px');
        expect(entry.vsInside).toBeGreaterThanOrEqual(3);
        expect(entry.vsOutside).toBeGreaterThanOrEqual(3);
      }
      // Normal borders are unchanged by the invalid-state fix.
      const normal = await measureBorders(
        page,
        '.structured-fields input[type=text]:not([aria-invalid])',
      );
      for (const entry of normal) expect(entry.vsInside).toBeGreaterThanOrEqual(4.5);
      // Values are retained.
      await expect(page.getByLabel('First term of the ratio')).toHaveValue('abc');
    });
  }
});

test.describe('legacy items are unchanged', () => {
  test('a legacy session keeps the single labeled input and string request body', async ({
    page,
  }) => {
    const seen: Recorded[] = [];
    await page.route('**/api/phase1/attempt', async (route) => {
      seen.push(record(route.request()));
      await route.fulfill({ json: { attemptId: crypto.randomUUID(), correctness: 'CORRECT' } });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await expect(page.getByRole('group', { name: /Your answer:/ })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Text version of this question' })).toHaveCount(
      0,
    );
    await page.getByLabel('Your answer').fill('15');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Correct — nice work.')).toBeVisible();
    expect(seen).toHaveLength(1);
    expect(Object.keys(seen[0].body).sort()).toEqual(['learnerResponse', 'sessionId']);
    expect(seen[0].body.learnerResponse).toBe('15');
  });

  test('a legacy blank answer still gets the existing recoverable error', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Enter an answer' })).toBeVisible();
    await expect(page.getByLabel('Your answer')).toBeFocused();
  });
});

test.describe('structured layout and accessibility evidence', () => {
  test('axe is clean at wide width, light and dark themes', async ({ page }) => {
    await mockStructuredSession(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      // Buttons transition their colours (120ms); sample after they settle.
      await page.waitForTimeout(500);
      const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(axe.violations, scheme).toEqual([]);
    }
    await shot(page, 'structured-wide-dark');
  });

  test('reflows at 320 CSS px with targets of at least 24 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await mockStructuredSession(page);
    await page.route('**/api/phase1/attempt', async (route) => {
      await route.fulfill({ status: 422, json: MALFORMED });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Synthetic mixed-answer check' })).toBeVisible();
    await expectNoHorizontalScroll(page);

    const targets = page.locator(
      '.structured-fields input, .structured-fields label, button[type=submit]',
    );
    const count = await targets.count();
    for (let index = 0; index < count; index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
    }
    await shot(page, 'structured-narrow-320-initial');

    await fillAll(page);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Check your answer' })).toBeFocused();
    await expectNoHorizontalScroll(page);
    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
    await shot(page, 'structured-narrow-320-error');
  });

  test.describe('touch emulation', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test('3/4 and 1 1/2 can be typed into the fraction field on a touch viewport', async ({
      page,
    }) => {
      await mockStructuredSession(page);
      await page.goto('/');
      await expect(
        page.getByRole('heading', { name: 'Synthetic mixed-answer check' }),
      ).toBeVisible();
      const share = page.getByLabel('Fraction of the bar shaded');
      // A full keyboard is requested (inputmode=text), not a numeric keypad.
      await expect(share).toHaveAttribute('inputmode', 'text');
      await share.tap();
      await page.keyboard.type('3/4');
      await expect(share).toHaveValue('3/4');
      await share.fill('');
      await share.tap();
      await page.keyboard.type('1 1/2');
      await expect(share).toHaveValue('1 1/2');
      await expectNoHorizontalScroll(page);
      await shot(page, 'structured-mobile-390-fraction-entry');
    });
  });
});
