/**
 * useThrottledProgress Hook
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Throttle progress updates to optimize performance
 */

import { useState, useEffect, useRef } from 'react';
import type { GenerationProgress, BatchGenerationProgress } from '../../types/progress';
import { PROGRESS_UPDATE_THROTTLE } from '../../lib/progress-constants';

type ProgressData = GenerationProgress | BatchGenerationProgress;

/**
 * Hook for throttled progress updates
 */
export function useThrottledProgress(
  progress: ProgressData | null,
  throttleMs: number = PROGRESS_UPDATE_THROTTLE
): ProgressData | null {
  const [throttledProgress, setThrottledProgress] = useState<ProgressData | null>(progress);
  const lastUpdateRef = useRef<number>(Date.now());
  const pendingUpdateRef = useRef<ProgressData | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!progress) {
      setThrottledProgress(null);
      pendingUpdateRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const now = Date.now();
    const elapsed = now - lastUpdateRef.current;

    // If enough time has passed, update immediately
    if (elapsed >= throttleMs) {
      setThrottledProgress(progress);
      lastUpdateRef.current = now;
      pendingUpdateRef.current = null;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Otherwise, schedule update for later
      pendingUpdateRef.current = progress;

      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (pendingUpdateRef.current) {
            setThrottledProgress(pendingUpdateRef.current);
            lastUpdateRef.current = Date.now();
            pendingUpdateRef.current = null;
          }
          timeoutRef.current = null;
        }, throttleMs - elapsed);
      }
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [progress, throttleMs]);

  return throttledProgress;
}

/**
 * Hook for debounced progress updates (updates only after a period of inactivity)
 */
export function useDebouncedProgress(
  progress: ProgressData | null,
  debounceMs: number = 500
): ProgressData | null {
  const [debouncedProgress, setDebouncedProgress] = useState<ProgressData | null>(progress);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedProgress(progress);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [progress, debounceMs]);

  return debouncedProgress;
}

/**
 * Hook for batch progress deduplication
 */
export function useDeduplicatedBatchProgress(
  batch: BatchGenerationProgress | null
): BatchGenerationProgress | null {
  const prevItemsRef = useRef<string>('');
  const [deduplicatedBatch, setDeduplicatedBatch] = useState<BatchGenerationProgress | null>(batch);

  useEffect(() => {
    if (!batch) {
      setDeduplicatedBatch(null);
      prevItemsRef.current = '';
      return;
    }

    // Create a hash of item states for comparison
    const itemsHash = JSON.stringify(
      batch.items.map((item) => ({
        id: item.id,
        stage: item.stage,
        percentage: item.percentage,
      }))
    );

    // Only update if items have actually changed
    if (itemsHash !== prevItemsRef.current) {
      setDeduplicatedBatch(batch);
      prevItemsRef.current = itemsHash;
    }
  }, [batch]);

  return deduplicatedBatch;
}

/**
 * Hook for memoized stage calculation
 */
export function useStageProgress(
  progress: GenerationProgress | null
): {
  stage: string | null;
  percentage: number;
  isCompleted: boolean;
  isFailed: boolean;
} {
  return {
    stage: progress?.stage || null,
    percentage: progress?.percentage || 0,
    isCompleted: progress?.stage === 'completed',
    isFailed: progress?.stage === 'failed' || progress?.stage === 'timeout',
  };
}
