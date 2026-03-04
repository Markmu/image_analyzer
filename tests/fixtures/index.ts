/**
 * 测试 Fixtures 统一导出
 *
 * 提供所有测试工厂的统一入口
 * 简化导入路径
 *
 * @test-architecture Integration Test Fixtures
 * @usage
 * import { createAnalysisFixtures, TestScenario } from '@/tests/fixtures';
 */

// 数据库工厂
export {
  TestDataBuilder,
  createTestDataBuilder,
} from './database-factory';

// 认证工厂
export {
  createMockSession,
  mockAuthService,
  resetAuthMock,
  AuthContext,
  createAuthContext,
} from './auth-factory';

// 分析任务工厂
export {
  TestScenario,
  AnalysisTestFixtures,
  createAnalysisFixtures,
  setupStandardTest,
} from './analysis-factory';

// 便捷重新导出
export { createAnalysisFixtures as createFixtures };
export { TestScenario as Scenario };
