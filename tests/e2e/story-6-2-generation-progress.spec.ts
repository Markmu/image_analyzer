/**
 * Story 6.2: Generation Progress E2E 测试
 *
 * 测试覆盖：
 * - AC-1: 单个图片生成进度显示
 * - AC-2: 批量生成进度显示
 * - AC-3: 生成阶段可视化
 * - AC-4: 错误处理和重试
 * - AC-5: 生成完成通知
 * - AC-6: 移动端响应式设计
 *
 * @tags @p0 @story-6-2 @generation
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// 辅助函数：设置生成 API mock
async function setupGenerationMocks(page: Page) {
  // Mock 单个生成 API
  await page.route('**/api/generate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          generationId: 'gen-test-123',
          status: 'processing',
          images: [],
        },
      }),
    });
  });

  // Mock 批量生成 API
  await page.route('**/api/generate/batch', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          batchId: 'batch-test-123',
          totalItems: 3,
          status: 'processing',
          items: [],
        },
      }),
    });
  });

  // Mock 生成状态轮询 API
  await page.route('**/api/generate/*/status', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 'gen-test-123',
          stage: 'generating',
          stageName: '生成中',
          progress: 50,
          estimatedTimeRemaining: 15,
        },
      }),
    });
  });

  // Mock 生成完成 API
  await page.route('**/api/generate/*/complete', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          id: 'gen-test-123',
          stage: 'completed',
          stageName: '已完成',
          progress: 100,
          images: [
            {
              id: 'img-1',
              url: 'https://example.com/generated-image-1.jpg',
              thumbnailUrl: 'https://example.com/thumb-1.jpg',
              metadata: {
                width: 1024,
                height: 1024,
                format: 'jpg',
                size: 512000,
              },
            },
          ],
        },
      }),
    });
  });
}

test.describe('Story 6.2 - 单个图片生成进度 @p0 @story-6-2', () => {
  test.beforeEach(async ({ page }) => {
    await setupGenerationMocks(page);
  });

  test('AC-1: 应该显示单个图片生成的进度 @critical', async ({ page }) => {
    // GIVEN: 用户在模版编辑页面
    await page.goto(`${BASE_URL}/templates/edit`);

    // WHEN: 点击生成按钮并启动生成
    await page.getByTestId('generate-button').click();
    await page.getByTestId('generation-options-dialog').waitFor({ state: 'visible' });

    // 选择生成选项
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('confirm-generation').click();

    // THEN: 应该显示进度对话框
    await expect(page.getByTestId('generation-progress-dialog')).toBeVisible();

    // AND: 应该显示当前阶段
    await expect(page.getByTestId('generation-stage')).toBeVisible();
    await expect(page.getByTestId('generation-stage')).toContainText('初始化中');

    // AND: 应该显示进度条
    await expect(page.getByTestId('progress-bar')).toBeVisible();

    // AND: 应该显示预估剩余时间
    await expect(page.getByTestId('estimated-time')).toBeVisible();
  });

  test('AC-3: 应该显示生成阶段的可视化 @smoke', async ({ page }) => {
    // GIVEN: 用户启动了图片生成
    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('confirm-generation').click();

    // WHEN: 生成进行中
    await page.getByTestId('generation-progress-dialog').waitFor({ state: 'visible' });

    // THEN: 应该显示阶段列表
    await expect(page.getByTestId('stage-visualization')).toBeVisible();

    // AND: 应该显示所有阶段（初始化、生成、处理）
    const stages = await page.getByTestId('stage-item').all();
    expect(stages.length).toBeGreaterThanOrEqual(3);

    // AND: 当前阶段应该高亮显示
    const activeStage = page.getByTestId('stage-item').filter({ hasText: '生成中' });
    await expect(activeStage).toHaveClass(/active/);
  });

  test('AC-5: 生成完成时应该显示通知', async ({ page }) => {
    // GIVEN: 用户启动了图片生成
    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('confirm-generation').click();
    await page.getByTestId('generation-progress-dialog').waitFor({ state: 'visible' });

    // WHEN: 生成完成
    // 注意: 实际场景中需要等待真实的生成完成
    // 这里我们通过 mock 来模拟完成状态

    // THEN: 应该显示完成通知
    await expect(page.getByTestId('generation-complete-toast')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('generation-complete-toast')).toContainText('生成完成');

    // AND: 应该显示预览对话框
    await expect(page.getByTestId('generation-preview-dialog')).toBeVisible();
  });

  test('AC-6: 移动端应该优化进度显示', async ({ page }) => {
    // GIVEN: 使用移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/templates/edit`);

    // WHEN: 启动生成
    await page.getByTestId('generate-button').click();
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('confirm-generation').click();
    await page.getByTestId('generation-progress-dialog').waitFor({ state: 'visible' });

    // THEN: 进度对话框应该适配移动端
    const dialog = page.getByTestId('generation-progress-dialog');
    const box = await dialog.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);

    // AND: 阶段可视化应该是紧凑的
    await expect(page.getByTestId('stage-visualization')).toHaveClass(/compact/);
  });
});

