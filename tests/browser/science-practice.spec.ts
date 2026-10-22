import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

import { E2E_TEST_PARENT_EMAIL } from '../../playwright/test-account';
import { contentCatalog } from '../../src/content/catalog';
import { PHASE_1_MASTERY_VERSION } from '../../src/phase1/service';
import { prisma } from '../../src/server/prisma';

/**
 * SU-E3 (SCI6-ACTIVATION-CANDIDATE): the Grade 6 Science learner journeys with
 * Science available. Three serial journeys (placement, practice with hint and
 * independent check, review) against the shared disposable e2e learner, with
 * item-level feedback and refusal/retry. The review journey seeds one
 * synthetic confirmed mastery row aged 15 days; afterAll removes every
 * Science row this spec created. Math overview counts must be unchanged.
 */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PROGRAM = 'grade-6-science';
const LABEL = 'Grade 6 Science (Cells unit, practice only)';
const OVERVIEW = `/?program=${PROGRAM}&view=overview`;
const MATH_OVERVIEW = '/?program=grade-6-math&view=overview';
const EOL = 'sci6-cells-evidence-of-life';
const EOL_TOPIC = 'Evidence that living things are made of cells';
const DAY_MS = 24 * 60 * 60 * 1000;

type Choice = {
  key: string;
  label: string;
  options: { id: string; label: string }[];
  correct: string;
};

function choicesOf(id: string): { title: string; fields: Choice[] } {
  const item = contentCatalog.find((candidate) => candidate.id === id);
  if (!item || item.deterministicValidator.type !== 'structured') {
    throw new Error(`${id} is not a structured record`);
  }
  return {
    title: item.title,
    fields: item.deterministicValidator.fields.map((field) => {
      if (field.kind !== 'choice') throw new Error('unexpected non-choice field');
      return {
        key: field.key,
        label: field.label,
        options: field.options.map((option) => ({ id: option.id, label: option.label })),
        correct: field.correctOptionId,
      };
    }),
  };
}

async function choose(page: Page, field: Choice, optionId: string) {
  const label = field.options.find((option) => option.id === optionId)!.label;
  await page
    .getByRole('radiogroup', { name: field.label })
    .getByLabel(label, { exact: true })
    .check();
}

/** Selects every field correctly, or deliberately wrong in the first field. */
async function answer(page: Page, id: string, wrongFirst = false) {
  const { fields } = choicesOf(id);
  for (const [index, field] of fields.entries()) {
    const wrong = field.options.find((option) => option.id !== field.correct)!.id;
    await choose(page, field, wrongFirst && index === 0 ? wrong : field.correct);
  }
}

async function shot(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await info.attach(name, { path, contentType: 'image/png' });
}

async function expectAxeClean(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function learnerProfileId() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_TEST_PARENT_EMAIL } });
  const profile = await prisma.learnerProfile.findFirstOrThrow({
    where: { householdId: user.householdId },
  });
  return { householdId: user.householdId, learnerProfileId: profile.id };
}

async function removeScienceRows() {
  const { learnerProfileId: learner } = await learnerProfileId();
  const attempts = await prisma.attempt.findMany({
    where: { learnerProfileId: learner, contentKey: { startsWith: 'sci6-' } },
    select: { id: true },
  });
  const sessions = await prisma.session.findMany({
    where: { learnerProfileId: learner, contentKey: { startsWith: 'sci6-' } },
    select: { id: true },
  });
  const attemptIds = attempts.map((row) => row.id);
  const sessionIds = sessions.map((row) => row.id);
  await prisma.masteryEstimate.deleteMany({
    where: { learnerProfileId: learner, skillCode: { startsWith: 'sci6-' } },
  });
  await prisma.tutorInteraction.deleteMany({ where: { attemptId: { in: attemptIds } } });
  await prisma.tutorTrace.deleteMany({ where: { sessionId: { in: sessionIds } } });
  await prisma.attempt.deleteMany({ where: { id: { in: attemptIds } } });
  await prisma.session.deleteMany({ where: { id: { in: sessionIds } } });
}

async function mathCounts(page: Page) {
  await page.goto(MATH_OVERVIEW);
  await expect(page.getByRole('heading', { name: /^Course overview: / })).toBeVisible();
  return page.locator('.overview-chapter-progress p').allInnerTexts();
}

