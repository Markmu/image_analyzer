/**
 * 分析任务状态 Hook
 *
 * 使用 TanStack Query 实现状态轮询
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 */

import React, { useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  TaskStatus,
  TaskStatusView,
  CurrentStage,
  RecoverableAction,
} from '@/lib/analysis-ir/status-schema';

/**
 * 状态查询键生成器
 */
export const statusQueryKeys = {
  all: ['analysis-status'] as const,
  detail: (id: string | number) => ['analysis-status', id] as const,
};

/**
 * 状态查询函数
 */
async function fetchTaskStatus(taskId: string | number): Promise<TaskStatusView> {
  const response = await fetch(`/api/analysis/${taskId}/status`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: '请求失败' },
    }));
    throw new Error(error.error?.message || '获取任务状态失败');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || '获取任务状态失败');
  }

  return result.data;
}

/**
 * 分析状态查询 Hook 选项
 */
export interface UseAnalysisStatusOptions {
  /** 轮询间隔（毫秒），默认 2000 */
  pollInterval?: number;
  /** 是否启用轮询，默认 true */
  enabled?: boolean;
  /** 状态变化回调 */
  onStatusChange?: (status: TaskStatus, currentStage: CurrentStage) => void;
  /** 完成回调 */
  onComplete?: () => void;
  /** 完成时自动加载最终结果并回调 */
  onCompleteWithResult?: (resultData: unknown) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

/**
 * 分析状态查询 Hook 返回值
 */
export interface UseAnalysisStatusResult {
  /** 任务状态 */
  status: TaskStatus | null;
  /** 当前阶段 */
  currentStage: CurrentStage;
  /** 进度百分比 */
  progress: number;
  /** 可恢复操作 */
  recoverableActions: RecoverableAction[];
  /** 错误摘要 */
  errorSummary: { message: string; code?: string; retryable: boolean } | undefined;
  /** 排队信息 */
  queueInfo: { queue_position: number; estimated_wait_time?: number } | undefined;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否有错误 */
  isError: boolean;
  /** 错误对象 */
  error: Error | null;
  /** 是否在轮询 */
  isPolling: boolean;
  /** 手动刷新 */
  refetch: () => void;
}

/**
 * 分析状态查询 Hook
 *
 * 使用 TanStack Query 实现自动轮询任务状态
 *
 * @param taskId - 任务 ID
 * @param options - Hook 选项
 * @returns 状态查询结果
 *
 * @example
 * ```tsx
 * const { status, progress, isPolling } = useAnalysisStatus(analysisId, {
 *   pollInterval: 2000,
 *   onComplete: () => console.log('分析完成'),
 * });
 * ```
 */
export function useAnalysisStatus(
  taskId: string | number | null | undefined,
  options: UseAnalysisStatusOptions = {}
): UseAnalysisStatusResult {
  const {
    pollInterval = 2000,
    enabled = true,
    onStatusChange,
    onComplete,
    onCompleteWithResult,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const prevStatusRef = React.useRef<TaskStatus | null>(null);

  // 查询任务状态
  const query = useQuery({
    queryKey: taskId ? statusQueryKeys.detail(taskId) : ['analysis-status', 'idle'],
    queryFn: async () => {
      if (!taskId) {
        throw new Error('任务 ID 不能为空');
      }
      return await fetchTaskStatus(taskId);
    },
    // 改进的轮询启用条件：只在有 taskId 且状态为 queued 或 running 时启用
    enabled: enabled && !!taskId && (
      !prevStatusRef.current ||
      ['queued', 'running'].includes(prevStatusRef.current)
    ),
    refetchInterval: pollInterval,
    refetchOnWindowFocus: false, // 切换窗口不重新获取
    retry: 3, // 失败重试 3 次
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
  });

  const data = query.data as TaskStatusView | undefined;

  // 处理状态变化
  React.useEffect(() => {
    if (!data) return;

    const { status, current_stage: currentStage } = data;

    // 检测状态变化
    if (prevStatusRef.current !== status) {
      onStatusChange?.(status, currentStage);

      // 完成回调
      if (status === 'completed' && prevStatusRef.current !== 'completed') {
        // 如果提供了 onCompleteWithResult，自动加载最终结果
        if (onCompleteWithResult && taskId) {
          fetch(`/api/analysis/${taskId}`)
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                onCompleteWithResult(result.data);
              }
            })
            .catch(err => {
              console.error('加载最终结果失败:', err);
            });
        }
        onComplete?.();
      }

      prevStatusRef.current = status;
    }
  }, [data, onStatusChange, onComplete, onCompleteWithResult, taskId]);

  // 处理错误
  React.useEffect(() => {
    if (query.error && query.error instanceof Error) {
      onError?.(query.error);
    }
  }, [query.error, onError]);

  return {
    status: data?.status ?? null,
    currentStage: data?.current_stage ?? null,
    progress: data?.progress?.percentage ?? 0,
    recoverableActions: data?.recoverable_actions ?? [],
    errorSummary: data?.error_summary,
    queueInfo: data?.queue_info,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    isPolling: query.isLoading && query.fetchStatus === 'fetching',
    refetch: () => query.refetch(),
  };
}

/**
 * 预取任务状态
 * 用于在页面跳转前预先加载数据
 */
export function prefetchTaskStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: string | number
): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey: statusQueryKeys.detail(taskId),
    queryFn: () => fetchTaskStatus(taskId),
  });
}

/**
 * 使任务状态缓存失效
 * 用于在手动更新状态后刷新数据
 */
export function invalidateTaskStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: string | number
): void {
  queryClient.invalidateQueries({
    queryKey: statusQueryKeys.detail(taskId),
  });
}

/**
 * 重置任务状态缓存
 * 用于清理不再需要的缓存数据
 */
export function resetTaskStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: string | number
): void {
  queryClient.resetQueries({
    queryKey: statusQueryKeys.detail(taskId),
  });
}
