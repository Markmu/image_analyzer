/**
 * Field Configurations Unit Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Tests for field configurations and validation
 */

import { describe, it, expect } from 'vitest';
import { FIELD_CONFIGS, getFieldConfig, getFieldKeys } from '@/features/templates/lib/field-configs';

describe('FIELD_CONFIGS', () => {
  describe('field structure', () => {
    it('should have all 6 required fields', () => {
      const keys = Object.keys(FIELD_CONFIGS);
      expect(keys).toHaveLength(6);
      expect(keys).toContain('subject');
      expect(keys).toContain('style');
      expect(keys).toContain('composition');
      expect(keys).toContain('colors');
      expect(keys).toContain('lighting');
      expect(keys).toContain('additional');
    });

    it('should have correct field structure for each config', () => {
      Object.values(FIELD_CONFIGS).forEach((config) => {
        expect(config).toHaveProperty('key');
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('placeholder');
        expect(config).toHaveProperty('required');
        expect(config).toHaveProperty('maxLength');
        expect(config).toHaveProperty('suggestions');
        expect(Array.isArray(config.suggestions)).toBe(true);
      });
    });
  });

  describe('subject field config', () => {
    const config = FIELD_CONFIGS.subject;

    it('should have correct label', () => {
      expect(config.label).toBe('主体描述');
    });

    it('should be required', () => {
      expect(config.required).toBe(true);
    });

    it('should have max length of 200', () => {
      expect(config.maxLength).toBe(200);
    });

    it('should have suggestions', () => {
      expect(config.suggestions.length).toBeGreaterThan(0);
      expect(config.suggestions).toContain('一位美丽的女性');
    });

    it('should validate empty value', () => {
      const error = config.validation?.('');
      expect(error).toBe('主体描述不能为空');
    });

    it('should validate whitespace only value', () => {
      const error = config.validation?.('   ');
      expect(error).toBe('主体描述不能为空');
    });

    it('should validate max length', () => {
      const longValue = 'a'.repeat(201);
      const error = config.validation?.(longValue);
      expect(error).toBe('主体描述不能超过 200 个字符');
    });

    it('should pass validation for valid value', () => {
      const error = config.validation?.('一位美丽的女性');
      expect(error).toBeNull();
    });
  });

  describe('style field config', () => {
    const config = FIELD_CONFIGS.style;

    it('should have correct label', () => {
      expect(config.label).toBe('风格描述');
    });

    it('should be required', () => {
      expect(config.required).toBe(true);
    });

    it('should have max length of 150', () => {
      expect(config.maxLength).toBe(150);
    });

    it('should have suggestions', () => {
      expect(config.suggestions.length).toBeGreaterThan(0);
      expect(config.suggestions).toContain('肖像摄影风格');
    });

    it('should validate empty value', () => {
      const error = config.validation?.('');
      expect(error).toBe('风格描述不能为空');
    });

    it('should validate max length', () => {
      const longValue = 'a'.repeat(151);
      const error = config.validation?.(longValue);
      expect(error).toBe('风格描述不能超过 150 个字符');
    });

    it('should pass validation for valid value', () => {
      const error = config.validation?.('肖像摄影风格');
      expect(error).toBeNull();
    });
  });

  describe('composition field config', () => {
    const config = FIELD_CONFIGS.composition;

    it('should have correct label', () => {
      expect(config.label).toBe('构图信息');
    });

    it('should not be required', () => {
      expect(config.required).toBe(false);
    });

    it('should have max length of 150', () => {
      expect(config.maxLength).toBe(150);
    });

    it('should have suggestions', () => {
      expect(config.suggestions.length).toBeGreaterThan(0);
      expect(config.suggestions).toContain('特写，居中构图');
    });

    it('should allow empty value', () => {
      const error = config.validation?.('');
      expect(error).toBeUndefined();
    });

    it('should have no validation function', () => {
      expect(config.validation).toBeUndefined();
    });
  });

  describe('colors field config', () => {
    const config = FIELD_CONFIGS.colors;

    it('should have correct label', () => {
      expect(config.label).toBe('色彩方案');
    });

    it('should not be required', () => {
      expect(config.required).toBe(false);
    });

    it('should have max length of 150', () => {
      expect(config.maxLength).toBe(150);
    });

    it('should have suggestions', () => {
      expect(config.suggestions.length).toBeGreaterThan(0);
      expect(config.suggestions).toContain('暖色调，柔和的棕色和金色');
    });
  });

  describe('lighting field config', () => {
    const config = FIELD_CONFIGS.lighting;

    it('should have correct label', () => {
      expect(config.label).toBe('光线设置');
    });

    it('should not be required', () => {
      expect(config.required).toBe(false);
    });

    it('should have max length of 150', () => {
      expect(config.maxLength).toBe(150);
    });

    it('should have suggestions', () => {
      expect(config.suggestions.length).toBeGreaterThan(0);
      expect(config.suggestions).toContain('柔和的自然光，黄金时刻');
    });
  });

  describe('additional field config', () => {
    const config = FIELD_CONFIGS.additional;

    it('should have correct label', () => {
      expect(config.label).toBe('其他细节');
    });

    it('should not be required', () => {
      expect(config.required).toBe(false);
    });

    it('should have max length of 300', () => {
      expect(config.maxLength).toBe(300);
    });

    it('should have suggestions', () => {
      expect(config.suggestions.length).toBeGreaterThan(0);
      expect(config.suggestions).toContain('优雅的姿势，平静的表情');
    });
  });
});

describe('getFieldConfig', () => {
  it('should return correct config for valid key', () => {
    const config = getFieldConfig('subject');
    expect(config).toBeDefined();
    expect(config?.key).toBe('subject');
  });

  it('should return undefined for invalid key', () => {
    const config = getFieldConfig('invalid' as any);
    expect(config).toBeUndefined();
  });

  it('should return all field configs', () => {
    const keys = ['subject', 'style', 'composition', 'colors', 'lighting', 'additional'];
    keys.forEach((key) => {
      const config = getFieldConfig(key);
      expect(config).toBeDefined();
      expect(config?.key).toBe(key);
    });
  });
});

describe('getFieldKeys', () => {
  it('should return all field keys', () => {
    const keys = getFieldKeys();
    expect(keys).toHaveLength(6);
    expect(keys).toContain('subject');
    expect(keys).toContain('style');
    expect(keys).toContain('composition');
    expect(keys).toContain('colors');
    expect(keys).toContain('lighting');
    expect(keys).toContain('additional');
  });

  it('should return keys in consistent order', () => {
    const keys1 = getFieldKeys();
    const keys2 = getFieldKeys();
    expect(keys1).toEqual(keys2);
  });
});

describe('field validation edge cases', () => {
  it('should handle unicode characters correctly', () => {
    const config = FIELD_CONFIGS.subject;
    const unicodeText = '🎨 美丽的女性 👩‍🎨';
    const error = config.validation?.(unicodeText);
    expect(error).toBeNull();
  });

  it('should handle very long suggestions', () => {
    FIELD_CONFIGS.additional.suggestions.forEach((suggestion) => {
      expect(suggestion.length).toBeLessThanOrEqual(FIELD_CONFIGS.additional.maxLength);
    });
  });

  it('should have at least 3 suggestions for each field', () => {
    Object.values(FIELD_CONFIGS).forEach((config) => {
      expect(config.suggestions.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should have unique suggestions within each field', () => {
    Object.values(FIELD_CONFIGS).forEach((config) => {
      const uniqueSuggestions = new Set(config.suggestions);
      expect(uniqueSuggestions.size).toBe(config.suggestions.length);
    });
  });
});
