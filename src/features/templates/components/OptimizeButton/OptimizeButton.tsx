/**
 * Optimize Button Component
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Button component for triggering AI-powered prompt optimization
 */

'use client';

import { Button, ButtonProps } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface OptimizeButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Whether the button is disabled (no content to optimize) */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * OptimizeButton component with loading state
 */
export function OptimizeButton({
  loading = false,
  disabled = false,
  onClick,
  ...buttonProps
}: OptimizeButtonProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      setIsSpinning(true);
      onClick();
      // Reset spinning after animation
      setTimeout(() => setIsSpinning(false), 1000);
    }
  };

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={
        <Sparkles
          size={16}
          className={loading || isSpinning ? 'animate-spin' : ''}
        />
      }
      disabled={disabled || loading}
      onClick={handleClick}
      {...buttonProps}
    >
      {loading ? '优化中...' : 'AI 优化'}
    </Button>
  );
}
