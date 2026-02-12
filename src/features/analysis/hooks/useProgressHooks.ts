/**
 * 分析进度 Hook
 * 集成轮询和进度状态管理
 */

import { useEffect, useRef, useState } from 'react';
import { useProgressStore } from '@/stores/useProgressStore';
import { pollAnalysisStatus, type AnalysisProgress } from '@/lib/api/polling';
import { getRandomTerm } from '@/features/analysis/constants/analysis-terms';

export interface UseAnalysisProgressOptions {
  analysisId?: string;
  pollInterval?: number;
  timeout?: number;
  onProgress?: (progress: AnalysisProgress) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

export const useAnalysisProgress = (options: UseAnalysisProgressOptions) => {
  const {
    analysisId,
    pollInterval = 2000,
    timeout = 60000,
    onProgress,
    onComplete,
    onError,
  } = options;

  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setAnalysisStage = useProgressStore((state) => state.setAnalysisStage);
  const setAnalysisProgress = useProgressStore((state) => state.setAnalysisProgress);
  const setCurrentTerm = useProgressStore((state) => state.setCurrentTerm);
  const setQueuePosition = useProgressStore((state) => state.setQueuePosition);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!analysisId || isPolling) return;

    setIsPolling(true);
    setError(null);

    // 开始轮询
    unsubscribeRef.current = pollAnalysisStatus({
      analysisId,
      pollInterval,
      timeout,
      onProgress: (progress) => {
        // 更新 store
        setAnalysisStage(progress.status);
        setAnalysisProgress(progress.progress);

        if (progress.currentTerm) {
          setCurrentTerm(progress.currentTerm);
        } else if (progress.status === 'analyzing') {
          // 如果 API 没有返回术语，本地随机生成一个
          setCurrentTerm(getRandomTerm('analyzing'));
        }

        if (progress.queuePosition !== undefined) {
          setQueuePosition(progress.queuePosition);
        }

        // 调用外部回调
        onProgress?.(progress);
      },
      onComplete: (result) => {
        setAnalysisStage('completed');
        setAnalysisProgress(100);
        setIsPolling(false);

        onComplete?.(result);
      },
      onError: (err) => {
        setAnalysisStage('error');
        setIsPolling(false);
        setError(err);

        onError?.(err);
      },
    });

    // 清理函数
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [analysisId, pollInterval, timeout]);

  return {
    isPolling,
    error,
  };
};

/**
 * 上传进度计算 Hook
 * 自动计算上传速度和预计时间
 */
export const useUploadProgressCalculation = () => {
  const setUploadProgress = useProgressStore((state) => state.setUploadProgress);
  const setUploadSpeed = useProgressStore((state) => state.setUploadSpeed);
  const setUploadStartTime = useProgressStore((state) => state.setUploadStartTime);

  const lastTimeRef = useRef<number>(0);
  const lastLoadedRef = useRef<number>(0);

  const handleProgress = (loaded: number, total: number) => {
    const now = Date.now();
    const progress = Math.round((loaded / total) * 100);

    // 计算速度
    if (lastTimeRef.current > 0 && now > lastTimeRef.current) {
      const timeDiff = (now - lastTimeRef.current) / 1000; // 秒
      const loadedDiff = loaded - lastLoadedRef.current;
      const speed = loadedDiff / timeDiff / (1024 * 1024); // MB/s

      setUploadSpeed(speed);
    }

    setUploadProgress(progress, loaded, total);

    lastTimeRef.current = now;
    lastLoadedRef.current = loaded;
  };

  const startUpload = () => {
    setUploadStartTime(Date.now());
    lastTimeRef.current = 0;
    lastLoadedRef.current = 0;
  };

  return {
    handleProgress,
    startUpload,
  };
};

/**
 * 批量分析进度 Hook
 * 管理多个分析任务的进度
 */
export interface BatchAnalysisItem {
  id: string;
  imageId: string;
  url: string;
  name: string;
}

export const useBatchAnalysisProgress = (items: BatchAnalysisItem[]) => {
  const [completedCount, setCompletedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setBatchProgress = useProgressStore((state) => state.setBatchProgress);

  useEffect(() => {
    if (items.length === 0) return;

    setBatchProgress({
      current: currentIndex,
      total: items.length,
      completed: completedCount,
    });
  }, [completedCount, currentIndex, items.length, setBatchProgress]);

  const handleComplete = (index: number) => {
    setCompletedCount((prev) => prev + 1);

    if (index < items.length - 1) {
      setCurrentIndex(index + 1);
    }
  };

  return {
    completedCount,
    currentIndex,
    total: items.length,
    handleComplete,
  };
};
