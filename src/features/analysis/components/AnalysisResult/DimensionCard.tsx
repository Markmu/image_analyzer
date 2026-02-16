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
    <Card
      elevation={1}
      sx={{
        height: '100%',
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent>
        {/* 维度标题 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          <Icon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            {dimension.name}
          </Typography>
        </Box>

        {/* 维度置信度 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#475569' }}>
            置信度
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {(dimension.confidence * 100).toFixed(0)}%
          </Typography>
        </Box>

        {/* 特征标签列表 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {dimension.features.map((feature, index) => (
            <FeatureTag key={index} feature={feature} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
