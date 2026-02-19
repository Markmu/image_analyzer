/**
 * useExportTemplate Hook
 *
 * Epic 5 - Story 5.2: JSON Export
 * Custom hook for exporting templates to JSON files
 */

'use client';

import { useState, useCallback } from 'react';
import type { Template, ExportOptions, ExportResult, ContentSafetyCheckResult } from '../types';
import {
  exportTemplate as exportTemplateUtil,
  checkContentSafety as checkContentSafetyUtil,
} from '../lib/template-exporter';

export interface UseExportTemplateOptions {
  /** Callback when export succeeds */
  onSuccess?: (result: ExportResult) => void;
  /** Callback when export fails */
  onError?: (error: string) => void;
  /** Whether to check content safety before export */
  checkSafety?: boolean;
}

export interface UseExportTemplateReturn {
  /** Export template to JSON file */
  exportTemplate: (template: Template, options?: ExportOptions) => Promise<ExportResult>;
  /** Check content safety */
  checkContentSafety: (template: Template) => Promise<ContentSafetyCheckResult>;
  /** Whether export is in progress */
  isExporting: boolean;
  /** Export error if any */
  error: string | null;
  /** Last export result */
  lastResult: ExportResult | null;
}

/**
 * Hook for exporting templates to JSON files
 *
 * Features:
 * - Export template to JSON file download
 * - Content safety checking (optional)
 * - Loading and error states
 * - Success/error callbacks
 *
 * @example
 * ```tsx
 * const { exportTemplate, isExporting, error } = useExportTemplate({
 *   onSuccess: (result) => console.log('Exported:', result.filename),
 *   onError: (error) => console.error('Export failed:', error),
 *   checkSafety: true,
 * });
 *
 * await exportTemplate(template, { format: true });
 * ```
 */
export function useExportTemplate(options: UseExportTemplateOptions = {}): UseExportTemplateReturn {
  const { onSuccess, onError, checkSafety = true } = options;

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ExportResult | null>(null);

  const exportTemplate = useCallback(
    async (template: Template, exportOptions?: ExportOptions): Promise<ExportResult> => {
      setIsExporting(true);
      setError(null);

      try {
        // Check content safety if enabled
        if (checkSafety) {
          const safetyResult = await checkContentSafetyUtil(template);
          if (!safetyResult.isSafe) {
            const error = safetyResult.warning || 'Template contains unsafe content';
            setError(error);
            onError?.(error);
            return {
              success: false,
              filename: '',
              size: 0,
              error,
            };
          }
        }

        // Export template
        const result = await exportTemplateUtil(template, exportOptions);

        if (result.success) {
          setLastResult(result);
          onSuccess?.(result);
        } else {
          setError(result.error || 'Export failed');
          onError?.(result.error || 'Export failed');
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return {
          success: false,
          filename: '',
          size: 0,
          error: errorMessage,
        };
      } finally {
        setIsExporting(false);
      }
    },
    [checkSafety, onSuccess, onError]
  );

  const checkContentSafety = useCallback(async (template: Template): Promise<ContentSafetyCheckResult> => {
    return checkContentSafetyUtil(template);
  }, []);

  return {
    exportTemplate,
    checkContentSafety,
    isExporting,
    error,
    lastResult,
  };
}
