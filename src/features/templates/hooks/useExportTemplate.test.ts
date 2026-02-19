/**
 * useExportTemplate Hook Tests
 *
 * Epic 5 - Story 5.2: JSON Export
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExportTemplate } from './useExportTemplate';
import type { Template } from '../types';

// Mock template-exporter utilities
vi.mock('../lib/template-exporter', () => ({
  exportTemplate: vi.fn(),
  checkContentSafety: vi.fn(),
}));

import { exportTemplate as exportTemplateUtil, checkContentSafety as checkContentSafetyUtil } from '../lib/template-exporter';

describe('useExportTemplate', () => {
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
    createdAt: new Date('2026-02-20'),
    updatedAt: new Date('2026-02-20'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportTemplate', () => {
    it('should export template successfully', async () => {
      const mockResult = {
        success: true,
        filename: 'template-2026-02-20-164512.json',
        size: 1024,
      };

      (exportTemplateUtil as any).mockResolvedValue(mockResult);
      (checkContentSafetyUtil as any).mockResolvedValue({ isSafe: true });

      const { result } = renderHook(() =>
        useExportTemplate({
          checkSafety: true,
        })
      );

      await act(async () => {
        const exportResult = await result.current.exportTemplate(mockTemplate);
        expect(exportResult).toEqual(mockResult);
      });

      expect(exportTemplateUtil).toHaveBeenCalledWith(mockTemplate, undefined);
      expect(checkContentSafetyUtil).toHaveBeenCalledWith(mockTemplate);
    });

    it('should handle content safety check failure', async () => {
      const safetyResult = {
        isSafe: false,
        unsafeContent: ['inappropriate content'],
        warning: 'Template contains unsafe content',
      };

      (checkContentSafetyUtil as any).mockResolvedValue(safetyResult);

      const onError = vi.fn();
      const { result } = renderHook(() =>
        useExportTemplate({
          checkSafety: true,
          onError,
        })
      );

      await act(async () => {
        const exportResult = await result.current.exportTemplate(mockTemplate);
        expect(exportResult.success).toBe(false);
        expect(exportResult.error).toBeDefined();
      });

      expect(onError).toHaveBeenCalledWith(expect.any(String));
      expect(exportTemplateUtil).not.toHaveBeenCalled();
    });

    it('should skip content safety check when disabled', async () => {
      const mockResult = {
        success: true,
        filename: 'template-2026-02-20-164512.json',
        size: 1024,
      };

      (exportTemplateUtil as any).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useExportTemplate({
          checkSafety: false,
        })
      );

      await act(async () => {
        await result.current.exportTemplate(mockTemplate);
      });

      expect(checkContentSafetyUtil).not.toHaveBeenCalled();
      expect(exportTemplateUtil).toHaveBeenCalledWith(mockTemplate, undefined);
    });

    it('should handle export errors', async () => {
      const error = new Error('Export failed');
      (exportTemplateUtil as any).mockRejectedValue(error);
      (checkContentSafetyUtil as any).mockResolvedValue({ isSafe: true });

      const onError = vi.fn();
      const { result } = renderHook(() =>
        useExportTemplate({
          checkSafety: true,
          onError,
        })
      );

      await act(async () => {
        const exportResult = await result.current.exportTemplate(mockTemplate);
        expect(exportResult.success).toBe(false);
        expect(exportResult.error).toBe('Export failed');
      });

      expect(result.current.error).toBe('Export failed');
      expect(onError).toHaveBeenCalledWith('Export failed');
    });

    it('should call onSuccess callback when export succeeds', async () => {
      const mockResult = {
        success: true,
        filename: 'template-2026-02-20-164512.json',
        size: 1024,
      };

      (exportTemplateUtil as any).mockResolvedValue(mockResult);
      (checkContentSafetyUtil as any).mockResolvedValue({ isSafe: true });

      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useExportTemplate({
          checkSafety: true,
          onSuccess,
        })
      );

      await act(async () => {
        await result.current.exportTemplate(mockTemplate);
      });

      expect(onSuccess).toHaveBeenCalledWith(mockResult);
    });

    it('should update loading state during export', async () => {
      const mockResult = {
        success: true,
        filename: 'template-2026-02-20-164512.json',
        size: 1024,
      };

      (exportTemplateUtil as any).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResult), 100);
          })
      );
      (checkContentSafetyUtil as any).mockResolvedValue({ isSafe: true });

      const { result } = renderHook(() =>
        useExportTemplate({
          checkSafety: true,
        })
      );

      // Start export
      act(() => {
        result.current.exportTemplate(mockTemplate);
      });

      // Should be loading
      expect(result.current.isExporting).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isExporting).toBe(false);
      });

      // Should have result
      expect(result.current.lastResult).toEqual(mockResult);
    });
  });

  describe('checkContentSafety', () => {
    it('should check content safety', async () => {
      const safetyResult = {
        isSafe: true,
      };

      (checkContentSafetyUtil as any).mockResolvedValue(safetyResult);

      const { result } = renderHook(() => useExportTemplate());

      await act(async () => {
        const checkResult = await result.current.checkContentSafety(mockTemplate);
        expect(checkResult).toEqual(safetyResult);
      });

      expect(checkContentSafetyUtil).toHaveBeenCalledWith(mockTemplate);
    });
  });
});
