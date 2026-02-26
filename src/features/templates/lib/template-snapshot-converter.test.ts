/**
 * Template Snapshot Converter Tests
 *
 * Tests for template snapshot to Template conversion
 */

import { describe, it, expect, vi } from 'vitest';
import type { Template } from '../../types/template';
import {
  templateSnapshotToTemplate,
  validateAnalysisData,
  isTemplateValid,
} from './template-snapshot-converter';
import { validateAndConvertAnalysisData } from './validation-schemas';
import type { SavedTemplate } from '../../types/library';

describe('template-snapshot-converter', () => {
  describe('validateAndConvertAnalysisData (Zod validation)', () => {
    it('should validate complete analysis data with Zod', () => {
      const completeData = {
        dimensions: {
          lighting: {
            name: 'lighting',
            features: [{ name: 'soft', value: 'soft light', confidence: 0.9 }],
            confidence: 0.85,
          },
          composition: {
            name: 'composition',
            features: [{ name: 'center', value: 'centered', confidence: 0.8 }],
            confidence: 0.75,
          },
          color: {
            name: 'color',
            features: [{ name: 'warm', value: 'warm tones', confidence: 0.88 }],
            confidence: 0.82,
          },
          artisticStyle: {
            name: 'artisticStyle',
            features: [{ name: 'portrait', value: 'portrait style', confidence: 0.92 }],
            confidence: 0.9,
          },
        },
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
      };

      const result = validateAndConvertAnalysisData(completeData);
      expect(result).toEqual(completeData);
    });

    it('should validate partial analysis data (missing dimensions)', () => {
      const partialData = {
        dimensions: {
          lighting: {
            name: 'lighting',
            features: [{ name: 'soft', value: 'soft light', confidence: 0.9 }],
            confidence: 0.85,
          },
          // Missing other dimensions
        },
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
      };

      const result = validateAndConvertAnalysisData(partialData);
      expect(result).toEqual(partialData);
    });

    it('should return null for null data', () => {
      const result = validateAndConvertAnalysisData(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined data', () => {
      const result = validateAndConvertAnalysisData(undefined);
      expect(result).toBeNull();
    });

    it('should return null for data without dimensions', () => {
      const noDimensionsData = {
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
      };

      const result = validateAndConvertAnalysisData(noDimensionsData);
      expect(result).toBeNull();
    });

    it('should return null for data with empty dimensions', () => {
      const emptyDimensionsData = {
        dimensions: {},
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
      };

      const result = validateAndConvertAnalysisData(emptyDimensionsData);
      expect(result).toBeNull();
    });

    it('should reject data with invalid confidence values', () => {
      const invalidConfidenceData = {
        dimensions: {
          lighting: {
            name: 'lighting',
            features: [{ name: 'soft', value: 'soft light', confidence: 1.5 }],
            confidence: 2.0,
          },
        },
        overallConfidence: 0.85,
      };

      const result = validateAndConvertAnalysisData(invalidConfidenceData);
      expect(result).toBeNull();
    });
  });

  describe('validateAnalysisData (backwards compatibility)', () => {
    it('should delegate to validateAndConvertAnalysisData', () => {
      const completeData = {
        dimensions: {
          lighting: {
            name: 'lighting',
            features: [{ name: 'soft', value: 'soft light', confidence: 0.9 }],
            confidence: 0.85,
          },
        },
        overallConfidence: 0.85,
      };

      const result = validateAnalysisData(completeData);
      expect(result).toEqual(completeData);
    });
  });

  describe('templateSnapshotToTemplate', () => {
    const mockDate = new Date('2024-01-01T00:00:00.000Z');

    const createMockSavedTemplate = (analysisData: unknown): SavedTemplate => ({
      id: 123,
      userId: 'user-123',
      analysisResultId: 456,
      title: 'Test Template',
      description: 'Test Description',
      templateSnapshot: {
        analysisData,
        confidenceScore: 0.85,
        modelId: 'test-model',
        createdAt: mockDate,
      },
      isFavorite: false,
      usageCount: 0,
      tags: [],
      categories: [],
      createdAt: mockDate,
      updatedAt: mockDate,
    });

    it('should convert valid SavedTemplate to Template', () => {
      const validAnalysisData = {
        dimensions: {
          lighting: {
            name: 'lighting',
            features: [
              { name: 'soft', value: 'soft light', confidence: 0.9 },
              { name: 'natural', value: 'natural light', confidence: 0.85 },
            ],
            confidence: 0.85,
          },
          composition: {
            name: 'composition',
            features: [
              { name: 'center', value: 'centered composition', confidence: 0.8 },
            ],
            confidence: 0.75,
          },
          color: {
            name: 'color',
            features: [
              { name: 'warm', value: 'warm tones', confidence: 0.88 },
            ],
            confidence: 0.82,
          },
          artisticStyle: {
            name: 'artisticStyle',
            features: [
              { name: 'portrait', value: 'portrait photography', confidence: 0.92 },
            ],
            confidence: 0.9,
          },
        },
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
      };

      const savedTemplate = createMockSavedTemplate(validAnalysisData);
      const result = templateSnapshotToTemplate(savedTemplate, 'template-123');

      expect(result).toMatchObject({
        id: 'template-123',
        userId: 'user-123',
        analysisResultId: '456',
        createdAt: mockDate,
        updatedAt: mockDate,
      });

      // Check that jsonFormat has generated values
      expect(result.jsonFormat).toBeDefined();
      expect(typeof result.jsonFormat.subject).toBe('string');
      expect(typeof result.jsonFormat.style).toBe('string');
      expect(typeof result.variableFormat).toBe('string');
    });

    it('should return blank template for invalid analysisData', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const invalidData = {
        randomField: 'value',
      };

      const savedTemplate = createMockSavedTemplate(invalidData);
      const result = templateSnapshotToTemplate(savedTemplate, 'template-123');

      expect(result.jsonFormat).toEqual({
        subject: '',
        style: '',
        composition: '',
        colors: '',
        lighting: '',
        additional: '',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid analysisData in templateSnapshot, returning blank template'
      );

      consoleSpy.mockRestore();
    });

    it('should return blank template for null analysisData', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const savedTemplate = createMockSavedTemplate(null);
      const result = templateSnapshotToTemplate(savedTemplate, 'template-123');

      expect(result.jsonFormat).toEqual({
        subject: '',
        style: '',
        composition: '',
        colors: '',
        lighting: '',
        additional: '',
      });

      consoleSpy.mockRestore();
    });

    it('should handle conversion errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create data that will cause generateJSONFormat to throw
      const problematicData = {
        dimensions: {
          lighting: {
            name: 'lighting',
            features: null, // This might cause issues
            confidence: 0.85,
          },
        },
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
      };

      const savedTemplate = createMockSavedTemplate(problematicData);

      // Should not throw, but return blank template
      const result = templateSnapshotToTemplate(savedTemplate, 'template-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('template-123');

      consoleSpy.mockRestore();
    });

    it('should preserve timestamps from SavedTemplate', () => {
      const validAnalysisData = {
        dimensions: {
          lighting: {
            name: 'lighting',
            features: [{ name: 'soft', value: 'soft light', confidence: 0.9 }],
            confidence: 0.85,
          },
          composition: {
            name: 'composition',
            features: [{ name: 'center', value: 'centered', confidence: 0.8 }],
            confidence: 0.75,
          },
          color: {
            name: 'color',
            features: [{ name: 'warm', value: 'warm tones', confidence: 0.88 }],
            confidence: 0.82,
          },
          artisticStyle: {
            name: 'artisticStyle',
            features: [{ name: 'portrait', value: 'portrait style', confidence: 0.92 }],
            confidence: 0.9,
          },
        },
        overallConfidence: 0.85,
        modelUsed: 'test-model',
        analysisDuration: 1.5,
      };

      const savedTemplate = createMockSavedTemplate(validAnalysisData);
      const result = templateSnapshotToTemplate(savedTemplate, 'template-123');

      expect(result.createdAt).toEqual(mockDate);
      expect(result.updatedAt).toEqual(mockDate);
    });
  });

  describe('isTemplateValid', () => {
    it('should return true for template with populated fields', () => {
      const template: Template = {
        id: 'template-123',
        userId: 'user-123',
        analysisResultId: '456',
        variableFormat: '主体: [test]',
        jsonFormat: {
          subject: 'A beautiful woman',
          style: 'Portrait style',
          composition: '',
          colors: '',
          lighting: '',
          additional: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isTemplateValid(template)).toBe(true);
    });

    it('should return false for template with all empty fields', () => {
      const template: Template = {
        id: 'template-123',
        userId: 'user-123',
        analysisResultId: '456',
        variableFormat: '',
        jsonFormat: {
          subject: '',
          style: '',
          composition: '',
          colors: '',
          lighting: '',
          additional: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isTemplateValid(template)).toBe(false);
    });

    it('should return false for null template', () => {
      expect(isTemplateValid(null)).toBe(false);
    });

    it('should return true for template with only one populated field', () => {
      const template: Template = {
        id: 'template-123',
        userId: 'user-123',
        analysisResultId: '456',
        variableFormat: '',
        jsonFormat: {
          subject: 'A beautiful woman',
          style: '',
          composition: '',
          colors: '',
          lighting: '',
          additional: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isTemplateValid(template)).toBe(true);
    });
  });
});
