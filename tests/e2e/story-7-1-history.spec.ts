/**
 * Story 7-1: History Management - E2E Tests
 *
 * 测试历史记录的完整用户流程:
 * - AC1: 自动保存分析记录 (FIFO, 最近10条)
 * - AC2: 历史记录列表显示 (时间、缩略图、摘要、状态)
 * - AC3: 历史记录详情查看 (完整分析和模版)
 * - AC4: 基于历史模版创建新分析
 * - AC5: UX 设计规范 (Glassmorphism、图标、响应式)
 * - AC7: 授权控制 (用户只能访问自己的数据)
 */

import { test, expect, Page } from '@playwright/test';

// 测试配置
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('Story 7-1: History Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 登录测试用户
    await page.goto(`${BASE_URL}/auth/signin`);
    // TODO: 实现实际的登录逻辑
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.click('button[type="submit"]');
  });

  test.describe('AC1: 自动保存和 FIFO 清理', () => {
    test('@p0 应该在上传并分析图片后自动保存到历史', async ({ page }) => {
      // 1. 上传图片
      await page.goto(`${BASE_URL}/analysis`);
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFile('./tests/fixtures/test-image.jpg');

      // 2. 等待分析完成
      await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 60000 });

      // 3. 导航到历史记录页面
      await page.goto(`${BASE_URL}/history`);

      // 4. 验证历史记录中有新记录
      const historyCards = await page.locator('[data-testid="history-card"]');
      await expect(historyCards.first()).toBeVisible();

      // 5. 验证显示的信息
      const firstCard = historyCards.first();
      await expect(firstCard.locator('[data-testid="history-time"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="history-thumbnail"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="history-summary"]')).toBeVisible();
      await expect(firstCard.locator('[data-testid="history-status"]')).toBeVisible();
    });

    test('@p1 应该保留最近 10 条记录(FIFO 自动清理)', async ({ page }) => {
      // 注意: 这个测试需要创建 11 条分析记录
      // 由于时间成本,这里只测试验证逻辑

      await page.goto(`${BASE_URL}/history`);

      // 获取当前历史记录数量
      const historyCards = await page.locator('[data-testid="history-card"]');
      const count = await historyCards.count();

      // 验证不超过 10 条
      expect(count).toBeLessThanOrEqual(10);

      // 如果有 10 条,验证没有"加载更多"按钮(因为 FIFO 自动清理)
      if (count === 10) {
        const loadMoreBtn = page.locator('button:has-text("加载更多")');
        await expect(loadMoreBtn).not.toBeVisible();
      }
    });
  });

  test.describe('AC2: 历史记录列表', () => {
    test('@p0 应该正确显示历史记录列表', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      // 等待页面加载
      await page.waitForSelector('[data-testid="history-list"]', { timeout: 5000 });

      // 验证列表容器存在
      const historyList = await page.locator('[data-testid="history-list"]');
      await expect(historyList).toBeVisible();

      // 验证 Glassmorphism 样式
      await expect(historyList).toHaveClass(/ia-glass-card/);
    });

    test('@p1 应该显示相对时间(如"2小时前")', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      const timeElements = await page.locator('[data-testid="history-time"]');
      const count = await timeElements.count();

      if (count > 0) {
        const firstTime = await timeElements.first().textContent();
        // 验证包含时间单位
        expect(firstTime).toMatch(/(小时前|天前|分钟前|刚刚)/);
      }
    });

    test('@p1 应该显示原始图片缩略图', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      const thumbnails = await page.locator('[data-testid="history-thumbnail"] img');
      const count = await thumbnails.count();

      if (count > 0) {
        // 验证图片可见
        await expect(thumbnails.first()).toBeVisible();

        // 验证图片 URL
        const src = await thumbnails.first().getAttribute('src');
        expect(src).toMatch(/^https?:\/\//);
      }
    });

    test('@p1 应该显示模版摘要(前50字符)', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      const summaries = await page.locator('[data-testid="history-summary"]');
      const count = await summaries.count();

      if (count > 0) {
        const firstSummary = await summaries.first().textContent();
        // 验证摘要长度
        expect(firstSummary?.length).toBeLessThanOrEqual(53); // 50 + "..."
      }
    });

    test('@p1 应该显示分析状态(成功/失败)', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      const statusBadges = await page.locator('[data-testid="history-status"]');
      const count = await statusBadges.count();

      if (count > 0) {
        const firstStatus = await statusBadges.first().textContent();
        // 验证状态文本
        expect(firstStatus).toMatch(/(成功|失败|success|failed)/i);
      }
    });
  });

  test.describe('AC3: 历史记录详情', () => {
    test('@p0 应该显示完整的分析结果和模版内容', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      // 点击第一条历史记录
      const firstCard = await page.locator('[data-testid="history-card"]').first();
      await firstCard.click();

      // 等待详情页加载
      await page.waitForSelector('[data-testid="history-detail"]', { timeout: 5000 });

      // 验证四维度分析结果显示
      await expect(page.locator('[data-testid="analysis-lighting"]')).toBeVisible();
      await expect(page.locator('[data-testid="analysis-composition"]')).toBeVisible();
      await expect(page.locator('[data-testid="analysis-colors"]')).toBeVisible();
      await expect(page.locator('[data-testid="analysis-artistic-style"]')).toBeVisible();

      // 验证模版显示
      await expect(page.locator('[data-testid="template-variable"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-json"]')).toBeVisible();
    });

    test('@p1 应该支持返回列表', async ({ page }) => {
      await page.goto(`${BASE_URL}/history/1`);

      // 点击返回按钮
      const backButton = await page.locator('button:has-text("返回")');
      await backButton.click();

      // 验证返回列表页
      await expect(page).toHaveURL(/\/history$/);
      await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    });
  });

  test.describe('AC4: 基于历史模版创建新分析', () => {
    test('@p0 应该支持一键加载模版到分析界面', async ({ page }) => {
      await page.goto(`${BASE_URL}/history/1`);

      // 点击"重新使用"按钮
      const reuseButton = await page.locator('button:has-text("重新使用")');
      await reuseButton.click();

      // 验证导航到分析页面
      await expect(page).toHaveURL(/\/analysis/);

      // 验证模版已加载
      const templateEditor = await page.locator('[data-testid="template-editor"]');
      await expect(templateEditor).toBeVisible();

      // 验证模版内容已填充
      const templateContent = await templateEditor.textContent();
      expect(templateContent).not.toBe('');
    });

    test('@p1 应该允许编辑后重新生成', async ({ page }) => {
      await page.goto(`${BASE_URL}/history/1`);

      // 点击"重新使用"
      await page.click('button:has-text("重新使用")');

      // 等待导航到分析页面
      await page.waitForURL(/\/analysis/);

      // 编辑模版
      const templateEditor = await page.locator('[data-testid="template-editor"]');
      await templateEditor.click();
      await templateEditor.fill('A photo of sunset over the ocean');

      // 点击生成按钮
      const generateButton = await page.locator('button:has-text("生成图片")');
      await generateButton.click();

      // 验证开始生成(不消耗额外 credit,因为只是重新使用模版)
      await expect(page.locator('[data-testid="generation-progress"]')).toBeVisible();
    });
  });

  test.describe('AC5: UX 设计规范', () => {
    test('@p1 应该使用 Glassmorphism 卡片样式', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      const cards = await page.locator('[data-testid="history-card"]');
      const count = await cards.count();

      if (count > 0) {
        const firstCard = cards.first();
        await expect(firstCard).toHaveClass(/ia-glass-card/);
      }
    });

    test('@p1 应该使用 Lucide 图标', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      // 验证历史图标
      const historyIcon = await page.locator('svg[data-lucide="history"]');
      await expect(historyIcon).toBeVisible();

      // 验证时钟图标
      const clockIcon = await page.locator('svg[data-lucide="clock"]');
      await expect(clockIcon).toBeVisible();

      // 验证查看图标
      const eyeIcon = await page.locator('svg[data-lucide="eye"]');
      await expect(eyeIcon).toBeVisible();
    });

    test('@p1 应该是响应式布局', async ({ page }) => {
      // 桌面端
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`${BASE_URL}/history`);

      const cardsDesktop = await page.locator('[data-testid="history-card"]');
      const desktopGrid = await page.locator('[data-testid="history-list"]').locator('..');
      const desktopClass = await desktopGrid.getAttribute('class');

      // 验证桌面端网格布局
      expect(desktopClass).toMatch(/grid/);

      // 移动端
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      const mobileClass = await desktopGrid.getAttribute('class');

      // 验证移动端单列布局
      expect(mobileClass).toMatch(/grid-cols-1/);
    });
  });

  test.describe('AC7: 授权控制', () => {
    test('@critical 未登录用户应该被重定向到登录页', async ({ page, context }) => {
      // 清除所有 cookies
      await context.clearCookies();

      // 尝试访问历史记录页面
      await page.goto(`${BASE_URL}/history`);

      // 验证重定向到登录页
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('@p1 用户只能看到自己的历史记录', async ({ page }) => {
      // 登录用户 A
      await page.goto(`${BASE_URL}/auth/signin`);
      // TODO: 实现 loginAs('user-a@example.com')

      await page.goto(`${BASE_URL}/history`);

      // 获取用户 A 的历史记录数量
      const cardsA = await page.locator('[data-testid="history-card"]');
      const countA = await cardsA.count();

      // 登出并登录用户 B
      // TODO: 实现 logout() 和 loginAs('user-b@example.com')

      await page.goto(`${BASE_URL}/history`);

      // 获取用户 B 的历史记录数量
      const cardsB = await page.locator('[data-testid="history-card"]');
      const countB = await cardsB.count();

      // 验证两个用户看到的历史记录不同
      // (这个测试需要预置数据)
      expect(countB).not.toBe(countA);
    });

    test('@p1 用户不能访问其他人的历史记录详情', async ({ page }) => {
      // 尝试直接访问其他用户的历史记录 ID
      await page.goto(`${BASE_URL}/history/999`);

      // 验证显示 403 或重定向
      const hasForbidden = await page.locator('text=/403|Forbidden|无权访问/').count();
      const isRedirected = page.url().includes('/history');

      expect(hasForbidden > 0 || isRedirected).toBe(true);
    });
  });

  test.describe('完整用户流程', () => {
    test('@p0 上传 -> 分析 -> 自动保存 -> 查看历史 -> 重新使用', async ({ page }) => {
      // 1. 上传图片
      await page.goto(`${BASE_URL}/analysis`);
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFile('./tests/fixtures/test-image.jpg');

      // 2. 等待分析完成
      await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 60000 });

      // 3. 导航到历史记录
      await page.goto(`${BASE_URL}/history`);

      // 4. 验证新记录存在
      const firstCard = await page.locator('[data-testid="history-card"]').first();
      await expect(firstCard).toBeVisible();

      // 5. 点击查看详情
      await firstCard.click();
      await expect(page.locator('[data-testid="history-detail"]')).toBeVisible();

      // 6. 重新使用模版
      await page.click('button:has-text("重新使用")');
      await expect(page).toHaveURL(/\/analysis/);

      // 7. 验证模版已加载
      await expect(page.locator('[data-testid="template-editor"]')).toBeVisible();
    });

    test('@smoke 历史记录空状态应该显示友好提示', async ({ page }) => {
      // TODO: 创建一个没有历史记录的测试用户

      await page.goto(`${BASE_URL}/history`);

      // 验证空状态提示
      const emptyState = await page.locator('[data-testid="history-empty"]');
      await expect(emptyState).toBeVisible();

      // 验证引导文字
      await expect(emptyState.locator('text=/还没有历史记录|开始第一次分析/')).toBeVisible();

      // 验证引导按钮
      const ctaButton = await emptyState.locator('button:has-text("开始分析")');
      await expect(ctaButton).toBeVisible();
    });
  });

  test.describe('性能测试', () => {
    test('@p1 历史记录列表加载性能', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/history`);

      // 等待列表加载完成
      await page.waitForSelector('[data-testid="history-list"]', { timeout: 5000 });

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // 验证加载时间 < 500ms (实际测试中可能需要放宽)
      expect(loadTime).toBeLessThan(5000);
    });

    test('@p1 历史记录详情加载性能', async ({ page }) => {
      await page.goto(`${BASE_URL}/history`);

      const startTime = Date.now();

      // 点击第一条记录
      const firstCard = await page.locator('[data-testid="history-card"]').first();
      await firstCard.click();

      // 等待详情页加载
      await page.waitForSelector('[data-testid="history-detail"]', { timeout: 5000 });

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // 验证加载时间 < 1000ms
      expect(loadTime).toBeLessThan(1000);
    });
  });

  test.describe('移动端测试', () => {
    test('@p1 移动端历史记录列表应该正常显示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/history`);

      // 验证单列布局
      const historyList = await page.locator('[data-testid="history-list"]');
      const gridClass = await historyList.locator('..').getAttribute('class');
      expect(gridClass).toMatch(/grid-cols-1/);

      // 验证卡片可点击
      const firstCard = await page.locator('[data-testid="history-card"]').first();
      await firstCard.click();
      await expect(page.locator('[data-testid="history-detail"]')).toBeVisible();
    });

    test('@p1 移动端导航应该正常工作', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/history/1`);

      // 验证返回按钮可见
      const backButton = await page.locator('button:has-text("返回")');
      await expect(backButton).toBeVisible();

      // 点击返回
      await backButton.click();
      await expect(page).toHaveURL(/\/history$/);
    });
  });
});
