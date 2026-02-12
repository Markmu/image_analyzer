/**
 * useProgressStore 测试
 */

import { renderHook, act } from '@testing-library/react';
import { useProgressStore } from '../useProgressStore';

describe('useProgressStore', () => {
  beforeEach(() => {
    // 每次测试前重置 store
    const { result } = renderHook(() => useProgressStore());
    act(() => {
      result.current.resetAll();
    });
  });

  it('应该初始化为默认状态', () => {
    const { result } = renderHook(() => useProgressStore());

    expect(result.current.upload.progress).toBe(0);
    expect(result.current.upload.speed).toBe(0);
    expect(result.current.analysisStage).toBe('idle');
    expect(result.current.analysisProgress).toBe(0);
    expect(result.current.batchProgress).toBeNull();
  });

  describe('上传进度', () => {
    it('应该更新上传进度', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setUploadProgress(50, 1024 * 1024, 2 * 1024 * 1024);
      });

      expect(result.current.upload.progress).toBe(50);
      expect(result.current.upload.loadedBytes).toBe(1024 * 1024);
      expect(result.current.upload.totalBytes).toBe(2 * 1024 * 1024);
    });

    it('应该更新上传速度', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setUploadSpeed(2.5);
      });

      expect(result.current.upload.speed).toBe(2.5);
    });

    it('应该重置上传状态', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setUploadProgress(75);
        result.current.setUploadSpeed(1.5);
        result.current.resetUpload();
      });

      expect(result.current.upload.progress).toBe(0);
      expect(result.current.upload.speed).toBe(0);
      expect(result.current.upload.estimatedTime).toBe(0);
    });
  });

  describe('分析进度', () => {
    it('应该更新分析阶段', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setAnalysisStage('analyzing');
      });

      expect(result.current.analysisStage).toBe('analyzing');
    });

    it('应该更新分析进度', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setAnalysisProgress(60);
      });

      expect(result.current.analysisProgress).toBe(60);
    });

    it('应该更新当前术语', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setCurrentTerm('正在识别光影技巧...');
      });

      expect(result.current.currentTerm).toBe('正在识别光影技巧...');
    });

    it('应该更新队列位置', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setQueuePosition(3);
      });

      expect(result.current.queuePosition).toBe(3);
    });

    it('应该重置分析状态', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setAnalysisStage('generating');
        result.current.setAnalysisProgress(80);
        result.current.setCurrentTerm('测试术语');
        result.current.resetAnalysis();
      });

      expect(result.current.analysisStage).toBe('idle');
      expect(result.current.analysisProgress).toBe(0);
      expect(result.current.currentTerm).toBe('');
    });
  });

  describe('批量进度', () => {
    it('应该更新批量进度', () => {
      const { result } = renderHook(() => useProgressStore());

      const batchProgress = {
        current: 2,
        total: 5,
        completed: 2,
      };

      act(() => {
        result.current.setBatchProgress(batchProgress);
      });

      expect(result.current.batchProgress).toEqual(batchProgress);
    });

    it('应该重置批量进度', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setBatchProgress({ current: 1, total: 3, completed: 1 });
        result.current.resetBatch();
      });

      expect(result.current.batchProgress).toBeNull();
    });
  });

  describe('通用操作', () => {
    it('应该重置所有状态', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setUploadProgress(50);
        result.current.setUploadSpeed(1.5);
        result.current.setAnalysisStage('analyzing');
        result.current.setAnalysisProgress(60);
        result.current.setBatchProgress({ current: 1, total: 3, completed: 1 });
        result.current.resetAll();
      });

      expect(result.current.upload.progress).toBe(0);
      expect(result.current.upload.speed).toBe(0);
      expect(result.current.analysisStage).toBe('idle');
      expect(result.current.analysisProgress).toBe(0);
      expect(result.current.batchProgress).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('应该正确选择上传进度', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setUploadProgress(75);
      });

      expect(result.current.upload.progress).toBe(75);
    });

    it('应该正确选择分析阶段', () => {
      const { result } = renderHook(() => useProgressStore());

      act(() => {
        result.current.setAnalysisStage('generating');
      });

      expect(result.current.analysisStage).toBe('generating');
    });
  });
});
