/**
 * 轮询 Hook
 *
 * Story 3-3: 分析进度与队列管理
 * AC-6: 后台异步处理 - 使用轮询模式查询任务状态
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 轮询配置选项
 */
export interface PollingOptions {
  interval?: number; // 轮询间隔（毫秒），默认 3000
  enabled?: boolean; // 是否启用轮询
  retryCount?: number; // 最大重试次数
  retryDelay?: number; // 重试延迟（毫秒）
}

/**
 * 轮询状态
 */
export interface PollingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isPolling: boolean;
}

/**
 * 轮询回调
 */
export type PollingCallback<T> = (data: T) => boolean | void;

/**
 * usePolling Hook
 *
 * 提供轮询功能：
 * - 定期请求任务状态
 * - 任务完成时自动停止轮询
 * - 错误重试机制
 * - 页面可见性控制
 */
export function usePolling<T>(
  url: string | null,
  onStatusChange?: PollingCallback<T>,
  options: PollingOptions = {}
) {
  const {
    interval = 3000,
    enabled = true,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<PollingState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isPolling: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 执行轮询
   */
  const poll = useCallback(async () => {
    if (!url || !enabled) return;

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Unknown error');
      }

      // 重置重试计数
      retryCountRef.current = 0;

      // 更新数据
      setState((prev) => ({
        ...prev,
        data: result.data,
        isLoading: false,
        error: null,
      }));

      // 检查是否需要停止轮询
      if (onStatusChange) {
        const shouldStop = onStatusChange(result.data);
        if (shouldStop) {
          stopPolling();
        }
      }
    } catch (error: any) {
      // 忽略取消请求的错误
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Polling error:', error);

      // 重试逻辑
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(poll, retryDelay);
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    }
  }, [url, enabled, onStatusChange, retryCount, retryDelay]);

  /**
   * 开始轮询
   */
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setState((prev) => ({ ...prev, isPolling: true }));

    // 立即执行一次
    poll();

    // 设置轮询间隔
    intervalRef.current = setInterval(poll, interval);
  }, [poll, interval]);

  /**
   * 停止轮询
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 取消进行中的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState((prev) => ({ ...prev, isPolling: false }));
  }, []);

  /**
   * 手动触发一次轮询
   */
  const triggerPoll = useCallback(() => {
    retryCountRef.current = 0;
    poll();
  }, [poll]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 自动开始/停止轮询
  useEffect(() => {
    if (enabled && url) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, url, startPolling, stopPolling]);

  return {
    ...state,
    startPolling,
    stopPolling,
    triggerPoll,
  };
}
