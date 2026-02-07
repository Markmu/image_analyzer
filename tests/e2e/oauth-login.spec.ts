import { test, expect } from '@playwright/test';

/**
 * ATDD E2E Tests for Story 1-1: OAuth 基础设置
 *
 * 🔴 TDD RED PHASE - All tests are intentionally failing
 *
 * These tests validate EXPECTED user journeys for:
 * - Complete OAuth login flow (AC-3)
 * - OAuth authorization failure handling (AC-8)
 *
 * Tests use test.skip() because UI is not yet implemented.
 * Once implementation is complete, remove test.skip() to verify GREEN phase.
 *
 * @story 1-1-oauth-setup
 * @epic 1-user-authentication
 *
 * Selectors used:
 * - Login button: [data-testid="google-login-button"]
 * - User menu: [data-testid="user-menu"]
 * - Error message: [data-testid="oauth-error-message"]
 */

test.describe('[Story 1-1] OAuth Login E2E Journey (ATDD)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
  });

  test.describe('[AC-3] Complete OAuth Login Flow', () => {
    test.skip('[P0] should complete Google OAuth login successfully', async ({ page }) => {
      // GIVEN: User is on home page and sees login button
      // THEN: Login button should be visible
      await expect(page.getByTestId('google-login-button')).toBeVisible();

      // WHEN: User clicks "使用 Google 登录" button
      await page.getByTestId('google-login-button').click();

      // THEN: Should redirect to Google OAuth authorization page
      await page.waitForURL(/accounts\.google\.com/);
      await expect(page).toHaveURL(/oauth2\/auth/);

      // WHEN: User authorizes the application (clicks "Allow" in Google OAuth UI)
      // Note: In real test, this would require Google OAuth test credentials
      // For ATDD, we're documenting the expected flow

      // THEN: Should redirect back to application
      // AND: User should be logged in
      await page.waitForURL('/');
      await expect(page.getByTestId('user-menu')).toBeVisible();

      // AND: User menu should show user's email
      // (Email would come from OAuth response)
      await expect(page.getByTestId('user-email')).toBeVisible();
    });

    test.skip('[P1] should persist session across page navigation', async ({ page }) => {
      // GIVEN: User has completed OAuth login and is logged in
      // (Precondition: User navigated through OAuth flow successfully)

      // WHEN: User navigates to different page
      await page.goto('/dashboard');

      // THEN: User should still be logged in
      await expect(page.getByTestId('user-menu')).toBeVisible();

      // WHEN: User refreshes the page
      await page.reload();

      // THEN: Session should persist (user still logged in)
      await expect(page.getByTestId('user-menu')).toBeVisible();
    });
  });

  test.describe('[AC-8] OAuth Error Handling', () => {
    test.skip('[P1] should handle OAuth authorization denial', async ({ page }) => {
      // GIVEN: User is on home page
      await expect(page.getByTestId('google-login-button')).toBeVisible();

      // WHEN: User clicks login button but denies authorization
      await page.getByTestId('google-login-button').click();

      // Simulate user clicking "Deny" or "Cancel" in Google OAuth UI
      // (In real test, this would interact with Google OAuth test flow)

      // THEN: Should redirect back to application with error
      await page.waitForURL('/');

      // AND: Should show user-friendly error message
      await expect(page.getByTestId('oauth-error-message')).toBeVisible();
      await expect(page.getByTestId('oauth-error-message')).toHaveText(
        /login.*failed|authorization.*denied/i
      );

      // AND: User should not be logged in
      await expect(page.getByTestId('user-menu')).not.toBeVisible();
      await expect(page.getByTestId('google-login-button')).toBeVisible();
    });

    test.skip('[P2] should handle OAuth timeout', async ({ page }) => {
      // GIVEN: User clicks login button
      await page.getByTestId('google-login-button').click();

      // WHEN: OAuth authorization times out (no response within timeout period)
      // Simulate timeout by waiting longer than OAuth timeout

      // THEN: Should show timeout error message
      await expect(page.getByTestId('oauth-error-message')).toBeVisible();
      await expect(page.getByTestId('oauth-error-message')).toHaveText(
        /timeout|took too long/i
      );

      // AND: User should be able to retry
      await expect(page.getByTestId('google-login-button')).toBeVisible();
    });
  });

  test.describe('[AC-5] Security - Session Management', () => {
    test.skip('[P1] should use secure cookie for session token', async ({ page, context }) => {
      // GIVEN: User completes OAuth login successfully

      // WHEN: Checking session cookies
      const cookies = await context.cookies();

      // THEN: Session cookie should have secure attributes
      const sessionCookie = cookies.find(c => c.name === 'next-auth.session-token');
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toMatchObject({
        secure: true, // HTTPS only
        httpOnly: true, // Not accessible via JavaScript
        sameSite: 'lax', // CSRF protection
      });
    });

    test.skip('[P1] should redirect unauthenticated users from protected pages', async ({ page }) => {
      // GIVEN: User is not logged in
      // WHEN: User tries to access protected page (e.g., /dashboard)
      await page.goto('/dashboard');

      // THEN: Should redirect to login page or home page
      await page.waitForURL(/\/(|login)/);
      await expect(page.getByTestId('google-login-button')).toBeVisible();
    });
  });

  test.describe('[AC-7] Performance', () => {
    test.skip('[P2] should complete entire login flow within 10 seconds', async ({ page }) => {
      // GIVEN: User is on home page
      const startTime = Date.now();

      // WHEN: User completes OAuth login flow
      await page.getByTestId('google-login-button').click();

      // Wait for redirect to Google OAuth page
      await page.waitForURL(/accounts\.google\.com/);

      // Simulate OAuth authorization (in real test, would use test credentials)

      // Wait for redirect back to application
      await page.waitForURL('/');
      await expect(page.getByTestId('user-menu')).toBeVisible();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // THEN: Complete flow should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
    });
  });
});
