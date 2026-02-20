/**
 * ProgressBar Types
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Type definitions for progress bar components
 */

import type { GenerationStage } from '../../types/progress';

/**
 * Base progress bar props
 */
export interface BaseProgressBarProps {
  /** Progress percentage (0-100) */
  value: number;
  /** Whether to show percentage text */
  showPercentage?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Animation duration in ms */
  animationDuration?: number;
}

/**
 * Stage progress bar props
 */
export interface StageProgressBarProps extends BaseProgressBarProps {
  /** Current stage */
  stage: GenerationStage;
  /** Stage label */
  stageLabel?: string;
  /** Whether to show stage label */
  showStageLabel?: boolean;
  /** Whether to show icon */
  showIcon?: boolean;
}

/**
 * Progress bar variant
 */
export type ProgressBarVariant = 'default' | 'thin' | 'thick' | 'glass';

/**
 * Progress bar color theme
 */
export type ProgressBarColor = 'purple' | 'green' | 'blue' | 'red' | 'gradient';
