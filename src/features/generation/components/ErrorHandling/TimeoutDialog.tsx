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
  AlertTitle,
} from '@mui/material';
import { Clock, AlertCircle } from 'lucide-react';

interface TimeoutDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onOpenChange: (open: boolean) => void;
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
  onOpenChange,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('rounded-full bg-yellow-100 p-2', 'dark:bg-yellow-900/30')}>
              <Clock className={cn('text-yellow-600', 'dark:text-yellow-400')} size={24} />
            </div>
            <DialogTitle>生成超时</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DialogDescription className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              图片生成时间已超过 <span className="font-semibold">{formatTime(elapsedSeconds)}</span>,
              这可能是由于:
            </p>

            <ul className={cn('ml-4 list-disc space-y-1', 'text-sm text-gray-600 dark:text-gray-400')}>
              <li>网络连接不稳定</li>
              <li>服务器负载较高</li>
              <li>请求过于复杂</li>
            </ul>

            <div className={cn('mt-4 rounded-md bg-blue-50 p-3', 'dark:bg-blue-900/20')}>
              <div className="flex items-start gap-2">
                <AlertCircle className={cn('mt-0.5 flex-shrink-0', 'text-blue-600 dark:text-blue-400')} size={16} />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  建议: 尝试使用较低的分辨率或减少同时生成的图片数量
                </p>
              </div>
            </div>
          </DialogDescription>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            取消
          </Button>
          <Button
            onClick={() => {
              onRetry?.();
              onOpenChange(false);
            }}
          >
            重试
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
