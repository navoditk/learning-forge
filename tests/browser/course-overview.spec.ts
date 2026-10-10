import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const RATIOS = 'ratios-and-proportional-reasoning';

test.describe('course overview and topic detail (real server data)', () => {
  test('is opened by the Course overview button without changing the default landing', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('#chapter-heading')).toBeVisible();
    await expect(page.getByLabel('Your answer')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('button', { name: 'Course overview' }).click();
    await expect(page).toHaveURL(/\/\?program=grade-6-math&view=overview$/);
    const heading = page.getByRole('heading', { name: 'Course overview: Grade 6 Math' });
    await expect(heading).toBeFocused();
    await expect(page.getByRole('button', { name: 'Course overview' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).locator('[aria-current="page"]'),
    ).toHaveText('Grade 6 Math');
    await expect(page.getByRole('link', { name: 'Ratios & Proportional Reasoning' })).toBeVisible();
    // Totals are labelled as confirmed topics, never as completion.
    await expect(page.getByText(/topics independently confirmed/).first()).toBeVisible();
    await expect(page.getByText(/\bcomplete(d|ion)?\b/i)).toHaveCount(0);
  });

  test('a topic can be opened with only the keyboard and focus moves to its heading', async ({
    page,
  }) => {
    await page.goto('/?program=grade-6-math&view=overview');
    await expect(
      page.getByRole('heading', { name: 'Course overview: Grade 6 Math' }),
    ).toBeVisible();
    expect(await page.locator('.topic-card a').count()).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Course overview' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#course-overview-heading')).toBeFocused();

    let reached = false;
    for (let step = 0; step < 60 && !reached; step += 1) {
      await page.keyboard.press('Tab');
      reached = (await page.locator('.topic-card a:focus').count()) > 0;
    }
    expect(reached).toBe(true);
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\?program=grade-6-math&domain=[a-z0-9-]+&skill=[a-z0-9-]+$/);
    await expect(page.locator('#topic-heading')).toBeFocused();
    await expect(page.locator('#topic-heading')).toContainText('Topic:');
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).locator('[aria-current="page"]'),
    ).toBeVisible();
    await expect(page.getByText('Number of attempts is not reported')).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/view=overview$/);
    await expect(page.locator('#course-overview-heading')).toBeFocused();
  });

  test('deep links survive reload and work with back and forward', async ({ page }) => {
    const topicUrl = `/?program=grade-6-math&domain=${RATIOS}&skill=ratio-language`;
    await page.goto(topicUrl);
    await expect(page.locator('#topic-heading')).toHaveText('Topic: Ratio language');
    await page.reload();
    await expect(page.locator('#topic-heading')).toHaveText('Topic: Ratio language');
    await expect(page.getByText('Skill 1 of 5')).toBeVisible();

    await page.getByRole('link', { name: 'Grade 6 Math' }).click();
    await expect(page).toHaveURL(/view=overview$/);
    await page.getByRole('link', { name: 'Ratios & Proportional Reasoning' }).click();
    await expect(page).toHaveURL(new RegExp(`view=overview&domain=${RATIOS}$`));
    await expect(
      page.getByRole('heading', { name: 'Ratios & Proportional Reasoning overview' }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/view=overview$/);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`skill=ratio-language$`));
    await expect(page.locator('#topic-heading')).toHaveText('Topic: Ratio language');
    await page.goForward();
    await expect(page).toHaveURL(/view=overview$/);
    await expect(page.locator('#course-overview-heading')).toBeVisible();
  });

  for (const [name, search] of [
    ['an unknown program', '?program=not-a-program'],
    [
      'a skill from another chapter',
      `?program=grade-6-math&domain=number-system&skill=ratio-language`,
    ],
    ['an unknown skill', `?program=grade-6-math&domain=${RATIOS}&skill=does-not-exist`],
    ['an unrecognized parameter', '?program=grade-6-math&learnerId=private-value-123'],
    ['markup in a parameter', `?program=grade-6-math&domain=${RATIOS}&skill=%3Cimg%20src%3Dx%3E`],
  ] as const) {
    test(`rejects ${name} with a harmless notice and the course overview`, async ({ page }) => {
      await page.goto(`/${search}`);
      await expect(page.getByRole('heading', { name: /^Course overview:/ })).toBeVisible();
      await expect(page.getByText('That link was not recognized for this course')).toBeVisible();
      await expect(page.locator('#topic-heading')).toHaveCount(0);
      await expect(page).toHaveURL(/view=overview$/);
      const body = await page.locator('body').innerText();
      expect(body).not.toContain('not-a-program');
      expect(body).not.toContain('private-value-123');
      expect(body).not.toContain('does-not-exist');
      expect(body).not.toContain('<img');
    });
  }
});

