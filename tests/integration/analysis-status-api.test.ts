/**
 * 状态 API 集成测试 (使用真实数据库)
 *
 * 测试 GET /api/analysis/[id]/status 端点
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 *
 * 测试 ID: 1.2-INT-001 至 1.2-INT-007
 *
 * 环境要求:
 * - 需要配置开发数据库连接
 * - 测试数据会在每个测试后清理
 * - 支持并行测试（使用唯一的测试 ID）
 *
 * 数据库配置:
 * - 使用环境变量 DATABASE_URL
 * - 或使用 .env.test.local 配置测试数据库
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '@/app/api/analysis/[id]/status/route';
import { getDb } from '@/lib/db';
import { batchAnalysisResults, analysisResults, user, images } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// Mock Auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('GET /api/analysis/[id]/status (集成测试 - 使用开发数据库)', () => {
  const db = getDb();

  // 用于跟踪需要在 afterEach 中清理的其他用户
  let otherUsersToCleanup: string[] = [];

  // 固定的测试用户 ID（用于所有测试）
  const mockUserId = `test-user-integration-${Date.now()}`;

  // 生成唯一的任务 ID，避免测试间冲突
  // PostgreSQL integer 最大值为 2147483647，确保生成的 ID 在范围内
  const generateUniqueTaskId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    // 确保不超过 integer 最大值
    const MAX_INT = 2147483647;
    return (timestamp + random) % MAX_INT;
  };

  // Helper: 创建完整的测试用户
  const createTestUser = async (userId: string, name: string, email: string) => {
    await db.insert(user).values({
      id: userId,
      email,
      name,
      creditBalance: 100,
      subscriptionTier: 'free',
    }).onConflictDoNothing();
  };

  // Helper: 创建完整的测试图片记录
  const createTestImage = async (imageId: string, userId: string) => {
    await db.insert(images).values({
      id: imageId,
      userId,
      filePath: `/test/path/${imageId}.jpg`,
      fileSize: 1024,
      fileFormat: 'JPEG',
      width: 800,
      height: 600,
      uploadStatus: 'completed',
    }).onConflictDoNothing();
  };

  beforeAll(async () => {
    // 验证数据库连接
    try {
      await db.select({ count: batchAnalysisResults.id }).from(batchAnalysisResults).limit(1);
      console.log('✅ 数据库连接成功，测试将继续使用开发数据库');
    } catch (error) {
      console.error('❌ 数据库连接失败，请检查 DATABASE_URL 配置:', error);
      throw new Error('数据库连接失败，请确保开发数据库已启动并可访问');
    }
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    otherUsersToCleanup = []; // 重置清理列表

    // 创建 mock session，使用固定的 userId
    const mockSession = {
      user: {
        id: mockUserId,
        name: 'Test User',
        email: `test-${mockUserId}@example.com`,
      },
      expires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    vi.mocked(auth).mockResolvedValue(mockSession);

    // 创建测试用户，使用相同的 userId
    await createTestUser(mockUserId, 'Test User', `test-${mockUserId}@example.com`);
  });

  afterEach(async () => {
    // 每个测试后清理该测试创建的数据
    // 按照外键依赖顺序删除
    try {
      // 先删除子表记录
      await db.delete(analysisResults).where(eq(analysisResults.userId, mockUserId));
      await db.delete(images).where(eq(images.userId, mockUserId));
      await db.delete(batchAnalysisResults).where(eq(batchAnalysisResults.userId, mockUserId));
      // 最后删除用户
      await db.delete(user).where(eq(user.id, mockUserId));

      // 清理其他用户
      for (const otherUserId of otherUsersToCleanup) {
        await db.delete(batchAnalysisResults).where(eq(batchAnalysisResults.userId, otherUserId));
        await db.delete(user).where(eq(user.id, otherUserId));
      }
    } catch (error) {
      console.warn('清理测试数据时出现警告:', error);
    }
  });

  /**
   * 1.2-INT-001: 批量任务状态查询成功
   *
   * 验证状态接口返回正确的批量任务状态视图
   */
  it('应该返回 200 和批量任务状态', async () => {
    // 创建测试数据
    const taskId = generateUniqueTaskId();
    await db.insert(batchAnalysisResults).values({
      id: taskId,
      userId: mockUserId,
      mode: 'serial',
      totalImages: 10,
      completedImages: 5,
      failedImages: 1,
      skippedImages: 0,
      status: 'processing',
      creditUsed: 5,
      queuePosition: 3,
      estimatedWaitTime: 120,
      isQueued: false,
      latestErrorMessage: null,
      createdAt: new Date(),
      completedAt: null,
    });

    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      id: taskId,
      status: 'running',
      current_stage: null,
      progress: {
        percentage: 50,
        completed_steps: 5,
        total_steps: 10,
      },
    });
    expect(data.data.recoverable_actions).toContain('cancel');
  });

  /**
   * 1.2-INT-002: 标准分析任务状态查询成功
   *
   * 验证状态接口返回正确的标准分析任务状态视图
   */
  it('应该返回 200 和标准分析任务状态', async () => {
    // 创建测试数据
    const taskId = generateUniqueTaskId();
    const imageId = `test-image-${Date.now()}`;

    // 先创建图片记录（外键约束要求）
    await createTestImage(imageId, mockUserId);

    await db.insert(analysisResults).values({
      id: taskId,
      userId: mockUserId,
      imageId, // 使用已存在的图片 ID
      analysisData: { dimensions: [] },
      confidenceScore: 0.95,
      feedback: null,
      modelId: 'test-model',
      confidenceScores: null,
      retryCount: 0,
      createdAt: new Date(),
    });

    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toMatchObject({
      id: taskId,
      status: 'completed',
      progress: {
        percentage: 100,
      },
    });
  });

  /**
   * 1.2-INT-003: 未登录用户返回 401
   *
   * 验证状态接口的权限校验
   */
  it('应该返回 401 当用户未登录', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const taskId = generateUniqueTaskId();
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
   * 1.2-INT-004: 访问他人任务返回 403
   *
   * 验证状态接口的所有权校验
   */
  it('应该返回 403 当用户访问他人任务', async () => {
    // 创建另一个用户的任务
    const otherUserId = `other-user-${Date.now()}`;
    const taskId = generateUniqueTaskId();

    // 先创建另一个用户记录，满足外键约束
    await createTestUser(otherUserId, 'Other User', `other-${Date.now()}@example.com`);
    otherUsersToCleanup.push(otherUserId); // 标记需要清理

    await db.insert(batchAnalysisResults).values({
      id: taskId,
      userId: otherUserId, // 属于其他用户
      mode: 'serial',
      totalImages: 5,
      completedImages: 2,
      failedImages: 0,
      skippedImages: 0,
      status: 'processing',
      creditUsed: 2,
      queuePosition: 1,
      estimatedWaitTime: 60,
      isQueued: false,
      latestErrorMessage: null,
      createdAt: new Date(),
      completedAt: null,
    });

    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FORBIDDEN');

    // 清理其他用户的数据
    await db.delete(batchAnalysisResults).where(eq(batchAnalysisResults.userId, otherUserId));
  });

  /**
   * 1.2-INT-005: 任务不存在返回 404
   *
   * 验证状态接口的错误处理
   */
  it('应该返回 404 当任务不存在', async () => {
    const taskId = generateUniqueTaskId();
    const request = new Request(`http://localhost:3000/api/analysis/${taskId}/status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: String(taskId) }),
    });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  /**
   * 1.2-INT-006: 任务 ID 为空返回 400
   *
   * 验证状态接口的参数校验
   */
  it('应该返回 400 当任务 ID 为空', async () => {
    const request = new Request(`http://localhost:3000/api/analysis//status`);
    const response = await GET(request, {
      params: Promise.resolve({ id: '' }),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  /**
   * 1.2-INT-007: 数据库错误处理
   *
   * 验证状态接口的错误处理
   *
   * 注意: 此测试模拟数据库错误场景
   * 在真实环境中，可能需要临时破坏数据库连接来测试
   */
  it.skip('应该返回 500 当数据库错误时', async () => {
    // TODO: 需要特殊的环境来模拟数据库错误
    // 可以考虑:
    // 1. 使用测试专用的错误注入机制
    // 2. 临时断开数据库连接
    // 3. 使用数据库代理工具模拟故障
  });
});
