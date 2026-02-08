import { test, expect, type Page } from '@playwright/test';

/**
 * Story 1-5: Account Deletion - E2E Tests
 */

test.describe('Story 1-5: Account Deletion Journey (ATDD)', () => {
  let deleted = false;
  const openUserMenu = async (page: Page) => {
    const avatar = page.getByTestId('user-menu-avatar');
    await expect(avatar).toBeVisible();
    await avatar.focus();
    await avatar.press('Enter');
    await expect(page.getByTestId('user-menu-delete-account')).toBeVisible();
  };

  test.beforeEach(async ({ page }) => {
    deleted = false;

    await page.route('**/api/auth/session**', async (route) => {
      if (deleted) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'null',
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'e2e-user-1',
            name: 'E2E User',
            email: 'e2e@example.com',
            image: null,
            creditBalance: 30,
            subscriptionTier: 'free',
          },
          expires: new Date(Date.now() + 3600_000).toISOString(),
        }),
      });
    });

    await page.route('**/api/auth/signout**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/' }),
      });
    });

    await page.route('**/api/user**', async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.continue();
        return;
      }

      deleted = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { message: '账户已删除' },
        }),
      });
    });

    await page.goto('/');
    await page.addStyleTag({
      content: '[data-testid="google-login-button"] { pointer-events: none !important; }',
    });
  });

  test('[P0][AC-1] should show delete account option in user menu', async ({ page }) => {
    await openUserMenu(page);
    await expect(page.getByTestId('user-menu-delete-account')).toContainText('删除账户');
  });

  test('[P0][AC-2] should open confirmation dialog with irreversible warning', async ({ page }) => {
    await openUserMenu(page);
    await page.getByTestId('user-menu-delete-account').click();

    await expect(page.getByRole('dialog', { name: '删除账户' })).toBeVisible();
    await expect(page.getByText('确定要删除账户吗？此操作不可撤销')).toBeVisible();
    await expect(page.getByText('所有图片将被删除')).toBeVisible();
    await expect(page.getByText('所有分析记录将被删除')).toBeVisible();
    await expect(page.getByText('所有模版将被删除')).toBeVisible();
    await expect(page.getByText('Credit 余额将被清零')).toBeVisible();
  });

  test('[P1][AC-2] should close dialog when clicking cancel', async ({ page }) => {
    await openUserMenu(page);
    await page.getByTestId('user-menu-delete-account').click();
    await page.getByRole('button', { name: '取消' }).click();

    await expect(page.getByRole('dialog', { name: '删除账户' })).not.toBeVisible();
  });

  test('[P0][AC-3][AC-4] should delete account then redirect to home and show login', async ({ page }) => {
    await openUserMenu(page);
    await page.getByTestId('user-menu-delete-account').click();
    await page.getByTestId('delete-account-confirm-input').locator('input').fill('DELETE_MY_ACCOUNT');
    await page.getByTestId('delete-account-reauth-input').locator('input').fill('e2e@example.com');

    const confirmBtn = page.getByRole('button', { name: '确定删除' });
    await confirmBtn.click();

    await expect(page.getByTestId('delete-account-dialog')).not.toBeVisible();
    await page.waitForURL('/');
    await expect(page.getByTestId('google-login-button').first()).toBeVisible();
  });

  test('[P1][AC-8] should show error and retry action when deletion fails', async ({ page }) => {
    await page.unroute('**/api/user**');
    await page.route('**/api/user**', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { code: 'DELETE_FAILED', message: '删除账户失败，请重试' }
          }),
        });
        return;
      }
      await route.continue();
    });

    await openUserMenu(page);
    await page.getByTestId('user-menu-delete-account').click();
    await page.getByTestId('delete-account-confirm-input').locator('input').fill('DELETE_MY_ACCOUNT');
    await page.getByTestId('delete-account-reauth-input').locator('input').fill('e2e@example.com');
    await page.getByRole('button', { name: '确定删除' }).click();

    await expect(page.getByText('删除账户失败，请重试')).toBeVisible();
    await expect(page.getByTestId('delete-account-error-message')).toBeVisible();
  });

  test('[P2][AC-7] should finish visual deletion flow within 5s', async ({ page }) => {
    const start = Date.now();

    await openUserMenu(page);
    await page.getByTestId('user-menu-delete-account').click();
    await page.getByTestId('delete-account-confirm-input').locator('input').fill('DELETE_MY_ACCOUNT');
    await page.getByTestId('delete-account-reauth-input').locator('input').fill('e2e@example.com');
    await page.getByRole('button', { name: '确定删除' }).click();
    await page.waitForURL('/');

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });
});
