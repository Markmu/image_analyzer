/**
 * 状态 Schema 测试
 *
 * 测试任务状态协议的定义和验证
 */

import { describe, it, expect } from 'vitest';
import {
  isValidStatusTransition,
  getRecoverableActions,
  mapToDisplayStatus,
  type TaskStatus,
  type CurrentStage,
} from '@/lib/analysis-ir/status-schema';

describe('状态 Schema', () => {
  describe('isValidStatusTransition', () => {
    it('应该验证有效的状态转换', () => {
      expect(isValidStatusTransition('queued', 'running')).toBe(true);
      expect(isValidStatusTransition('queued', 'canceled')).toBe(true);
      expect(isValidStatusTransition('running', 'completed')).toBe(true);
      expect(isValidStatusTransition('running', 'failed')).toBe(true);
      expect(isValidStatusTransition('running', 'partial')).toBe(true);
      expect(isValidStatusTransition('partial', 'running')).toBe(true);
      expect(isValidStatusTransition('failed', 'running')).toBe(true);
    });

    it('应该拒绝无效的状态转换', () => {
      expect(isValidStatusTransition('completed', 'running')).toBe(false);
      expect(isValidStatusTransition('canceled', 'running')).toBe(false);
      expect(isValidStatusTransition('queued', 'completed')).toBe(false);
      expect(isValidStatusTransition('failed', 'completed')).toBe(false);
    });

    it('终态不能转换到任何其他状态', () => {
      expect(isValidStatusTransition('completed', 'failed')).toBe(false);
      expect(isValidStatusTransition('completed', 'canceled')).toBe(false);
      expect(isValidStatusTransition('canceled', 'running')).toBe(false);
      expect(isValidStatusTransition('canceled', 'failed')).toBe(false);
    });
  });

  describe('getRecoverableActions', () => {
    it('应该为 queued 状态返回 cancel 操作', () => {
      const actions = getRecoverableActions('queued');
      expect(actions).toContain('cancel');
      expect(actions).not.toContain('retry');
    });

    it('应该为 running 状态返回 cancel 操作', () => {
      const actions = getRecoverableActions('running');
      expect(actions).toContain('cancel');
      expect(actions).not.toContain('retry');
    });

    it('应该为 partial 状态返回所有恢复操作', () => {
      const actions = getRecoverableActions('partial');
      expect(actions).toContain('view_result');
      expect(actions).toContain('retry');
      expect(actions).toContain('cancel');
    });

    it('应该为 failed 状态返回查看错误和重试操作', () => {
      const actions = getRecoverableActions('failed');
      expect(actions).toContain('view_error');
      expect(actions).toContain('retry');
      expect(actions).not.toContain('view_result');
    });

    it('应该为 completed 状态返回查看结果操作', () => {
      const actions = getRecoverableActions('completed');
      expect(actions).toContain('view_result');
      expect(actions).not.toContain('retry');
    });

    it('应该为 canceled 状态返回 none 操作', () => {
      const actions = getRecoverableActions('canceled');
      expect(actions).toContain('none');
      expect(actions.length).toBe(1);
    });
  });

  describe('mapToDisplayStatus', () => {
    it('应该将 queued 映射到 queued', () => {
      expect(mapToDisplayStatus('queued', null)).toBe('queued');
    });

    it('应该将 running + forensic_describer 映射到 analyzing', () => {
      expect(mapToDisplayStatus('running', 'forensic_describer')).toBe('analyzing');
    });

    it('应该将 running + style_fingerprinter 映射到 analyzing', () => {
      expect(mapToDisplayStatus('running', 'style_fingerprinter')).toBe('analyzing');
    });

    it('应该将 running + prompt_compiler 映射到 generating', () => {
      expect(mapToDisplayStatus('running', 'prompt_compiler')).toBe('generating');
    });

    it('应该将 running + qa_critic 映射到 generating', () => {
      expect(mapToDisplayStatus('running', 'qa_critic')).toBe('generating');
    });

    it('应该将 running + null 映射到 analyzing（默认）', () => {
      expect(mapToDisplayStatus('running', null)).toBe('analyzing');
    });

    it('应该将 partial 映射到 partial', () => {
      expect(mapToDisplayStatus('partial', null)).toBe('partial');
    });

    it('应该将 failed 映射到 error', () => {
      expect(mapToDisplayStatus('failed', null)).toBe('error');
    });

    it('应该将 completed 映射到 completed', () => {
      expect(mapToDisplayStatus('completed', null)).toBe('completed');
    });

    it('应该将 canceled 映射到 canceled', () => {
      expect(mapToDisplayStatus('canceled', null)).toBe('canceled');
    });
  });
});
