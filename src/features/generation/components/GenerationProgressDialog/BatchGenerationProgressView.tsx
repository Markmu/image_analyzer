/**
 * BatchGenerationProgressView Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Display progress for batch image generation
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { ProgressBar } from '../ProgressBar';
import { SingleGenerationProgress } from './SingleGenerationProgress';
import type { BatchGenerationProgress } from '../../types/progress';
import { formatTime } from '../../lib/time-estimator';

interface BatchGenerationProgressViewProps {
  /** Batch generation progress data */
  batch: BatchGenerationProgress;
  /** Cancel item callback */
  onCancelItem?: (itemId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export const BatchGenerationProgressView: React.FC<BatchGenerationProgressViewProps> = ({
  batch,
  onCancelItem,
  className,
}) => {
  // Determine grid columns based on item count
  const gridCols = batch.totalItems <= 2 ? 12 : 6;

  // Validate batch data
  if (!batch || !batch.items || batch.items.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">无效的批量生成数据</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header with overall progress */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight="medium">
            批量生成进度
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {batch.completedItems}/{batch.totalItems} 张 ({batch.overallPercentage}%)
          </Typography>
        </Box>

        {/* Overall progress bar */}
        <ProgressBar value={batch.overallPercentage} showPercentage={false} />

        {/* Estimated time */}
        {batch.estimatedTimeRemaining > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Clock size={14} />
            <Typography variant="caption" color="text.secondary">
              预计剩余时间: {formatTime(batch.estimatedTimeRemaining)}
            </Typography>
          </Box>
        )}

        {/* Summary */}
        {batch.failedItems > 0 && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {batch.failedItems} 张生成失败
          </Typography>
        )}
      </Box>

      {/* Individual item progress grid */}
      <Grid container spacing={2}>
        {batch.items.map((item) => (
          <Grid size={{ xs: gridCols }} key={item.id}>
            <SingleGenerationProgress
              progress={item}
              showCancel={item.stage !== 'completed' && item.stage !== 'failed'}
              onCancel={() => onCancelItem?.(item.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
