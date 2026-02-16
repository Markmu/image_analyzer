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
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1,
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: '#475569' }} display="block">
          {feature.name}
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {feature.value}
        </Typography>
      </Box>
      <Chip
        label={`${(feature.confidence * 100).toFixed(0)}%`}
        size="small"
        color={getConfidenceColor(feature.confidence) as any}
        sx={{ ml: 1 }}
      />
    </Box>
  );
}
