/**
 * GenerationProgressDialog Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Main dialog for displaying generation progress
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { X } from 'lucide-react';
import { SingleGenerationProgress } from './SingleGenerationProgress';
import { BatchGenerationProgressView } from './BatchGenerationProgressView';
import { StageVisualization } from './StageVisualization';
import type { GenerationProgress, BatchGenerationProgress } from '../../types/progress';
import { useGenerationProgressStore } from '../../stores/generation-progress.store';
import { isTimeout } from '../../lib/progress-tracker';

interface GenerationProgressDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onOpenChange: (open: boolean) => void;
  /** Single generation progress (if single mode) */
  singleProgress?: GenerationProgress;
  /** Batch generation progress (if batch mode) */
  batchProgress?: BatchGenerationProgress;
  /** Cancel callback */
  onCancel?: () => void;
  /** View results callback (when completed) */
  onViewResults?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const GenerationProgressDialog: React.FC<GenerationProgressDialogProps> = ({
  open,
  onOpenChange,
  singleProgress,
  batchProgress,
  onCancel,
  onViewResults,
  className,
}) => {
  const [allowClose, setAllowClose] = useState(false);
  const [showContinueHint, setShowContinueHint] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if showing single or batch progress
  const isBatch = !!batchProgress;
  const progress = isBatch ? batchProgress : singleProgress;

  // Validate progress data
  useEffect(() => {
    if (progress) {
      try {
        if (isBatch && batchProgress) {
          if (!batchProgress.items || batchProgress.items.length === 0) {
            setError('批量生成数据无效');
          } else {
            setError(null);
          }
        } else if (singleProgress) {
          if (typeof singleProgress.progress !== 'number') {
            setError('生成进度数据无效');
          } else {
            setError(null);
          }
        }
      } catch (err) {
        setError('加载进度数据时出错');
        console.error('Progress validation error:', err);
      }
    }
  }, [progress, isBatch, batchProgress, singleProgress]);

  // Determine overall completion status
  const isCompleted = isBatch
    ? batchProgress?.overallPercentage === 100
    : singleProgress?.stage === 'completed';

  const isFailed = isBatch
    ? batchProgress?.failedItems === batchProgress?.totalItems
    : singleProgress?.stage === 'failed' || singleProgress?.stage === 'timeout';

  // If there's an error, show error state
  if (error) {
    return (
      <Dialog open={open} onClose={onOpenChange}>
        <DialogContent sx={{ maxWidth: 'md' }}>
          <DialogTitle>错误</DialogTitle>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Show "continue in background" hint after 3 seconds
  useEffect(() => {
    if (open && !isCompleted && !isFailed) {
      const timer = setTimeout(() => {
        setAllowClose(true);
        setShowContinueHint(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, isCompleted, isFailed]);

  // Handle close
  const handleClose = () => {
    if (isCompleted || isFailed || allowClose) {
      onOpenChange(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  if (!progress) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={isBatch ? 'lg' : 'md'} fullWidth>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <DialogTitle sx={{ p: 0 }}>
            {isBatch ? '批量生成进度' : '生成进度'}
          </DialogTitle>

          {/* Close button */}
          <IconButton
            onClick={handleClose}
            disabled={!isCompleted && !isFailed && !allowClose}
            aria-label="关闭"
          >
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Stage visualization for single progress */}
          {!isBatch && singleProgress && (
            <StageVisualization
              currentStage={singleProgress.stage}
              progress={singleProgress.progress}
            />
          )}

          {/* Progress display */}
          {isBatch ? (
            <BatchGenerationProgressView
              batch={batchProgress!}
              onCancelItem={(itemId) => {
                // Handle item cancellation
                console.log('Cancel item:', itemId);
              }}
            />
          ) : (
            <SingleGenerationProgress
              progress={singleProgress!}
              showCancel={false} // Cancel handled at dialog level
            />
          )}

          {/* Background generation hint */}
          {showContinueHint && !isCompleted && !isFailed && (
            <Typography variant="body2" align="center" color="text.secondary">
              您可以关闭此对话框,生成将在后台继续进行
            </Typography>
          )}

          {/* Action buttons */}
          <DialogActions>
            {/* Cancel button */}
            {!isCompleted && !isFailed && (
              <Button
                onClick={handleCancel}
                color="error"
              >
                取消生成
              </Button>
            )}

            {/* View results button */}
            {isCompleted && onViewResults && (
              <Button onClick={onViewResults} variant="contained">
                查看结果
              </Button>
            )}
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
