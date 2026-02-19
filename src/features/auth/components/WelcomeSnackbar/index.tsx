'use client';

/**
 * Welcome Snackbar Component
 *
 * Epic 1 - Story 1.2: 用户注册与 Credit 奖励
 *
 * Displays welcome message for new users after receiving free credits.
 * Features:
 * - Green background (Green 500: #3B82F6)
 * - White text
 * - Checkmark icon
 * - Auto-hide after 5 seconds
 * - Positioned at bottom center
 * - Smooth fade-in animation
 */

import { Snackbar, Alert } from '@mui/material';
import { useState, useEffect } from 'react';

export interface WelcomeSnackbarProps {
  open: boolean;
  message?: string;
  autoHideDuration?: number;
  onClose?: () => void;
}

export function WelcomeSnackbar({
  open,
  message = '欢迎！您已获得 30 次 free credit',
  autoHideDuration = 5000,
  onClose,
}: WelcomeSnackbarProps) {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <Snackbar
      data-testid="welcome-snackbar"
      open={isOpen}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        '& .MuiSnackbar-root': {
          bottom: '24px',
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity="success"
        iconMapping={{
          success: <span data-testid="checkmark-icon" aria-hidden="true">✓</span>,
        }}
        sx={{
          backgroundColor: '#3B82F6', // Green 500
          color: 'var(--glass-text-white-heavy)', // White text
          fontWeight: 500,
          '& .MuiAlert-icon': {
            color: 'var(--glass-text-white-heavy)',
          },
          '& .MuiAlert-action': {
            color: 'var(--glass-text-white-heavy)',
          },
          // Smooth fade-in animation
          animation: 'fadeIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
