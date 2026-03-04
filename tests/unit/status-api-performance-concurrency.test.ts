/**
 * 状态 API 并发性能测试
 *
 * 测试并发场景下的性能表现
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 *
 * 测试 ID: 1.2-PERF-201 至 1.2-PERF-203
 * 优先级: P2
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

describe('GET /api/analysis/[id]/status - 并发性能测试 (P2)', () => {
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
    vi.mocked(auth).mockResolvedValue(mockSession);

    vi.mocked(getTaskStatusView).mockImplementation(async (taskId, session) => {
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
   * 1.2-PERF-201: 并发 10 个状态查询请求应无错误
   *
   * P2 并发测试
   *
   * 模拟多个客户端同时轮询同一个任务的状态
   * 确保没有数据库连接池耗尽或死锁问题
   */
  it('[P2] 并发 10 个状态查询请求应无错误', async () => {
    const concurrency = 10;
    const requests = Array.from({ length: concurrency }, () =>
      new Request(`http://localhost:3000/api/analysis/${batchTaskId}/status`)
    );

    const startTime = performance.now();

    // 并发执行所有请求
    const responses = await Promise.all(
      requests.map((request) =>
        GET(request, {
          params: Promise.resolve({ id: String(batchTaskId) }),
        })
      )
    );

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // 断言所有请求都成功
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // 验证所有响应数据一致
    const responseDatas = await Promise.all(responses.map((r) => r.json()));
    const firstData = responseDatas[0];
    for (const data of responseDatas) {
      expect(data).toEqual(firstData);
    }

    console.log(`并发 10 个请求总耗时: ${totalTime.toFixed(2)}ms`);
  });

  /**
   * 1.2-PERF-202: 并发 50 个请求应在 5s 内全部完成
   *
   * P2 并发性能测试
   *
   * 测试在高并发场景下的响应时间
   * 50 个并发请求，所有请求应在 5s 内完成
   */
  it('[P2] 并发 50 个请求应在 5s 内全部完成', async () => {
    const concurrency = 50;
    const startTime = performance.now();

    const requests = Array.from({ length: concurrency }, () =>
      new Request(`http://localhost:3000/api/analysis/${standardTaskId}/status`)
    );

    // 并发执行所有请求
    const responses = await Promise.all(
      requests.map((request) =>
        GET(request, {
          params: Promise.resolve({ id: String(standardTaskId) }),
        })
      )
    );

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // 断言总时间 < 5s
    expect(totalTime).toBeLessThan(5000);

    // 断言所有请求都成功
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    console.log(`并发 50 个请求总耗时: ${totalTime.toFixed(2)}ms`);
  });

  /**
   * 1.2-PERF-203: 并发查询不同任务应互不影响
   *
   * P2 不同任务的并发查询
   *
   * 模拟多个客户端轮询不同任务的状态
   * 确保数据库查询不会相互干扰
   */
  it('[P2] 并发查询不同任务应互不影响', async () => {
    const taskIds = [batchTaskId, standardTaskId];
    const concurrencyPerTask = 5;

    const requests: Array<{ request: Request; taskId: number }> = [];

    // 为每个任务创建多个并发请求
    taskIds.forEach((taskId) => {
      for (let i = 0; i < concurrencyPerTask; i++) {
        requests.push({
          request: new Request(`http://localhost:3000/api/analysis/${taskId}/status`),
          taskId,
        });
      }
    });

    // 并发执行所有请求
    const responses = await Promise.all(
      requests.map(({ request, taskId }) =>
        GET(request, {
          params: Promise.resolve({ id: String(taskId) }),
        })
      )
    );

    // 断言所有请求都成功
    responses.forEach((response, index) => {
      expect(response.status).toBe(200);
    });

    // 验证响应数据与对应的任务 ID 匹配
    for (let i = 0; i < responses.length; i++) {
      const data = await responses[i].json();
      expect(data.data.id).toBe(requests[i].taskId);
    }

    console.log(`并发查询 ${taskIds.length} 个不同任务，每个 ${concurrencyPerTask} 次请求，全部成功`);
  });
});
