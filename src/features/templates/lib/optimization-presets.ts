/**
 * Optimization Presets
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Manage optimization presets and system prompts
 */

import type {
  OptimizationMode,
  OptimizationTarget,
  OptimizationIntensity,
  OptimizationPreset,
  PromptOptimizationOptions,
} from '../types/optimization';
import { OPTIMIZATION_PRESETS } from './optimization-constants';

/**
 * Get optimization preset based on options
 *
 * @param options - Optimization options
 * @param language - Target language ('zh' or 'en')
 * @returns Optimization preset with system prompt for the specified language
 */
export function getOptimizationPreset(
  options: PromptOptimizationOptions,
  language: 'zh' | 'en'
): Omit<OptimizationPreset, 'systemPrompt'> & { systemPrompt: string } {
  // Get base preset for the mode
  const basePreset = OPTIMIZATION_PRESETS[options.mode];

  // Get system prompt for the specified language
  const systemPrompt = typeof basePreset.systemPrompt === 'string'
    ? basePreset.systemPrompt
    : basePreset.systemPrompt[language];

  return {
    ...basePreset,
    systemPrompt,
  };
}

/**
 * Build full optimization prompt incorporating target and intensity
 *
 * @param options - Optimization options
 * @param language - Target language ('zh' or 'en')
 * @returns Complete system prompt for the LLM
 */
export function buildOptimizationSystemPrompt(
  options: PromptOptimizationOptions,
  language: 'zh' | 'en'
): string {
  // Get base preset
  const preset = getOptimizationPreset(options, language);
  let systemPrompt = preset.systemPrompt;

  // Add target-specific instructions
  const targetInstructions = getTargetInstructions(options.target, language);
  const intensityInstructions = getIntensityInstructions(options.intensity, language);

  // Combine instructions
  return `${systemPrompt}\n\n${targetInstructions}\n\n${intensityInstructions}`.trim();
}

/**
 * Get target-specific optimization instructions
 *
 * @param target - Optimization target
 * @param language - Target language
 * @returns Target-specific instructions
 */
function getTargetInstructions(
  target: OptimizationTarget,
  language: 'zh' | 'en'
): string {
  const instructions: Record<OptimizationTarget, Record<'zh' | 'en', string>> = {
    detailed: {
      zh: '优化目标: 增加细节描述,使提示词更丰富和具体。',
      en: 'Optimization Goal: Add descriptive details to make the prompt richer and more specific.',
    },
    concise: {
      zh: '优化目标: 精简表达,去除冗余内容,保持核心信息。',
      en: 'Optimization Goal: Simplify expression, remove redundancy, keep core information.',
    },
    professional: {
      zh: '优化目标: 使用专业术语,提升描述质量,使表达更专业。',
      en: 'Optimization Goal: Use professional terminology, improve description quality for more professional expression.',
    },
    creative: {
      zh: '优化目标: 添加创意元素,增强表现力和艺术性。',
      en: 'Optimization Goal: Add creative elements to enhance expressiveness and artistic quality.',
    },
  };

  return instructions[target][language];
}

/**
 * Get intensity-specific optimization instructions
 *
 * @param intensity - Optimization intensity
 * @param language - Target language
 * @returns Intensity-specific instructions
 */
function getIntensityInstructions(
  intensity: OptimizationIntensity,
  language: 'zh' | 'en'
): string {
  const instructions: Record<OptimizationIntensity, Record<'zh' | 'en', string>> = {
    light: {
      zh: '优化强度: 轻度 - 最小改动,保持原意,仅修正明显错误。',
      en: 'Optimization Intensity: Light - Minimal changes, preserve original meaning, only fix obvious errors.',
    },
    medium: {
      zh: '优化强度: 中度 - 适度优化,平衡改动和原意,提升表达质量。',
      en: 'Optimization Intensity: Medium - Moderate optimization, balance changes and original meaning, improve expression quality.',
    },
    heavy: {
      zh: '优化强度: 重度 - 大幅优化,显著提升质量,可以重构表达方式。',
      en: 'Optimization Intensity: Heavy - Extensive optimization, significantly improve quality, can rephrase expressions.',
    },
  };

  return instructions[intensity][language];
}

/**
 * Get credit cost for optimization mode
 *
 * @param mode - Optimization mode
 * @returns Credit cost
 */
export function getCreditCost(mode: OptimizationMode): number {
  return OPTIMIZATION_PRESETS[mode].creditsCost;
}
