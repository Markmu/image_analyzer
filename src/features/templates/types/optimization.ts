/**
 * Optimization Types
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Type definitions for AI-powered prompt optimization
 */

import type { TemplateJSONFormat } from './template';

/**
 * Optimization mode
 * - quick: Lightweight optimization, improve grammar and flow (1 credit)
 * - deep: Enhanced optimization, add professional terms (2 credits)
 */
export type OptimizationMode = 'quick' | 'deep';

/**
 * Optimization target
 */
export type OptimizationTarget = 'detailed' | 'concise' | 'professional' | 'creative';

/**
 * Optimization intensity
 */
export type OptimizationIntensity = 'light' | 'medium' | 'heavy';

/**
 * Language support
 * - auto: Auto-detect language
 * - zh: Chinese
 * - en: English
 */
export type OptimizationLanguage = 'zh' | 'en' | 'auto';

/**
 * Prompt optimization options
 */
export interface PromptOptimizationOptions {
  /** Optimization mode (quick or deep) */
  mode: OptimizationMode;
  /** Optimization target */
  target: OptimizationTarget;
  /** Optimization intensity */
  intensity: OptimizationIntensity;
  /** Language (auto-detect or manual) */
  language: OptimizationLanguage;
}

/**
 * Diff item type
 */
export type DiffItemType = 'added' | 'removed' | 'unchanged';

/**
 * Diff item for highlighting changes
 */
export interface DiffItem {
  /** Type of change */
  type: DiffItemType;
  /** Text content */
  text: string;
}

/**
 * Prompt optimization result
 */
export interface PromptOptimizationResult {
  /** Original prompt */
  original: string;
  /** Optimized prompt */
  optimized: string;
  /** Diff highlighting data */
  diff: DiffItem[];
  /** Detected language */
  language: 'zh' | 'en';
  /** Mode used */
  mode: OptimizationMode;
  /** Credits consumed */
  creditsConsumed: number;
}

/**
 * Optimization preset configuration
 */
export interface OptimizationPreset {
  /** Optimization mode */
  mode: OptimizationMode;
  /** Optimization target */
  target: OptimizationTarget;
  /** Optimization intensity */
  intensity: OptimizationIntensity;
  /** System prompt to send to LLM (supports multiple languages) */
  systemPrompt: Record<'zh' | 'en', string>;
  /** Credit cost */
  creditsCost: number;
}

/**
 * Optimization state for UI
 */
export interface OptimizationState {
  /** Whether optimization is in progress */
  isOptimizing: boolean;
  /** Current optimization result */
  result: PromptOptimizationResult | null;
  /** Error message if optimization failed */
  error: string | null;
}

/**
 * User optimization preferences (saved to localStorage)
 */
export interface UserOptimizationPreferences {
  /** Last used mode */
  lastMode: OptimizationMode;
  /** Last used target */
  lastTarget: OptimizationTarget;
  /** Last used intensity */
  lastIntensity: OptimizationIntensity;
  /** Last used language */
  lastLanguage: OptimizationLanguage;
}
