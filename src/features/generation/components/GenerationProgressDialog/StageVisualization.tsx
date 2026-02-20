/**
 * StageVisualization Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Visual representation of generation stages queue
 */

import React from 'react';
import { Check, Loader2, Clock } from 'lucide-react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import type { GenerationStage } from '../../types/progress';
import { STAGE_LABELS } from '../../lib/progress-constants';

interface StageVisualizationProps {
  /** Current stage */
  currentStage: GenerationStage;
  /** Progress percentage */
  progress: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generation stages in order
 */
const STAGES: GenerationStage[] = [
  'initializing',
  'parsing',
  'queued',
  'generating',
  'post_processing',
  'saving',
  'completed',
];

/**
 * Get stage status
 */
function getStageStatus(
  stage: GenerationStage,
  currentStage: GenerationStage,
  progress: number
): 'completed' | 'current' | 'pending' {
  const currentIndex = STAGES.indexOf(currentStage);
  const stageIndex = STAGES.indexOf(stage);

  if (stageIndex < currentIndex) return 'completed';
  if (stageIndex === currentIndex) return 'current';
  return 'pending';
}

export const StageVisualization: React.FC<StageVisualizationProps> = ({
  currentStage,
  progress,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {STAGES.slice(0, -1).map((stage, index) => {
        const status = getStageStatus(stage, currentStage, progress);
        const isLast = index === STAGES.length - 2;

        return (
          <React.Fragment key={stage}>
            {/* Stage indicator */}
            <div className="flex items-center gap-1.5">
              {/* Stage icon */}
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full',
                  'text-xs font-medium',
                  'transition-colors duration-300',
                  status === 'completed' &&
                    'bg-green-500 text-white dark:bg-green-600',
                  status === 'current' &&
                    'bg-purple-500 text-white dark:bg-purple-600',
                  status === 'pending' &&
                    'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {status === 'completed' && <Check size={14} />}
                {status === 'current' && <Loader2 size={14} className="animate-spin" />}
                {status === 'pending' && <Clock size={14} />}
              </div>

              {/* Stage label */}
              <span
                className={cn(
                  'text-xs',
                  'transition-colors duration-300',
                  status === 'completed' &&
                    'text-green-700 dark:text-green-300',
                  status === 'current' &&
                    'text-purple-700 dark:text-purple-300 font-medium',
                  status === 'pending' &&
                    'text-gray-500 dark:text-gray-400'
                )}
              >
                {STAGE_LABELS[stage].replace('正在', '').replace('...', '')}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 w-8',
                  'transition-colors duration-300',
                  status === 'completed'
                    ? 'bg-green-500 dark:bg-green-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
