/**
 * Stage Mapper
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Maps Replicate API status to application generation stages
 */

import { GenerationStage } from '../types/progress';
import { STAGE_THRESHOLDS } from './progress-constants';

/**
 * Replicate API status types
 */
type ReplicateStatus =
  | 'starting'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

/**
 * Replicate prediction status response
 */
interface ReplicatePredictionStatus {
  /** Prediction status */
  status: ReplicateStatus;
  /** Progress value (0-1) */
  progress?: number;
  /** Queue position */
  queue_position?: number;
  /** Error message */
  error?: string;
}

/**
 * Map Replicate status to generation stage
 */
export function mapReplicateStatusToStage(
  replicateStatus: ReplicatePredictionStatus
): GenerationStage {
  const { status, progress = 0 } = replicateStatus;

  switch (status) {
    case 'starting':
      return GenerationStage.INITIALIZING;

    case 'processing':
      // Map progress to stages
      if (progress < 0.1) return GenerationStage.INITIALIZING;
      if (progress < 0.2) return GenerationStage.PARSING;
      if (progress < 0.3) return GenerationStage.QUEUED;
      if (progress < 0.9) return GenerationStage.GENERATING;
      if (progress < 0.95) return GenerationStage.POST_PROCESSING;
      return GenerationStage.SAVING;

    case 'succeeded':
      return GenerationStage.COMPLETED;

    case 'failed':
    case 'canceled':
      return GenerationStage.FAILED;

    default:
      return GenerationStage.QUEUED;
  }
}

/**
 * Calculate percentage based on Replicate status and current stage
 */
export function calculatePercentage(
  replicateStatus: ReplicatePredictionStatus,
  stage: GenerationStage
): number {
  const { status, progress = 0 } = replicateStatus;

  // Completed or failed
  if (status === 'succeeded') return 100;
  if (status === 'failed' || status === 'canceled') return Math.round(progress * 100);

  // Get stage thresholds
  const thresholds = STAGE_THRESHOLDS[stage.toUpperCase() as keyof typeof STAGE_THRESHOLDS];
  if (!thresholds) return 0;

  // Calculate percentage within stage range
  const stageRange = thresholds.max - thresholds.min;
  const progressInRange = progress * stageRange;
  const percentage = thresholds.min + progressInRange;

  return Math.min(100, Math.max(0, Math.round(percentage)));
}

/**
 * Extract queue position from Replicate status
 */
export function extractQueuePosition(
  replicateStatus: ReplicatePredictionStatus
): number | undefined {
  return replicateStatus.queue_position;
}

/**
 * Extract error from Replicate status
 */
export function extractError(replicateStatus: ReplicatePredictionStatus): string | undefined {
  return replicateStatus.error;
}

/**
 * Check if Replicate status indicates a retryable error
 */
export function isReplicateErrorRetryable(
  replicateStatus: ReplicatePredictionStatus
): boolean {
  if (replicateStatus.status !== 'failed') return false;

  const error = replicateStatus.error?.toLowerCase() || '';

  // Retryable error patterns
  const retryablePatterns = [
    /timeout/i,
    /network/i,
    /temporary/i,
    /unavailable/i,
    /5\d\d/, // 5xx server errors
  ];

  return retryablePatterns.some((pattern) => pattern.test(error));
}

/**
 * Create a mock Replicate status for testing
 */
export function createMockReplicateStatus(
  status: ReplicateStatus,
  progress: number = 0,
  queuePosition?: number,
  error?: string
): ReplicatePredictionStatus {
  return {
    status,
    progress,
    queue_position: queuePosition,
    error,
  };
}
