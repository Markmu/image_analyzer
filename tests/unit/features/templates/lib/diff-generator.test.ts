/**
 * Diff Generator Tests
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Unit tests for diff generation logic
 */

import { describe, it, expect } from 'vitest';
import { generateDiff } from '@/features/templates/lib/diff-generator';

describe('Diff Generator', () => {
  describe('generateDiff', () => {
    it('should generate diff for simple text addition', () => {
      const original = '主体: 一位美女';
      const optimized = '主体: 一位优雅的美女';

      const diff = generateDiff(original, optimized);

      expect(diff).toHaveLength(3);
      expect(diff[0]).toEqual({ type: 'unchanged', text: '主体: 一位' });
      expect(diff[1]).toEqual({ type: 'added', text: '优雅的' });
      expect(diff[2]).toEqual({ type: 'unchanged', text: '美女' });
    });

    it('should handle text removal', () => {
      const original = '主体: 一位非常非常美丽的女子';
      const optimized = '主体: 一位美丽的女子';

      const diff = generateDiff(original, optimized);

      expect(diff.length).toBeGreaterThan(0);
      expect(diff.some((d) => d.type === 'removed')).toBe(true);
    });

    it('should handle mixed additions and removals', () => {
      const original = '主体: 美女, 风格: 简单';
      const optimized = '主体: 优雅的美女, 风格: 专业的';

      const diff = generateDiff(original, optimized);

      expect(diff.length).toBeGreaterThan(0);
      expect(diff.some((d) => d.type === 'added')).toBe(true);
    });

    it('should handle empty original', () => {
      const original = '';
      const optimized = '主体: 一位美女';

      const diff = generateDiff(original, optimized);

      expect(diff).toHaveLength(1);
      expect(diff[0]).toEqual({ type: 'added', text: '主体: 一位美女' });
    });

    it('should handle empty optimized', () => {
      const original = '主体: 一位美女';
      const optimized = '';

      const diff = generateDiff(original, optimized);

      expect(diff).toHaveLength(1);
      expect(diff[0]).toEqual({ type: 'removed', text: '主体: 一位美女' });
    });

    it('should handle identical text', () => {
      const original = '主体: 一位美女';
      const optimized = '主体: 一位美女';

      const diff = generateDiff(original, optimized);

      expect(diff).toHaveLength(1);
      expect(diff[0]).toEqual({ type: 'unchanged', text: '主体: 一位美女' });
    });

    it('should handle multiline text', () => {
      const original = '主体: 一位美女\n风格: 油画';
      const optimized = '主体: 一位优雅的美女\n风格: 精美油画';

      const diff = generateDiff(original, optimized);

      expect(diff.length).toBeGreaterThan(0);
      expect(diff.some((d) => d.type === 'added')).toBe(true);
    });

    it('should handle English text', () => {
      const original = 'Subject: A woman';
      const optimized = 'Subject: A beautiful woman';

      const diff = generateDiff(original, optimized);

      expect(diff).toHaveLength(3);
      expect(diff[0]).toEqual({ type: 'unchanged', text: 'Subject: A ' });
      expect(diff[1]).toEqual({ type: 'added', text: 'beautiful ' });
      expect(diff[2]).toEqual({ type: 'unchanged', text: 'woman' });
    });
  });
});
