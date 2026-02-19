/**
 * Prompt Optimization API
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Client-side API for optimizing prompts using text models via Replicate
 */

import type { TemplateJSONFormat } from '../types/template';
import type {
  PromptOptimizationOptions,
  PromptOptimizationResult,
  OptimizationLanguage,
} from '../types/optimization';
import { replicate } from '@/lib/replicate';
import { detectLanguage } from './language-detector';
import { buildOptimizationSystemPrompt, getCreditCost } from './optimization-presets';
import { generateDiff } from './diff-generator';

// TODO: Import content moderation from Story 4.1 when available
// import { checkContentSafety } from '@/lib/content-moderation';

/**
 * Content safety check result
 *
 * TODO: Replace with actual implementation from Story 4.1
 * This is a placeholder for future integration
 */
interface ContentSafetyResult {
  isSafe: boolean;
  reason?: string;
}

/**
 * Check content safety (placeholder)
 *
 * TODO: Integrate with Story 4.1 content moderation logic
 * This function should call the actual content safety check
 * and return detailed results
 *
 * @param content - Content to check
 * @returns Safety check result
 */
async function checkContentSafetyPlaceholder(content: string): Promise<ContentSafetyResult> {
  // Placeholder implementation
  // TODO: Replace with actual content moderation from Story 4.1
  console.warn('[checkContentSafety] Using placeholder implementation - integrate Story 4.1 logic');

  // Basic check for obviously unsafe content
  const unsafePatterns = [
    '暴力',
    '血腥',
    '色情',
    'illegal',
    'violence',
    'gore',
    'pornography',
  ];

  const lowerContent = content.toLowerCase();
  const hasUnsafeContent = unsafePatterns.some((pattern) =>
    lowerContent.includes(pattern.toLowerCase())
  );

  return {
    isSafe: !hasUnsafeContent,
    reason: hasUnsafeContent ? '检测到潜在的不安全内容' : undefined,
  };
}

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
 * Parse optimization result from LLM response
 *
 * @param response - LLM response
 * @returns Parsed optimized prompt
 */
function parseOptimizationResult(response: unknown): string {
  // Handle string response
  if (typeof response === 'string') {
    return response.trim();
  }

  // Handle object response
  if (typeof response === 'object' && response !== null) {
    // Try to extract text from common response formats
    if ('output' in response) {
      return String(response.output).trim();
    }
    if ('text' in response) {
      return String(response.text).trim();
    }
    if ('result' in response) {
      return String(response.result).trim();
    }

    // Fallback to JSON stringification
    return JSON.stringify(response).trim();
  }

  // Fallback
  return String(response).trim();
}

/**
 * Optimize prompt using text model
 *
 * @param template - Template to optimize
 * @param options - Optimization options
 * @returns Optimization result
 */
export async function optimizePrompt(
  template: TemplateJSONFormat,
  options: PromptOptimizationOptions
): Promise<PromptOptimizationResult> {
  // 1. Detect language
  const language: 'zh' | 'en' = options.language === 'auto'
    ? detectLanguage(template)
    : options.language;

  // 2. Build full prompt
  const fullPrompt = buildFullPrompt(template);

  // 3. Build optimization system prompt
  const systemPrompt = buildOptimizationSystemPrompt(options, language);

  // 4. Get credit cost
  const creditsConsumed = getCreditCost(options.mode);

  // 5. Call Replicate API
  // Use a text model for optimization
  // Default to meta-llama-3.1-8b-instruct or similar
  const model = process.env.REPLICATE_TEXT_MODEL_ID || 'meta/meta-llama-3.1-8b-instruct';

  try {
    const response = await replicate.run(model as `${string}/${string}`, {
      input: {
        prompt: `${systemPrompt}\n\n请优化以下提示词:\n\n${fullPrompt}`,
        max_tokens: 1000,
        temperature: 0.7,
      },
    });

    // 6. Parse optimization result
    const optimized = parseOptimizationResult(response);

    // 6.5. Content safety check (AC5)
    // TODO: Integrate with Story 4.1 content moderation
    const safetyCheck = await checkContentSafetyPlaceholder(optimized);
    if (!safetyCheck.isSafe) {
      console.warn('[optimizePrompt] Optimization result failed safety check:', {
        reason: safetyCheck.reason,
        optimized,
      });
      throw new Error(
        `优化结果未通过内容安全检查: ${safetyCheck.reason || '未知原因'}`
      );
    }

    // 7. Generate diff
    const diff = generateDiff(fullPrompt, optimized);

    // 8. Return result
    return {
      original: fullPrompt,
      optimized,
      diff,
      language,
      mode: options.mode,
      creditsConsumed,
    };
  } catch (error) {
    // Log error and rethrow with more context
    console.error('[optimizePrompt] Optimization failed:', {
      error: error instanceof Error ? error.message : String(error),
      template,
      options,
    });

    throw new Error(
      `提示词优化失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
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

  // If language is auto, default to zh for display
  const displayLang: 'zh' | 'en' = language === 'auto' ? 'zh' : language;

  return names[mode][displayLang];
}
