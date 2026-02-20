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
  AlertTitle,
} from '@mui/material';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { GenerationError } from '../../types/progress';
import { getErrorDisplayInfo } from '../../lib/retry-handler';

interface RetryPromptProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onOpenChange: (open: boolean) => void;
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
  onOpenChange,
  onRetry,
  onCancel,
  error,
  retryCount = 0,
  maxRetries = 3,
  className,
}) => {
  const errorInfo = getErrorDisplayInfo(error);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('rounded-full bg-red-100 p-2', 'dark:bg-red-900/30')}>
              <AlertCircle className={cn('text-red-600', 'dark:text-red-400')} size={24} />
            </div>
            <DialogTitle>{errorInfo.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DialogDescription className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {errorInfo.message}
            </p>

            {/* Retry status */}
            {error.retryable && (
              <div className={cn('flex items-center gap-2 text-sm', 'text-gray-600 dark:text-gray-400')}>
                <RefreshCw size={16} />
                <span>
                  重试次数: {retryCount}/{maxRetries}
                </span>
              </div>
            )}

            {/* Suggestions */}
            {errorInfo.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  建议:
                </p>
                <ul className={cn('ml-4 list-disc space-y-1', 'text-xs text-gray-600 dark:text-gray-400')}>
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
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

          {errorInfo.canRetry && (
            <Button
              onClick={() => {
                onRetry?.();
                onOpenChange(false);
              }}
            >
              重试
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
