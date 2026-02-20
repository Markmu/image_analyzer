/**
 * TimeoutDialog Component
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Dialog for handling generation timeout
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
import { Clock, Info } from 'lucide-react';

interface TimeoutDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Retry callback */
  onRetry?: () => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Elapsed time in seconds */
  elapsedSeconds?: number;
  /** Additional CSS classes */
  className?: string;
}

export const TimeoutDialog: React.FC<TimeoutDialogProps> = ({
  open,
  onClose,
  onRetry,
  onCancel,
  elapsedSeconds = 0,
  className,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

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
            bgcolor: 'warning.light',
            p: 1,
          }}
        >
          <Clock sx={{ color: 'warning.main', fontSize: 24 }} />
        </Box>
        生成超时
      </DialogTitle>

      <DialogContent>
        <DialogContentText component="div" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            图片生成时间已超过 <strong>{formatTime(elapsedSeconds)}</strong>,
            这可能是由于:
          </Typography>

          <Box component="ul" sx={{ pl: 2, mb: 2, color: 'text.secondary' }}>
            <li>网络连接不稳定</li>
            <li>服务器负载较高</li>
            <li>请求过于复杂</li>
          </Box>

          <Alert severity="info" icon={<Info />}>
            <Typography variant="body2">
              建议: 尝试使用较低的分辨率或减少同时生成的图片数量
            </Typography>
          </Alert>
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleCancel}>
          取消
        </Button>
        <Button variant="contained" onClick={handleRetry} autoFocus>
          重试
        </Button>
      </DialogActions>
    </Dialog>
  );
};