test.describe('Story 6.2 - 批量生成进度 @p1 @story-6-2 @batch', () => {
  test.beforeEach(async ({ page }) => {
    await setupGenerationMocks(page);
  });

  test('AC-2: 应该显示批量生成的总体进度', async ({ page }) => {
    // GIVEN: 用户在模版编辑页面
    await page.goto(`${BASE_URL}/templates/edit`);

    // WHEN: 点击批量生成并选择多张图片
    await page.getByTestId('generate-button').click();
    await page.getByTestId('batch-mode-toggle').click();
    await page.getByTestId('quantity-input').fill('3');
    await page.getByTestId('confirm-generation').click();

    // THEN: 应该显示批量进度对话框
    await expect(page.getByTestId('batch-generation-progress')).toBeVisible();

    // AND: 应该显示总体进度
    await expect(page.getByTestId('overall-progress')).toBeVisible();
    await expect(page.getByTestId('overall-progress')).toContainText('0%');

    // AND: 应该显示已完成/总数
    await expect(page.getByTestId('progress-counter')).toBeVisible();
    await expect(page.getByTestId('progress-counter')).toContainText('0/3');
  });

  test('应该显示批量生成中每个项目的进度', async ({ page }) => {
    // GIVEN: 用户启动了批量生成
    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('batch-mode-toggle').click();
    await page.getByTestId('quantity-input').fill('3');
    await page.getByTestId('confirm-generation').click();

    // WHEN: 批量生成进行中
    await page.getByTestId('batch-generation-progress').waitFor({ state: 'visible' });

    // THEN: 应该显示每个项目的进度
    const items = await page.getByTestId('batch-item').all();
    expect(items.length).toBe(3);

    // AND: 每个项目应该显示独立的进度条
    await expect(page.getByTestId('batch-item').first().getByTestId('item-progress')).toBeVisible();
  });

  test('应该正确更新批量生成的总体进度', async ({ page }) => {
    // GIVEN: 批量生成进行中
    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('batch-mode-toggle').click();
    await page.getByTestId('quantity-input').fill('3');
    await page.getByTestId('confirm-generation').click();
    await page.getByTestId('batch-generation-progress').waitFor({ state: 'visible' });

    // WHEN: 一个项目完成
    // 注意: 实际场景中需要等待真实的进度更新

    // THEN: 总体进度应该更新
    // 完成率为 1/3 = 33%
    await expect(page.getByTestId('overall-progress')).toContainText('33%', { timeout: 10000 });
    await expect(page.getByTestId('progress-counter')).toContainText('1/3');
  });
});

