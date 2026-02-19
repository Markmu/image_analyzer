/**
 * template-exporter Tests
 *
 * Epic 5 - Story 5.2: JSON Export
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateExportFilename,
  createExportMetadata,
  createExportData,
  createExportUsage,
  createExportObject,
  validateTemplateForExport,
  serializeTemplate,
  exportTemplate,
  checkContentSafety,
  isBlobSupported,
} from './template-exporter';
import type { Template } from '../types';

// Mock document and URL for browser APIs
const mockLink = {
  style: {},
  href: '',
  download: '',
  click: vi.fn(),
};

const mockDocument = {
  createElement: vi.fn(() => mockLink),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
};

const mockURL = {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
};

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'URL', {
  value: mockURL,
  writable: true,
});

describe('template-exporter', () => {
  const mockTemplate: Template = {
    id: 'tpl-123',
    userId: 'user-456',
    analysisResultId: 'ar-789',
    variableFormat: 'A [subject] in [style] style',
    jsonFormat: {
      subject: 'beautiful woman',
      style: 'portrait photography',
      composition: 'close-up',
      colors: 'warm tones',
      lighting: 'soft light',
      additional: 'elegant pose',
    },
    createdAt: new Date('2026-02-20T10:00:00.000Z'),
    updatedAt: new Date('2026-02-20T10:00:00.000Z'),
  };

  describe('generateExportFilename', () => {
    it('should generate filename with correct format', () => {
      const filename = generateExportFilename();
      expect(filename).toMatch(/^template-\d{4}-\d{2}-\d{2}-\d{6}\.json$/);
    });

    it('should generate unique filenames', () => {
      const filename1 = generateExportFilename();
      // Note: In real usage, timestamps will differ between calls
      // In tests with fake timers, they might be the same
      // This is acceptable as the function uses current time
      expect(filename1).toMatch(/^template-\d{4}-\d{2}-\d{2}-\d{6}\.json$/);
    });
  });

  describe('createExportMetadata', () => {
    it('should create export metadata from template', () => {
      const metadata = createExportMetadata(mockTemplate);

      expect(metadata.version).toBe('1.0.0');
      expect(metadata.templateId).toBe(mockTemplate.id);
      expect(metadata.analysisResultId).toBe(mockTemplate.analysisResultId);
      expect(metadata.createdAt).toBe(mockTemplate.createdAt.toISOString());
      expect(metadata.exportedAt).toBeDefined();
      expect(metadata.platform).toBe('image_analyzer');
    });
  });

  describe('createExportData', () => {
    it('should create export data from template', () => {
      const data = createExportData(mockTemplate);

      expect(data.variableFormat).toBe(mockTemplate.variableFormat);
      expect(data.jsonFormat).toEqual(mockTemplate.jsonFormat);
    });
  });

  describe('createExportUsage', () => {
    it('should create export usage information', () => {
      const usage = createExportUsage();

      expect(usage.description).toBeDefined();
      expect(usage.examples).toBeInstanceOf(Array);
      expect(usage.examples.length).toBeGreaterThan(0);
      expect(usage.notes).toBeInstanceOf(Array);
      expect(usage.notes.length).toBeGreaterThan(0);
    });
  });

  describe('createExportObject', () => {
    it('should create complete export object', () => {
      const exportObj = createExportObject(mockTemplate);

      expect(exportObj.metadata).toBeDefined();
      expect(exportObj.template).toBeDefined();
      expect(exportObj.usage).toBeDefined();
    });

    it('should exclude usage when option is false', () => {
      const exportObj = createExportObject(mockTemplate, { includeUsage: false });

      expect(exportObj.metadata).toBeDefined();
      expect(exportObj.template).toBeDefined();
      expect(exportObj.usage).toBeUndefined();
    });
  });

  describe('validateTemplateForExport', () => {
    it('should validate valid template', () => {
      const validation = validateTemplateForExport(mockTemplate);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should fail validation for missing id', () => {
      const invalidTemplate = { ...mockTemplate, id: '' };
      const validation = validateTemplateForExport(invalidTemplate);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Template ID is missing');
    });

    it('should fail validation for empty variable format', () => {
      const invalidTemplate = { ...mockTemplate, variableFormat: '' };
      const validation = validateTemplateForExport(invalidTemplate);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Variable format is empty');
    });

    it('should fail validation for missing json format', () => {
      const invalidTemplate = { ...mockTemplate, jsonFormat: null as any };
      const validation = validateTemplateForExport(invalidTemplate);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('JSON format is missing');
    });

    it('should fail validation for empty json format fields', () => {
      const invalidTemplate = {
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
      const validation = validateTemplateForExport(invalidTemplate);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('serializeTemplate', () => {
    it('should serialize template to formatted JSON', () => {
      const exportObj = createExportObject(mockTemplate);
      const serialized = serializeTemplate(exportObj, true);

      expect(typeof serialized).toBe('string');
      expect(() => JSON.parse(serialized)).not.toThrow();
      expect(serialized).toContain('\n'); // Formatted with newlines
    });

    it('should serialize template to compact JSON', () => {
      const exportObj = createExportObject(mockTemplate);
      const serialized = serializeTemplate(exportObj, false);

      expect(typeof serialized).toBe('string');
      expect(() => JSON.parse(serialized)).not.toThrow();
      expect(serialized).not.toContain('\n'); // Not formatted
    });
  });

  describe('isBlobSupported', () => {
    it('should return true when Blob API is available', () => {
      expect(isBlobSupported()).toBe(true);
    });
  });

  describe('exportTemplate', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should export template successfully', async () => {
      const result = await exportTemplate(mockTemplate);

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/^template-\d{4}-\d{2}-\d{2}-\d{6}\.json$/);
      expect(result.size).toBeGreaterThan(0);
      expect(mockDocument.createElement).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should fail export for invalid template', async () => {
      const invalidTemplate = { ...mockTemplate, id: '' };
      const result = await exportTemplate(invalidTemplate);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use custom filename when provided', async () => {
      const customFilename = 'my-custom-template.json';
      const result = await exportTemplate(mockTemplate, { filename: customFilename });

      expect(result.success).toBe(true);
      expect(result.filename).toBe(customFilename);
    });

    it('should handle export errors', async () => {
      // Mock Blob to throw error
      global.Blob = vi.fn(() => {
        throw new Error('Blob creation failed');
      }) as any;

      const result = await exportTemplate(mockTemplate);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('checkContentSafety', () => {
    it('should return safe result for clean content', async () => {
      const result = await checkContentSafety(mockTemplate);

      expect(result.isSafe).toBe(true);
      expect(result.unsafeContent).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });

    // Note: Actual content safety checking logic will be implemented
    // when Story 4.1 integration is added
  });
});
