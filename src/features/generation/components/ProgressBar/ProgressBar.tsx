/**
 * ProgressBar Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Single-line progress bar with smooth animations
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { BaseProgressBarProps, ProgressBarVariant } from './types';

interface ProgressBarProps extends BaseProgressBarProps {
  /** Progress bar variant */
  variant?: ProgressBarVariant;
  /** Custom color */
  color?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      showPercentage = true,
      className,
      animationDuration = 300,
      variant = 'default',
      color,
    },
    ref
  ) => {
    // Clamp value between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));

    // Variant styles
    const variantStyles: Record<ProgressBarVariant, string> = {
      default: 'h-2',
      thin: 'h-1',
      thick: 'h-3',
      glass: 'h-2 backdrop-blur-sm',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
          variantStyles[variant],
          className
        )}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Progress fill */}
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-purple-500 to-green-500',
            'transition-all duration-300 ease-out',
            color
          )}
          style={{
            width: `${clampedValue}%`,
            transitionDuration: `${animationDuration}ms`,
          }}
        />

        {/* Percentage overlay */}
        {showPercentage && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
