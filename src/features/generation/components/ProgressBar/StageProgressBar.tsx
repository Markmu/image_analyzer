/**
 * StageProgressBar Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Multi-stage progress bar with stage indicators
 */

import React from 'react';
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StageProgressBarProps } from './types';
import { PROGRESS_COLORS, STAGE_ICONS } from '../../lib/progress-constants';
import type { GenerationStage } from '../../types/progress';

const stageIcons = {
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
};

export const StageProgressBar = React.forwardRef<HTMLDivElement, StageProgressBarProps>(
  (
    {
      value,
      stage,
      stageLabel,
      showStageLabel = true,
      showIcon = true,
      showPercentage = true,
      className,
      animationDuration = 300,
    },
    ref
  ) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));

    // Get icon component
    const iconName = STAGE_ICONS[stage as keyof typeof STAGE_ICONS] || 'Loader2';
    const IconComponent = stageIcons[iconName as keyof typeof stageIcons] || Loader2;

    // Get icon color
    const iconColor = PROGRESS_COLORS.icon[stage as keyof typeof PROGRESS_COLORS.icon];

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {/* Progress bar with stage label */}
        <div className="relative">
          {/* Stage label and icon */}
          {(showStageLabel || showIcon) && (
            <div className="mb-2 flex items-center gap-2">
              {showIcon && (
                <IconComponent
                  size={16}
                  className={cn(
                    'flex-shrink-0',
                    stage === 'generating' && 'animate-spin',
                    iconColor
                  )}
                />
              )}
              {showStageLabel && (
                <span className={cn('text-sm font-medium', PROGRESS_COLORS.text)}>
                  {stageLabel}
                </span>
              )}
              {showPercentage && (
                <span className={cn('ml-auto text-sm font-medium', PROGRESS_COLORS.text)}>
                  {Math.round(clampedValue)}%
                </span>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div
            className={cn(
              'relative h-2 w-full overflow-hidden rounded-full',
              PROGRESS_COLORS.barBackground
            )}
            role="progressbar"
            aria-valuenow={clampedValue}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                'h-full rounded-full',
                PROGRESS_COLORS.bar,
                'transition-all duration-300 ease-out'
              )}
              style={{
                width: `${clampedValue}%`,
                transitionDuration: `${animationDuration}ms`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

StageProgressBar.displayName = 'StageProgressBar';
