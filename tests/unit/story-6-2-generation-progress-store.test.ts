/**
 * Story 6.2: Generation Progress Store 单元测试
 *
 * 测试覆盖：
 * - 单个生成任务的状态管理
 * - 批量生成任务的状态管理
 * - 进度更新和计算
 * - 通知权限管理
 * - 清除操作
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generationProgressStore } from '@/features/generation/stores/generation-progress.store';
import type { GenerationProgress, BatchGenerationProgress } from '@/features/generation/types/progress';

describe('Story 6.2 - Generation Progress Store', () => {
  beforeEach(() => {
    // 清除 store 状态
    generationProgressStore.getState().clearAll();
  });

  describe('单个生成任务管理', () => {
    it('应该成功添加单个生成任务', () => {
      // GIVEN: 准备一个生成进度对象
      const progress: GenerationProgress = {
        id: 'gen-123',
        stage: 'initializing',
        stageName: '初始化中',
        progress: 0,
        estimatedTimeRemaining: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // WHEN: 添加到 store
      generationProgressStore.getState().addSingleGeneration(progress);

      // THEN: 应该能够获取该任务
      const retrieved = generationProgressStore.getState().getSingleGeneration('gen-123');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('gen-123');
      expect(retrieved?.stage).toBe('initializing');
    });

    it('应该成功更新单个生成任务', async () => {
      // GIVEN: 添加一个生成任务
      const progress: GenerationProgress = {
        id: 'gen-456',
        stage: 'initializing',
        stageName: '初始化中',
        progress: 0,
        estimatedTimeRemaining: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      generationProgressStore.getState().addSingleGeneration(progress);

      // 等待 1ms 确保 updatedAt 时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));

      // WHEN: 更新任务状态
      generationProgressStore.getState().updateSingleGeneration('gen-456', {
        stage: 'generating',
        stageName: '生成中',
        progress: 50,
      });

      // THEN: 状态应该更新，updatedAt 应该变化
      const updated = generationProgressStore.getState().getSingleGeneration('gen-456');
      expect(updated?.stage).toBe('generating');
      expect(updated?.progress).toBe(50);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(progress.updatedAt.getTime());
    });

    it('应该成功移除单个生成任务', () => {
      // GIVEN: 添加一个生成任务
      const progress: GenerationProgress = {
        id: 'gen-789',
        stage: 'initializing',
        stageName: '初始化中',
        progress: 0,
        estimatedTimeRemaining: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      generationProgressStore.getState().addSingleGeneration(progress);

      // WHEN: 移除任务
      generationProgressStore.getState().removeSingleGeneration('gen-789');

      // THEN: 任务应该不存在
      const retrieved = generationProgressStore.getState().getSingleGeneration('gen-789');
      expect(retrieved).toBeUndefined();
    });

    it('更新不存在的任务时不应该报错', () => {
      // WHEN: 尝试更新不存在的任务
      const action = () => {
        generationProgressStore.getState().updateSingleGeneration('nonexistent', {
          stage: 'generating',
          stageName: '生成中',
          progress: 10,
        });
      };

      // THEN: 不应该抛出错误
      expect(action).not.toThrow();
    });
  });

  describe('批量生成任务管理', () => {
    const createMockBatchProgress = (): BatchGenerationProgress => ({
      id: 'batch-123',
      totalItems: 3,
      completedItems: 0,
      failedItems: 0,
      overallPercentage: 0,
      items: [
        {
          id: 'gen-1',
          stage: 'initializing',
          stageName: '初始化中',
          progress: 0,
          estimatedTimeRemaining: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'gen-2',
          stage: 'initializing',
          stageName: '初始化中',
          progress: 0,
          estimatedTimeRemaining: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'gen-3',
          stage: 'initializing',
          stageName: '初始化中',
          progress: 0,
          estimatedTimeRemaining: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedTimeRemaining: 90,
    });

    it('应该成功添加批量生成任务', () => {
      // GIVEN: 准备批量生成任务
      const batch = createMockBatchProgress();

      // WHEN: 添加到 store
      generationProgressStore.getState().addBatchGeneration(batch);

      // THEN: 应该能够获取该批量任务
      const retrieved = generationProgressStore.getState().getBatchGeneration('batch-123');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('batch-123');
      expect(retrieved?.totalItems).toBe(3);
      expect(retrieved?.items).toHaveLength(3);
    });

    it('应该成功更新批量任务中的单个项目', () => {
      // GIVEN: 添加批量任务
      const batch = createMockBatchProgress();
      generationProgressStore.getState().addBatchGeneration(batch);

      // WHEN: 更新批量任务中的某个项目
      generationProgressStore.getState().updateBatchItem('batch-123', 'gen-1', {
        stage: 'completed',
        stageName: '已完成',
        progress: 100,
      });

      // THEN: 该项目应该更新，批量统计数据应该重新计算
      const updatedBatch = generationProgressStore.getState().getBatchGeneration('batch-123');
      expect(updatedBatch?.items[0].stage).toBe('completed');
      expect(updatedBatch?.completedItems).toBe(1);
      expect(updatedBatch?.overallPercentage).toBe(Math.round((1 / 3) * 100));
    });

    it('应该正确计算批量任务的失败项目数', () => {
      // GIVEN: 添加批量任务
      const batch = createMockBatchProgress();
      generationProgressStore.getState().addBatchGeneration(batch);

      // WHEN: 标记一个项目为失败
      generationProgressStore.getState().updateBatchItem('batch-123', 'gen-1', {
        stage: 'failed',
        stageName: '失败',
        progress: 0,
      });

      // THEN: 失败数应该更新
      const updatedBatch = generationProgressStore.getState().getBatchGeneration('batch-123');
      expect(updatedBatch?.failedItems).toBe(1);
    });

    it('应该成功移除批量生成任务', () => {
      // GIVEN: 添加批量任务
      const batch = createMockBatchProgress();
      generationProgressStore.getState().addBatchGeneration(batch);

      // WHEN: 移除任务
      generationProgressStore.getState().removeBatchGeneration('batch-123');

      // THEN: 任务应该不存在
      const retrieved = generationProgressStore.getState().getBatchGeneration('batch-123');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('清除操作', () => {
    it('clearCompleted 应该只清除已完成的任务', () => {
      // GIVEN: 添加多个任务
      const completedTask: GenerationProgress = {
        id: 'gen-completed',
        stage: 'completed',
        stageName: '已完成',
        progress: 100,
        estimatedTimeRemaining: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const activeTask: GenerationProgress = {
        id: 'gen-active',
        stage: 'generating',
        stageName: '生成中',
        progress: 50,
        estimatedTimeRemaining: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      generationProgressStore.getState().addSingleGeneration(completedTask);
      generationProgressStore.getState().addSingleGeneration(activeTask);

      // WHEN: 清除已完成任务
      generationProgressStore.getState().clearCompleted();

      // THEN: 已完成任务应该被清除，活跃任务应该保留
      expect(generationProgressStore.getState().getSingleGeneration('gen-completed')).toBeUndefined();
      expect(generationProgressStore.getState().getSingleGeneration('gen-active')).toBeDefined();
    });

    it('clearAll 应该清除所有任务', () => {
      // GIVEN: 添加多个任务
      const task1: GenerationProgress = {
        id: 'gen-1',
        stage: 'initializing',
        stageName: '初始化中',
        progress: 0,
        estimatedTimeRemaining: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const task2: GenerationProgress = {
        id: 'gen-2',
        stage: 'generating',
        stageName: '生成中',
        progress: 50,
        estimatedTimeRemaining: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      generationProgressStore.getState().addSingleGeneration(task1);
      generationProgressStore.getState().addSingleGeneration(task2);

      // WHEN: 清除所有任务
      generationProgressStore.getState().clearAll();

      // THEN: 所有任务都应该被清除
      expect(generationProgressStore.getState().getSingleGeneration('gen-1')).toBeUndefined();
      expect(generationProgressStore.getState().getSingleGeneration('gen-2')).toBeUndefined();
    });
  });

  describe('通知权限管理', () => {
    it('应该能够设置通知权限', () => {
      // WHEN: 设置权限为 granted
      generationProgressStore.getState().setNotificationPermission('granted');

      // THEN: 权限应该更新
      const state = generationProgressStore.getState();
      expect(state.notificationPermission).toBe('granted');
    });

    it('应该支持所有权限状态', () => {
      // 测试所有可能的权限状态
      const permissions: Array<'default' | 'granted' | 'denied'> = ['default', 'granted', 'denied'];

      permissions.forEach((permission) => {
        generationProgressStore.getState().setNotificationPermission(permission);
        expect(generationProgressStore.getState().notificationPermission).toBe(permission);
      });
    });
  });

  describe('Hook 导出', () => {
    it('应该导出正确的 hooks', () => {
      // 这里只验证 hooks 是否导出，实际使用需要在组件中测试
      expect(typeof generationProgressStore).toBe('function');
    });
  });
});
