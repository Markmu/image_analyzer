/**
 * 页面可见性 Hook
 *
 * Story 3-3: 分析进度与队列管理
 * AC-4: 页面离开后继续处理 - 使用 Page Visibility API
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 可见性状态
 */
export type VisibilityState = 'visible' | 'hidden' | 'prerender' | 'unloaded';

/**
 * useVisibility Hook
 *
 * 提供页面可见性功能：
 * - 检测页面是否可见
 * - 页面重新可见时触发回调
 * - 用于页面刷新恢复状态
 */
export function useVisibility(onVisible?: () => void) {
  const [isVisible, setIsVisible] = useState(true);
  const [visibilityState, setVisibilityState] = useState<VisibilityState>('visible');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 初始化状态
    setIsVisible(!document.hidden);
    setVisibilityState(document.visibilityState as VisibilityState);

    /**
     * 处理可见性变化
     */
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      const state = document.visibilityState as VisibilityState;

      setIsVisible(visible);
      setVisibilityState(state);

      // 页面重新可见时触发回调
      if (visible && onVisible) {
        onVisible();
      }
    };

    // 监听 visibilitychange 事件
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 清理
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onVisible]);

  /**
   * 手动刷新数据（当页面重新可见时）
   */
  const refreshOnVisible = useCallback(() => {
    if (isVisible && onVisible) {
      onVisible();
    }
  }, [isVisible, onVisible]);

  return {
    isVisible,
    visibilityState,
    refreshOnVisible,
  };
}

/**
 * usePageLeave Hook
 *
 * 检测用户是否离开页面
 * 可用于保存状态或提示用户
 */
export function usePageLeave(onLeave?: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined' || !onLeave) return;

    /**
     * 处理页面卸载
     */
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 调用回调
      onLeave();

      // 显示确认对话框（可选）
      // 现代浏览器不再支持自定义消息
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onLeave]);
}

/**
 * useOnlineStatus Hook
 *
 * 检测网络连接状态
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
