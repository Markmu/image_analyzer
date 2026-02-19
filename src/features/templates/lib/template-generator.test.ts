/**
 * Template Generator Tests
 *
 * Epic 5 - Story 5.1: Template Generation
 */

import { describe, it, expect } from 'vitest';
import { generateTemplate, extractVariables, replaceVariables, formatJSONAsText } from './template-generator';
import type { AnalysisData } from '@/types/analysis';

describe('Template Generator', () => {
  describe('generateTemplate', () => {
    it('should generate a template from analysis data', () => {
      const analysisData: AnalysisData = {
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
        dimensions: {
          lighting: {
            name: 'Lighting',
            features: [
              { name: 'light-type', value: '自然光', confidence: 0.9 },
              { name: 'intensity', value: '柔和', confidence: 0.85 },
            ],
            confidence: 0.87,
          },
          composition: {
            name: 'Composition',
            features: [
              { name: 'rule-of-thirds', value: '三分法', confidence: 0.8 },
            ],
            confidence: 0.8,
          },
          color: {
            name: 'Color',
            features: [
              { name: 'palette', value: '暖色调', confidence: 0.88 },
            ],
            confidence: 0.88,
          },
          artisticStyle: {
            name: 'Artistic Style',
            features: [
              { name: 'style', value: '印象派', confidence: 0.9 },
              { name: 'subject', value: '风景画', confidence: 0.85 },
            ],
            confidence: 0.87,
          },
        },
      };

      const template = generateTemplate('analysis-123', 'user-456', analysisData);

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.userId).toBe('user-456');
      expect(template.analysisResultId).toBe('analysis-123');
      expect(template.variableFormat).toContain('[');
      expect(template.variableFormat).toContain(']');
      expect(template.jsonFormat).toBeDefined();
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('should include all required fields in JSON format', () => {
      const analysisData: AnalysisData = {
        overallConfidence: 0.75,
        modelUsed: 'test-model',
        analysisDuration: 1.0,
        dimensions: {
          lighting: {
            name: 'Lighting',
            features: [{ name: 'type', value: '自然光', confidence: 0.8 }],
            confidence: 0.8,
          },
          composition: {
            name: 'Composition',
            features: [{ name: 'rule', value: '居中', confidence: 0.7 }],
            confidence: 0.7,
          },
          color: {
            name: 'Color',
            features: [{ name: 'tone', value: '冷色调', confidence: 0.75 }],
            confidence: 0.75,
          },
          artisticStyle: {
            name: 'Artistic Style',
            features: [{ name: 'style', value: '写实', confidence: 0.8 }],
            confidence: 0.8,
          },
        },
      };

      const template = generateTemplate('analysis-1', 'user-1', analysisData);

      expect(template.jsonFormat).toHaveProperty('subject');
      expect(template.jsonFormat).toHaveProperty('style');
      expect(template.jsonFormat).toHaveProperty('composition');
      expect(template.jsonFormat).toHaveProperty('colors');
      expect(template.jsonFormat).toHaveProperty('lighting');
      expect(template.jsonFormat).toHaveProperty('additional');
    });
  });

  describe('extractVariables', () => {
    it('should extract variables from template', () => {
      const template = '主体: [风景画]\n风格: [印象派]\n色彩: [暖色调]';
      const variables = extractVariables(template);

      expect(variables).toContain('风景画');
      expect(variables).toContain('印象派');
      expect(variables).toContain('暖色调');
    });

    it('should remove duplicate variables', () => {
      const template = '[主体] [主体] [风格]';
      const variables = extractVariables(template);

      expect(variables).toHaveLength(2);
      expect(variables).toContain('主体');
      expect(variables).toContain('风格');
    });

    it('should handle empty variables', () => {
      const template = '主体: []\n风格: []';
      const variables = extractVariables(template);

      expect(variables).toHaveLength(0);
    });
  });

  describe('replaceVariables', () => {
    it('should replace variables with values', () => {
      const template = '主体: [主体]\n风格: [风格]';
      const values = {
        主体: '山脉',
        风格: '写实主义',
      };

      const result = replaceVariables(template, values);

      expect(result).toContain('山脉');
      expect(result).toContain('写实主义');
      expect(result).not.toContain('[主体]');
      expect(result).not.toContain('[风格]');
    });

    it('should keep unreplaced variables if value not provided', () => {
      const template = '主体: [主体]\n风格: [风格]';
      const values = {
        主体: '山脉',
      };

      const result = replaceVariables(template, values);

      expect(result).toContain('山脉');
      expect(result).toContain('[风格]');
    });
  });

  describe('formatJSONAsText', () => {
    it('should format JSON template as text', () => {
      const jsonFormat = {
        subject: '山脉风景',
        style: '写实主义',
        composition: '三分法',
        colors: '暖色调',
        lighting: '自然光',
        additional: '细节丰富',
      };

      const result = formatJSONAsText(jsonFormat);

      expect(result).toContain('Subject:');
      expect(result).toContain('Style:');
      expect(result).toContain('Composition:');
      expect(result).toContain('Colors:');
      expect(result).toContain('Lighting:');
      expect(result).toContain('Additional:');
      expect(result).toContain('山脉风景');
      expect(result).toContain('写实主义');
    });
  });
});
