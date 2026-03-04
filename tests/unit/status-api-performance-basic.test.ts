/**
 * 状态 API 基础性能测试
 *
 * 测试 GET /api/analysis/[id]/status 端点的性能要求
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 *
 * AC7: 状态接口响应时间 < 2s
 *
 * 注意: 本测试使用 Mock 数据库，专注于测试 API 路由层的性能
 * 真实的数据库性能测试需要集成测试环境
 *
 * 测试 ID: 1.2-PERF-101 至 1.2-PERF-103
 * 优先级: P1
 */

import { describe, it, beforeAll, vi, expect } from 'vitest';
import { GET } from '@/app/api/analysis/[id]/status/route';
import { auth } from '@/lib/auth';
import type { Session } from 'next-auth';

// Mock Auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock Database
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(),
}));

vi.mock('@/lib/analysis-tasks/status-service', () => ({
  getTaskStatusView: vi.fn(),
  StatusServiceError: class StatusServiceError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'StatusServiceError';
    }
  },
}));

import { getTaskStatusView, StatusServiceError } from '@/lib/analysis-tasks/status-service';

describe('GET /api/analysis/[id]/status - 基础性能测试 (P1)', () => {
  const mockUserId = 'test-perf-user-id';
  const mockSession: Session = {
    user: {
      id: mockUserId,
      name: 'Performance Test User',
      email: 'perf-test@example.com',
    },
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  const batchTaskId = 1001;
  const standardTaskId = 1002;

  // Mock 状态数据
  const mockBatchStatusView = {
    id: batchTaskId,
    status: 'running' as const,
    current_stage: null,
    progress: {
      percentage: 50,
      completed_steps: 25,
      total_steps: 50,
    },
    error_summary: {
      message: '部分图片处理失败',
      code: 'PARTIAL',
      retryable: true,
    },
    queue_info: {
      queue_position: 5,
      estimated_wait_time: 180,
    },
    recoverable_actions: ['cancel', 'retry'],
    updated_at: new Date().toISOString(),
  };

  const mockStandardStatusView = {
    id: standardTaskId,
    status: 'completed' as const,
    current_stage: null,
    progress: {
      percentage: 100,
      completed_steps: 1,
      total_steps: 1,
    },
    recoverable_actions: ['view', 'export'],
    updated_at: new Date().toISOString(),
  };

  beforeAll(() => {
    // 设置 mock session
    vi.mocked(auth).mockResolvedValue(mockSession);

    // Mock getTaskStatusView 返回数据
    vi.mocked(getTaskStatusView).mockImplementation(async (taskId, session) => {
      // 模拟数据库查询延迟（1-5ms）
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 4 + 1));

      if (taskId === String(batchTaskId) || taskId === batchTaskId) {
        return mockBatchStatusView;
      } else if (taskId === String(standardTaskId) || taskId === standardTaskId) {
        return mockStandardStatusView;
      }

      throw new StatusServiceError('NOT_FOUND', '任务不存在');
    });
  });

  /**
   * 1.2-PERF-101: 批量任务状态查询性能
   *
   * AC7: 状态接口响应时间 < 2s
   *
   * 测试批量任务状态查询的响应时间
   * 批量任务需要查询 batchAnalysisResults 和 batchAnalysisImages 两张表
   */
  it('[P1] 批量任务状态查询应在 2s 内完成', async () => {
    const request = new Request(`http://localhost:3000/api/analysis/${batchTaskId}/status`);
    const startTime = performance.now();

    const response = await GET(request, {
      params: Promise.resolve({ id: String(batchTaskId) }),
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // 断言响应时间 < 2s (2000ms)
    expect(responseTime).toBeLessThan(2000);

    // 断言响应正确
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(batchTaskId);

    console.log(`批量任务状态查询响应时间: ${responseTime.toFixed(2)}ms`);
  });

  /**
   * 1.2-PERF-102: 标准分析任务状态查询性能
   *
   * AC7: 状态接口响应时间 < 2s
   *
   * 测试标准分析任务状态查询的响应时间
   * 标准任务只需要查询 analysisResults 一张表，应该更快
   */
  it('[P1] 标准分析任务状态查询应在 2s 内完成', async () => {
    const request = new Request(`http://localhost:3000/api/analysis/${standardTaskId}/status`);
    const startTime = performance.now();

    const response = await GET(request, {
      params: Promise.resolve({ id: String(standardTaskId) }),
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    // 断言响应时间 < 2s (2000ms)
    expect(responseTime).toBeLessThan(2000);

    // 断言响应正确
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(standardTaskId);

    console.log(`标准分析任务状态查询响应时间: ${responseTime.toFixed(2)}ms`);
  });

  /**
   * 1.2-PERF-103: 100次连续查询性能基准
   *
   * P1 性能基准测试
   *
   * 连续执行 100 次查询，确保平均响应时间 < 500ms
   * 这为轮询场景提供了更严格的性能要求
   */
  it('[P1] 100 次连续查询的平均响应时间应 < 500ms', async () => {
    const iterations = 100;
    const responseTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const request = new Request(
        `http://localhost:3000/api/analysis/${batchTaskId}/status`
      );
      const startTime = performance.now();

      const response = await GET(request, {
        params: Promise.resolve({ id: String(batchTaskId) }),
      });

      const endTime = performance.now();
      responseTimes.push(endTime - startTime);

      // 确保每次请求都成功
      expect(response.status).toBe(200);
    }

    // 计算平均响应时间
    const avgResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    // 断言平均响应时间 < 500ms
    expect(avgResponseTime).toBeLessThan(500);

    // 断言 P95 响应时间 < 1s
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(iterations * 0.95);
    expect(sortedTimes[p95Index]).toBeLessThan(1000);

    console.log(`100 次查询性能统计:
      - 平均响应时间: ${avgResponseTime.toFixed(2)}ms
      - P95 响应时间: ${sortedTimes[p95Index].toFixed(2)}ms
      - 最大响应时间: ${Math.max(...responseTimes).toFixed(2)}ms
      - 最小响应时间: ${Math.min(...responseTimes).toFixed(2)}ms
    `);
  });
});

/**
 * 计算标准差
 */
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
  const variance =
    squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(variance);
}
