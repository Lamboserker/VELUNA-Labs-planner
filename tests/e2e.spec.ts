import { test, expect } from '@playwright/test';

test.describe('Inbox to Plan flow', () => {
  test('renders marketing hero and navigates to app shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Persoenlicher Planer')).toBeVisible();
    await page.goto('/app');
    await expect(page.locator('text=Fokus')).toBeVisible();
  });
});
