'use client';

import { Box, Typography, Chip } from '@mui/material';
import type { StyleFeature } from '@/types/analysis';

interface FeatureTagProps {
  feature: StyleFeature;
}

/**
 * 特征标签组件
 * 显示单个风格特征及其置信度
 */
export function FeatureTag({ feature }: FeatureTagProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'var(--success)';
    if (confidence >= 0.6) return 'var(--warning)';
    return 'var(--error)';
  };

  const confidenceColor = getConfidenceColor(feature.confidence);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.25,
        borderRadius: '8px',
        background: 'var(--glass-bg-dark-light)',
        border: '1px solid var(--glass-border-white-light)',
        transition: 'var(--glass-transition)',
        '&:hover': {
          background: 'var(--glass-bg-dark-medium)',
          borderColor: 'var(--glass-border-white-medium)',
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'var(--glass-text-gray-medium)',
            display: 'block',
            fontSize: '0.75rem',
            mb: 0.25,
          }}
        >
          {feature.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'var(--glass-text-white-heavy)',
          }}
        >
          {feature.value}
        </Typography>
      </Box>
      <Box
        sx={{
          ml: 1.5,
          px: 1,
          py: 0.5,
          borderRadius: '6px',
          background: confidenceColor + '20',
          border: '1px solid ' + confidenceColor + '40',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: confidenceColor,
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        >
          {(feature.confidence * 100).toFixed(0)}%
        </Typography>
      </Box>
    </Box>
  );
}
