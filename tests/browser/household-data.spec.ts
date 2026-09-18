import { expect, test } from '@playwright/test';

test.describe('household data controls', () => {
  test('the delete button stays disabled until the confirmation phrase matches exactly', async ({
    page,
  }) => {
    await page.goto('/parent');
    await expect(page.getByRole('heading', { name: 'Your data' })).toBeVisible();

    const deleteButton = page.getByRole('button', {
      name: 'Permanently delete my household data',
    });
    const confirmationInput = page.getByLabel('Type "DELETE" to confirm');

    await expect(deleteButton).toBeDisabled();

    await confirmationInput.fill('delete');
    await expect(deleteButton).toBeDisabled();

    await confirmationInput.fill('DELETE ');
    await expect(deleteButton).toBeDisabled();

    await confirmationInput.fill('DELETE');
    await expect(deleteButton).toBeEnabled();

    // Deliberately does not click the enabled button: this suite shares one
    // seeded household across every test file, and actually deleting it
    // here would break every other test. Real end-to-end deletion is
    // verified separately against a disposable household (see
    // docs/PROGRESS.md).
  });

  test('the export button downloads a JSON file', async ({ page }) => {
    await page.goto('/parent');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download my data' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^learning-forge-export-\d{4}-\d{2}-\d{2}\.json$/);
  });
});
