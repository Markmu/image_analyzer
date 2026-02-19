'use client';

import { useState, useCallback } from 'react';
import { Button, Tooltip, Snackbar, Alert } from '@mui/material';
import { Download, Check } from 'lucide-react';
import type { Template } from '../../types';
import { useExportTemplate } from '../../hooks/useExportTemplate';

interface ExportButtonProps {
  /** Template to export */
  template: Template;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Button variant */
  variant?: 'text' | 'outlined' | 'contained';
  /** Custom tooltip text */
  tooltipText?: string;
  /** Export success message duration in ms */
  successDuration?: number;
  /** Additional class name */
  className?: string;
  /** Whether to check content safety before export */
  checkSafety?: boolean;
  /** On export success callback */
  onSuccess?: (filename: string) => void;
  /** On export error callback */
  onError?: (error: string) => void;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Export button with visual feedback
 *
 * Features:
 * - Exports template to JSON file on click
 * - Shows checkmark icon after successful export
 * - Displays tooltip feedback
 * - Toast notification for export success/error
 * - Glassmorphism styling (when className is provided)
 * - Content safety checking (optional)
 *
 * @example
 * ```tsx
 * <ExportButton
 *   template={template}
 *   tooltipText="导出为 JSON"
 *   onSuccess={(filename) => console.log('Exported:', filename)}
 *   className="ia-glass-card"
 * />
 * ```
 */
export function ExportButton({
  template,
  size = 'small',
  variant = 'outlined',
  tooltipText = '导出为 JSON',
  checkSafety = true,
  onSuccess,
  onError,
  className,
  successDuration = 3000,
  'data-testid': testId,
}: ExportButtonProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const { exportTemplate, isExporting, lastResult } = useExportTemplate({
    checkSafety,
    onSuccess: (result) => {
      if (result.success) {
        // Show toast notification
        setToastMessage(`导出成功: ${result.filename}`);
        setToastSeverity('success');
        setToastOpen(true);
        onSuccess?.(result.filename);
      }
    },
    onError: (error) => {
      // Show error toast
      setToastMessage(`导出失败: ${error}`);
      setToastSeverity('error');
      setToastOpen(true);
      onError?.(error);
    },
  });

  const handleExport = async () => {
    await exportTemplate(template);
  };

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);

  const isSuccess = lastResult?.success === true;

  return (
    <>
      <Tooltip title={isSuccess ? `已导出: ${lastResult.filename}` : tooltipText} arrow>
        <Button
          size={size}
          variant={variant}
          onClick={handleExport}
          disabled={isExporting}
          startIcon={isSuccess ? <Check size={16} /> : <Download size={16} />}
          className={className || 'ia-glass-card'}
          data-testid={testId || 'export-button'}
          sx={{
            minWidth: 'auto',
            '& .MuiButton-startIcon': {
              color: isSuccess ? 'var(--success)' : 'rgb(34, 197, 94)',
            },
            ...(className
              ? {}
              : {
                  // Apply glassmorphism styles when className is not provided
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }),
          }}
        >
          {isSuccess ? '已导出' : '导出'}
        </Button>
      </Tooltip>

      <Snackbar
        open={toastOpen}
        autoHideDuration={successDuration}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toastSeverity}
          variant="filled"
          sx={{
            minWidth: '300px',
            '&.MuiAlert-filledSuccess': {
              backgroundColor: 'var(--success, #22c55e)',
            },
            '&.MuiAlert-filledError': {
              backgroundColor: 'var(--error, #ef4444)',
            },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
