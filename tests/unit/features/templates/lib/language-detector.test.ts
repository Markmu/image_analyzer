/**
 * Language Detector Tests
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Unit tests for language detection logic
 */

import { describe, it, expect } from 'vitest';
import { detectLanguage } from '@/features/templates/lib/language-detector';
import type { TemplateJSONFormat } from '@/features/templates/lib/template';

describe('Language Detector', () => {
  describe('detectLanguage', () => {
    it('should detect Chinese language', () => {
      const template: TemplateJSONFormat = {
        subject: '一位美丽的女子',
        style: '油画风格',
        composition: '居中构图',
        colors: '暖色调',
        lighting: '自然光',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('zh');
    });

    it('should detect English language', () => {
      const template: TemplateJSONFormat = {
        subject: 'A beautiful woman',
        style: 'Oil painting style',
        composition: 'Center composition',
        colors: 'Warm colors',
        lighting: 'Natural light',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('en');
    });

    it('should detect Chinese when mixed content has more Chinese', () => {
      const template: TemplateJSONFormat = {
        subject: '一位美丽的女子 portrait',
        style: '油画风格 painting',
        composition: '居中构图',
        colors: '暖色调',
        lighting: '自然光',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('zh');
    });

    it('should detect English when mixed content has more English', () => {
      const template: TemplateJSONFormat = {
        subject: 'Beautiful woman portrait',
        style: 'Oil painting style 油画',
        composition: 'Center composition',
        colors: 'Warm colors 暖色',
        lighting: 'Natural light',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('en');
    });

    it('should default to English for empty or minimal content', () => {
      const template: TemplateJSONFormat = {
        subject: '',
        style: '',
        composition: '',
        colors: '',
        lighting: '',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('en');
    });

    it('should handle partial content', () => {
      const template: TemplateJSONFormat = {
        subject: '美丽的女子',
        style: '',
        composition: '',
        colors: '',
        lighting: '',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('zh');
    });
  });
});