test.describe.serial('Grade 6 Science learner journeys (SU-E3 candidate)', () => {
  let mathBefore: string[];

  test.beforeAll(async () => {
    await removeScienceRows();
  });

  test.afterAll(async () => {
    await removeScienceRows();
    await prisma.$disconnect();
  });

  test('journey 1 placement: switcher, overview, keyboard selection, refusal then feedback', async ({
    page,
  }, info) => {
    mathBefore = await mathCounts(page);

    await page.goto('/');
    await expect(page.getByLabel('Subject')).toBeVisible();
    await expect(page.getByRole('option', { name: LABEL })).toBeEnabled();

    await page.goto(OVERVIEW);
    await expect(page.getByRole('heading', { name: `Course overview: ${LABEL}` })).toBeVisible();
    await expect(page.locator('.overview-chapter')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Life Science' })).toBeVisible();
    await expect(page.locator('.topic-card')).toHaveCount(3);
    await expect(page.getByText('0 of 3 topics independently confirmed')).toBeVisible();
    await expectAxeClean(page);
    await shot(page, info, 'overview-desktop-light');

    await page.getByRole('link', { name: EOL_TOPIC }).click();
    await expect(page.getByText('Placement check — answer independently, no hints.')).toBeVisible();
    const { title, fields } = choicesOf('sci6-cells-evidence-of-life-1');
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expectAxeClean(page);
    await shot(page, info, 'activity-placement-desktop-light');

    // Refusal: nothing chosen. The error summary takes focus.
    await page.getByRole('button', { name: 'Submit answer' }).click();
    const summary = page.locator('#structured-error-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Check your answer');
    await expect(page.getByText('Not yet — recorded for placement')).toHaveCount(0);

    // Keyboard-only selection: arrow keys move within a radio group.
    const first = fields[0];
    const firstGroup = page.getByRole('radiogroup', { name: first.label });
    await firstGroup.getByRole('radio').first().focus();
    const wrongIndex = first.options.findIndex(
      (option, index) => index > 0 && option.id !== first.correct,
    );
    expect(wrongIndex).toBeGreaterThan(0);
    for (let step = 0; step < wrongIndex; step += 1) await page.keyboard.press('ArrowDown');
    await expect(
      firstGroup.getByLabel(first.options[wrongIndex].label, { exact: true }),
    ).toBeChecked();
    for (const field of fields.slice(1)) {
      await choose(page, field, field.correct);
    }

    // Retry: item-level feedback for a well-formed wrong answer.
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(
      page.getByText('Not yet — recorded for placement. Regular practice will cover this skill.'),
    ).toBeVisible();
    await expectAxeClean(page);
  });

  test('journey 2 practice: submit, fake-tutor hint, independent check, topic confirmed', async ({
    page,
  }, info) => {
    await page.goto(OVERVIEW);
    await page.getByRole('link', { name: EOL_TOPIC }).click();
    await expect(page.getByText('Placement check')).toHaveCount(0);
    const { title } = choicesOf('sci6-cells-evidence-of-life-1');
    await expect(page.locator('#activity-heading')).toBeVisible();
    await expectAxeClean(page);
    await shot(page, info, 'activity-practice-desktop-light');

    // Refusal then wrong then right, with item-level feedback each time.
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.locator('#structured-error-summary')).toBeFocused();
    const heading = ((await page.locator('#activity-heading').textContent()) ?? '').trim();
    const id = contentCatalog.find((item) => item.title === heading)!.id;
    expect(title.length).toBeGreaterThan(0);
    await answer(page, id, true);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Not yet. Your attempt is recorded.')).toBeVisible();
    await answer(page, id);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Correct — nice work.')).toBeVisible();

    await page.getByRole('button', { name: 'Ask for a small hint' }).click();
    await expect(page.getByRole('heading', { name: 'Tutor' })).toBeVisible();
    await page.getByRole('button', { name: 'Start independent check' }).click();
    await expect(page.getByText('Independent check: correct.')).toBeVisible();

    await page.goto(OVERVIEW);
    await expect(page.getByText('1 of 3 topics independently confirmed')).toBeVisible();
    await page.getByRole('link', { name: EOL_TOPIC }).click();
    await expect(page.getByText('Independently confirmed', { exact: true }).first()).toBeVisible();
  });

  test('journey 3 review: aged confirmed row offers review; refusal then item-level feedback', async ({
    page,
  }, info) => {
    const { householdId, learnerProfileId: learner } = await learnerProfileId();
    const aged = new Date(Date.now() - 15 * DAY_MS);
    await prisma.masteryEstimate.upsert({
      where: {
        learnerProfileId_skillCode_algorithmVersion: {
          learnerProfileId: learner,
          skillCode: EOL,
          algorithmVersion: PHASE_1_MASTERY_VERSION,
        },
      },
      update: {
        estimate: 1,
        confidenceBand: 'HIGH',
        independentDelayedCheck: true,
        updatedAt: aged,
      },
      create: {
        householdId,
        learnerProfileId: learner,
        skillCode: EOL,
        estimate: 1,
        confidenceBand: 'HIGH',
        algorithmVersion: PHASE_1_MASTERY_VERSION,
        independentDelayedCheck: true,
        updatedAt: aged,
      },
    });

    await page.goto(OVERVIEW);
    await page.getByRole('link', { name: EOL_TOPIC }).click();
    await expect(page.getByText('Review check — answer independently, no hints.')).toBeVisible();
    await expectAxeClean(page);
    await shot(page, info, 'activity-review-desktop-light');

    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.locator('#structured-error-summary')).toBeFocused();
    const heading = ((await page.locator('#activity-heading').textContent()) ?? '').trim();
    const id = contentCatalog.find((item) => item.title === heading)!.id;
    await answer(page, id, true);
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(
      page.getByText('Not yet — this skill has been moved back into regular practice.'),
    ).toBeVisible();
  });

  test('layout: 320px reflow and dark mode, axe clean, no horizontal scroll', async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(OVERVIEW);
    await expect(page.getByRole('heading', { name: `Course overview: ${LABEL}` })).toBeVisible();
    await noHorizontalScroll(page);
    await expectAxeClean(page);
    await shot(page, info, 'overview-320-dark');

    await page.getByRole('link', { name: EOL_TOPIC }).click();
    await expect(page.locator('#activity-heading')).toBeVisible();
    await noHorizontalScroll(page);
    await expectAxeClean(page);
    await shot(page, info, 'activity-320-dark');
  });

  test('Math overview counts are unchanged by the Science journeys', async ({ page }) => {
    expect(await mathCounts(page)).toEqual(mathBefore);
  });
});
