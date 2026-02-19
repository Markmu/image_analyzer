'use client';

import { useMemo } from 'react';
import type { AnalysisData } from '@/types/analysis';
import type { Template, TemplateGenerationOptions } from '../types';
import { generateTemplate } from '../lib';

interface UseTemplateGenerationOptions extends TemplateGenerationOptions {
  /** Analysis result ID */
  analysisResultId: string;
  /** User ID */
  userId: string;
}

interface UseTemplateGenerationReturn {
  /** Generated template */
  template: Template | null;
  /** Whether template generation is in progress */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Regenerate template with new options */
  regenerate: (options?: Partial<TemplateGenerationOptions>) => void;
}

/**
 * Hook for generating templates from analysis results
 *
 * @example
 * ```tsx
 * const { template, isLoading } = useTemplateGeneration({
 *   analysisResultId: '123',
 *   userId: 'user-1',
 *   analysisData,
 * });
 * ```
 */
export function useTemplateGeneration(
  analysisData: AnalysisData | null,
  options: UseTemplateGenerationOptions
): UseTemplateGenerationReturn {
  const { analysisResultId, userId, ...generationOptions } = options;

  const template = useMemo(() => {
    if (!analysisData) {
      return null;
    }

    try {
      return generateTemplate(analysisResultId, userId, analysisData, generationOptions);
    } catch (error) {
      console.error('Failed to generate template:', error);
      return null;
    }
  }, [analysisData, analysisResultId, userId, generationOptions]);

  const regenerate = useMemo(() => {
    return (_options?: Partial<TemplateGenerationOptions>) => {
      // This is a no-op in the current implementation
      // In a real scenario, you might trigger a re-fetch or re-computation
      console.warn('Regenerate not implemented in this version');
    };
  }, []);

  return {
    template: template || null,
    isLoading: false,
    error: null,
    regenerate,
  };
}
