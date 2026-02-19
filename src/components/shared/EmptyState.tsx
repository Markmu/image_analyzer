'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  hint?: string;
  testId?: string;
}

export default function EmptyState({ title, description, icon, hint, testId }: EmptyStateProps) {
  return (
    <Box
      className="ia-glass-card ia-glass-card--static ia-glass-card--lg"
      data-testid={testId}
      sx={{
        p: 4,
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        gap: 1.5,
        background: 'var(--glass-bg-dark-light)',
        border: '1px solid var(--glass-border-white-light)',
      }}
    >
      {icon && (
        <Box
          sx={{
            color: 'var(--glass-text-primary)',
            opacity: 0.8,
            mb: 1,
            filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))',
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        variant="h6"
        sx={{
          color: 'var(--glass-text-white-heavy)',
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'var(--glass-text-gray-medium)',
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{
            color: 'var(--glass-text-gray-heavy)',
            mt: 1.5,
            display: 'block',
          }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
}