test.describe('course overview presentation (real server data)', () => {
  const combos = [
    { scheme: 'light', width: 390, height: 844, label: 'narrow' },
    { scheme: 'light', width: 1280, height: 900, label: 'wide' },
    { scheme: 'dark', width: 390, height: 844, label: 'narrow' },
    { scheme: 'dark', width: 1280, height: 900, label: 'wide' },
  ] as const;

  for (const combo of combos) {
    test(`overview and topic pass axe in ${combo.scheme} ${combo.label}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: combo.width, height: combo.height });
      await page.emulateMedia({ colorScheme: combo.scheme });

      await page.goto('/?program=grade-6-math&view=overview');
      await expect(
        page.getByRole('heading', { name: 'Course overview: Grade 6 Math' }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      const overview = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(overview.violations).toEqual([]);
      const overviewPath = testInfo.outputPath(`overview-${combo.scheme}-${combo.label}.png`);
      await page.screenshot({ path: overviewPath, fullPage: true });
      await testInfo.attach(`overview-${combo.scheme}-${combo.label}`, {
        path: overviewPath,
        contentType: 'image/png',
      });

      await page.goto(`/?program=grade-6-math&domain=${RATIOS}&skill=ratio-language`);
      await expect(page.locator('#topic-heading')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
      const topic = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(topic.violations).toEqual([]);
      const topicPath = testInfo.outputPath(`topic-${combo.scheme}-${combo.label}.png`);
      await page.screenshot({ path: topicPath, fullPage: true });
      await testInfo.attach(`topic-${combo.scheme}-${combo.label}`, {
        path: topicPath,
        contentType: 'image/png',
      });
    });
  }

  test('honours reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?program=grade-6-math&view=overview');
    const card = page.locator('.topic-card').first();
    await expect(card).toBeVisible();
    const duration = await card.evaluate((element) =>
      parseFloat(getComputedStyle(element).transitionDuration),
    );
    expect(duration).toBeLessThan(0.001);
  });
});

// Synthetic fixtures for these tests only; never served by the application.
type Skill = { skillCode: string; title: string; domain: string; status: string; summary: string };
const skill = (skillCode: string, title: string, domain: string, status: string): Skill => ({
  skillCode,
  title,
  domain,
  status,
  summary: '',
});
const MK6 = 'mk6-arithmetic-and-patterns';
const FIXTURES: Record<string, { skills: Skill[]; plan: object }> = {
  'grade-6-math': {
    skills: [
      skill('ratio-language', 'Ratio language', RATIOS, 'PRACTICING'),
      skill('unit-rates', 'Unit rates', RATIOS, 'NOT_STARTED'),
      skill('ratio-tables', 'Ratio tables', RATIOS, 'NOT_STARTED'),
    ],
    plan: {
      items: [
        {
          contentId: 'stub-ratio-language',
          skillCode: 'ratio-language',
          title: 'Stub ratio activity',
          skillTitle: 'Ratio language',
          reason: 'stub',
          estimatedMinutes: 5,
        },
      ],
      totalMinutes: 5,
      blockedSkills: ['unit-rates'],
      unavailableSkills: ['ratio-tables'],
    },
  },
  'math-kangaroo-6': {
    skills: [
      skill('mk6-multi-step-arithmetic-reasoning', 'Stub contest arithmetic', MK6, 'NOT_STARTED'),
    ],
    plan: {
      items: [
        {
          contentId: 'stub-mk6',
          skillCode: 'mk6-multi-step-arithmetic-reasoning',
          title: 'Stub contest activity',
          skillTitle: 'Stub contest arithmetic',
          reason: 'stub',
          estimatedMinutes: 5,
        },
      ],
      totalMinutes: 5,
      blockedSkills: [],
      unavailableSkills: [],
    },
  },
};

type Knobs = {
  hold?: (program: string, resource: string) => Promise<void> | undefined;
  fail?: (program: string, resource: string) => number | 'malformed' | undefined;
  plan?: object;
  session?: (params: URLSearchParams, base: Record<string, unknown>) => object;
  sessionRequests: string[];
  requests: string[];
};

async function stubApi(page: Page, knobs: Partial<Knobs> = {}): Promise<Knobs> {
  const state: Knobs = { sessionRequests: [], requests: [], ...knobs };
  await page.route('**/api/phase1/*', async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const resource = url.pathname.split('/').pop() ?? '';
    if (
      request.method() !== 'GET' ||
      !['progress', 'plan', 'diagnostic', 'review', 'session'].includes(resource)
    ) {
      return route.fallback();
    }
    const program = url.searchParams.get('program') ?? 'grade-6-math';
    state.requests.push(`${resource}:${program}`);
    await state.hold?.(program, resource);
    const failure = state.fail?.(program, resource);
    if (failure === 'malformed') return route.fulfill({ json: { unexpected: true } });
    if (failure) return route.fulfill({ status: failure, json: { error: 'stub' } });
    const fixture = FIXTURES[program];
    if (resource === 'progress') {
      return route.fulfill({
        json: { skills: fixture.skills, recentStrengths: [], nextActivity: null },
      });
    }
    if (resource === 'plan') return route.fulfill({ json: state.plan ?? fixture.plan });
    if (resource === 'session') {
      state.sessionRequests.push(url.search);
      const first = fixture.skills[0];
      const base = {
        sessionId: 'stub-session',
        resumed: false,
        completed: false,
        hintCount: 0,
        learner: { displayName: 'Stub learner' },
        content: {
          id: 'stub-content',
          title: `Stub activity for ${first.title}`,
          skillCode: first.skillCode,
          prompt: 'Stub prompt.',
          accessibilityNotes: 'Stub notes.',
        },
      };
      return route.fulfill({ json: state.session?.(url.searchParams, base) ?? base });
    }
    return route.fulfill({ json: { items: [] } });
  });
  return state;
}

test.describe('overview states with stubbed responses', () => {
  test('shows server-derived status honestly and links only offered topics', async ({ page }) => {
    await stubApi(page);
    await page.goto('/?program=grade-6-math&view=overview');
    await expect(
      page.getByRole('heading', { name: 'Course overview: Grade 6 Math' }),
    ).toBeVisible();

    const offered = page.locator('.topic-card', { hasText: 'Ratio language' });
    await expect(offered.getByRole('link', { name: 'Ratio language' })).toBeVisible();
    await expect(offered).toContainText('Practice evidence recorded');
    await expect(offered).toContainText('Not yet independently confirmed');

    const blocked = page.locator('.topic-card', { hasText: 'Unit rates' });
    await expect(blocked.getByRole('link')).toHaveCount(0);
    await expect(blocked).toContainText('Not offered yet');
    await expect(blocked).toContainText('no further reason is available');

    const unavailable = page.locator('.topic-card', { hasText: 'Ratio tables' });
    await expect(unavailable.getByRole('link')).toHaveCount(0);
    await expect(unavailable).toContainText('No activity is offered for this topic yet.');
    await expect(page.getByText('0 of 3 topics independently confirmed').first()).toBeVisible();
  });

  test('a deep link to a blocked topic fetches and renders no activity', async ({ page }) => {
    const state = await stubApi(page);
    await page.goto(`/?program=grade-6-math&domain=${RATIOS}&skill=unit-rates`);
    await expect(page.locator('#topic-heading')).toHaveText('Topic: Unit rates');
    await expect(page.getByText('Not offered yet. The course plan lists this topic')).toBeVisible();
    await expect(page.getByLabel('Your answer')).toHaveCount(0);
    expect(state.sessionRequests).toEqual([]);
  });

  test('a deep link to an offered topic starts only that topic through the session server', async ({
    page,
  }) => {
    const state = await stubApi(page);
    await page.goto(`/?program=grade-6-math&domain=${RATIOS}&skill=ratio-language`);
    await expect(
      page.getByRole('heading', { name: 'Stub activity for Ratio language' }),
    ).toBeVisible();
    expect(state.sessionRequests).toHaveLength(1);
    expect(state.sessionRequests[0]).toContain('contentId=stub-ratio-language');
  });

  test('without a plan no topic can be opened and the failure is announced with a retry', async ({
    page,
  }) => {
    let planFails = true;
    await stubApi(page, {
      fail: (_program, resource) => (resource === 'plan' && planFails ? 500 : undefined),
    });
    await page.goto('/?program=grade-6-math&view=overview');
    await expect(page.getByText('no topic can be opened from here right now')).toBeVisible();
    await expect(
      page.getByRole('alert').filter({ hasText: 'could not be loaded or refreshed' }),
    ).toBeVisible();
    await expect(page.locator('.topic-card a')).toHaveCount(0);

    planFails = false;
    await page.getByRole('button', { name: 'Reload course information' }).click();
    await expect(page.locator('.topic-card a')).toHaveCount(1);
  });

  test('empty and malformed progress responses never render as a course', async ({ page }) => {
    let mode: 'empty' | 'malformed' = 'empty';
    await page.route('**/api/phase1/progress*', (route) =>
      mode === 'empty'
        ? route.fulfill({ json: { skills: [], recentStrengths: [], nextActivity: null } })
        : route.fulfill({ json: { unexpected: true } }),
    );
    await page.goto('/?program=grade-6-math&view=overview');
    await expect(page.getByText('This course has no topics to show yet.')).toBeVisible();

    mode = 'malformed';
    await page.reload();
    await expect(
      page.getByRole('alert').getByText('The course could not be loaded.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});

test.describe('program switching with stubbed responses', () => {
  test('shows a pending state and never the previous program while loading', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await stubApi(page, {
      hold: (program, resource) =>
        program === 'math-kangaroo-6' && resource === 'progress' ? gate : undefined,
    });
    await page.goto('/');
    const toc = page.getByRole('navigation', { name: 'Course table of contents' });
    await expect(toc.getByRole('button', { name: 'Ratio language' })).toBeVisible();

    await page.getByLabel('Subject').selectOption('math-kangaroo-6');
    await expect(page.getByText('Loading your chapters…')).toBeVisible();
    await expect(toc.getByRole('button', { name: 'Ratio language' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Topic: Ratio language' })).toHaveCount(0);
    await expect(page).toHaveURL(/program=math-kangaroo-6$/);
    await expect(page.getByLabel('Subject')).toHaveValue('math-kangaroo-6');

    release();
    await expect(toc.getByRole('button', { name: 'Stub contest arithmetic' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Stub activity for Stub contest arithmetic' }),
    ).toBeVisible();
  });

  test('a failed load is announced and can be retried without a stale program', async ({
    page,
  }) => {
    let failures = 1;
    const state = await stubApi(page, {
      fail: (program, resource) =>
        program === 'math-kangaroo-6' && resource === 'progress' && failures-- > 0
          ? 500
          : undefined,
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Ratio language' })).toBeVisible();

    await page.getByLabel('Subject').selectOption('math-kangaroo-6');
    await expect(
      page.getByRole('alert').getByText('The course could not be loaded.'),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ratio language' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('button', { name: 'Stub contest arithmetic' })).toBeVisible();
    expect(state.requests.filter((entry) => entry === 'progress:math-kangaroo-6')).toHaveLength(2);
  });

  test('a late response for a program the learner left is discarded', async ({ page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await stubApi(page, {
      hold: (program, resource) =>
        program === 'math-kangaroo-6' && resource === 'progress' ? gate : undefined,
    });
    await page.goto('/');
    const toc = page.getByRole('navigation', { name: 'Course table of contents' });
    await expect(toc.getByRole('button', { name: 'Ratio language' })).toBeVisible();

    await page.getByLabel('Subject').selectOption('math-kangaroo-6');
    await expect(page.getByText('Loading your chapters…')).toBeVisible();
    await page.getByLabel('Subject').selectOption('grade-6-math');
    await expect(toc.getByRole('button', { name: 'Ratio language' })).toBeVisible();

    release();
    await page.waitForTimeout(250);
    await expect(toc.getByRole('button', { name: 'Stub contest arithmetic' })).toHaveCount(0);
    await expect(toc.getByRole('button', { name: 'Ratio language' })).toBeVisible();
  });

  test('a failed activity load shows a retry that restarts only that request', async ({ page }) => {
    let failures = 1;
    const state = await stubApi(page, {
      fail: (_program, resource) => (resource === 'session' && failures-- > 0 ? 500 : undefined),
    });
    await page.goto('/');
    await expect(
      page.getByRole('alert').getByText('The learning activity could not be loaded.'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(
      page.getByRole('heading', { name: 'Stub activity for Ratio language' }),
    ).toBeVisible();
    expect(state.sessionRequests).toHaveLength(1);
  });
});

test.describe('session continuity and authorization with stubbed responses', () => {
  const defaultSession = (skillCode: string, title: string) => ({
    sessionId: 'stub-default-session',
    resumed: true,
    completed: false,
    hintCount: 0,
    learner: { displayName: 'Stub learner' },
    content: {
      id: 'stub-default-content',
      title,
      skillCode,
      prompt: 'Stub prompt.',
      accessibilityNotes: 'Stub notes.',
    },
  });
  const offeredPlan = (blocked: string[]) => ({
    items: ['ratio-language', 'ratio-tables'].map((skillCode) => ({
      contentId: `stub-${skillCode}`,
      skillCode,
      title: `Stub ${skillCode} activity`,
      skillTitle: skillCode,
      reason: 'stub',
      estimatedMinutes: 5,
    })),
    totalMinutes: 10,
    blockedSkills: blocked,
    unavailableSkills: [],
  });

  test('an advisory plan that lists the default skill as blocked never hides the authorized session', async ({
    page,
  }) => {
    const state = await stubApi(page, { plan: offeredPlan(['ratio-language']) });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Stub activity for Ratio language' }),
    ).toBeVisible();
    await expect(page.getByLabel('Your answer')).toBeVisible();
    expect(state.sessionRequests).toHaveLength(1);
  });

  test('a deep link to a topic is started once the failed plan recovers', async ({ page }) => {
    let planFails = true;
    const state = await stubApi(page, {
      fail: (_program, resource) => (resource === 'plan' && planFails ? 500 : undefined),
    });
    await page.goto(`/?program=grade-6-math&domain=${RATIOS}&skill=ratio-language`);
    await expect(page.locator('#topic-heading')).toHaveText('Topic: Ratio language');
    await expect(
      page.getByRole('alert').filter({ hasText: 'could not be loaded or refreshed' }),
    ).toBeVisible();
    expect(state.sessionRequests).toEqual([]);

    planFails = false;
    await page.getByRole('button', { name: 'Reload course information' }).click();
    await expect(
      page.getByRole('heading', { name: 'Stub activity for Ratio language' }),
    ).toBeVisible();
    expect(state.sessionRequests).toHaveLength(1);
  });

  test('returning from the overview keeps the recorded attempt and hints without a new request', async ({
    page,
  }) => {
    const state = await stubApi(page, {
      session: (_params, base) => ({
        ...base,
        hintCount: 2,
        latestAttempt: { attemptId: 'stub-attempt', correctness: 'INCORRECT' },
      }),
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Ask for the next hint' })).toBeVisible();

    await page.getByRole('button', { name: 'Course overview' }).click();
    await expect(page).toHaveURL(/view=overview/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Ask for the next hint' })).toBeVisible();
    expect(state.sessionRequests).toHaveLength(1);
  });

  test('returning to a deep-linked topic keeps its draft, tutor and check without a new request', async ({
    page,
  }) => {
    const state = await stubApi(page, {
      session: (params, base) => ({
        ...base,
        content: { ...(base.content as object), id: params.get('contentId') ?? 'stub-content' },
      }),
    });
    await page.route('**/api/phase1/attempt', (route) =>
      route.fulfill({ json: { attemptId: 'stub-attempt', correctness: 'INCORRECT' } }),
    );
    await page.route('**/api/phase1/hint', (route) =>
      route.fulfill({
        json: {
          response: {
            status: 'OK',
            move: { learnerMessage: 'Stub tutor message.', question: 'Stub tutor question?' },
          },
        },
      }),
    );
    await page.route('**/api/phase1/check', (route) =>
      route.fulfill({ json: { attemptId: 'stub-check', correctness: 'INCORRECT' } }),
    );

    await page.goto(`/?program=grade-6-math&domain=${RATIOS}&skill=ratio-language`);
    const answer = page.getByLabel('Your answer');
    await answer.fill('first try');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.getByText('Stub tutor message.')).toBeVisible();
    await page.getByRole('button', { name: 'Start independent check' }).click();
    await expect(page.getByText('Independent check: not yet.')).toBeVisible();
    await answer.fill('second draft');

    await page.getByRole('button', { name: 'Course overview' }).click();
    await expect(page).toHaveURL(/view=overview/);
    await page.goBack();
    await expect(page).toHaveURL(/skill=ratio-language/);

    await expect(page.getByLabel('Your answer')).toHaveValue('second draft');
    await expect(page.getByText('Stub tutor message.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ask for the next hint' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start independent check' })).toBeVisible();
    await expect(page.getByText('Independent check: not yet.')).toBeVisible();
    expect(state.sessionRequests).toHaveLength(1);
  });

  test('the default activity is restored after browsing another topic', async ({ page }) => {
    const state = await stubApi(page, {
      plan: offeredPlan(['unit-rates']),
      session: (params, base) =>
        params.get('contentId')
          ? base
          : defaultSession('unit-rates', 'Stub default activity for Unit rates'),
    });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Stub default activity for Unit rates' }),
    ).toBeVisible();

    const toc = page.getByRole('navigation', { name: 'Course table of contents' });
    await toc.getByRole('button', { name: 'Ratio language' }).click();
    await expect(
      page.getByRole('heading', { name: 'Stub activity for Ratio language' }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Stub default activity for Unit rates' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Stub activity for Ratio language' }),
    ).toHaveCount(0);
    expect(state.sessionRequests).toHaveLength(3);
  });

  const invalidSessions: Array<[string, (base: Record<string, unknown>) => object]> = [
    ['latestAttempt', (base) => ({ ...base, latestAttempt: { unexpected: true } })],
    ['latestCheck', (base) => ({ ...base, latestCheck: { attemptId: 7, correctness: 'CORRECT' } })],
    [
      'figure',
      (base) => ({
        ...base,
        content: { ...(base.content as object), figure: { unexpected: true } },
      }),
    ],
    ['version', (base) => ({ ...base, content: { ...(base.content as object), version: {} } })],
  ];
  for (const [field, corrupt] of invalidSessions) {
    test(`a session with an invalid ${field} is rejected with a retry`, async ({ page }) => {
      await stubApi(page, { session: (_params, base) => corrupt(base) });
      await page.goto('/');
      await expect(
        page.getByRole('alert').getByText('The learning activity could not be loaded.'),
      ).toBeVisible();
      await expect(page.getByLabel('Your answer')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
    });
  }
});
