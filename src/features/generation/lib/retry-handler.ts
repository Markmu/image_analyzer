/**
 * Retry Handler
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Handle automatic retries for failed generation attempts
 */

import type { GenerationError, GenerationProgress } from '../types/progress';
import {
  MAX_RETRY_COUNT,
  RETRY_DELAYS,
  ERROR_MESSAGES,
} from './progress-constants';
import { extractErrorCode, isRetryableError } from './progress-tracker';

/**
 * Retry state
 */
interface RetryState {
  /** Number of attempts made */
  attemptCount: number;
  /** Last attempt timestamp */
  lastAttemptAt: Date;
  /** Next retry timestamp */
  nextRetryAt?: Date;
  /** Whether retrying is active */
  isRetrying: boolean;
}

/**
 * Active retry attempts map
 */
const activeRetries = new Map<string, RetryState>();

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(retryCount: number): number {
  return RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
}

/**
 * Create a generation error object
 */
export function createGenerationError(
  error: Error,
  retryCount: number = 0
): GenerationError {
  const code = extractErrorCode(error);
  const retryable = isRetryableError(error) && retryCount < MAX_RETRY_COUNT;

  const baseError = {
    code,
    message: error.message,
    retryable,
    retryCount,
  };

  // Add suggestions based on error type
  const errorConfig = ERROR_MESSAGES[code.toLowerCase() as keyof typeof ERROR_MESSAGES];
  if (errorConfig) {
    return {
      ...baseError,
      suggestions: errorConfig.suggestions,
    };
  }

  return baseError;
}

/**
 * Handle generation error with retry logic
 */
export async function handleGenerationError(
  progressId: string,
  error: Error,
  retryCallback?: () => Promise<void>
): Promise<GenerationError> {
  const existingRetry = activeRetries.get(progressId);
  const attemptCount = existingRetry?.attemptCount ?? 0;

  const generationError = createGenerationError(error, attemptCount);

  // Check if we should retry
  if (generationError.retryable && retryCallback && attemptCount < MAX_RETRY_COUNT) {
    const delay = calculateRetryDelay(attemptCount);
    const nextRetryAt = new Date(Date.now() + delay);

    // Update retry state
    activeRetries.set(progressId, {
      attemptCount: attemptCount + 1,
      lastAttemptAt: new Date(),
      nextRetryAt,
      isRetrying: true,
    });

    // Schedule retry
    setTimeout(async () => {
      try {
        await retryCallback();
        // Clear retry state on success
        activeRetries.delete(progressId);
      } catch (retryError) {
        // Retry failed, will be handled by next call to handleGenerationError
        console.error(`[RetryHandler] Retry ${attemptCount + 1} failed:`, retryError);
      }
    }, delay);

    return generationError;
  }

  // Max retries reached or non-retryable error
  activeRetries.delete(progressId);

  return generationError;
}

/**
 * Cancel active retry
 */
export function cancelRetry(progressId: string): void {
  activeRetries.delete(progressId);
}

/**
 * Check if a retry is active for a progress ID
 */
export function isRetrying(progressId: string): boolean {
  const retryState = activeRetries.get(progressId);
  return retryState?.isRetrying ?? false;
}

/**
 * Get retry state for a progress ID
 */
export function getRetryState(progressId: string): RetryState | undefined {
  return activeRetries.get(progressId);
}

/**
 * Clear all retry states
 */
export function clearAllRetries(): void {
  activeRetries.clear();
}

/**
 * Wait for retry with promise
 */
export function waitForRetry(progressId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const retryState = activeRetries.get(progressId);

    if (!retryState || !retryState.nextRetryAt) {
      reject(new Error('No active retry for this progress ID'));
      return;
    }

    const delay = retryState.nextRetryAt.getTime() - Date.now();

    if (delay <= 0) {
      resolve();
      return;
    }

    setTimeout(() => {
      const currentRetryState = activeRetries.get(progressId);
      if (currentRetryState?.isRetrying) {
        resolve();
      } else {
        reject(new Error('Retry was cancelled'));
      }
    }, delay);
  });
}

/**
 * Format retry message for display
 */
export function formatRetryMessage(attemptCount: number, maxRetries: number): string {
  return `正在重试 (${attemptCount}/${maxRetries})...`;
}

/**
 * Get error display information
 */
export function getErrorDisplayInfo(error: GenerationError): {
  title: string;
  message: string;
  suggestions: string[];
  canRetry: boolean;
} {
  const errorConfig = ERROR_MESSAGES[error.code.toLowerCase() as keyof typeof ERROR_MESSAGES];

  if (errorConfig) {
    return {
      title: errorConfig.title,
      message: error.message || errorConfig.message,
      suggestions: error.suggestions || errorConfig.suggestions,
      canRetry: error.retryable && (error.retryCount || 0) < MAX_RETRY_COUNT,
    };
  }

  // Default error display
  return {
    title: '生成失败',
    message: error.message || '图片生成时发生未知错误',
    suggestions: [
      '检查您的网络连接',
      '稍后重试',
      '如果问题持续存在,请联系支持',
    ],
    canRetry: error.retryable && (error.retryCount || 0) < MAX_RETRY_COUNT,
  };
}

/**
 * Update progress with error information
 */
export function updateProgressWithError(
  progress: GenerationProgress,
  error: GenerationError
): GenerationProgress {
  return {
    ...progress,
    stage: error.retryable ? progress.stage : 'failed',
    error,
    updatedAt: new Date(),
  };
}
