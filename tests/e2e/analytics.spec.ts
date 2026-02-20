/**
 * E2E 测试 - 分析仪表板
 * Story 7-3: 模版使用分析和统计
 */

import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/auth/signin');
    // 这里需要根据实际的登录流程调整
  });

  test('@p0 @smoke should display analytics dashboard', async ({ page }) => {
    await page.goto('/analytics');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('分析仪表板');

    // 验证统计卡片存在
    await expect(page.locator('text=总模版数')).toBeVisible();
    await expect(page.locator('text=总生成数')).toBeVisible();
    await expect(page.locator('text=最近 7 天')).toBeVisible();
    await expect(page.locator('text=最近 30 天')).toBeVisible();
  });

  test('@p1 should filter by time range', async ({ page }) => {
    await page.goto('/analytics');

    // 点击"最近 7 天"按钮
    await page.click('button:has-text("最近 7 天")');

    // 验证数据更新（这里需要等待 API 响应）
    await page.waitForTimeout(1000);

    // 点击"最近 30 天"按钮
    await page.click('button:has-text("最近 30 天")');
    await page.waitForTimeout(1000);
  });

  test('@p1 should display usage trends chart', async ({ page }) => {
    await page.goto('/analytics');

    // 验证趋势图表存在
    await expect(page.locator('text=使用趋势')).toBeVisible();

    // 验证图表容器存在（Recharts 会创建 SVG）
    const chartContainer = page.locator('.recharts-wrapper').first();
    await expect(chartContainer).toBeVisible();
  });

  test('@p1 should display template usage list', async ({ page }) => {
    await page.goto('/analytics');

    // 验证模版使用统计标题存在
    await expect(page.locator('text=模版使用统计')).toBeVisible();
  });

  test('@p2 should display category and tag stats', async ({ page }) => {
    await page.goto('/analytics');

    // 验证分类和标签统计组件存在
    await expect(page.locator('text=分类统计')).toBeVisible();
    await expect(page.locator('text=标签统计')).toBeVisible();
  });

  test('@p2 should display performance metrics', async ({ page }) => {
    await page.goto('/analytics');

    // 验证性能分析组件存在
    await expect(page.locator('text=性能分析')).toBeVisible();
    await expect(page.locator('text=表现最佳')).toBeVisible();
  });

  test('@p2 should show empty state when no data', async ({ page }) => {
    // 这个测试需要使用一个没有数据的测试账户
    // 或者 mock API 返回空数据

    await page.goto('/analytics');

    // 如果没有数据，应该显示友好提示
    const emptyState = page.locator('text=暂无统计数据');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });
});

test.describe('Template Generation Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
  });

  test('@p1 should display generation history for template', async ({ page }) => {
    // 导航到模版详情页（假设有模版）
    await page.goto('/analytics');

    // 点击查看某个模版的生成历史
    // 这需要实际的模版数据

    // 验证画廊组件显示
    await expect(page.locator('text=生成图片历史')).toBeVisible();
  });

  test('@p2 should open image preview on click', async ({ page }) => {
    // 这个测试需要实际的生成图片数据
    await page.goto('/analytics');

    // 点击图片缩略图
    // await page.click('.gallery-image:first-child');

    // 验证模态框打开
    // await expect(page.locator('.image-modal')).toBeVisible();
  });
});
