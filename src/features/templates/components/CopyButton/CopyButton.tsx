'use client';

import { useEffect, useRef } from 'react';
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
  /** Enable keyboard shortcut (Ctrl/Cmd + C) */
  enableKeyboardShortcut?: boolean;
}

/**
 * Copy button with visual feedback and keyboard shortcut support
 *
 * Features:
 * - Copies text to clipboard on click using useCopyToClipboard hook
 * - Shows checkmark icon after successful copy
 * - Displays tooltip feedback
 * - Keyboard shortcut support (Ctrl/Cmd + C) when enabled
 *
 * @example
 * // Basic usage
 * <CopyButton text="Hello world" />
 *
 * @example
 * // With keyboard shortcut enabled
 * <CopyButton text="Hello world" enableKeyboardShortcut />
 */
export function CopyButton({
  text,
  size = 'small',
  variant = 'outlined',
  tooltipText = '复制到剪贴板',
  successDuration = 2000,
  className,
  'data-testid': testId,
  enableKeyboardShortcut = true,
}: CopyButtonProps) {
  const { copy, isSuccess, isCopying } = useCopyToClipboard({ successDuration });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCopy = () => {
    copy(text);
  };

  // Keyboard shortcut support (Ctrl/Cmd + C)
  useEffect(() => {
    if (!enableKeyboardShortcut || !buttonRef.current) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+C or Cmd+C
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        // Only trigger if the button or its container has focus
        const activeElement = document.activeElement;
        const button = buttonRef.current;

        if (button && (activeElement === button || button.contains(activeElement))) {
          event.preventDefault();
          copy(text);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [text, copy, enableKeyboardShortcut]);

  return (
    <Tooltip title={isSuccess ? '已复制!' : tooltipText} arrow>
      <Button
        ref={buttonRef}
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
