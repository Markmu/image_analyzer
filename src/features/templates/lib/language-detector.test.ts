/**
 * Language Detection Tests
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Tests for language detection functionality
 */

import { describe, it, expect } from 'vitest';
import { detectLanguage, detectLanguageFromText } from './language-detector';
import type { TemplateJSONFormat } from '../types/template';

describe('language-detector', () => {
  describe('detectLanguage', () => {
    it('should detect Chinese when Chinese characters are more prevalent', () => {
      const template: TemplateJSONFormat = {
        subject: '一位美女',
        style: '肖像画风格',
        composition: '居中构图',
        colors: '暖色调',
        lighting: '自然光',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('zh');
    });

    it('should detect English when English characters are more prevalent', () => {
      const template: TemplateJSONFormat = {
        subject: 'A beautiful woman',
        style: 'Portrait style',
        composition: 'Center composition',
        colors: 'Warm tones',
        lighting: 'Natural light',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('en');
    });

    it('should detect Chinese in mixed content with more Chinese characters', () => {
      const template: TemplateJSONFormat = {
        subject: '一位中文美女',
        style: '肖像画风格艺术风格',
        composition: '居中构图构图',
        colors: '暖色调色彩',
        lighting: '自然光线',
        additional: '',
      };

      expect(detectLanguage(template)).toBe('zh');
    });

    it('should detect English in mixed content with more English characters', () => {
      const template: TemplateJSONFormat = {
        subject: '美女 portrait',
        style: 'style 肖像画',
        composition: 'composition composition',
        colors: 'warm tones warm tones',
        lighting: 'light light',
        additional: 'additional text text',
      };

      expect(detectLanguage(template)).toBe('en');
    });

    it('should default to English when equal number of Chinese and English characters', () => {
      const template: TemplateJSONFormat = {
        subject: 'A',
        style: 'B',
        composition: 'C',
        colors: 'D',
        lighting: 'E',
        additional: 'F',
      };

      expect(detectLanguage(template)).toBe('en');
    });

    it('should handle empty template', () => {
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

    it('should handle template with only spaces', () => {
      const template: TemplateJSONFormat = {
        subject: '   ',
        style: '  ',
        composition: ' ',
        colors: '  ',
        lighting: ' ',
        additional: ' ',
      };

      expect(detectLanguage(template)).toBe('en');
    });
  });

  describe('detectLanguageFromText', () => {
    it('should detect Chinese from Chinese text', () => {
      const text = '这是一段中文文本，包含多个汉字。';
      expect(detectLanguageFromText(text)).toBe('zh');
    });

    it('should detect English from English text', () => {
      const text = 'This is English text with multiple words.';
      expect(detectLanguageFromText(text)).toBe('en');
    });

    it('should detect Chinese when more Chinese characters', () => {
      const text = '这是中文文本文本文本文本文本 text';
      expect(detectLanguageFromText(text)).toBe('zh');
    });

    it('should detect English when more English characters', () => {
      const text = '中文 with more English text and words';
      expect(detectLanguageFromText(text)).toBe('en');
    });

    it('should default to English for equal counts', () => {
      const text = 'A B C D E';
      expect(detectLanguageFromText(text)).toBe('en');
    });

    it('should handle empty string', () => {
      expect(detectLanguageFromText('')).toBe('en');
    });

    it('should handle string with only special characters', () => {
      expect(detectLanguageFromText('!@#$%^&*()')).toBe('en');
    });

    it('should handle numbers only', () => {
      expect(detectLanguageFromText('12345 67890')).toBe('en');
    });
  });

  describe('edge cases', () => {
    it('should handle Chinese numbers and punctuation', () => {
      const text = '一二三四五，！@#￥%';
      expect(detectLanguageFromText(text)).toBe('zh');
    });

    it('should handle mixed script text (Japanese, Korean, etc.)', () => {
      // Japanese uses some Chinese characters (Kanji)
      const text = '日本語のテキスト';
      expect(detectLanguageFromText(text)).toBe('zh');
    });

    it('should handle very long Chinese text', () => {
      const text = '中文'.repeat(1000);
      expect(detectLanguageFromText(text)).toBe('zh');
    });

    it('should handle very long English text', () => {
      const text = 'English'.repeat(1000);
      expect(detectLanguageFromText(text)).toBe('en');
    });
  });
});
