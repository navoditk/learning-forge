import { expect, test } from '@playwright/test';

test.describe('keyboard operability', () => {
  test('learner can complete the core loop using only the keyboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();

    await page.getByLabel('Your answer').focus();
    await expect(page.getByLabel('Your answer')).toBeFocused();
    await page.keyboard.type('15');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Submit answer' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Correct — nice work.')).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Ask for a small hint' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Tutor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ask for the next hint' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('What stays the same as both quantities change?')).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Start independent check' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Independent check: correct.')).toBeVisible();
  });

  test('parent can request the weekly digest using only the keyboard', async ({ page }) => {
    await page.goto('/parent');
    await expect(page.getByRole('heading', { name: 'Parent evidence' })).toBeVisible();

    await page.getByRole('button', { name: 'Get weekly digest' }).focus();
    await expect(page.getByRole('button', { name: 'Get weekly digest' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/completed \d+ attempts? across|has not attempted/)).toBeVisible();
  });

  test('a blank answer produces an accessible, recoverable error instead of a silent failure', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bicycle pace' })).toBeVisible();
    await page
      .getByRole('region', { name: 'Recommended next activities' })
      .getByRole('button', { name: 'Garden rows' })
      .click();
    await expect(page.getByRole('heading', { name: 'Garden rows' })).toBeVisible();

    const input = page.getByLabel('Your answer');
    await page.getByRole('button', { name: 'Submit answer' }).click();

    // The error is announced (role=alert), tied to the input via
    // aria-describedby/aria-invalid, and focus returns to the input so a
    // keyboard/screen-reader user isn't left guessing what went wrong.
    await expect(page.locator('#learner-response-error')).toHaveText(
      'Enter an answer before submitting.',
    );
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await input.getAttribute('aria-describedby');
    expect(describedBy).toBe('learner-response-error');
    await expect(input).toBeFocused();

    // Correcting the input clears the error without a page reload, and the
    // activity can still be completed normally afterwards.
    await input.fill('2:3');
    await expect(page.locator('#learner-response-error')).toHaveCount(0);
    await expect(input).not.toHaveAttribute('aria-invalid');
    await page.getByRole('button', { name: 'Submit answer' }).click();
    await expect(page.getByText('Correct — nice work.')).toBeVisible();
  });
});
