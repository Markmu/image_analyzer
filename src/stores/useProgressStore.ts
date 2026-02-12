/**
 * 进度状态管理 Store
 * 使用 Zustand 管理上传和分析进度状态
 */

import { create } from 'zustand';
import type { AnalysisStage } from '@/lib/utils/time-estimation';
import {
  calculateAnalysisTime,
  calculateUploadTime,
  formatEstimatedTime,
} from '@/lib/utils/time-estimation';
import { getRandomTerm } from '@/features/analysis/constants/analysis-terms';

/**
 * 批量进度信息
 */
export interface BatchProgress {
  current: number; // 当前图片索引
  total: number; // 总图片数
  completed: number; // 已完成数量
}

/**
 * 上传进度状态
 */
export interface UploadProgressState {
  progress: number; // 0-100
  speed: number; // MB/s
  estimatedTime: number; // 秒
  loadedBytes: number; // 已上传字节数
  totalBytes: number; // 总字节数
  startTime: number | null; // 开始时间戳
}

/**
 * 进度状态接口
 */
export interface ProgressState {
  // 上传进度
  upload: UploadProgressState;

  // 分析进度
  analysisStage: AnalysisStage;
  analysisProgress: number; // 0-100
  analysisEstimatedTime: number; // 秒
  currentTerm: string; // 当前显示的专业术语
  queuePosition: number | null; // 队列位置

  // 批量分析
  batchProgress: BatchProgress | null;

  // Actions - 上传
  setUploadProgress: (progress: number, loaded?: number, total?: number) => void;
  setUploadSpeed: (speed: number) => void;
  setUploadStartTime: (time: number) => void;
  resetUpload: () => void;

  // Actions - 分析
  setAnalysisStage: (stage: AnalysisStage) => void;
  setAnalysisProgress: (progress: number) => void;
  setCurrentTerm: (term: string) => void;
  setQueuePosition: (position: number | null) => void;
  resetAnalysis: () => void;

  // Actions - 批量
  setBatchProgress: (progress: BatchProgress) => void;
  resetBatch: () => void;

  // Actions - 通用
  resetAll: () => void;
}

/**
 * 进度 Store
 */
