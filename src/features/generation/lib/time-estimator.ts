/**
 * Time Estimator
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Estimate remaining time for generation tasks
 */

import type { GenerationProgress } from '../types/progress';
import {
  DEFAULT_ESTIMATED_TIME,
  GENERATION_TIMES_KEY,
  MAX_HISTORICAL_TIMES,
} from './progress-constants';

/**
 * Historical time record
 */
interface HistoricalTimeRecord {
  /** Template ID */
  templateId: string;
  /** Resolution width */
  width: number;
  /** Resolution height */
  height: number;
  /** Duration in seconds */
  duration: number;
  /** Timestamp */
  timestamp: number;
}

/**
 * Get historical average time for similar generations
 */
export function getHistoricalAverageTime(
  templateId?: string,
  width?: number,
  height?: number
): number {
  if (typeof window === 'undefined') return DEFAULT_ESTIMATED_TIME;

  try {
    const historyJson = localStorage.getItem(GENERATION_TIMES_KEY);
    if (!historyJson) return DEFAULT_ESTIMATED_TIME;

    const records: HistoricalTimeRecord[] = JSON.parse(historyJson);
    if (records.length === 0) return DEFAULT_ESTIMATED_TIME;

    // Filter by template and resolution if provided
    let relevantRecords = records;
    if (templateId || width || height) {
      relevantRecords = records.filter((record) => {
        if (templateId && record.templateId !== templateId) return false;
        if (width && record.width !== width) return false;
        if (height && record.height !== height) return false;
        return true;
      });
    }

    // If no relevant records, use all records
    const recordsToUse =
      relevantRecords.length > 0 ? relevantRecords : records;

    // Calculate weighted average (more recent records have higher weight)
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    let weightedSum = 0;
    let totalWeight = 0;

    for (const record of recordsToUse.slice(-MAX_HISTORICAL_TIMES)) {
      const age = now - record.timestamp;
      const weight = Math.max(0.1, 1 - age / maxAge); // Decay over time
      weightedSum += record.duration * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) return DEFAULT_ESTIMATED_TIME;

    return Math.round(weightedSum / totalWeight);
  } catch (error) {
    console.error('[TimeEstimator] Failed to get historical average time:', error);
    return DEFAULT_ESTIMATED_TIME;
  }
}

/**
 * Calculate estimated remaining time for a generation
 */
export function calculateEstimatedTimeRemaining(
  progress: GenerationProgress,
  historicalAverage?: number
): number {
  const elapsed = calculateElapsedTime(progress);

  // Use historical average if no progress yet
  if (progress.percentage === 0 || progress.percentage < 5) {
    const avg = historicalAverage || getHistoricalAverageTime(
      progress.templateId,
      undefined, // Will be set from resolution
      undefined
    );
    return avg;
  }

  // Calculate based on current progress rate
  const progressRate = progress.percentage / elapsed; // percentage per second
  const estimatedTotal = progress.percentage > 0 ? 100 / progressRate : 0;

  // Get historical average
  const historical = historicalAverage || getHistoricalAverageTime();

  // Weight historical (30%) and current (70%) estimates
  // Current estimate gets higher weight as progress increases
  const currentWeight = Math.min(0.7, 0.3 + (progress.percentage / 100) * 0.4);
  const historicalWeight = 1 - currentWeight;

  const weightedEstimate =
    historical * historicalWeight + estimatedTotal * currentWeight;

  const remaining = Math.max(0, weightedEstimate - elapsed);

  // Add some buffer for uncertainty (especially at early stages)
  const bufferMultiplier = progress.percentage < 50 ? 1.2 : 1.0;

  return Math.round(remaining * bufferMultiplier);
}

/**
 * Calculate elapsed time in seconds
 */
function calculateElapsedTime(progress: GenerationProgress): number {
  return (Date.now() - progress.startedAt.getTime()) / 1000;
}

/**
 * Save generation time to history
 */
export function saveGenerationTime(
  duration: number,
  templateId?: string,
  width?: number,
  height?: number
): void {
  if (typeof window === 'undefined') return;

  try {
    const historyJson = localStorage.getItem(GENERATION_TIMES_KEY);
    const records: HistoricalTimeRecord[] = historyJson ? JSON.parse(historyJson) : [];

    // Add new record
    records.push({
      templateId: templateId || 'unknown',
      width: width || 0,
      height: height || 0,
      duration,
      timestamp: Date.now(),
    });

    // Keep only the most recent records
    if (records.length > MAX_HISTORICAL_TIMES) {
      records.splice(0, records.length - MAX_HISTORICAL_TIMES);
    }

    localStorage.setItem(GENERATION_TIMES_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('[TimeEstimator] Failed to save generation time:', error);
  }
}

/**
 * Format time for display
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}小时${remainingMinutes}分钟`
    : `${hours}小时`;
}

/**
 * Get time estimate with confidence level
 */
export function getTimeEstimateWithConfidence(
  progress: GenerationProgress
): {
  estimate: number;
  confidence: 'high' | 'medium' | 'low';
  formatted: string;
} {
  const elapsed = calculateElapsedTime(progress);
  const estimate = calculateEstimatedTimeRemaining(progress);

  // Confidence based on progress percentage
  let confidence: 'high' | 'medium' | 'low';
  if (progress.percentage >= 70) {
    confidence = 'high';
  } else if (progress.percentage >= 30) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Adjust confidence based on data age
  if (elapsed < 10) {
    confidence = 'low';
  }

  return {
    estimate,
    confidence,
    formatted: formatTime(estimate),
  };
}
