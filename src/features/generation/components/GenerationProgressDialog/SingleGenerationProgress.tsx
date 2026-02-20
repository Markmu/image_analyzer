/**
 * SingleGenerationProgress Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Display progress for a single image generation
 */

import React from 'react';
import { Clock, X } from 'lucide-react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { StageProgressBar } from '../ProgressBar';
import type { GenerationProgress } from '../../types/progress';
import { STAGE_LABELS } from '../../lib/progress-constants';
import { formatTime } from '../../lib/time-estimator';

interface SingleGenerationProgressProps {
  /** Generation progress data */
  progress: GenerationProgress;
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Cancel callback */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const SingleGenerationProgress: React.FC<SingleGenerationProgressProps> = ({
  progress,
  showCancel = true,
  onCancel,
  className,
}) => {
  // Validate progress data
  if (!progress || typeof progress.progress !== 'number') {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">无效的生成进度数据</Typography>
      </Paper>
    );
  }

  const stageLabel = STAGE_LABELS[progress.stage];

  return (
    <Paper sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {progress.templateName && (
            <Typography variant="body2" fontWeight="medium">
              {progress.templateName}
            </Typography>
          )}
          {progress.currentPosition !== undefined && (
            <Typography variant="caption" color="text.secondary">
              队列位置: {progress.currentPosition}
            </Typography>
          )}
        </Box>

        {showCancel && progress.stage !== 'completed' && progress.stage !== 'failed' && (
          <IconButton
            onClick={onCancel}
            aria-label="取消生成"
            size="small"
          >
            <X size={16} />
          </IconButton>
        )}
      </Box>

      {/* Progress bar */}
      <StageProgressBar
        value={progress.progress}
        stage={progress.stage}
        stageLabel={stageLabel}
        showStageLabel={true}
        showIcon={true}
        showPercentage={true}
      />

      {/* Estimated time */}
      {(progress.stage !== 'completed' &&
        progress.stage !== 'failed' &&
        progress.estimatedTimeRemaining > 0) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Clock size={14} />
          <Typography variant="caption" color="text.secondary">
            预计剩余时间: {formatTime(progress.estimatedTimeRemaining)}
          </Typography>
        </Box>
      )}

      {/* Error message */}
      {progress.stage === 'failed' && progress.error && (
        <Box sx={{ bgcolor: 'error.light', p: 2, mt: 2, borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="medium" color="error.dark">
            {progress.error.message}
          </Typography>
          {progress.error.suggestions && progress.error.suggestions.length > 0 && (
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              {progress.error.suggestions.map((suggestion, index) => (
                <Typography component="li" variant="caption" key={index} color="error.dark">
                  {suggestion}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Timeout message */}
      {progress.stage === 'timeout' && (
        <Box sx={{ bgcolor: 'warning.light', p: 2, mt: 2, borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="medium" color="warning.dark">
            生成超时 (超过{Math.floor((Date.now() - progress.createdAt.getTime()) / 1000)}秒)
          </Typography>
          <Typography variant="caption" color="warning.dark" sx={{ mt: 1, display: 'block' }}>
            这可能是由于网络问题或服务器负载较高。您可以稍后重试。
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
