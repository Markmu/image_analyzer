/**
 * useAnalysisStatus Hook 单元测试
 *
 * 测试状态轮询 Hook 的行为
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 *
 * 测试 ID: 1.2-UNIT-101 至 1.2-UNIT-110
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnalysisStatus, statusQueryKeys } from '@/features/analysis/hooks/useAnalysisStatus';

// Mock fetch
global.fetch = vi.fn();

describe('useAnalysisStatus', () => {
  let queryClient: QueryClient;
  const mockTaskId = 'test-task-123';

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  /**
   * 1.2-UNIT-101: 正确获取任务状态
   */
  it('应该正确获取任务状态', async () => {
    const mockStatus = {
      success: true,
      data: {
        id: mockTaskId,
        status: 'running' as const,
        current_stage: 'forensic_describer' as const,
        progress: { percentage: 25, completed_steps: 1, total_steps: 4 },
        recoverable_actions: ['cancel'] as const,
        updated_at: new Date().toISOString(),
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatus,
    } as Response);

    const { result } = renderHook(
      () => useAnalysisStatus(mockTaskId, { pollInterval: 100 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status).toBe('running');
    expect(result.current.currentStage).toBe('forensic_describer');
    expect(result.current.progress).toBe(25);
    expect(result.current.recoverableActions).toContain('cancel');
  });

  /**
   * 1.2-UNIT-102: completed 状态时停止轮询
   */
  it('应该在 completed 状态时停止轮询', async () => {
    const mockStatus = {
      success: true,
      data: {
        id: mockTaskId,
        status: 'completed' as const,
        current_stage: null,
        progress: { percentage: 100 },
        recoverable_actions: ['view_result'] as const,
        updated_at: new Date().toISOString(),
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatus,
    } as Response);

    const onComplete = vi.fn();
    const onCompleteWithResult = vi.fn();

    const { result } = renderHook(
      () =>
        useAnalysisStatus(mockTaskId, {
          pollInterval: 100,
          onComplete,
          onCompleteWithResult,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('completed');
    });

    expect(onComplete).toHaveBeenCalled();

    // 验证后续不会继续轮询
    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledTimes(2); // 初始请求 + 完成后加载结果
      },
      { timeout: 500 }
    );
  });

  /**
   * 1.2-UNIT-103: failed 状态时停止轮询并显示错误
   */
  it('应该在 failed 状态时停止轮询并显示错误', async () => {
    const mockStatus = {
      success: true,
      data: {
        id: mockTaskId,
        status: 'failed' as const,
        current_stage: null,
        progress: { percentage: 0 },
        recoverable_actions: ['view_error', 'retry'] as const,
        error_summary: {
          message: '分析失败：图片格式不支持',
          code: 'UNSUPPORTED_FORMAT',
          retryable: false,
        },
        updated_at: new Date().toISOString(),
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatus,
    } as Response);

    const onError = vi.fn();

    const { result } = renderHook(
      () => useAnalysisStatus(mockTaskId, { pollInterval: 100, onError }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('failed');
    });

    expect(result.current.errorSummary).toMatchObject({
      message: '分析失败：图片格式不支持',
      code: 'UNSUPPORTED_FORMAT',
      retryable: false,
    });

    // 验证后续不会继续轮询
    await waitFor(
      () => {
        expect(fetch).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });

  /**
   * 1.2-UNIT-104: queued 状态时显示排队信息
   */
  it('应该在 queued 状态时显示排队信息', async () => {
    const mockStatus = {
      success: true,
      data: {
        id: mockTaskId,
        status: 'queued' as const,
        current_stage: null,
        progress: { percentage: 0 },
        recoverable_actions: ['cancel'] as const,
        queue_info: {
          queue_position: 5,
          estimated_wait_time: 120,
        },
        updated_at: new Date().toISOString(),
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatus,
    } as Response);

    const { result } = renderHook(
      () => useAnalysisStatus(mockTaskId, { pollInterval: 100 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.status).toBe('queued');
    });

    expect(result.current.queueInfo).toMatchObject({
      queue_position: 5,
      estimated_wait_time: 120,
    });
  });

  /**
   * 1.2-UNIT-105: 处理 API 错误响应
   */
  it('应该处理 API 错误响应', async () => {
    const mockError = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '任务不存在',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockError,
    } as Response);

    const onError = vi.fn();

    const { result } = renderHook(
      () => useAnalysisStatus(mockTaskId, { pollInterval: 100, onError }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('任务不存在');
  });

  /**
   * 1.2-UNIT-106: 处理网络错误
   */
  it('应该处理网络错误', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const onError = vi.fn();

    const { result } = renderHook(
      () => useAnalysisStatus(mockTaskId, { pollInterval: 100, onError }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalled();
  });

  /**
   * 1.2-UNIT-107: 任务 ID 为空时不启用查询
   */
  it('应该在任务 ID 为空时不启用查询', () => {
    const { result } = renderHook(
      () => useAnalysisStatus(null, { pollInterval: 100 }),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  /**
   * 1.2-UNIT-108: 支持手动刷新
   */
  it('应该支持手动刷新', async () => {
    const mockStatus = {
      success: true,
      data: {
        id: mockTaskId,
        status: 'running' as const,
        current_stage: 'forensic_describer' as const,
        progress: { percentage: 25 },
        recoverable_actions: ['cancel'] as const,
        updated_at: new Date().toISOString(),
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockStatus,
    } as Response);

    const { result } = renderHook(
      () => useAnalysisStatus(mockTaskId, { pollInterval: 100 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const fetchCountBefore = vi.mocked(fetch).mock.calls.length;

    // 手动刷新
    result.current.refetch();

    await waitFor(() => {
      expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(fetchCountBefore);
    });
  });

  /**
   * 1.2-UNIT-109: 使用正确的 query key
   */
  it('应该使用正确的 query key', () => {
    expect(statusQueryKeys.all).toEqual(['analysis-status']);
    expect(statusQueryKeys.detail('task-123')).toEqual(['analysis-status', 'task-123']);
  });
});
