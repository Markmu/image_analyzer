/**
 * Optimization Constants
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Constants for optimization modes, targets, and presets
 */

import type {
  OptimizationMode,
  OptimizationTarget,
  OptimizationIntensity,
  OptimizationPreset,
  OptimizationLanguage,
} from '../types/optimization';

/**
 * Optimization mode labels (Chinese)
 */
export const OPTIMIZATION_MODES: Record<
  OptimizationMode,
  { label: string; description: string; credits: number }
> = {
  quick: {
    label: '快速优化',
    description: '轻量级优化,改善语法和流畅度',
    credits: 1,
  },
  deep: {
    label: '深度优化',
    description: '增强描述质量,添加专业术语',
    credits: 2,
  },
};

/**
 * Optimization target labels
 */
export const OPTIMIZATION_TARGETS: Record<
  OptimizationTarget,
  { label: string; description: string }
> = {
  detailed: {
    label: '更详细',
    description: '增加细节描述,使提示词更丰富',
  },
  concise: {
    label: '更简洁',
    description: '精简表达,去除冗余内容',
  },
  professional: {
    label: '更专业',
    description: '使用专业术语,提升描述质量',
  },
  creative: {
    label: '更有创意',
    description: '添加创意元素,增强表现力',
  },
};

/**
 * Optimization intensity labels
 */
export const OPTIMIZATION_INTENSITIES: Record<
  OptimizationIntensity,
  { label: string; description: string }
> = {
  light: {
    label: '轻度',
    description: '最小改动,保持原意',
  },
  medium: {
    label: '中度',
    description: '适度优化,平衡改动和原意',
  },
  heavy: {
    label: '重度',
    description: '大幅优化,显著提升质量',
  },
};

/**
 * Language labels
 */
export const OPTIMIZATION_LANGUAGES: Record<
  OptimizationLanguage,
  { label: string; description: string }
> = {
  auto: {
    label: '自动检测',
    description: '根据输入内容自动识别语言',
  },
  zh: {
    label: '中文',
    description: '输入和输出均为中文',
  },
  en: {
    label: 'English',
    description: 'Input and output in English',
  },
};

/**
 * Optimization presets (system prompts for different modes and targets)
 */
export const OPTIMIZATION_PRESETS: Record<OptimizationMode, OptimizationPreset> = {
  quick: {
    mode: 'quick',
    target: 'professional',
    intensity: 'light',
    systemPrompt: {
      zh: `你是一个专业的提示词优化助手。请改善以下提示词的语法和流畅度,保持原意不变。

要求:
1. 保持原有信息完整
2. 改善语法错误和表达不通顺的地方
3. 优化词汇选择,使表达更准确
4. 保持原有的结构和风格

请只返回优化后的提示词,不要添加任何解释或说明。`,
      en: `You are a professional prompt optimization assistant. Please improve the grammar and flow of the following prompt while keeping the original meaning intact.

Requirements:
1. Keep all original information intact
2. Fix grammatical errors and awkward expressions
3. Optimize word choice for more accurate expression
4. Maintain the original structure and style

Please return only the optimized prompt without any explanation or notes.`,
    },
    creditsCost: 1,
  },
  deep: {
    mode: 'deep',
    target: 'professional',
    intensity: 'medium',
    systemPrompt: {
      zh: `你是一个专业的提示词优化助手。请优化以下提示词,使其更适合生成高质量的图片。

要求:
1. 添加专业的摄影、艺术或设计术语
2. 增强描述质量,使表达更生动具体
3. 优化结构和逻辑,使提示词更清晰
4. 添加缺失的重要细节
5. 保持原有的核心意图和风格

请只返回优化后的提示词,不要添加任何解释或说明。`,
      en: `You are a professional prompt optimization assistant. Please optimize the following prompt to make it more suitable for generating high-quality images.

Requirements:
1. Add professional photography, art, or design terminology
2. Enhance description quality for more vivid and specific expression
3. Optimize structure and logic for clearer prompts
4. Add missing important details
5. Maintain the original core intention and style

Please return only the optimized prompt without any explanation or notes.`,
    },
    creditsCost: 2,
  },
};

/**
 * Default user preferences
 */
export const DEFAULT_OPTIMIZATION_PREFERENCES = {
  lastMode: 'quick' as OptimizationMode,
  lastTarget: 'professional' as OptimizationTarget,
  lastIntensity: 'medium' as OptimizationIntensity,
  lastLanguage: 'auto' as OptimizationLanguage,
};

/**
 * Local storage key for user preferences
 */
export const OPTIMIZATION_PREFERENCES_STORAGE_KEY = 'template-optimization-preferences';

/**
 * User preferences interface
 */
export interface OptimizationPreferences {
  lastMode: OptimizationMode;
  lastTarget: OptimizationTarget;
  lastIntensity: OptimizationIntensity;
  lastLanguage: OptimizationLanguage;
}

/**
 * Load user preferences from localStorage (AC7)
 *
 * @returns User preferences or defaults
 */
export function loadOptimizationPreferences(): OptimizationPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_OPTIMIZATION_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_OPTIMIZATION_PREFERENCES,
        ...parsed,
      };
    }
  } catch (error) {
    console.error('[loadOptimizationPreferences] Failed to load preferences:', error);
  }

  return DEFAULT_OPTIMIZATION_PREFERENCES;
}

/**
 * Save user preferences to localStorage (AC7)
 *
 * @param preferences - Preferences to save
 */
export function saveOptimizationPreferences(preferences: Partial<OptimizationPreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = loadOptimizationPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[saveOptimizationPreferences] Failed to save preferences:', error);
  }
}

/**
 * Save optimization mode preference (helper function)
 *
 * @param mode - Optimization mode to save
 */
export function saveOptimizationMode(mode: OptimizationMode): void {
  saveOptimizationPreferences({ lastMode: mode });
}

/**
 * Save optimization target preference (helper function)
 *
 * @param target - Optimization target to save
 */
export function saveOptimizationTarget(target: OptimizationTarget): void {
  saveOptimizationPreferences({ lastTarget: target });
}

/**
 * Save optimization intensity preference (helper function)
 *
 * @param intensity - Optimization intensity to save
 */
export function saveOptimizationIntensity(intensity: OptimizationIntensity): void {
  saveOptimizationPreferences({ lastIntensity: intensity });
}

/**
 * Save optimization language preference (helper function)
 *
 * @param language - Optimization language to save
 */
export function saveOptimizationLanguage(language: OptimizationLanguage): void {
  saveOptimizationPreferences({ lastLanguage: language });
}
