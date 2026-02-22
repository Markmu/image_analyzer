/**
 * Prompt Optimization API client
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Browser-safe client utilities for optimization.
 */

import type { TemplateJSONFormat } from '../types/template';
import type {
  PromptOptimizationOptions,
  PromptOptimizationResult,
  OptimizationLanguage,
} from '../types/optimization';
import { getCreditCost } from './optimization-presets';

/**
 * Build full prompt from template fields
 *
 * @param template - Template JSON format
 * @returns Full prompt string
 */
export function buildFullPrompt(template: TemplateJSONFormat): string {
  const parts: string[] = [];

  if (template.subject) parts.push(`主体: ${template.subject}`);
  if (template.style) parts.push(`风格: ${template.style}`);
  if (template.composition) parts.push(`构图: ${template.composition}`);
  if (template.colors) parts.push(`色彩: ${template.colors}`);
  if (template.lighting) parts.push(`光线: ${template.lighting}`);
  if (template.additional) parts.push(`其他: ${template.additional}`);

  return parts.join('\n');
}

/**
 * Optimize prompt via server API
 */
export async function optimizePrompt(
  template: TemplateJSONFormat,
  options: PromptOptimizationOptions
): Promise<PromptOptimizationResult> {
  const response = await fetch('/api/templates/optimize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template, options }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success || !payload?.data) {
    const message = payload?.error?.message || payload?.error || '提示词优化失败';
    throw new Error(message);
  }

  return payload.data as PromptOptimizationResult;
}

/**
 * Validate if user has enough credits for optimization
 *
 * @param userCredits - Current user credits
 * @param mode - Optimization mode
 * @returns True if user has enough credits
 */
export function hasEnoughCredits(userCredits: number, mode: PromptOptimizationOptions['mode']): boolean {
  const required = getCreditCost(mode);
  return userCredits >= required;
}

/**
 * Get optimization mode display name
 *
 * @param mode - Optimization mode
 * @param language - Display language
 * @returns Display name
 */
export function getModeDisplayName(
  mode: PromptOptimizationOptions['mode'],
  language: OptimizationLanguage
): string {
  const names: Record<PromptOptimizationOptions['mode'], Record<'zh' | 'en', string>> = {
    quick: {
      zh: '快速优化',
      en: 'Quick Optimization',
    },
    deep: {
      zh: '深度优化',
      en: 'Deep Optimization',
    },
  };

  const displayLang: 'zh' | 'en' = language === 'auto' ? 'zh' : language;
  return names[mode][displayLang];
}
