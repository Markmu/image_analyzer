/**
 * Toast Hook for Optimization Feedback
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Provides toast notifications for optimization feedback
 */

'use client';

import { useCallback } from 'react';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  message: string;
  severity: ToastSeverity;
  duration?: number;
}

/**
 * Simple toast notification hook
 *
 * This is a placeholder implementation. For production use,
 * integrate with a proper toast library like:
 * - MUI Snackbar (https://mui.com/material-ui/react-snackbar/)
 * - react-hot-toast (https://react-hot-toast.com/)
 * - notistack (https://iamhosseindhv.com/notistack/)
 *
 * TODO: Replace with proper toast library integration
 */
export function useToast() {
  const showToast = useCallback((message: string, severity: ToastSeverity = 'info') => {
    // Placeholder implementation using console
    // In production, this would trigger a toast notification
    console.log(`[Toast ${severity.toUpperCase()}]`, message);

    // TODO: Integrate with actual toast library
    // Example with MUI Snackbar:
    // enqueueSnackbar(message, { variant: severity, autoHideDuration: duration });
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'success');
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      console.error('[Toast ERROR]', message);
      showToast(message, 'error');
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      console.warn('[Toast WARNING]', message);
      showToast(message, 'warning');
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast(message, 'info');
    },
    [showToast]
  );

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
