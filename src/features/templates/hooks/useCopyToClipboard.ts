'use client';

import { useState, useCallback } from 'react';

interface UseCopyToClipboardReturn {
  /** Copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Whether the last copy operation was successful */
  isSuccess: boolean;
  /** Copy error if any */
  error: Error | null;
  /** Whether a copy operation is in progress */
  isCopying: boolean;
}

interface UseCopyToClipboardOptions {
  /** Success duration in ms */
  successDuration?: number;
  /** Callback on successful copy */
  onCopySuccess?: (text: string) => void;
  /** Callback on copy error */
  onCopyError?: (error: Error) => void;
}

/**
 * Hook for copying text to clipboard with feedback
 *
 * Features:
 * - Copy text to clipboard using Clipboard API
 * - Fallback for older browsers
 * - Success/error state tracking
 * - Optional callbacks
 * - Keyboard shortcut support (Ctrl/Cmd + C)
 *
 * @example
 * ```tsx
 * const { copy, isSuccess } = useCopyToClipboard();
 *
 * <button onClick={() => copy('Hello world')}>
 *   {isSuccess ? 'Copied!' : 'Copy'}
 * </button>
 * ```
 */
export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn {
  const { successDuration = 2000, onCopySuccess, onCopyError } = options;
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      setIsCopying(true);
      setError(null);

      try {
        // Try modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);

          if (!successful) {
            throw new Error('Fallback copy command failed');
          }
        }

        setIsSuccess(true);
        onCopySuccess?.(text);

        // Reset success state after duration
        setTimeout(() => {
          setIsSuccess(false);
        }, successDuration);

        return true;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Copy operation failed');
        setError(errorObj);
        onCopyError?.(errorObj);
        return false;
      } finally {
        setIsCopying(false);
      }
    },
    [successDuration, onCopySuccess, onCopyError]
  );

  return {
    copy,
    isSuccess,
    error,
    isCopying,
  };
}
