/**
 * RetryPrompt Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Prompt for retrying failed generation
 */

import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { GenerationError } from '../../types/progress';
import { getErrorDisplayInfo } from '../../lib/retry-handler';

interface RetryPromptProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Retry callback */
  onRetry?: () => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Error information */
  error: GenerationError;
  /** Retry count */
  retryCount?: number;
  /** Max retries */
  maxRetries?: number;
  /** Additional CSS classes */
  className?: string;
}

export const RetryPrompt: React.FC<RetryPromptProps> = ({
  open,
  onClose,
  onRetry,
  onCancel,
  error,
  retryCount = 0,
  maxRetries = 3,
  className,
}) => {
  const errorInfo = getErrorDisplayInfo(error);

  const handleRetry = () => {
    onRetry?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'error.light',
            p: 1,
          }}
        >
          <AlertCircle sx={{ color: 'error.main', fontSize: 24 }} />
        </Box>
        {errorInfo.title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="body2" sx={{ mb: 2 }}>
            {errorInfo.message}
          </Typography>

          {/* Retry status */}
          {error.retryable && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
              <RefreshCw style={{ fontSize: 16 }} />
              <Typography variant="body2">
                重试次数: {retryCount}/{maxRetries}
              </Typography>
            </Box>
          )}

          {/* Suggestions */}
          {errorInfo.suggestions.length > 0 && (
            <Box>
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                建议:
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                {errorInfo.suggestions.map((suggestion, index) => (
                  <Box component="li" key={index}>
                    <Typography variant="body2">{suggestion}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleCancel}>
          取消
        </Button>

        {errorInfo.canRetry && (
          <Button variant="contained" onClick={handleRetry} autoFocus>
            重试
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
