import { test, expect } from '@playwright/test';

test('Phase 3 preview loads', async ({ page }) => {
  await page.goto('/phase3/preview');
  await expect(page.getByText('Phase 3 Preview')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Install App' })).toBeVisible();
});


