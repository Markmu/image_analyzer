/**
 * Progress Poller
 *
 * Epic 6 - Story 6.1: Image Generation
 * Poll and track generation progress
 */

import type { GenerationProgress } from '../types';
import { GENERATION_LIMITS } from './generation-presets';

/**
 * Poll generation progress with callbacks
 */
export class GenerationProgressPoller {
  private pollingInterval: number | null = null;
  private isPolling = false;

  /**
   * Start polling generation progress
   */
  startPolling(
    onProgress: (progress: GenerationProgress) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): void {
    if (this.isPolling) {
      console.warn('[GenerationProgressPoller] Already polling');
      return;
    }

    this.isPolling = true;
    let progress = 0;
    let stage: GenerationProgress['stage'] = 'initializing';

    // Simulate progress (in production, this would poll Replicate API)
    const simulateProgress = () => {
      if (!this.isPolling) return;

      progress += 10;

      // Update stage based on progress
      if (progress < 30) {
        stage = 'initializing';
      } else if (progress < 70) {
        stage = 'generating';
      } else if (progress < 90) {
        stage = 'processing';
      } else {
        stage = 'completed';
        this.stopPolling();
        onComplete();
        return;
      }

      const estimatedTimeRemaining = Math.max(
        0,
        (100 - progress) / 10 * (GENERATION_LIMITS.POLLING_INTERVAL / 1000)
      );

      onProgress({
        stage,
        stageName: this.getStageName(stage),
        progress,
        estimatedTimeRemaining,
      });

      this.pollingInterval = window.setTimeout(simulateProgress, GENERATION_LIMITS.POLLING_INTERVAL);
    };

    simulateProgress();
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  /**
   * Get stage display name
   */
  private getStageName(stage: GenerationProgress['stage']): string {
    const stageNames: Record<GenerationProgress['stage'], string> = {
      initializing: '正在初始化模型...',
      generating: '正在生成图片...',
      processing: '正在处理结果...',
      completed: '生成完成',
      failed: '生成失败',
    };

    return stageNames[stage];
  }

  /**
   * Check if currently polling
   */
  isActive(): boolean {
    return this.isPolling;
  }
}

/**
 * Create a progress poller instance
 */
export function createProgressPoller(): GenerationProgressPoller {
  return new GenerationProgressPoller();
}
