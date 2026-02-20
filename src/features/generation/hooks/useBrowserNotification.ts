/**
 * useBrowserNotification Hook
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Hook for managing browser notifications
 */

import { useState, useEffect, useCallback } from 'react';
import type { NotificationPermission } from '../../types/progress';
import {
  requestNotificationPermission,
  getNotificationPermission,
  areNotificationsSupported,
  areNotificationsEnabled,
  showCompletedNotification,
  showFailedNotification,
  showTimeoutNotification,
  NOTIFICATION_PERMISSION_EDUCATION,
} from '../../lib/notification-handler';
import type { GenerationProgress } from '../../types/progress';

/**
 * Hook for browser notification management
 */
export function useBrowserNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [hasPromptedBefore, setHasPromptedBefore] = useState(false);

  // Check notification support on mount
  useEffect(() => {
    setIsSupported(areNotificationsSupported());
    setPermission(getNotificationPermission());

    // Check if we've prompted before
    const hasPrompted = localStorage.getItem('notification-prompted');
    setHasPromptedBefore(hasPrompted === 'true');
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);

    if (newPermission === 'granted') {
      localStorage.setItem('notification-prompted', 'true');
      setHasPromptedBefore(true);
      setShowPermissionPrompt(false);
      return true;
    }

    return false;
  }, [isSupported]);

  // Show permission prompt (should be called in response to user action)
  const showPrompt = useCallback(() => {
    if (!isSupported || hasPromptedBefore) return;
    setShowPermissionPrompt(true);
  }, [isSupported, hasPromptedBefore]);

  // Dismiss permission prompt
  const dismissPrompt = useCallback(() => {
    setShowPermissionPrompt(false);
    localStorage.setItem('notification-prompted', 'true');
    setHasPromptedBefore(true);
  }, []);

  // Show completed notification
  const notifyCompleted = useCallback(
    (progress: GenerationProgress, clickUrl?: string): boolean => {
      return showCompletedNotification(progress, clickUrl);
    },
    []
  );

  // Show failed notification
  const notifyFailed = useCallback(
    (progress: GenerationProgress, clickUrl?: string): boolean => {
      return showFailedNotification(progress, clickUrl);
    },
    []
  );

  // Show timeout notification
  const notifyTimeout = useCallback(
    (progress: GenerationProgress, clickUrl?: string): boolean => {
      return showTimeoutNotification(progress, clickUrl);
    },
    []
  );

  return {
    permission,
    isSupported,
    isEnabled: areNotificationsEnabled(),
    showPermissionPrompt,
    requestPermission,
    showPrompt,
    dismissPrompt,
    notifyCompleted,
    notifyFailed,
    notifyTimeout,
    education: NOTIFICATION_PERMISSION_EDUCATION,
  };
}

/**
 * Hook for automatic generation notifications
 */
export function useGenerationNotifications(
  progress: GenerationProgress | null,
  onComplete?: () => void,
  onClick?: (url: string) => void
) {
  const { notifyCompleted, notifyFailed, notifyTimeout, isEnabled } =
    useBrowserNotification();

  useEffect(() => {
    if (!progress || !isEnabled) return;

    // Handle completion
    if (progress.stage === 'completed') {
      const clickUrl = onClick ? `/generations/${progress.id}` : undefined;
      notifyCompleted(progress, clickUrl);
      onComplete?.();
    }

    // Handle failure
    if (progress.stage === 'failed') {
      const clickUrl = onClick ? `/generations/${progress.id}` : undefined;
      notifyFailed(progress, clickUrl);
    }

    // Handle timeout
    if (progress.stage === 'timeout') {
      const clickUrl = onClick ? `/generations/${progress.id}` : undefined;
      notifyTimeout(progress, clickUrl);
    }
  }, [progress, isEnabled, notifyCompleted, notifyFailed, notifyTimeout, onComplete, onClick]);
}
