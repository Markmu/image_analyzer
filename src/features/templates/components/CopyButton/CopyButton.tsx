'use client';

import { Button, Tooltip } from '@mui/material';
import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Button variant */
  variant?: 'text' | 'outlined' | 'contained';
  /** Custom tooltip text */
  tooltipText?: string;
  /** Success message duration in ms */
  successDuration?: number;
  /** Additional class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Copy button with visual feedback
 *
 * Features:
 * - Copies text to clipboard on click using useCopyToClipboard hook
 * - Shows checkmark icon after successful copy
 * - Displays tooltip feedback
 *
 * NOTE: Keyboard shortcuts (Ctrl/Cmd + C) are intentionally NOT implemented
 * on this button to avoid conflicts with browser native shortcuts. Users can
 * still use the button's onClick handler for programmatic copying.
 */
export function CopyButton({
  text,
  size = 'small',
  variant = 'outlined',
  tooltipText = '复制到剪贴板',
  successDuration = 2000,
  className,
  'data-testid': testId,
}: CopyButtonProps) {
  const { copy, isSuccess, isCopying } = useCopyToClipboard({ successDuration });

  const handleCopy = () => {
    copy(text);
  };

  return (
    <Tooltip title={isSuccess ? '已复制!' : tooltipText} arrow>
      <Button
        size={size}
        variant={variant}
        onClick={handleCopy}
        disabled={isCopying}
        startIcon={isSuccess ? <Check size={16} /> : <Copy size={16} />}
        className={className}
        data-testid={testId || 'copy-button'}
        sx={{
          minWidth: 'auto',
          '& .MuiButton-startIcon': {
            color: isSuccess ? 'var(--success)' : 'rgb(34, 197, 94)',
          },
        }}
      >
        {isSuccess ? '已复制' : '复制'}
      </Button>
    </Tooltip>
  );
}