export const useProgressStore = create<ProgressState>((set, get) => ({
  // 初始状态
  upload: {
    progress: 0,
    speed: 0,
    estimatedTime: 0,
    loadedBytes: 0,
    totalBytes: 0,
    startTime: null,
  },

  analysisStage: 'idle',
  analysisProgress: 0,
  analysisEstimatedTime: 60, // 默认 60 秒
  currentTerm: '',
  queuePosition: null,

  batchProgress: null,

  // 上传相关 Actions
  setUploadProgress: (progress, loaded, total) =>
    set((state) => {
      const uploadState = { ...state.upload, progress };

      if (loaded !== undefined) {
        uploadState.loadedBytes = loaded;
      }

      if (total !== undefined) {
        uploadState.totalBytes = total;
      }

      // 计算预计剩余时间
      if (state.upload.speed > 0) {
        const fileSizeMB = (uploadState.totalBytes || 5 * 1024 * 1024) / (1024 * 1024);
        uploadState.estimatedTime = calculateUploadTime(
          progress,
          state.upload.speed,
          fileSizeMB
        );
      }

      return { upload: uploadState };
    }),

  setUploadSpeed: (speed) =>
    set((state) => {
      const uploadState = { ...state.upload, speed };

      // 更新预计时间
      if (uploadState.totalBytes > 0) {
        const fileSizeMB = uploadState.totalBytes / (1024 * 1024);
        uploadState.estimatedTime = calculateUploadTime(
          uploadState.progress,
          speed,
          fileSizeMB
        );
      }

      return { upload: uploadState };
    }),

  setUploadStartTime: (time) =>
    set((state) => ({
      upload: { ...state.upload, startTime: time },
    })),

  resetUpload: () =>
    set(() => ({
      upload: {
        progress: 0,
        speed: 0,
        estimatedTime: 0,
        loadedBytes: 0,
        totalBytes: 0,
        startTime: null,
      },
    })),

  // 分析相关 Actions
  setAnalysisStage: (stage) =>
    set((state) => {
      // 更新当前术语
      const newTerm = stage === 'analyzing' ? getRandomTerm(stage) : state.currentTerm;

      return {
        analysisStage: stage,
        currentTerm: newTerm,
        analysisEstimatedTime: calculateAnalysisTime(stage, state.analysisProgress),
      };
    }),

  setAnalysisProgress: (progress) =>
    set((state) => ({
      analysisProgress: progress,
      analysisEstimatedTime: calculateAnalysisTime(
        state.analysisStage,
        progress
      ),
    })),

  setCurrentTerm: (term) =>
    set(() => ({
      currentTerm: term,
    })),

  setQueuePosition: (position) =>
    set(() => ({
      queuePosition: position,
    })),

  resetAnalysis: () =>
    set(() => ({
      analysisStage: 'idle',
      analysisProgress: 0,
      analysisEstimatedTime: 60,
      currentTerm: '',
      queuePosition: null,
    })),

  // 批量相关 Actions
  setBatchProgress: (progress) =>
    set(() => ({
      batchProgress: progress,
    })),

  resetBatch: () =>
    set(() => ({
      batchProgress: null,
    })),

  // 通用 Actions
  resetAll: () =>
    set(() => ({
      upload: {
        progress: 0,
        speed: 0,
        estimatedTime: 0,
        loadedBytes: 0,
        totalBytes: 0,
        startTime: null,
      },
      analysisStage: 'idle',
      analysisProgress: 0,
      analysisEstimatedTime: 60,
      currentTerm: '',
      queuePosition: null,
      batchProgress: null,
    })),
}));

/**
 * Selectors - 用于从 store 中派生数据
 */
export const selectUploadProgress = (state: ProgressState) => state.upload.progress;
export const selectUploadSpeed = (state: ProgressState) => state.upload.speed;
export const selectUploadEstimatedTime = (state: ProgressState) =>
  formatEstimatedTime(state.upload.estimatedTime);

export const selectAnalysisStage = (state: ProgressState) => state.analysisStage;
export const selectAnalysisProgress = (state: ProgressState) => state.analysisProgress;
export const selectAnalysisEstimatedTime = (state: ProgressState) =>
  formatEstimatedTime(state.analysisEstimatedTime);
export const selectCurrentTerm = (state: ProgressState) => state.currentTerm;
export const selectQueuePosition = (state: ProgressState) => state.queuePosition;

export const selectBatchProgress = (state: ProgressState) => state.batchProgress;

/**
 * Hook: 获取上传进度百分比
 */
export const useUploadProgress = () => useProgressStore(selectUploadProgress);

/**
 * Hook: 获取上传速度
 */
export const useUploadSpeed = () => useProgressStore(selectUploadSpeed);

/**
 * Hook: 获取上传预计时间（格式化）
 */
export const useUploadEstimatedTime = () =>
  useProgressStore(selectUploadEstimatedTime);

/**
 * Hook: 获取分析阶段
 */
export const useAnalysisStage = () => useProgressStore(selectAnalysisStage);

/**
 * Hook: 获取分析进度
 */
export const useAnalysisProgress = () => useProgressStore(selectAnalysisProgress);

/**
 * Hook: 获取分析预计时间（格式化）
 */
export const useAnalysisEstimatedTime = () =>
  useProgressStore(selectAnalysisEstimatedTime);

/**
 * Hook: 获取当前专业术语
 */
export const useCurrentTerm = () => useProgressStore(selectCurrentTerm);

/**
 * Hook: 获取队列位置
 */
export const useQueuePosition = () => useProgressStore(selectQueuePosition);

/**
 * Hook: 获取批量进度
 */
export const useBatchProgress = () => useProgressStore(selectBatchProgress);
