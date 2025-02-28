import { test, expect } from '@playwright/test';
import { errorScenarios } from '../utils/errorTestUtils';

test.describe('Error Handling E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('recovers from storage quota exceeded', async ({ page }) => {
    // Fill storage until quota exceeded
    await page.evaluate(() => {
      let i = 0;
      while (true) {
        try {
          localStorage.setItem(`test-${i}`, 'x'.repeat(1024 * 1024)); // 1MB
          i++;
        } catch (e) {
          break;
        }
      }
    });

    // Start assessment to trigger storage error
    await page.click('text=Start Free Checkup');
    await page.click('text=Pre-Seed');

    // Verify error handling
    await expect(page.locator('text=storage space is full')).toBeVisible();
    await expect(page.locator('text=trying to free up space')).toBeVisible();

    // Attempt recovery
    await page.click('text=Try to Recover');
    
    // Verify recovery
    await expect(page.locator('text=Question 1')).toBeVisible();
  });

  test('handles offline mode gracefully', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Start assessment
    await page.click('text=Start Free Checkup');
    await page.click('text=Pre-Seed');

    // Answer questions in offline mode
    for (let i = 0; i < 3; i++) {
      await page.click('text=Option 1');
      await page.click('text=Next');
    }

    // Verify offline indicator
    await expect(page.locator('[data-testid=offline-indicator]')).toBeVisible();

    // Go online and verify sync
    await page.context().setOffline(false);
    await expect(page.locator('text=Syncing changes')).toBeVisible();
    await expect(page.locator('text=Changes synced')).toBeVisible();
  });

  test('prevents assessment state corruption', async ({ page }) => {
    // Start assessment
    await page.click('text=Start Free Checkup');
    await page.click('text=Pre-Seed');

    // Answer first question
    await page.click('text=Option 1');
    await page.click('text=Next');

    // Corrupt storage state
    await page.evaluate(() => {
      sessionStorage.setItem('octoflow', 'invalid json{');
    });

    // Attempt to continue
    await page.click('text=Next');

    // Verify corruption handling
    await expect(page.locator('text=data corruption')).toBeVisible();
    await expect(page.locator('text=Start Fresh')).toBeVisible();

    // Verify previous answers preserved in backup
    await page.click('text=Try to Recover');
    await expect(page.locator('text=Option 1').first()).toHaveAttribute('aria-checked', 'true');
  });

  test('maintains accessibility during errors', async ({ page }) => {
    // Force error state
    await page.evaluate(() => {
      throw new Error('Simulated error');
    });

    // Verify error boundary accessibility
    await expect(page.locator('role=alert')).toBeVisible();
    await expect(page.locator('text=Try to Recover')).toBeFocused();

    // Check ARIA attributes
    const alert = await page.locator('role=alert');
    await expect(alert).toHaveAttribute('aria-live', 'assertive');
    await expect(alert).toHaveAttribute('aria-atomic', 'true');
  });
});