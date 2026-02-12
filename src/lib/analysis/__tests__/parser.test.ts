/**
 * Analysis Parser Tests
 *
 * Tests for parsing and validating analysis results
 */

import { describe, it, expect } from 'vitest';
import { parseAnalysisResponse, extractJsonFromResponse, calculateOverallConfidence } from '@/lib/analysis/parser';
import type { StyleDimension } from '@/types/analysis';

describe('Analysis Parser', () => {
  describe('parseAnalysisResponse', () => {
    const validAnalysisData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [
            { name: '主光源方向', value: '侧光', confidence: 0.85 },
            { name: '光影对比度', value: '高对比度', confidence: 0.9 },
          ],
          confidence: 0.85,
        },
        composition: {
          name: '构图',
          features: [
            { name: '视角', value: '平视', confidence: 0.92 },
          ],
          confidence: 0.90,
        },
        color: {
          name: '色彩',
          features: [
            { name: '主色调', value: '暖色调', confidence: 0.95 },
          ],
          confidence: 0.88,
        },
        artisticStyle: {
          name: '艺术风格',
          features: [
            { name: '风格流派', value: '印象派', confidence: 0.78 },
          ],
          confidence: 0.81,
        },
      },
      overallConfidence: 0.86,
      modelUsed: 'llava-13b',
      analysisDuration: 45,
    };

    it('should parse valid JSON response', () => {
      const jsonString = JSON.stringify(validAnalysisData);
      const result = parseAnalysisResponse(jsonString);

      expect(result).toEqual(validAnalysisData);
    });

    it('should parse JSON with markdown code blocks', () => {
      const jsonString = `\`\`\`json\n${JSON.stringify(validAnalysisData)}\n\`\`\``;
      const result = parseAnalysisResponse(jsonString);

      expect(result).toEqual(validAnalysisData);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        parseAnalysisResponse('invalid json');
      }).toThrow('Invalid JSON response from model');
    });

    it('should throw error for missing required fields', () => {
      const invalidData = {
        dimensions: {
          lighting: { name: '光影', features: [], confidence: 0.85 },
        },
        // Missing other required dimensions
      };

      expect(() => {
        parseAnalysisResponse(JSON.stringify(invalidData));
      }).toThrow();
    });

    it('should throw error for invalid confidence values', () => {
      const invalidData = {
        ...validAnalysisData,
        overallConfidence: 1.5, // Invalid: > 1
      };

      expect(() => {
        parseAnalysisResponse(JSON.stringify(invalidData));
      }).toThrow();
    });
  });

  describe('extractJsonFromResponse', () => {
    it('should remove markdown code blocks', () => {
      const response = '```json\n{"key": "value"}\n```';
      const result = extractJsonFromResponse(response);

      expect(result).toBe('{"key": "value"}');
    });

    it('should handle response without code blocks', () => {
      const response = '{"key": "value"}';
      const result = extractJsonFromResponse(response);

      expect(result).toBe('{"key": "value"}');
    });

    it('should trim whitespace', () => {
      const response = '  {"key": "value"}  ';
      const result = extractJsonFromResponse(response);

      expect(result).toBe('{"key": "value"}');
    });
  });

  describe('calculateOverallConfidence', () => {
    const dimensions: {
      lighting: StyleDimension;
      composition: StyleDimension;
      color: StyleDimension;
      artisticStyle: StyleDimension;
    } = {
      lighting: { name: '光影', features: [], confidence: 0.8 },
      composition: { name: '构图', features: [], confidence: 0.9 },
      color: { name: '色彩', features: [], confidence: 0.85 },
      artisticStyle: { name: '艺术风格', features: [], confidence: 0.75 },
    };

    it('should calculate average of all dimension confidences', () => {
      const result = calculateOverallConfidence(dimensions);
      const expected = (0.8 + 0.9 + 0.85 + 0.75) / 4;

      expect(result).toBeCloseTo(expected, 5);
    });

    it('should return value between 0 and 1', () => {
      const result = calculateOverallConfidence(dimensions);

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });
});
