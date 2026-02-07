/**
 * Mobile Test Configuration
 *
 * 移动端测试特定配置，解决移动浏览器测试隔离问题
 *
 * 主要问题：
 * 1. 移动浏览器（尤其是 iOS Safari）对 Cookie 处理更严格
 * 2. 移动端测试可能需要更长的超时时间
 * 3. 移动端浏览器状态隔离更困难
 *
 * 解决方案：
 * 1. 使用 test.use() 配置移动端特定超时
 * 2. 增加移动端测试的重试次数
 * 3. 确保每个测试后完全清理状态
 */

import { test } from '../support/merged-fixtures';

/**
 * 移动端测试配置
 *
 * 在移动端测试文件中使用此配置
 */
export const mobileTest = test.extend<{
  // 移动端特定 fixtures 可以在这里添加
}>({});

/**
 * 为移动端测试配置更长的超时时间
 *
 * 使用示例：
 * ```typescript
 * import { configureMobileTimeouts } from './support/mobile-test-config';
 *
 * test.describe('Mobile Tests', () => {
 *   configureMobileTimeouts(test);
 *
 *   test('my mobile test', async ({ page }) => {
 *     // 测试代码
 *   });
 * });
 * ```
 */
export function configureMobileTimeouts(testObj: typeof test) {
  testObj.use({
    timeout: 90 * 1000, // 90秒（比桌面端的60秒更长）
    actionTimeout: 20 * 1000, // 20秒操作超时
    navigationTimeout: 40 * 1000, // 40秒导航超时
  });
}

/**
 * 为移动端 Safari 测试配置额外的超时
 *
 * iOS Safari 通常比 Android Chrome 更慢
 */
export function configureMobileSafariTimeouts(testObj: typeof test) {
  testObj.use({
    timeout: 120 * 1000, // 120秒
    actionTimeout: 25 * 1000, // 25秒操作超时
    navigationTimeout: 50 * 1000, // 50秒导航超时
  });
}

/**
 * 移动端测试的最佳实践
 *
 * 1. 始终使用 beforeEach 清理初始状态
 * 2. 始终使用 afterEach 清理测试后状态
 * 3. 使用更长的超时时间
 * 4. 避免并行修改相同的状态
 * 5. 使用明确的等待而不是固定的 timeout
 */
export const mobileTestBestPractices = {
  beforeEach: '使用 beforeEach 清理初始状态',
  afterEach: '使用 afterEach 清理测试后状态（已通过 merged-fixtures.ts 自动处理）',
  timeouts: '使用 configureMobileTimeouts 配置更长的超时',
  waits: '使用 waitForSelector 等待元素，而不是固定的 timeout',
  state: '避免在测试间共享状态，每个测试应该独立',
};

/**
 * 检测当前测试是否在移动端运行
 *
 * 使用示例：
 * ```typescript
 * import { isMobileTest } from './support/mobile-test-config';
 *
 * test('my test', async ({ page, browserName }) => {
 *   if (isMobileTest(browserName)) {
 *     // 移动端特定代码
 *   }
 * });
 * ```
 */
export function isMobileTest(projectName: string): boolean {
  return projectName.startsWith('mobile-') ||
         projectName === 'mobile-chrome' ||
         projectName === 'mobile-safari';
}

/**
 * 检测当前测试是否在 iOS Safari 运行
 */
export function isMobileSafari(projectName: string): boolean {
  return projectName === 'mobile-safari' || projectName === 'webkit';
}

/**
 * 检测当前测试是否在 Android Chrome 运行
 */
export function isMobileChrome(projectName: string): boolean {
  return projectName === 'mobile-chrome' || projectName === 'chromium';
}

export { test } from '../support/merged-fixtures';
export { expect } from '@playwright/test';
