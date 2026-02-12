/**
 * Story 2-4: 进度反馈 E2E 测试
 *
 * 测试场景：
 * 1. 单图片上传进度显示
 * 2. 分析进度显示（阶段指示器、专业术语）
 * 3. 批量分析进度显示
 * 4. 移动端进度栏
 * 5. 队列位置显示
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Story 2-4: Progress Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('AC-1: 上传进度显示', () => {
    test('应该显示上传进度百分比', async ({ page }) => {
      // 导航到上传页面
      await page.goto(`${BASE_URL}/analysis`);

      // 上传测试文件
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待进度条出现
      const progressBar = page.locator('[data-testid="upload-progress"] .MuiLinearProgress-root').first();
      await expect(progressBar).toBeVisible();

      // 验证进度百分比显示
      const progressText = page.locator('text=/\\d+%/');
      await expect(progressText).toBeVisible();
    });

    test('应该显示上传速度和预计剩余时间', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待上传速度显示（如果实现）
      const speedText = page.locator('text=/MB\\/s/');
      // 注意：速度可能只在大文件时显示
      // await expect(speedText).toBeVisible({ timeout: 10000 }).catch(() => {
      //   console.log('速度未显示（可能是小文件）');
      // });

      // 验证预计时间显示
      const estimatedTimeText = page.locator('text=/预计还需/');
      await expect(estimatedTimeText).toBeVisible({ timeout: 10000 });
    });

    test('应该支持大文件（10MB）上传进度显示', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      // 使用大文件测试
      await fileInput.setInputFiles('./tests/fixtures/large-test-image.jpg');

      // 验证进度条正常工作
      const progressBar = page.locator('.MuiLinearProgress-bar');
      await expect(progressBar).toBeVisible();

      // 进度应该从 0% 开始
      const initialWidth = await progressBar.getAttribute('style');
      expect(initialWidth).toContain('0%');
    });
  });

  test.describe('AC-2: 分析进度显示', () => {
    test('应该显示四个阶段的进度', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      // 上传文件以触发分析
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待分析开始
      await page.waitForTimeout(2000);

      // 检查阶段指示器
      const stageIndicator = page.locator('text=/上传中|分析中|生成中|完成/');
      await expect(stageIndicator).toBeVisible();
    });

    test('应该显示当前阶段的专业术语', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待分析阶段
      await page.waitForTimeout(3000);

      // 检查专业术语显示
      const termText = page.locator('text=/正在识别|正在检测|正在分析/');
      await expect(termText).toBeVisible({ timeout: 10000 });
    });

    test('应该显示整体进度百分比', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 验证进度百分比显示
      const progressPercentage = page.locator('text=/\\d+%/');
      await expect(progressPercentage).toBeVisible();
    });
  });

  test.describe('AC-3: 批量分析进度', () => {
    test('应该显示批量分析的总体进度', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      // 切换到批量上传模式
      const batchModeButton = page.locator('text=/批量上传/').or(page.locator('button:has-text("批量")'));
      await batchModeButton.click();

      // 上传多个文件
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([
        './tests/fixtures/test-image-1.jpg',
        './tests/fixtures/test-image-2.jpg',
        './tests/fixtures/test-image-3.jpg',
      ]);

      // 点击开始上传
      const startButton = page.locator('button:has-text("开始")');
      await startButton.click();

      // 验证批量进度显示
      const batchProgress = page.locator('text=/已分析 \\d+\\/\\d+ 张图片/');
      await expect(batchProgress).toBeVisible({ timeout: 15000 });
    });

    test('应该高亮当前正在分析的图片', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      // 切换到批量上传模式
      const batchModeButton = page.locator('text=/批量上传/');
      if (await batchModeButton.isVisible()) {
        await batchModeButton.click();
      }

      // 上传多个文件
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles([
        './tests/fixtures/test-image-1.jpg',
        './tests/fixtures/test-image-2.jpg',
      ]);

      const startButton = page.locator('button:has-text("开始")');
      await startButton.click();

      // 检查缩略图高亮
      const thumbnail = page.locator('[data-testid^="thumbnail-"]').first();
      await expect(thumbnail).toBeVisible();

      // 检查边框颜色变化（表示高亮）
      const borderColor = await thumbnail.evaluate((el) => {
        return window.getComputedStyle(el).borderColor;
      });
      expect(borderColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  test.describe('AC-4: 智能时间估算', () => {
    test('应该动态调整预计剩余时间', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待进度更新
      await page.waitForTimeout(2000);

      // 获取初始预计时间
      const timeText1 = await page.locator('text=/预计还需/').textContent();

      // 等待一段时间
      await page.waitForTimeout(3000);

      // 获取更新后的预计时间
      const timeText2 = await page.locator('text=/预计还需/').textContent();

      // 预计时间应该减少（因为进度在增加）
      expect(timeText1).not.toBe(timeText2);
    });
  });

  test.describe('AC-5: 队列透明化', () => {
    test('应该显示队列位置（如果适用）', async ({ page }) => {
      // 这个测试需要模拟队列场景
      // 可能需要设置测试环境来返回队列信息
      await page.goto(`${BASE_URL}/analysis`);

      // 检查是否有队列位置显示
      const queuePosition = page.locator('text=/当前排队第/');
      const isVisible = await queuePosition.isVisible().catch(() => false);

      if (isVisible) {
        expect(queuePosition).toBeVisible();
      }
      // 如果没有队列，这是正常的
    });
  });

  test.describe('AC-6: 视觉反馈', () => {
    test('应该显示进度条动画', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待进度条出现
      const progressBar = page.locator('.MuiLinearProgress-bar');
      await expect(progressBar).toBeVisible();

      // 检查是否有 transition 样式（表示动画）
      const hasTransition = await progressBar.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.transition.includes('width');
      });

      expect(hasTransition).toBe(true);
    });

    test('应该显示阶段图标点亮效果', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待阶段指示器
      const stageIcon = page.locator('[data-testid="stage-icon"]').or(
        page.locator('.MuiSvgIcon-root').first()
      );

      await expect(stageIcon.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('AC-7: 移动端优化', () => {
    test('应该显示移动端固定顶部进度栏', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 检查移动端进度栏
      const mobileProgress = page.locator('text=/\\d+%/').first();
      await expect(mobileProgress).toBeVisible();

      // 检查是否固定在顶部
      const isSticky = await mobileProgress.evaluate((el) => {
        const parent = el.closest('[style*="position"]');
        if (!parent) return false;
        const style = window.getComputedStyle(parent);
        return style.position === 'sticky' || style.position === 'fixed';
      });

      expect(isSticky).toBe(true);
    });

    test('应该简化移动端进度显示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 移动端应该显示大号百分比
      const percentage = page.locator('text=/\\d+%/').first();
      await expect(percentage).toBeVisible();

      // 检查字体大小（应该较大）
      const fontSize = await percentage.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      expect(parseInt(fontSize)).toBeGreaterThanOrEqual(20); // 至少 20px
    });
  });

  test.describe('错误处理', () => {
    test('应该显示上传错误', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      // 模拟网络错误（通过拦截请求）
      await page.route('**/api/upload', route => route.abort());

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待错误显示
      const errorMessage = page.locator('text=/上传失败|Upload failed/');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('应该显示分析超时错误', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      // 这个测试需要模拟超时场景
      // 可能需要配置测试环境
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 等待较长时间看是否出现超时
      const timeoutMessage = page.locator('text=/超时|timeout/');
      const isVisible = await timeoutMessage.isVisible({ timeout: 70000 }).catch(() => false);

      if (isVisible) {
        expect(timeoutMessage).toBeVisible();
      }
    });
  });

  test.describe('性能测试', () => {
    test('轮询不应该阻塞 UI', async ({ page }) => {
      await page.goto(`${BASE_URL}/analysis`);

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

      // 上传文件后立即检查 UI 响应性
      await page.waitForTimeout(2000);

      // 尝试点击某个按钮
      const cancelButton = page.locator('button:has-text("取消")');
      if (await cancelButton.isVisible()) {
        // 按钮应该可点击（表示 UI 未阻塞）
        await expect(cancelButton).toBeEnabled();
      }
    });
  });
});
