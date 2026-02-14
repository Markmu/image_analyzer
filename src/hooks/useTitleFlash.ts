/**
 * 页面标题闪烁 Hook
 *
 * Story 3-3: 分析进度与队列管理
 * AC-3: 任务完成通知 - 页面标题闪烁
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 闪烁消息类型
 */
export type FlashMessage = 'processing' | 'completed' | 'failed' | 'queued';

/**
 * 消息配置
 */
const MESSAGE_CONFIG: Record<FlashMessage, string> = {
  processing: '分析中...',
  completed: '分析完成',
  failed: '分析失败',
  queued: '等待中...',
};

/**
 * 默认闪烁持续时间（毫秒）
 */
const DEFAULT_FLASH_DURATION = 5000;

/**
 * useTitleFlash Hook
 *
 * 提供页面标题闪烁功能：
 * - 在处理中显示提示消息
 * - 任务完成时闪烁通知用户
 * - 支持不同状态的消息
 */
export function useTitleFlash() {
  const [originalTitle, setOriginalTitle] = useState<string>('');
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化时保存原始标题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginalTitle(document.title);
    }

    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
      // 恢复原始标题
      if (typeof window !== 'undefined' && originalTitle) {
        document.title = originalTitle;
      }
    };
  }, []);

  /**
   * 开始闪烁
   */
  const startFlashing = useCallback(
    (message: FlashMessage | string, duration: number = DEFAULT_FLASH_DURATION) => {
      if (typeof window === 'undefined') return;

      const msg = MESSAGE_CONFIG[message as FlashMessage] || message;
      setCurrentMessage(msg);
      setIsFlashing(true);

      // 清除之前的定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }

      // 设置闪烁间隔
      let toggle = false;
      intervalRef.current = setInterval(() => {
        document.title = toggle ? msg : originalTitle;
        toggle = !toggle;
      }, 1000);

      // 设置闪烁持续时间
      flashTimeoutRef.current = setTimeout(() => {
        stopFlashing();
      }, duration);
    },
    [originalTitle]
  );

  /**
   * 停止闪烁
   */
  const stopFlashing = useCallback(() => {
    if (typeof window === 'undefined') return;

    setIsFlashing(false);
    setCurrentMessage('');

    // 清除定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (flashTimeoutRef.current) {
      clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }

    // 恢复原始标题
    document.title = originalTitle;
  }, [originalTitle]);

  /**
   * 显示处理中状态
   */
  const showProcessing = useCallback(
    (duration?: number) => {
      startFlashing('processing', duration);
    },
    [startFlashing]
  );

  /**
   * 显示完成状态
   */
  const showCompleted = useCallback(
    (duration?: number) => {
      startFlashing('completed', duration);
    },
    [startFlashing]
  );

  /**
   * 显示失败状态
   */
  const showFailed = useCallback(
    (duration?: number) => {
      startFlashing('failed', duration);
    },
    [startFlashing]
  );

  /**
   * 显示排队状态
   */
  const showQueued = useCallback(
    (duration?: number) => {
      startFlashing('queued', duration);
    },
    [startFlashing]
  );

  /**
   * 设置自定义消息（不闪烁，只是临时更改标题）
   */
  const setTemporaryTitle = useCallback(
    (message: string, duration: number = 3000) => {
      if (typeof window === 'undefined') return;

      document.title = message;

      // 设置恢复时间
      setTimeout(() => {
        document.title = originalTitle;
      }, duration);
    },
    [originalTitle]
  );

  return {
    originalTitle,
    isFlashing,
    currentMessage,
    startFlashing,
    stopFlashing,
    showProcessing,
    showCompleted,
    showFailed,
    showQueued,
    setTemporaryTitle,
  };
}
