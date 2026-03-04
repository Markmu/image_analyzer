/**
 * 分析任务 Fixtures 工厂
 *
 * 提供高层次的测试数据创建接口
 * 组合数据库和认证工厂来简化测试设置
 *
 * @test-architecture Integration Test Fixtures
 * @pattern Facade Pattern
 */

import { createTestDataBuilder, TestDataBuilder } from './database-factory';
import { createAuthContext, AuthContext } from './auth-factory';

/**
 * 分析任务测试场景
 *
 * 预定义的常用测试场景，快速设置测试数据
 */
export enum TestScenario {
  /** 批量任务进行中 */
  BATCH_PROCESSING = 'BATCH_PROCESSING',

  /** 批量任务已完成 */
  BATCH_COMPLETED = 'BATCH_COMPLETED',

  /** 批量任务失败 */
  BATCH_FAILED = 'BATCH_FAILED',

  /** 标准分析已完成 */
  STANDARD_COMPLETED = 'STANDARD_COMPLETED',

  /** 标准分析失败 */
  STANDARD_FAILED = 'STANDARD_FAILED',
}

/**
 * 分析测试 Fixtures
 *
 * 提供高层次 API 来创建复杂的测试场景
 */
export class AnalysisTestFixtures {
  private dbBuilder: TestDataBuilder;
  private authContext: AuthContext;

  constructor() {
    this.dbBuilder = createTestDataBuilder();
    this.authContext = createAuthContext();
  }

  /**
   * 创建已认证的测试用户
   *
   * @returns 用户 ID
   */
  async createAuthenticatedUser(options?: {
    name?: string;
    email?: string;
  }): Promise<string> {
    const session = this.authContext.createSession(options);
    this.authContext.mock();

    const userId = await this.dbBuilder.createUser({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    });

    return userId;
  }

  /**
   * 创建预定义的测试场景
   *
   * @param scenario - 测试场景类型
   * @returns 场景数据（包含任务 ID 等）
   *
   * @example
   * const data = await fixtures.createScenario(TestScenario.BATCH_PROCESSING);
   * expect(data.taskId).toBeDefined();
   * expect(data.userId).toBeDefined();
   */
  async createScenario(scenario: TestScenario): Promise<{
    userId: string;
    taskId: number;
    [key: string]: any;
  }> {
    const userId = await this.createAuthenticatedUser();

    switch (scenario) {
      case TestScenario.BATCH_PROCESSING:
        return {
          userId,
          taskId: await this.createProcessingBatchTask(userId),
          scenario: TestScenario.BATCH_PROCESSING,
        };

      case TestScenario.BATCH_COMPLETED:
        return {
          userId,
          taskId: await this.createCompletedBatchTask(userId),
          scenario: TestScenario.BATCH_COMPLETED,
        };

      case TestScenario.BATCH_FAILED:
        return {
          userId,
          taskId: await this.createFailedBatchTask(userId),
          scenario: TestScenario.BATCH_FAILED,
        };

      case TestScenario.STANDARD_COMPLETED:
        return {
          userId,
          taskId: await this.createCompletedStandardAnalysis(userId),
          scenario: TestScenario.STANDARD_COMPLETED,
        };

      case TestScenario.STANDARD_FAILED:
        return {
          userId,
          taskId: await this.createFailedStandardAnalysis(userId),
          scenario: TestScenario.STANDARD_FAILED,
        };

      default:
        throw new Error(`未知的测试场景: ${scenario}`);
    }
  }

  /**
   * 创建进行中的批量任务
   */
  private async createProcessingBatchTask(userId: string): Promise<number> {
    return this.dbBuilder.createBatchTask(userId, {
      mode: 'serial',
      totalImages: 10,
      completedImages: 5,
      failedImages: 1,
      status: 'processing',
      creditUsed: 5,
      queuePosition: 3,
      estimatedWaitTime: 120,
    });
  }

  /**
   * 创建已完成的批量任务
   */
  private async createCompletedBatchTask(userId: string): Promise<number> {
    return this.dbBuilder.createBatchTask(userId, {
      mode: 'parallel',
      totalImages: 5,
      completedImages: 5,
      failedImages: 0,
      status: 'completed',
      creditUsed: 10,
    });
  }

  /**
   * 创建失败的批量任务
   */
  private async createFailedBatchTask(userId: string): Promise<number> {
    return this.dbBuilder.createBatchTask(userId, {
      mode: 'serial',
      totalImages: 10,
      completedImages: 3,
      failedImages: 7,
      status: 'failed',
      creditUsed: 3,
      latestErrorMessage: 'Analysis failed: too many errors',
    });
  }

  /**
   * 创建已完成的标准分析
   */
  private async createCompletedStandardAnalysis(userId: string): Promise<number> {
    const imageId = await this.dbBuilder.createImage(userId);

    return this.dbBuilder.createAnalysisResult(userId, imageId, {
      confidenceScore: 0.95,
      modelId: 'claude-3-opus',
      analysisData: {
        dimensions: [
          { name: 'quality', score: 0.9 },
          { name: 'composition', score: 0.85 },
        ],
      },
    });
  }

  /**
   * 创建失败的标准分析
   */
  private async createFailedStandardAnalysis(userId: string): Promise<number> {
    const imageId = await this.dbBuilder.createImage(userId);

    return this.dbBuilder.createAnalysisResult(userId, imageId, {
      confidenceScore: 0.3,
      modelId: 'claude-3-haiku',
      feedback: 'Image quality too low for analysis',
      retryCount: 3,
    });
  }

  /**
   * Mock 未登录状态
   */
  mockUnauthenticated(): void {
    this.authContext.mockUnauthenticated();
  }

  /**
   * 清理所有测试数据
   */
  async cleanup(): Promise<void> {
    this.authContext.reset();
    await this.dbBuilder.cleanup();
  }

  /**
   * 获取底层的数据库构建器
   *
   * 用于需要更精细控制的场景
   */
  getDbBuilder(): TestDataBuilder {
    return this.dbBuilder;
  }

  /**
   * 获取底层的认证上下文
   *
   * 用于需要更精细控制的场景
   */
  getAuthContext(): AuthContext {
    return this.authContext;
  }
}

/**
 * 创建分析测试 fixtures 实例
 *
 * @example
 * const fixtures = createAnalysisFixtures();
 *
 * beforeEach(async () => {
 *   const data = await fixtures.createScenario(
 *     TestScenario.BATCH_PROCESSING
 *   );
 * });
 *
 * afterEach(async () => {
 *   await fixtures.cleanup();
 * });
 */
export function createAnalysisFixtures(): AnalysisTestFixtures {
  return new AnalysisTestFixtures();
}

/**
 * 快速助手：创建标准的测试用户和任务
 *
 * @example
 * const { userId, taskId } = await setupStandardTest();
 */
export async function setupStandardTest() {
  const fixtures = createAnalysisFixtures();
  const data = await fixtures.createScenario(TestScenario.BATCH_PROCESSING);

  return {
    fixtures,
    ...data,
  };
}
