/**
 * API 轮询工具
 * 用于智能轮询分析状态和进度
 */

import type { AnalysisStage } from '@/lib/utils/time-estimation';

export interface AnalysisProgress {
  status: AnalysisStage;
  progress: number;
  currentTerm?: string;
  queuePosition?: number | null;
  estimatedTime?: number;
  error?: string;
}

export interface AnalysisResult {
  analysisId: string;
  status: 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export interface PollAnalysisStatusOptions {
  analysisId: string;
  pollInterval?: number; // 轮询间隔（毫秒），默认 2000
  timeout?: number; // 超时时间（毫秒），默认 60000
  maxRetries?: number; // 最大重试次数，默认 3
  onProgress?: (progress: AnalysisProgress) => void;
  onComplete?: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
  onQueueUpdate?: (queuePosition: number) => void;
}

/**
 * 轮询分析状态
 * @param options 轮询配置选项
 * @returns 取消轮询的函数
 */
export const pollAnalysisStatus = (options: PollAnalysisStatusOptions): (() => void) => {
  const {
    analysisId,
    pollInterval = 2000,
    timeout = 60000,
    maxRetries = 3,
    onProgress,
    onComplete,
    onError,
    onQueueUpdate,
  } = options;

  let retries = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let intervalId: NodeJS.Timeout | null = null;
  const startTime = Date.now();
  let cancelled = false;

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (intervalId) {
      clearTimeout(intervalId);
      intervalId = null;
    }
  };

  const poll = async (): Promise<void> => {
    if (cancelled) return;

    try {
      // 检查超时
      const elapsed = Date.now() - startTime;
      if (elapsed > timeout) {
        cleanup();
        const error = new Error('分析超时，请重试');
        onError?.(error);
        return;
      }

      // 调用 API 获取进度
      const response = await fetch(`/api/analysis/${analysisId}/status`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || '获取分析状态失败');
      }

      const progressData: AnalysisProgress = {
        status: data.data.status,
        progress: data.data.progress || 0,
        currentTerm: data.data.currentTerm,
        queuePosition: data.data.queuePosition || null,
        estimatedTime: data.data.estimatedTime,
      };

      // 更新队列信息
      if (progressData.queuePosition && onQueueUpdate) {
        onQueueUpdate(progressData.queuePosition);
      }

      // 更新进度
      if (onProgress) {
        onProgress(progressData);
      }

      // 检查是否完成
      if (data.data.status === 'completed') {
        cleanup();
        onComplete?.({
          analysisId,
          status: 'completed',
          progress: 100,
          result: data.data.result,
        });
        return;
      }

      // 检查是否出错
      if (data.data.status === 'error') {
        cleanup();
        const error = new Error(data.data.error || '分析失败');
        onError?.(error);
        return;
      }

      // 继续轮询
      if (!cancelled) {
        intervalId = setTimeout(poll, pollInterval);
      }
    } catch (error) {
      retries++;

      if (retries >= maxRetries || cancelled) {
        cleanup();
        onError?.(error instanceof Error ? error : new Error('轮询失败'));
        return;
      }

      // 延迟重试（使用指数退避）
      const retryDelay = pollInterval * Math.pow(2, retries - 1);
      if (!cancelled) {
        intervalId = setTimeout(poll, retryDelay);
      }
    }
  };

  // 开始轮询
  poll();

  // 返回取消函数
  return () => {
    cancelled = true;
    cleanup();
  };
};

/**
 * 批量轮询多个分析任务
 * @param analysisIds 分析任务 ID 数组
 * @param options 轮询配置选项
 * @returns 取消所有轮询的函数
 */
export const pollBatchAnalysisStatus = (
  analysisIds: string[],
  options: Omit<PollAnalysisStatusOptions, 'analysisId'>
): (() => void) => {
  const unsubscribers: Array<() => void> = [];

  analysisIds.forEach((analysisId) => {
    const unsubscribe = pollAnalysisStatus({
      ...options,
      analysisId,
    });
    unsubscribers.push(unsubscribe);
  });

  // 返回取消所有轮询的函数
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
};
