/**
 * Progress Tracker
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Core progress tracking logic and utilities
 */

import type {
  GenerationProgress,
  GenerationStage,
  BatchGenerationProgress,
} from '../types/progress';
import {
  TIMEOUT_DURATION,
  DEFAULT_ESTIMATED_TIME,
  MAX_RETRY_COUNT,
  RETRY_DELAYS,
  GENERATION_TIMES_KEY,
  MAX_HISTORICAL_TIMES,
} from './progress-constants';
import { nanoid } from 'nanoid';

/**
 * Create a new generation progress object
 */
export function createGenerationProgress(
  templateId?: string,
  templateName?: string
): GenerationProgress {
  return {
    id: nanoid(),
    stage: 'initializing' as GenerationStage,
    progress: 0,
    estimatedTimeRemaining: DEFAULT_ESTIMATED_TIME,
    createdAt: new Date(),
    updatedAt: new Date(),
    templateId,
    templateName,
  };
}

/**
 * Create a new batch generation progress object
 */
export function createBatchGenerationProgress(
  itemCount: number,
  templateId?: string,
  templateName?: string
): BatchGenerationProgress {
  const items: GenerationProgress[] = Array.from({ length: itemCount }, () =>
    createGenerationProgress(templateId, templateName)
  );

  return {
    id: nanoid(),
    totalItems: itemCount,
    completedItems: 0,
    failedItems: 0,
    overallPercentage: 0,
    items,
    createdAt: new Date(),
    updatedAt: new Date(),
    estimatedTimeRemaining: DEFAULT_ESTIMATED_TIME * itemCount,
  };
}

/**
 * Check if a generation has timed out
 */
export function isTimeout(progress: GenerationProgress): boolean {
  const elapsed = (Date.now() - progress.createdAt.getTime()) / 1000;
  return elapsed > TIMEOUT_DURATION;
}

/**
 * Calculate elapsed time in seconds
 */
export function calculateElapsedTime(progress: GenerationProgress): number {
  return (progress.updatedAt.getTime() - progress.createdAt.getTime()) / 1000;
}

/**
 * Format time duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
}

/**
 * Get historical average generation time
 */
export function getHistoricalAverageTime(): number {
  if (typeof window === 'undefined') return DEFAULT_ESTIMATED_TIME;

  try {
    const historyJson = localStorage.getItem(GENERATION_TIMES_KEY);
    if (!historyJson) return DEFAULT_ESTIMATED_TIME;

    const times: number[] = JSON.parse(historyJson);
    if (times.length === 0) return DEFAULT_ESTIMATED_TIME;

    // Keep only the most recent times
    const recentTimes = times.slice(-MAX_HISTORICAL_TIMES);
    const average = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;

    // Save back the trimmed list
    localStorage.setItem(GENERATION_TIMES_KEY, JSON.stringify(recentTimes));

    return average;
  } catch (error) {
    console.error('[ProgressTracker] Failed to get historical average time:', error);
    return DEFAULT_ESTIMATED_TIME;
  }
}

/**
 * Save generation time to history
 */
export function saveGenerationTime(duration: number): void {
  if (typeof window === 'undefined') return;

  try {
    const historyJson = localStorage.getItem(GENERATION_TIMES_KEY);
    const times: number[] = historyJson ? JSON.parse(historyJson) : [];

    times.push(duration);

    // Keep only the most recent times
    if (times.length > MAX_HISTORICAL_TIMES) {
      times.splice(0, times.length - MAX_HISTORICAL_TIMES);
    }

    localStorage.setItem(GENERATION_TIMES_KEY, JSON.stringify(times));
  } catch (error) {
    console.error('[ProgressTracker] Failed to save generation time:', error);
  }
}

/**
 * Calculate estimated remaining time
 */
export function calculateEstimatedTimeRemaining(
  progress: GenerationProgress,
  historicalAverage: number = getHistoricalAverageTime()
): number {
  const elapsed = calculateElapsedTime(progress);

  // If no progress yet, use historical average
  if (progress.progress === 0) {
    return historicalAverage;
  }

  // Calculate based on current progress rate
  const estimatedTotal = (elapsed / progress.progress) * 100;

  // Weight historical (40%) and current (60%) estimates
  const weightedEstimate = historicalAverage * 0.4 + estimatedTotal * 0.6;

  const remaining = Math.max(0, weightedEstimate - elapsed);
  return Math.round(remaining);
}

/**
 * Calculate batch estimated remaining time
 */
export function calculateBatchEstimatedTimeRemaining(
  batch: BatchGenerationProgress
): number {
  // Sum of remaining times for all items
  const totalRemaining = batch.items.reduce(
    (sum, item) => sum + item.estimatedTimeRemaining,
    0
  );

  // For batch, assume some parallelization (divide by 2 for concurrent processing)
  return Math.round(totalRemaining / 2);
}

/**
 * Throttle function for progress updates
 */
export function createThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func(...args);
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRY_COUNT,
  delays: number[] = RETRY_DELAYS
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries) {
        const delay = delays[i] || delays[delays.length - 1];
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /ECONNRESET/i,
    /ETIMEDOUT/i,
    /5\d\d/, // 5xx server errors
  ];

  return retryablePatterns.some((pattern) => pattern.test(error.message));
}

/**
 * Extract error code from error
 */
export function extractErrorCode(error: Error): string {
  // Check for common error patterns
  if (error.message.includes('timeout')) return 'TIMEOUT';
  if (error.message.includes('network')) return 'NETWORK_ERROR';
  if (error.message.includes('credits') || error.message.includes('quota'))
    return 'INSUFFICIENT_CREDITS';

  // Default to generic API error
  return 'API_ERROR';
}
