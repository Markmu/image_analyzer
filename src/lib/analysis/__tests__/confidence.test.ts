/**
 * Confidence Scoring Unit Tests
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 */

import {
  extractConfidenceFromAnalysisData,
  calculateOverallConfidence,
  getConfidenceLevel,
  checkLowConfidenceDimensions,
  generateConfidenceWarning,
  getAdjustedThresholds,
  getConfidenceForTier,
  DEFAULT_CONFIDENCE_THRESHOLDS,
} from '../confidence';
import type { AnalysisData } from '@/types/analysis';

describe('Confidence Scoring', () => {
  const mockAnalysisData: AnalysisData = {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源', value: '侧光', confidence: 0.85 },
          { name: '对比度', value: '高', confidence: 0.9 },
        ],
        confidence: 0.875,
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '平视', confidence: 0.92 },
        ],
        confidence: 0.92,
      },
      color: {
        name: '色彩',
        features: [
          { name: '色调', value: '暖', confidence: 0.95 },
        ],
        confidence: 0.95,
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格', value: '印象派', confidence: 0.78 },
        ],
        confidence: 0.78,
      },
    },
    overallConfidence: 0.88,
    modelUsed: 'qwen3-vl',
    analysisDuration: 15,
  };

  describe('extractConfidenceFromAnalysisData', () => {
    it('should extract confidence scores from analysis data', () => {
      const scores = extractConfidenceFromAnalysisData(mockAnalysisData);

      expect(scores.overall).toBe(88);
      expect(scores.lighting).toBe(88);
      expect(scores.composition).toBe(92);
      expect(scores.color).toBe(95);
      expect(scores.style).toBe(78);
    });

    it('should handle missing confidence values', () => {
      const dataWithoutConfidence = {
        ...mockAnalysisData,
        dimensions: {
          ...mockAnalysisData.dimensions,
          lighting: {
            name: '光影',
            features: [],
            confidence: 0,
          },
        },
      };

      const scores = extractConfidenceFromAnalysisData(dataWithoutConfidence);
      expect(scores.lighting).toBe(0);
    });
  });

  describe('calculateOverallConfidence', () => {
    it('should calculate average of all dimensions', () => {
      const scores = {
        overall: 0,
        lighting: 80,
        composition: 90,
        color: 70,
        style: 60,
      };

      const avg = calculateOverallConfidence(scores);
      expect(avg).toBe(75);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return "high" for scores >= 80', () => {
      expect(getConfidenceLevel(80)).toBe('high');
      expect(getConfidenceLevel(95)).toBe('high');
    });

    it('should return "medium" for scores 60-79', () => {
      expect(getConfidenceLevel(60)).toBe('medium');
      expect(getConfidenceLevel(75)).toBe('medium');
    });

    it('should return "low" for scores 40-59', () => {
      expect(getConfidenceLevel(40)).toBe('low');
      expect(getConfidenceLevel(55)).toBe('low');
    });

    it('should return "critical" for scores < 40', () => {
      expect(getConfidenceLevel(20)).toBe('critical');
      expect(getConfidenceLevel(0)).toBe('critical');
    });
  });

  describe('checkLowConfidenceDimensions', () => {
    it('should identify low confidence dimensions', () => {
      const scores = {
        overall: 75,
        lighting: 85,
        composition: 55,
        color: 58,
        style: 90,
      };

      const lowDims = checkLowConfidenceDimensions(scores, 60);
      expect(lowDims).toContain('构图');
      expect(lowDims).toContain('色彩');
      expect(lowDims).not.toContain('光影');
      expect(lowDims).not.toContain('艺术风格');
    });

    it('should return empty array when all dimensions are above threshold', () => {
      const scores = {
        overall: 90,
        lighting: 90,
        composition: 90,
        color: 90,
        style: 90,
      };

      const lowDims = checkLowConfidenceDimensions(scores, 60);
      expect(lowDims).toHaveLength(0);
    });
  });

  describe('generateConfidenceWarning', () => {
    it('should return null for high confidence scores', () => {
      const scores = {
        overall: 90,
        lighting: 90,
        composition: 90,
        color: 90,
        style: 90,
      };

      const warning = generateConfidenceWarning(scores);
      expect(warning).toBeNull();
    });

    it('should generate warning for low overall confidence', () => {
      const scores = {
        overall: 55,
        lighting: 60,
        composition: 50,
        color: 55,
        style: 58,
      };

      const warning = generateConfidenceWarning(scores);
      expect(warning).not.toBeNull();
      expect(warning?.level).toBe('low');
      expect(warning?.suggestedAction).toBe('retry');
    });

    it('should generate warning when some dimensions are low', () => {
      const scores = {
        overall: 75,
        lighting: 85,
        composition: 50,
        color: 55,
        style: 90,
      };

      const warning = generateConfidenceWarning(scores);
      expect(warning).not.toBeNull();
      expect(warning?.affectedDimensions).toContain('构图');
      expect(warning?.affectedDimensions).toContain('色彩');
    });
  });

  describe('getAdjustedThresholds', () => {
    it('should apply strict modifier for gemini-flash', () => {
      const thresholds = getAdjustedThresholds('gemini-flash');
      expect(thresholds.high).toBe(DEFAULT_CONFIDENCE_THRESHOLDS.high - 5);
    });

    it('should apply loose modifier for qwen3-vl', () => {
      const thresholds = getAdjustedThresholds('qwen3-vl');
      expect(thresholds.high).toBe(DEFAULT_CONFIDENCE_THRESHOLDS.high + 5);
    });

    it('should use default modifier for unknown models', () => {
      const thresholds = getAdjustedThresholds('unknown-model');
      expect(thresholds.high).toBe(DEFAULT_CONFIDENCE_THRESHOLDS.high);
    });
  });

  describe('getConfidenceForTier', () => {
    it('should return base dimensions for free tier', () => {
      const extendedScores = {
        overall: 85,
        lighting: 90,
        composition: 80,
        color: 85,
        style: 85,
        emotionalTone: 88,
        artisticPeriod: 82,
      };

      const result = getConfidenceForTier(extendedScores, 'free');
      expect(result).not.toHaveProperty('emotionalTone');
      expect(result).not.toHaveProperty('artisticPeriod');
      expect(result).toHaveProperty('lighting');
      expect(result).toHaveProperty('composition');
    });

    it('should return all dimensions for standard tier', () => {
      const extendedScores = {
        overall: 85,
        lighting: 90,
        composition: 80,
        color: 85,
        style: 85,
        emotionalTone: 88,
        artisticPeriod: 82,
      };

      const result = getConfidenceForTier(extendedScores, 'standard');
      expect(result).toHaveProperty('emotionalTone');
      expect(result).toHaveProperty('artisticPeriod');
    });
  });
});
