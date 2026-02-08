import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * ATDD E2E Tests for Story 1-2: 用户注册与 Credit 奖励
 *
 * 🔴 TDD RED PHASE - All tests are intentionally failing
 *
 * These tests validate EXPECTED user journeys for:
 * - New user login with credit reward (AC-1, AC-2, AC-3)
 * - Existing user login without duplicate reward (AC-4)
 * - Welcome snackbar display and behavior (AC-3)
 * - Credit balance display (AC-6)
 *
 * Tests use test() because UI is not yet implemented.
 * Once implementation is complete, remove test() to verify GREEN phase.
 *
 * @story 1-2-user-registration
 * @epic 1-user-authentication
 *
 * Selectors used:
 * - Google login button: [data-testid="google-login-button"]
 * - Welcome snackbar: [data-testid="welcome-snackbar"]
 * - Credit balance display: [data-testid="credit-balance"]
 * - User menu: [data-testid="user-menu"]
 */

test.describe.skip('[Story 1-2] User Registration & Credit Reward E2E Journey (ATDD)', () => {
  // Helper to generate unique test user
  const generateTestUser = () => ({
    email: `test-${faker.string.uuid()}@example.com`,
    name: faker.person.fullName(),
  });

  test.describe('[AC-1, AC-2, AC-3] New User First Login with Credit Reward', () => {
    test('[P0] should grant 30 credits and show welcome on first login', async ({ page, context }) => {
      // GIVEN: User is on home page and NOT logged in
      await page.goto('/');

      // THEN: Google login button should be visible
      await expect(page.getByTestId('google-login-button')).toBeVisible();

      // AND: User menu should NOT be visible (not logged in)
      await expect(page.getByTestId('user-menu')).not.toBeVisible();

      // WHEN: User clicks Google login button
      await page.getByTestId('google-login-button').click();

      // THEN: Should redirect to Google OAuth page
      await page.waitForURL(/accounts\.google\.com/);
      await expect(page).toHaveURL(/oauth2\/auth/);

      // WHEN: User authorizes the application
      // Note: In real E2E test, this would use Google OAuth test credentials
      // For ATDD documentation, we're showing the expected flow
      // Simulate successful OAuth callback

      // THEN: Should redirect back to application
      await page.waitForURL('/');
      await expect(page.getByTestId('user-menu')).toBeVisible();

      // AND: Welcome snackbar should appear
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');
      await expect(welcomeSnackbar).toBeVisible();
      await expect(welcomeSnackbar).toHaveText('欢迎！您已获得 30 次 free credit');

      // AND: Snackbar should have correct styling (green background, white text, checkmark icon)
      await expect(welcomeSnackbar).toHaveCSS('background-color', 'rgb(34, 197, 94)'); // Green 500
      await expect(welcomeSnackbar).toHaveCSS('color', 'rgb(255, 255, 255)'); // White

      // AND: Credit balance should show 30
      const creditBalance = page.getByTestId('credit-balance');
      await expect(creditBalance).toBeVisible();
      await expect(creditBalance).toContainText('30');
    });

    test('[P1] welcome snackbar should auto-hide after 5 seconds', async ({ page }) => {
      // GIVEN: New user just logged in and sees welcome snackbar
      await page.goto('/');

      // Simulate new user login (would use OAuth in real test)
      await page.evaluate(() => {
        // Simulate successful login and credit reward
        window.localStorage.setItem('test_scenario', 'new_user_first_login');
      });

      // WHEN: Waiting for snackbar
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');
      await expect(welcomeSnackbar).toBeVisible();

      const startTime = Date.now();

      // THEN: Snackbar should disappear after ~5 seconds
      await welcomeSnackbar.waitFor({ state: 'hidden', timeout: 6000 });
      const endTime = Date.now();

      const visibleDuration = endTime - startTime;
      expect(visibleDuration).toBeGreaterThanOrEqual(4500); // At least 4.5s
      expect(visibleDuration).toBeLessThanOrEqual(6000); // At most 6s (with buffer)
    });

    test('[P1] welcome snackbar should be positioned at bottom center', async ({ page }) => {
      // GIVEN: New user just logged in
      await page.goto('/');

      // Simulate new user login
      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'new_user_first_login');
      });

      // WHEN: Welcome snackbar appears
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');
      await expect(welcomeSnackbar).toBeVisible();

      // THEN: Should be positioned at bottom center
      const boundingBox = await welcomeSnackbar.boundingBox();

      if (boundingBox) {
        const viewportSize = page.viewportSize();
        if (viewportSize) {
          // Check horizontal center (within 10% tolerance)
          const centerX = viewportSize.width / 2;
          const snackbarCenterX = boundingBox.x + boundingBox.width / 2;
          expect(Math.abs(centerX - snackbarCenterX)).toBeLessThan(viewportSize.width * 0.1);

          // Check near bottom (within 100px of bottom)
          const distanceFromBottom = viewportSize.height - (boundingBox.y + boundingBox.height);
          expect(distanceFromBottom).toBeLessThan(100);
        }
      }
    });

    test('[P2] should show checkmark icon in welcome snackbar', async ({ page }) => {
      // GIVEN: New user just logged in
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'new_user_first_login');
      });

      // WHEN: Welcome snackbar appears
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');
      await expect(welcomeSnackbar).toBeVisible();

      // THEN: Checkmark icon should be visible
      const checkmarkIcon = welcomeSnackbar.locator('[data-testid="checkmark-icon"]');
      await expect(checkmarkIcon).toBeVisible();
    });
  });

  test.describe('[AC-4] Existing User Login Without Duplicate Reward', () => {
    test('[P0] should not show welcome or grant credits to existing users', async ({ page }) => {
      // GIVEN: Existing user with credits logging in again
      await page.goto('/');

      // Simulate existing user login (creditBalance > 0)
      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'existing_user_login');
        window.localStorage.setItem('user_credit_balance', '30');
      });

      // WHEN: User completes OAuth login (simulated)
      // In real test, would use OAuth test credentials

      // THEN: User menu should be visible (logged in)
      await expect(page.getByTestId('user-menu')).toBeVisible();

      // AND: Welcome snackbar should NOT appear
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');
      await expect(welcomeSnackbar).not.toBeVisible();

      // AND: Credit balance should remain unchanged (30)
      const creditBalance = page.getByTestId('credit-balance');
      await expect(creditBalance).toContainText('30');
    });

    test('[P1] should not increment credits on subsequent logins', async ({ page }) => {
      // GIVEN: User with 15 credits logs in again
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'existing_user_login');
        window.localStorage.setItem('user_credit_balance', '15');
      });

      // WHEN: User logs in
      // Simulate OAuth callback

      // THEN: Credit balance should still be 15 (not 45)
      const creditBalance = page.getByTestId('credit-balance');
      await expect(creditBalance).toContainText('15');

      // AND: No welcome snackbar
      await expect(page.getByTestId('welcome-snackbar')).not.toBeVisible();
    });
  });

  test.describe('[AC-6] Credit Balance Display', () => {
    test('[P1] should display credit balance after login', async ({ page }) => {
      // GIVEN: User just logged in with 30 credits
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'new_user_first_login');
        window.localStorage.setItem('user_credit_balance', '30');
      });

      // WHEN: Page loads
      // THEN: Credit balance should be visible in user menu
      const creditBalance = page.getByTestId('credit-balance');
      await expect(creditBalance).toBeVisible();

      // AND: Should show correct format
      await expect(creditBalance).toContainText('30');
      await expect(
        creditBalance.getByText(/credits|credit/i)
      ).toBeVisible();
    });

    test('[P1] should update credit display in real-time', async ({ page }) => {
      // GIVEN: User with 30 credits
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('user_credit_balance', '30');
      });

      // WHEN: Credits are used (simulate API call)
      await page.evaluate(() => {
        // Simulate credit deduction (e.g., after analysis)
        window.localStorage.setItem('user_credit_balance', '20');

        // Trigger re-render
        window.dispatchEvent(new CustomEvent('credits-updated'));
      });

      // THEN: Credit display should update to 20
      const creditBalance = page.getByTestId('credit-balance');
      await expect(creditBalance).toContainText('20');
    });

    test('[P2] should show credit balance in multiple formats', async ({ page }) => {
      // GIVEN: User with 30 credits
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('user_credit_balance', '30');
      });

      // WHEN: Checking credit display
      const creditBalance = page.getByTestId('credit-balance');

      // THEN: Should show both "30 credits" and "3 次使用剩余"
      await expect(creditBalance).toContainText('30');
      await expect(creditBalance.getByText(/credits|credit/i)).toBeVisible();

      // Alternative display (可能在不同地方显示)
      const usageDisplay = page.getByTestId('credit-usage');
      if (await usageDisplay.isVisible()) {
        await expect(usageDisplay).toContainText('3 次使用剩余');
      }
    });
  });

  test.describe('[AC-3] Welcome Snackbar Styling', () => {
    test('[P2] should use correct colors for welcome snackbar', async ({ page }) => {
      // GIVEN: New user just logged in
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'new_user_first_login');
      });

      // WHEN: Welcome snackbar appears
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');
      await expect(welcomeSnackbar).toBeVisible();

      // THEN: Should use green background (Green 500: #22C55E)
      const backgroundColor = await welcomeSnackbar.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      expect(backgroundColor).toBe('rgb(34, 197, 94)');

      // AND: White text
      const color = await welcomeSnackbar.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      expect(color).toBe('rgb(255, 255, 255)');
    });

    test('[P2] should have smooth fade-in animation', async ({ page }) => {
      // GIVEN: New user just logged in
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'new_user_first_login');
      });

      // WHEN: Welcome snackbar appears
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');

      // THEN: Should have fade-in animation
      const transition = await welcomeSnackbar.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });

      expect(transition).toContain('opacity');
      expect(transition).toContain('transform');
    });
  });

  test.describe('[Integration] Complete New User Journey', () => {
    test('[P0] should complete full new user onboarding flow', async ({ page }) => {
      // GIVEN: New user arrives for first time
      await page.goto('/');

      // THEN: Should see landing page with login button
      await expect(page.getByTestId('google-login-button')).toBeVisible();
      await expect(page.getByText(/图片风格分析/i)).toBeVisible();

      // WHEN: User clicks login
      await page.getByTestId('google-login-button').click();

      // AND: Authorizes with Google (simulated)
      // In real E2E, would use test OAuth credentials

      // THEN: Should be logged in
      await expect(page.getByTestId('user-menu')).toBeVisible();

      // AND: Should see welcome message with credit reward
      await expect(page.getByTestId('welcome-snackbar')).toBeVisible();
      await expect(page.getByTestId('welcome-snackbar')).toHaveText(
        /欢迎.*30.*credit/i
      );

      // AND: Credit balance should be 30
      await expect(page.getByTestId('credit-balance')).toContainText('30');

      // AND: User should be able to navigate to analysis page
      await page.goto('/analyze');
      await expect(page).toHaveURL('/analyze');

      // AND: Credit balance should persist across navigation
      await expect(page.getByTestId('credit-balance')).toContainText('30');
    });

    test('[P1] should handle user returning after first login', async ({ page, context }) => {
      // GIVEN: User previously logged in and has credits
      // Set up auth session
      await context.addCookies([
        {
          name: 'next-auth.session-token',
          value: 'existing_user_session_token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        },
      ]);

      await page.goto('/');

      // THEN: Should be logged in (no need to login again)
      await expect(page.getByTestId('user-menu')).toBeVisible();
      await expect(page.getByTestId('google-login-button')).not.toBeVisible();

      // AND: No welcome message (not a new user)
      await expect(page.getByTestId('welcome-snackbar')).not.toBeVisible();

      // AND: Credit balance should be visible
      await expect(page.getByTestId('credit-balance')).toBeVisible();
    });
  });

  test.describe('[AC-7] Performance', () => {
    test('[P2] should complete login and credit grant within acceptable time', async ({ page }) => {
      // GIVEN: User on home page
      await page.goto('/');

      // WHEN: Clicking login button
      const startTime = Date.now();

      await page.getByTestId('google-login-button').click();

      // Wait for complete flow (OAuth redirect + callback + credit grant)
      await page.waitForURL('/');
      await expect(page.getByTestId('user-menu')).toBeVisible();
      await expect(page.getByTestId('credit-balance')).toBeVisible();

      const endTime = Date.now();

      // THEN: Complete flow should be reasonable
      // Note: OAuth flow itself takes time, we're measuring the application's processing
      const duration = endTime - startTime;

      // Allow up to 15 seconds for complete OAuth flow
      expect(duration).toBeLessThan(15000);
    });
  });

  test.describe('[Edge Cases] Error States', () => {
    test('[P1] should handle OAuth error gracefully', async ({ page }) => {
      // GIVEN: User clicks login but OAuth fails
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'oauth_error');
        window.localStorage.setItem('oauth_error_code', 'access_denied');
      });

      await page.getByTestId('google-login-button').click();

      // THEN: Should show error message
      await expect(page.getByTestId('oauth-error-message')).toBeVisible();
      await expect(page.getByTestId('oauth-error-message')).toHaveText(
        /authorization.*denied|access.*denied/i
      );

      // AND: Should NOT be logged in
      await expect(page.getByTestId('user-menu')).not.toBeVisible();

      // AND: No welcome message
      await expect(page.getByTestId('welcome-snackbar')).not.toBeVisible();

      // AND: No credit balance
      await expect(page.getByTestId('credit-balance')).not.toBeVisible();
    });

    test('[P1] should handle credit grant failure gracefully', async ({ page }) => {
      // GIVEN: OAuth succeeds but credit grant fails
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'credit_grant_failure');
      });

      // WHEN: User logs in
      // Simulate OAuth callback with credit grant failure

      // THEN: User should still be logged in (OAuth succeeded)
      await expect(page.getByTestId('user-menu')).toBeVisible();

      // BUT: No welcome message (credit grant failed)
      await expect(page.getByTestId('welcome-snackbar')).not.toBeVisible();

      // AND: Error message should be shown
      await expect(page.getByTestId('credit-error-message')).toBeVisible();

      // AND: Credit balance should be 0 (grant failed)
      await expect(page.getByTestId('credit-balance')).toContainText('0');
    });
  });

  test.describe('[Responsive Design] Mobile Experience', () => {
    test('[P2] should show welcome snackbar correctly on mobile', async ({ page }) => {
      // GIVEN: Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('test_scenario', 'new_user_first_login');
      });

      // WHEN: Welcome snackbar appears
      const welcomeSnackbar = page.getByTestId('welcome-snackbar');
      await expect(welcomeSnackbar).toBeVisible();

      // THEN: Should be readable on mobile (not cut off)
      const boundingBox = await welcomeSnackbar.boundingBox();

      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(375); // Within viewport
        expect(boundingBox.x).toBeGreaterThanOrEqual(0); // Not off-screen left
        expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(375); // Not off-screen right
      }

      // AND: Text should be readable
      await expect(welcomeSnackbar).toHaveText(/欢迎.*30.*credit/i);
    });

    test('[P2] should show credit balance on mobile', async ({ page }) => {
      // GIVEN: Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await page.evaluate(() => {
        window.localStorage.setItem('user_credit_balance', '30');
      });

      // WHEN: Checking credit display
      const creditBalance = page.getByTestId('credit-balance');

      // THEN: Should be visible and readable
      await expect(creditBalance).toBeVisible();
      await expect(creditBalance).toContainText('30');

      // AND: Should not be overlapping with other mobile UI elements
      const boundingBox = await creditBalance.boundingBox();

      if (boundingBox) {
        // Should be within mobile viewport
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
      }
    });
  });
});