test.describe('Story 6.2 - 错误处理和重试 @p2 @story-6-2 @error-handling', () => {
  test('AC-4: 应该显示生成失败的错误信息', async ({ page }) => {
    // GIVEN: Mock 失败的生成 API
    await page.route('**/api/generate', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: '生成服务暂时不可用',
        }),
      });
    });

    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('confirm-generation').click();

    // WHEN: 生成失败
    await page.waitForTimeout(1000);

    // THEN: 应该显示错误对话框
    await expect(page.getByTestId('error-dialog')).toBeVisible();
    await expect(page.getByTestId('error-dialog')).toContainText('生成失败');

    // AND: 应该显示重试按钮
    await expect(page.getByTestId('retry-button')).toBeVisible();
  });

  test('应该支持重试失败的生成', async ({ page }) => {
    // GIVEN: 第一次生成失败
    let attemptCount = 0;
    await page.route('**/api/generate', async (route) => {
      attemptCount++;
      if (attemptCount === 1) {
        // 第一次失败
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: '生成服务暂时不可用',
          }),
        });
      } else {
        // 第二次成功
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              generationId: 'gen-retry-123',
              status: 'processing',
            },
          }),
        });
      }
    });

    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('confirm-generation').click();

    // 等待错误显示
    await expect(page.getByTestId('error-dialog')).toBeVisible();

    // WHEN: 点击重试按钮
    await page.getByTestId('retry-button').click();

    // THEN: 应该重新发起生成请求
    await expect(page.getByTestId('generation-progress-dialog')).toBeVisible();
    expect(attemptCount).toBe(2);
  });

  test('应该显示批量生成中的部分失败', async ({ page }) => {
    // GIVEN: Mock 批量生成，其中一个失败
    await page.route('**/api/generate/batch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            batchId: 'batch-partial-fail',
            totalItems: 3,
            items: [
              { id: 'gen-1', status: 'completed' },
              { id: 'gen-2', status: 'failed', error: '内容审查失败' },
              { id: 'gen-3', status: 'completed' },
            ],
          },
        }),
      });
    });

    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('batch-mode-toggle').click();
    await page.getByTestId('quantity-input').fill('3');
    await page.getByTestId('confirm-generation').click();

    // WHEN: 批量生成完成，有失败项
    await page.waitForTimeout(2000);

    // THEN: 应该显示部分完成的通知
    await expect(page.getByTestId('partial-completion-toast')).toBeVisible();
    await expect(page.getByTestId('partial-completion-toast')).toContainText('2/3 完成');

    // AND: 失败的项目应该显示错误图标
    await expect(page.getByTestId('batch-item').nth(1).getByTestId('error-icon')).toBeVisible();
  });
});

test.describe('Story 6.2 - 生成预览和结果 @p1 @story-6-2 @preview', () => {
  test.beforeEach(async ({ page }) => {
    await setupGenerationMocks(page);
  });

  test('应该显示生成的图片预览', async ({ page }) => {
    // GIVEN: 用户生成了图片
    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('confirm-generation').click();
    await page.getByTestId('generation-progress-dialog').waitFor({ state: 'visible' });

    // 等待生成完成
    await expect(page.getByTestId('generation-preview-dialog')).toBeVisible({ timeout: 10000 });

    // WHEN: 预览对话框显示
    // THEN: 应该显示生成的图片
    await expect(page.getByTestId('generated-image').first()).toBeVisible();

    // AND: 应该显示图片信息（分辨率、格式等）
    await expect(page.getByTestId('image-metadata')).toBeVisible();
    await expect(page.getByTestId('image-metadata')).toContainText('1024x1024');
  });

  test('应该支持下载生成的图片', async ({ page }) => {
    // GIVEN: 用户生成了图片并查看预览
    await page.goto(`${BASE_URL}/templates/edit`);
    await page.getByTestId('generate-button').click();
    await page.getByTestId('resolution-select').selectOption('标准');
    await page.getByTestId('confirm-generation').click();
    await page.getByTestId('generation-preview-dialog').waitFor({ state: 'visible', timeout: 10000 });

    // WHEN: 点击下载按钮
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-button').click();
    const download = await downloadPromise;

    // THEN: 应该触发下载
    expect(download.suggestedFilename()).toMatch(/\.(jpg|png)$/);
  });
});
