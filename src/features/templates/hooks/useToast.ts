/**
 * Toast Hook for Optimization Feedback
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Provides toast notifications using MUI Snackbar
 */

'use client';

import { useCallback, useState } from 'react';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
}

/**
 * Toast notification hook using MUI Snackbar
 *
 * This implementation manages toast state that can be consumed
 * by a Snackbar component in the application shell.
 *
 * Usage:
 * 1. Add a Snackbar component to your app shell that listens to toast state
 * 2. Use this hook in components to show notifications
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, severity: ToastSeverity = 'info', duration: number = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: ToastMessage = { id, message, severity, duration };

    // Add to queue
    setToasts((prev) => [...prev, toast]);

    // If no toast is currently showing, show this one
    if (!currentToast) {
      setCurrentToast(toast);
      setOpen(true);
    }

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [currentToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    // If dismissing current toast, close it
    if (currentToast?.id === id) {
      setOpen(false);

      // Show next toast in queue after a brief delay
      setTimeout(() => {
        setToasts((prev) => {
          if (prev.length > 0) {
            const next = prev[0];
            setCurrentToast(next);
            setOpen(true);
            return prev.slice(1);
          }
          setCurrentToast(null);
          return prev;
        });
      }, 100);
    }
  }, [currentToast]);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (currentToast) {
      dismissToast(currentToast.id);
    }
  }, [currentToast, dismissToast]);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'success', duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      console.error('[Toast ERROR]', message);
      return showToast(message, 'error', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      console.warn('[Toast WARNING]', message);
      return showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'info', duration);
    },
    [showToast]
  );

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // State for Snackbar component
    toasts,
    open,
    currentToast,
    handleClose,
  };
}

/**
 * Helper function to get Snackbar alert color from severity
 */
export function getSeverityColor(severity: ToastSeverity): 'success' | 'error' | 'warning' | 'info' {
  return severity;
}

/**
 * Helper function to get display text for severity
 */
export function getSeverityText(severity: ToastSeverity): string {
  const texts: Record<ToastSeverity, string> = {
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
  };
  return texts[severity];
}
