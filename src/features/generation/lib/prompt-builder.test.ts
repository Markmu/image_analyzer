/**
 * Prompt Builder Tests
 */

import { describe, it, expect } from 'vitest';
import { buildGenerationPrompt, validatePromptLength, truncatePrompt } from '../prompt-builder';
import type { Template } from '@/features/templates/types/template';

describe('Prompt Builder', () => {
  const mockTemplate: Template = {
    id: 'test-1',
    userId: 'user-1',
    analysisResultId: 'analysis-1',
    variableFormat: 'Test template with [variables]',
    jsonFormat: {
      subject: '一位美丽的女性',
      style: '肖像摄影风格',
      composition: '居中构图',
      colors: '暖色调',
      lighting: '自然光',
      additional: '微笑表情',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('buildGenerationPrompt', () => {
    it('should combine all template fields into a single prompt', () => {
      const prompt = buildGenerationPrompt(mockTemplate);

      expect(prompt).toContain('一位美丽的女性');
      expect(prompt).toContain('肖像摄影风格');
      expect(prompt).toContain('居中构图');
      expect(prompt).toContain('暖色调');
      expect(prompt).toContain('自然光');
      expect(prompt).toContain('微笑表情');
    });

    it('should handle empty fields gracefully', () => {
      const emptyTemplate: Template = {
        ...mockTemplate,
        jsonFormat: {
          subject: '',
          style: '',
          composition: '',
          colors: '',
          lighting: '',
          additional: '',
        },
      };

      const prompt = buildGenerationPrompt(emptyTemplate);
      expect(prompt).toBe('');
    });

    it('should join fields with comma separator', () => {
      const prompt = buildGenerationPrompt(mockTemplate);

      expect(prompt).toMatch(/.*, .*.*, .*/);
    });
  });

  describe('validatePromptLength', () => {
    it('should return true for short prompts', () => {
      const shortPrompt = 'A simple prompt';
      expect(validatePromptLength(shortPrompt, 1000)).toBe(true);
    });

    it('should return false for very long prompts', () => {
      const longPrompt = 'A'.repeat(5000); // ~1250 tokens
      expect(validatePromptLength(longPrompt, 1000)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      const edgePrompt = 'A'.repeat(4000); // ~1000 tokens
      expect(validatePromptLength(edgePrompt, 1000)).toBe(true);
    });
  });

  describe('truncatePrompt', () => {
    it('should return prompt unchanged if under limit', () => {
      const shortPrompt = 'A simple prompt';
      const truncated = truncatePrompt(shortPrompt, 1000);

      expect(truncated).toBe(shortPrompt);
    });

    it('should truncate long prompts and add ellipsis', () => {
      const longPrompt = 'A'.repeat(5000);
      const truncated = truncatePrompt(longPrompt, 1000);

      expect(truncated).toHaveLength(3997); // 4000 - 3 for '...'
      expect(truncated).toMatch(/\.\.\.$/);
    });

    it('should not add ellipsis if prompt is exactly at limit', () => {
      const exactPrompt = 'A'.repeat(4000);
      const truncated = truncatePrompt(exactPrompt, 1000);

      expect(truncated).toBe(exactPrompt);
    });
  });
});
