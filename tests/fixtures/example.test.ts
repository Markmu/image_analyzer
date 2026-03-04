/**
 * Fixtures 使用示例
 *
 * 展示如何使用测试 Fixtures 工厂来简化测试代码
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/analysis/[id]/status/route';
import { createAnalysisFixtures, TestScenario, createAuthContext } from './index';

describe('Fixtures 使用示例', () => {
  const fixtures = createAnalysisFixtures();

  beforeEach(async () => {
    // fixtures 会在每个测试前自动重置
  });

  afterEach(async () => {
    // 自动清理所有测试数据
    await fixtures.cleanup();
  });

  /**
   * 示例 1: 使用预定义场景（最简单）
   */
  it('应该返回批量任务状态（使用 fixtures）', async () => {
    // 一行代码创建完整的测试场景
    const { userId, taskId } = await fixtures.createScenario(
      TestScenario.BATCH_PROCESSING
    );

    // 执行测试
    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    // 验证结果
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(taskId);
    expect(data.data.status).toBe('running');
  });

  /**
   * 示例 2: 测试未登录场景
   */
  it('应该返回 401 当用户未登录', async () => {
    // Mock 未登录状态
    fixtures.mockUnauthenticated();

    const taskId = 12345;
    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  /**
   * 示例 3: 使用不同场景
   */
  it('应该返回已完成的批量任务状态', async () => {
    const { taskId } = await fixtures.createScenario(
      TestScenario.BATCH_COMPLETED
    );

    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.data.status).toBe('completed');
  });

  /**
   * 示例 4: 使用底层构建器进行精细控制
   */
  it('应该处理自定义场景', async () => {
    const userId = await fixtures.createAuthenticatedUser({
      name: 'Custom User',
      email: 'custom@example.com',
    });

    const db = fixtures.getDbBuilder();

    // 创建多个图片
    const imageIds = await Promise.all([
      db.createImage(userId, { fileFormat: 'PNG', width: 1920, height: 1080 }),
      db.createImage(userId, { fileFormat: 'JPEG', width: 800, height: 600 }),
      db.createImage(userId, { fileFormat: 'WEBP', width: 1024, height: 768 }),
    ]);

    // 创建批量任务
    const taskId = await db.createBatchTask(userId, {
      mode: 'parallel',
      totalImages: 3,
      completedImages: 2,
      failedImages: 0,
      status: 'processing',
    });

    // 测试代码...
    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(200);
  });

  /**
   * 示例 5: 测试标准分析结果
   */
  it('应该返回标准分析结果状态', async () => {
    const { taskId } = await fixtures.createScenario(
      TestScenario.STANDARD_COMPLETED
    );

    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.data.status).toBe('completed');
  });

  /**
   * 示例 6: 多用户场景（测试权限）
   */
  it('应该返回 403 当用户访问他人任务', async () => {
    // 创建第一个用户和任务
    const { userId: user1Id, taskId } = await fixtures.createScenario(
      TestScenario.BATCH_PROCESSING
    );

    // 创建第二个用户（当前认证用户）
    const auth2 = createAuthContext();
    const session2 = auth2.createSession({
      name: 'Other User',
      email: 'other@example.com',
    });
    auth2.mock();

    // 第二个用户尝试访问第一个用户的任务
    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(403);

    // 清理第二个用户的认证上下文
    auth2.reset();
  });

  /**
   * 对比：之前 vs 之后
   */
  describe('代码对比', () => {
    it('之前：需要手动创建所有数据', async () => {
      // ❌ 旧方式：冗长且容易出错
      const mockUserId = `test-user-${Date.now()}`;
      const generateUniqueTaskId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const MAX_INT = 2147483647;
        return (timestamp + random) % MAX_INT;
      };

      const taskId = generateUniqueTaskId();

      // 手动创建用户
      await fixtures.getDbBuilder().createUser({
        id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
      });

      // 手动创建任务
      await fixtures.getDbBuilder().createBatchTask(mockUserId, {
        id: taskId,
        mode: 'serial',
        totalImages: 10,
        completedImages: 5,
        status: 'processing',
      });

      // 测试代码...
      expect(taskId).toBeDefined();
    });

    it('之后：一行代码搞定', async () => {
      // ✅ 新方式：简洁且不易出错
      const { userId, taskId } = await fixtures.createScenario(
        TestScenario.BATCH_PROCESSING
      );

      // 测试代码...
      expect(taskId).toBeDefined();
    });
  });
});

/**
 * 预期的改进效果
 *
 * 代码行数减少：~70%
 * 测试可读性：显著提升
 * 维护成本：大幅降低
 * Bug 风险：最小化
 */
