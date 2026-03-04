/**
 * 数据库 Fixtures 工厂
 *
 * 提供统一的测试数据创建和清理接口
 * 遵循外键依赖顺序，确保数据完整性
 *
 * @test-architecture Integration Test Fixtures
 * @pattern Factory Pattern + Builder Pattern
 */

import { getDb } from '@/lib/db';
import { user, images, batchAnalysisResults, analysisResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Db = ReturnType<typeof getDb>;

/**
 * 测试数据构建器
 * 提供流式 API 来配置测试数据
 */
export class TestDataBuilder {
  private db: Db;
  private cleanupCallbacks: Array<() => Promise<void>> = [];

  constructor(db?: Db) {
    this.db = db || getDb();
  }

  /**
   * 创建测试用户
   *
   * @param options - 用户配置选项
   * @returns 用户 ID
   *
   * @example
   * const userId = await builder.createUser({
   *   name: 'Test User',
   *   email: 'test@example.com'
   * });
   */
  async createUser(options: {
    id?: string;
    name?: string;
    email?: string;
    creditBalance?: number;
    subscriptionTier?: string;
  } = {}): Promise<string> {
    const userId = options.id || `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await this.db.insert(user).values({
      id: userId,
      email: options.email || `test-${userId}@example.com`,
      name: options.name || 'Test User',
      creditBalance: options.creditBalance ?? 100,
      subscriptionTier: options.subscriptionTier || 'free',
    }).onConflictDoNothing();

    // 注册清理回调
    this.cleanupCallbacks.push(async () => {
      await this.db.delete(user).where(eq(user.id, userId));
    });

    return userId;
  }

  /**
   * 创建测试图片
   *
   * @param userId - 所属用户 ID
   * @param options - 图片配置选项
   * @returns 图片 ID
   *
   * @example
   * const imageId = await builder.createImage(userId, {
   *   fileFormat: 'JPEG',
   *   width: 800,
   *   height: 600
   * });
   */
  async createImage(
    userId: string,
    options: {
      id?: string;
      filePath?: string;
      fileSize?: number;
      fileFormat?: string;
      width?: number;
      height?: number;
      uploadStatus?: string;
    } = {}
  ): Promise<string> {
    const imageId = options.id || `test-image-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await this.db.insert(images).values({
      id: imageId,
      userId,
      filePath: options.filePath || `/test/path/${imageId}.jpg`,
      fileSize: options.fileSize ?? 1024,
      fileFormat: options.fileFormat || 'JPEG',
      width: options.width ?? 800,
      height: options.height ?? 600,
      uploadStatus: (options.uploadStatus as any) || 'completed',
    }).onConflictDoNothing();

    // 注册清理回调（注意顺序：先删除子表）
    this.cleanupCallbacks.unshift(async () => {
      await this.db.delete(images).where(eq(images.id, imageId));
    });

    return imageId;
  }

  /**
   * 创建批量分析任务
   *
   * @param userId - 所属用户 ID
   * @param options - 任务配置选项
   * @returns 任务 ID
   *
   * @example
   * const taskId = await builder.createBatchTask(userId, {
   *   mode: 'serial',
   *   totalImages: 10,
   *   status: 'processing'
   * });
   */
  async createBatchTask(
    userId: string,
    options: {
      id?: number;
      mode?: 'serial' | 'parallel' | 'single';
      totalImages?: number;
      completedImages?: number;
      failedImages?: number;
      skippedImages?: number;
      status?: 'pending' | 'processing' | 'completed' | 'failed';
      creditUsed?: number;
      queuePosition?: number;
      estimatedWaitTime?: number;
      isQueued?: boolean;
    } = {}
  ): Promise<number> {
    // PostgreSQL integer 最大值保护
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const MAX_INT = 2147483647;
    const taskId = options.id ?? (timestamp + random) % MAX_INT;

    await this.db.insert(batchAnalysisResults).values({
      id: taskId,
      userId,
      mode: options.mode || 'serial',
      totalImages: options.totalImages ?? 10,
      completedImages: options.completedImages ?? 0,
      failedImages: options.failedImages ?? 0,
      skippedImages: options.skippedImages ?? 0,
      status: options.status || 'pending',
      creditUsed: options.creditUsed ?? 0,
      queuePosition: options.queuePosition ?? 0,
      estimatedWaitTime: options.estimatedWaitTime ?? 0,
      isQueued: options.isQueued ?? false,
      createdAt: new Date(),
      completedAt: null,
    });

    // 注册清理回调（注意顺序：batchAnalysisResults 需要在 images 之后删除）
    this.cleanupCallbacks.unshift(async () => {
      await this.db.delete(batchAnalysisResults).where(eq(batchAnalysisResults.id, taskId));
    });

    return taskId;
  }

  /**
   * 创建标准分析结果
   *
   * @param userId - 所属用户 ID
   * @param imageId - 关联图片 ID
   * @param options - 结果配置选项
   * @returns 结果 ID
   *
   * @example
   * const resultId = await builder.createAnalysisResult(userId, imageId, {
   *   confidenceScore: 0.95,
   *   modelId: 'test-model'
   * });
   */
  async createAnalysisResult(
    userId: string,
    imageId: string,
    options: {
      id?: number;
      analysisData?: object;
      confidenceScore?: number;
      feedback?: string | null;
      modelId?: string;
      retryCount?: number;
    } = {}
  ): Promise<number> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const MAX_INT = 2147483647;
    const resultId = options.id ?? (timestamp + random) % MAX_INT;

    await this.db.insert(analysisResults).values({
      id: resultId,
      userId,
      imageId,
      analysisData: options.analysisData || { dimensions: [] },
      confidenceScore: options.confidenceScore ?? 0.95,
      feedback: options.feedback ?? null,
      modelId: options.modelId || 'test-model',
      confidenceScores: null,
      retryCount: options.retryCount ?? 0,
      createdAt: new Date(),
    });

    // 注册清理回调（analysisResults 最后删除）
    this.cleanupCallbacks.unshift(async () => {
      await this.db.delete(analysisResults).where(eq(analysisResults.id, resultId));
    });

    return resultId;
  }

  /**
   * 清理所有测试数据
   *
   * 按照注册顺序的逆序执行清理，确保外键约束不被违反
   * 建议在 afterEach 中调用
   *
   * @example
   * afterEach(async () => {
   *   await builder.cleanup();
   * });
   */
  async cleanup(): Promise<void> {
    for (const callback of this.cleanupCallbacks) {
      try {
        await callback();
      } catch (error) {
        console.warn('清理测试数据时出现警告:', error);
      }
    }
    this.cleanupCallbacks = [];
  }

  /**
   * 获取清理回调数量（用于调试）
   */
  getPendingCleanupCount(): number {
    return this.cleanupCallbacks.length;
  }
}

/**
 * 创建测试数据构建器实例
 *
 * @param db - 可选的数据库实例
 * @returns TestDataBuilder 实例
 *
 * @example
 * const builder = createTestDataBuilder();
 * const userId = await builder.createUser();
 * const taskId = await builder.createBatchTask(userId);
 * // ... 测试代码 ...
 * await builder.cleanup();
 */
export function createTestDataBuilder(db?: Db): TestDataBuilder {
  return new TestDataBuilder(db);
}
