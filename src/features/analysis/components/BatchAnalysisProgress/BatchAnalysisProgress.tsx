'use client';

/**
 * 批量分析进度组件
 *
 * AC-4: 实时进度显示
 * 复用 Story 2-4 的 ProgressDisplay 组件
 */

import React, { useEffect, useState } from 'react';

export interface BatchProgress {
  currentIndex: number;
  total: number;
  completed: number;
  failed: number;
  currentImageId?: string;
}

interface BatchAnalysisProgressProps {
  batchId: number;
  initialProgress?: BatchProgress;
  onComplete?: (results: BatchAnalysisResult) => void;
  onError?: (error: Error) => void;
}

interface BatchAnalysisResult {
  batchId: number;
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';
  progress: BatchProgress;
  results: ImageAnalysisResult[];
  errors: AnalysisError[];
}

interface ImageAnalysisResult {
  imageId: string;
  status: 'completed' | 'failed' | 'skipped';
  analysisData?: unknown;
  error?: string;
}

interface AnalysisError {
  imageId: string;
  error: string;
  retryable: boolean;
}

export function BatchAnalysisProgress({
  batchId,
  initialProgress,
  onComplete,
  onError,
}: BatchAnalysisProgressProps) {
  const [progress, setProgress] = useState<BatchProgress | null>(initialProgress || null);
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'partial' | 'failed'>('pending');
  const [estimatedRemainingTime, setEstimatedRemainingTime] = useState<number | null>(null);
  const [startTime] = useState<number>(Date.now());
  const [isPolling, setIsPolling] = useState(true);

  // 轮询获取状态
  useEffect(() => {
    if (!isPolling) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/analysis/batch/${batchId}/status`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch batch status');
        }

        const data = await response.json();

        if (data.success) {
          const { progress: newProgress, status: newStatus } = data.data;

          setProgress(newProgress);
          setStatus(newStatus);

          // 计算预计剩余时间
          if (newStatus === 'processing' && newProgress.completed > 0) {
            const elapsedTime = (Date.now() - startTime) / 1000; // 秒
            const avgTimePerImage = elapsedTime / newProgress.completed;
            const remainingImages = newProgress.total - newProgress.completed - newProgress.failed;
            setEstimatedRemainingTime(Math.round(avgTimePerImage * remainingImages));
          }

          // 检查是否完成
          if (newStatus === 'completed' || newStatus === 'partial' || newStatus === 'failed') {
            setIsPolling(false);
            onComplete?.(data.data);
          }
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
      }
    };

    // 立即获取一次状态
    pollStatus();

    // 每 3 秒轮询一次
    const interval = setInterval(pollStatus, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [batchId, isPolling, startTime, onComplete, onError]);

  // 计算进度百分比
  const progressPercentage = progress
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  // 格式化剩余时间
  const formatRemainingTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} 秒`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} 分钟`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} 小时 ${minutes} 分钟`;
    }
  };

  return (
    <div className="batch-analysis-progress" data-testid="batch-analysis-progress">
      <div className="progress-header">
        <h3 className="progress-title">批量分析进度</h3>
        <span className="progress-status" data-testid="progress-status">
          {status === 'processing' && '分析中...'}
          {status === 'completed' && '分析完成'}
          {status === 'partial' && '部分完成'}
          {status === 'failed' && '分析失败'}
          {status === 'pending' && '等待中'}
        </span>
      </div>

      {/* 进度条 */}
      <div className="progress-bar-container" data-testid="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 进度文本 */}
      <div className="progress-text" data-testid="progress-text">
        <span>
          已完成 {progress?.completed || 0} / {progress?.total || 0} 张
          {progress?.failed ? `（失败 ${progress.failed} 张）` : ''}
        </span>
        <span className="progress-percentage">{progressPercentage}%</span>
      </div>

      {/* 当前分析的图片 */}
      {status === 'processing' && progress && (
        <div className="current-image" data-testid="current-image">
          正在分析第 {progress.currentIndex} 张图片...
        </div>
      )}

      {/* 预计剩余时间 */}
      {status === 'processing' && estimatedRemainingTime !== null && (
        <div className="estimated-time" data-testid="estimated-time">
          预计剩余时间: {formatRemainingTime(estimatedRemainingTime)}
        </div>
      )}

      {/* 加载动画 */}
      {status === 'processing' && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
}

export default BatchAnalysisProgress;
