/**
 * Optimization Preview Dialog Component
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Dialog component for previewing optimization results with before/after comparison
 */

'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { X, Check } from 'lucide-react';
import type { PromptOptimizationResult } from '../../types';

export interface OptimizationPreviewDialogProps {
  /** Open state of the dialog */
  open: boolean;
  /** Optimization result to display */
  result: PromptOptimizationResult | null;
  /** Callback when user accepts optimization */
  onAccept: () => void;
  /** Callback when user rejects optimization */
  onReject: () => void;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Whether the operation is in progress */
  loading?: boolean;
}

/**
 * OptimizationPreviewDialog component
 *
 * Features:
 * - Side-by-side comparison view
 * - Diff highlighting with green background for additions
 * - Accept/Reject buttons
 * - Glassmorphism styling
 */
export function OptimizationPreviewDialog({
  open,
  result,
  onAccept,
  onReject,
  onClose,
  loading = false,
}: OptimizationPreviewDialogProps) {
  const handleAccept = () => {
    if (!loading) {
      onAccept();
      onClose();
    }
  };

  const handleReject = () => {
    if (!loading) {
      onReject();
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onReject();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: 'ia-glass-card ia-glass-card--static',
        sx: {
          backgroundColor: 'var(--glass-bg-dark)',
          backgroundImage: 'none',
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          color: 'var(--glass-text-white-heavy)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          优化结果预览
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{ color: 'var(--glass-text-gray-medium)' }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ pb: 2 }}>
        {result && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            {/* Original Prompt */}
            <Paper
              className="ia-glass-card ia-glass-card--static"
              sx={{
                p: 2,
                backgroundColor: 'var(--glass-bg-dark-medium)',
                backgroundImage: 'none',
                borderRadius: 1,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: 'var(--glass-text-gray-medium)',
                }}
              >
                原始提示词
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--glass-text-white-medium)',
                  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                {result.original}
              </Typography>
            </Paper>

            {/* Optimized Prompt */}
            <Paper
              className="ia-glass-card ia-glass-card--static"
              sx={{
                p: 2,
                backgroundColor: 'var(--glass-bg-dark-medium)',
                backgroundImage: 'none',
                borderRadius: 1,
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: 'var(--glass-text-primary)',
                }}
              >
                优化后提示词
              </Typography>
              <Box
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--glass-text-white-medium)',
                  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                {result.diff.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor:
                        part.type === 'added'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : part.type === 'removed'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'transparent',
                      padding:
                        part.type !== 'unchanged' ? '2px 4px' : '0',
                      borderRadius: '2px',
                    }}
                  >
                    {part.text}
                  </span>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Optimization Info */}
        {result && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              className: 'ia-glass-card ia-glass-card--static',
              backgroundColor: 'var(--glass-bg-dark-medium)',
              backgroundImage: 'none',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-medium)' }}>
              语言: {result.language === 'zh' ? '中文' : 'English'} | 模式:{' '}
              {result.mode === 'quick' ? '快速优化' : '深度优化'} | 消耗 Credits:{' '}
              {result.creditsConsumed}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={handleReject}
          disabled={loading}
          variant="outlined"
          sx={{
            borderColor: 'var(--glass-border-default)',
            color: 'var(--glass-text-gray-medium)',
            '&:hover': {
              borderColor: 'var(--glass-border-active)',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
            },
          }}
        >
          保持原样
        </Button>
        <Button
          onClick={handleAccept}
          disabled={loading}
          variant="contained"
          startIcon={<Check size={16} />}
          sx={{
            bgcolor: 'var(--glass-text-primary)',
            color: 'var(--glass-text-white-heavy)',
            '&:hover': { bgcolor: 'var(--primary-active)' },
            '&:disabled': {
              bgcolor: 'rgba(34, 197, 94, 0.3)',
              color: 'var(--glass-text-gray-light)',
            },
          }}
        >
          接受优化
        </Button>
      </DialogActions>
    </Dialog>
  );
}
