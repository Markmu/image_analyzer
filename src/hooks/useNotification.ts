/**
 * 通知 Hook
 *
 * Story 3-3: 分析进度与队列管理
 * AC-3: 任务完成通知 - 使用 Web Notifications API
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 通知权限状态
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * 通知选项
 */
export interface NotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * useNotification Hook
 *
 * 提供浏览器通知功能：
 * - 请求通知权限
 * - 发送通知
 * - 管理通知偏好
 */
export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(true);

  // 初始化时检查权限状态
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);

      // 从 localStorage 读取用户偏好
      const savedPreference = localStorage.getItem('notificationsEnabled');
      if (savedPreference !== null) {
        setIsEnabled(savedPreference === 'true');
      }
    }
  }, []);

  /**
   * 请求通知权限
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      return 'denied';
    }

    // 请求权限
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  /**
   * 发送通知
   */
  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions): boolean => {
      // 检查通知是否启用
      if (!isEnabled) {
        return false;
      }

      // 检查权限
      if (permission !== 'granted') {
        return false;
      }

      // 发送通知
      try {
        new Notification(title, {
          ...options,
          // 默认选项
          icon: options?.icon || '/icon.png',
          tag: options?.tag || 'analysis-notification',
        });
        return true;
      } catch (error) {
        console.error('Failed to send notification:', error);
        return false;
      }
    },
    [permission, isEnabled]
  );

  /**
   * 发送分析完成通知
   */
  const notifyAnalysisComplete = useCallback(
    (batchId?: number) => {
      return sendNotification('分析完成', {
        body: batchId
          ? `图片分析已完成，点击查看结果`
          : '您的图片分析已完成',
        tag: 'analysis-complete',
      });
    },
    [sendNotification]
  );

  /**
   * 发送分析失败通知
   */
  const notifyAnalysisFailed = useCallback(
    (error?: string) => {
      return sendNotification('分析失败', {
        body: error || '图片分析遇到问题，请稍后重试',
        tag: 'analysis-failed',
      });
    },
    [sendNotification]
  );

  /**
   * 发送排队位置更新通知
   */
  const notifyQueueUpdate = useCallback(
    (position: number, estimatedTime: number) => {
      return sendNotification('排队更新', {
        body: `您当前排在第 ${position} 位，预计等待 ${Math.ceil(estimatedTime / 60)} 分钟`,
        tag: 'queue-update',
      });
    },
    [sendNotification]
  );

  /**
   * 设置通知偏好
   */
  const setNotificationEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('notificationsEnabled', String(enabled));
  }, []);

  /**
   * 切换通知偏好
   */
  const toggleNotification = useCallback(() => {
    setNotificationEnabled(!isEnabled);
  }, [isEnabled, setNotificationEnabled]);

  return {
    permission,
    isEnabled,
    requestPermission,
    sendNotification,
    notifyAnalysisComplete,
    notifyAnalysisFailed,
    notifyQueueUpdate,
    setNotificationEnabled,
    toggleNotification,
  };
}
