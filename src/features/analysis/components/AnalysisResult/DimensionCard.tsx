'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { dimensionIcons } from '../../constants/dimension-icons';
import type { StyleDimension } from '@/types/analysis';
import { FeatureTag } from './FeatureTag';

interface DimensionCardProps {
  dimensionType: string;
  dimension: StyleDimension;
}

/**
 * 单个维度卡片
 * 显示风格维度（光影、构图、色彩、艺术风格）
 */
export function DimensionCard({ dimensionType, dimension }: DimensionCardProps) {
  const Icon = dimensionIcons[dimensionType as keyof typeof dimensionIcons] || dimensionIcons.lighting;

  return (
    <Box
      className="ia-glass-card ia-glass-card--static"
      sx={{
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 维度标题 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'var(--glass-bg-blue-medium)',
              border: '1px solid var(--glass-border-white-medium)',
              flexShrink: 0,
            }}
          >
            <Icon size={20} color="#3B82F6" aria-hidden="true" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--glass-text-white-heavy)' }}>
            {dimension.name}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.25,
            py: 0.5,
            borderRadius: '999px',
            border: '1px solid var(--glass-border-white-light)',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'var(--glass-text-gray-medium)',
              lineHeight: 1,
            }}
          >
            置信度
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'var(--glass-text-primary)',
              fontSize: '0.85rem',
              lineHeight: 1,
            }}
          >
            {(dimension.confidence * 100).toFixed(0)}%
          </Typography>
        </Box>
      </Box>

      {/* 特征标签列表 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {dimension.features.map((feature, index) => (
          <FeatureTag key={index} feature={feature} />
        ))}
      </Box>
    </Box>
  );
}
