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
      className="ia-glass-card ia-glass-card--static"
      data-testid={testId}
      sx={{
        p: 3,
        minHeight: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        gap: 1,
      }}
    >
      {icon && <Box sx={{ color: 'var(--glass-text-gray-heavy)' }}>{icon}</Box>}
      <Typography variant="h6" sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-medium)', maxWidth: 320 }}>
        {description}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-heavy)', mt: 1 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}
