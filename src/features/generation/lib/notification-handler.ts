/**
 * Notification Handler
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Handle browser notifications for generation events
 */

import type {
  GenerationNotification,
  GenerationProgress,
  NotificationPermission,
} from '../types/progress';
import { NOTIFICATION_PERMISSION_KEY } from './progress-constants';

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    saveNotificationPermission('granted');
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    saveNotificationPermission(permission);
    return permission as NotificationPermission;
  }

  return 'denied';
}

/**
 * Get saved notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined') return 'denied';

  try {
    const saved = localStorage.getItem(NOTIFICATION_PERMISSION_KEY);
    return (saved as NotificationPermission) || 'default';
  } catch {
    return 'default';
  }
}

/**
 * Save notification permission to localStorage
 */
function saveNotificationPermission(permission: NotificationPermission): void {
  try {
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
  } catch (error) {
    console.error('[NotificationHandler] Failed to save notification permission:', error);
  }
}

/**
 * Show a notification
 */
export function showNotification(notification: GenerationNotification): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192.png', // App icon
      badge: '/badge-72.png', // Badge icon
      tag: notification.generationId, // Prevents duplicate notifications
      timestamp: notification.timestamp.getTime(),
      requireInteraction: notification.type === 'failed',
    });

    // Handle click
    notif.onclick = () => {
      window.focus();
      if (notification.clickUrl) {
        window.location.href = notification.clickUrl;
      }
      notif.close();
    };

    // Auto-close after 5 seconds for success notifications
    if (notification.type === 'completed') {
      setTimeout(() => notif.close(), 5000);
    }

    return true;
  } catch (error) {
    console.error('[NotificationHandler] Failed to show notification:', error);
    return false;
  }
}

/**
 * Show generation completed notification
 */
export function showCompletedNotification(
  progress: GenerationProgress,
  clickUrl?: string
): boolean {
  return showNotification({
    generationId: progress.id,
    type: 'completed',
    title: '图片生成完成',
    message: progress.templateName
      ? `"${progress.templateName}" 已生成完成`
      : '您的图片已生成完成',
    clickUrl,
    timestamp: new Date(),
  });
}

/**
 * Show generation failed notification
 */
export function showFailedNotification(
  progress: GenerationProgress,
  clickUrl?: string
): boolean {
  return showNotification({
    generationId: progress.id,
    type: 'failed',
    title: '图片生成失败',
    message: progress.error?.message || '生成过程中发生错误',
    clickUrl,
    timestamp: new Date(),
  });
}

/**
 * Show generation timeout notification
 */
export function showTimeoutNotification(
  progress: GenerationProgress,
  clickUrl?: string
): boolean {
  return showNotification({
    generationId: progress.id,
    type: 'timeout',
    title: '图片生成超时',
    message: '生成时间过长,已自动停止',
    clickUrl,
    timestamp: new Date(),
  });
}

/**
 * Check if notifications are supported
 */
export function areNotificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  return areNotificationsSupported() && getNotificationPermission() === 'granted';
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  // Close all active notifications
  // Note: There's no direct API to close all notifications, so we rely on tag auto-replacement
}

/**
 * Create notification click URL for a generation
 */
export function createNotificationClickUrl(generationId: string): string {
  return `${window.location.origin}/generations/${generationId}`;
}

/**
 * Setup notification permission prompt
 * Should be called in response to user action
 */
export async function setupNotificationPermission(): Promise<boolean> {
  if (!areNotificationsSupported()) {
    console.warn('[NotificationHandler] Notifications not supported');
    return false;
  }

  const permission = await requestNotificationPermission();
  return permission === 'granted';
}

/**
 * Educational text for notification permission
 */
export const NOTIFICATION_PERMISSION_EDUCATION = {
  title: '启用通知',
  description: '当图片生成完成时,我们会通知您,这样您就可以在做其他事情的时候等待生成完成。',
  benefits: [
    '生成完成时立即收到通知',
    '无需持续检查进度',
    '可以在后台运行生成任务',
  ],
  buttonText: '启用通知',
  skipButtonText: '暂不启用',
};
