'use client';

import { Box, Paper, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import type { AnalysisData } from '@/types/analysis';
import { DimensionCard } from './DimensionCard';

interface AnalysisCardProps {
  analysisData: AnalysisData;
}

/**
 * 主分析结果卡片
 * 显示整体置信度、AI 标注和四维度分析
 */
export function AnalysisCard({ analysisData }: AnalysisCardProps) {
  const { overallConfidence, dimensions } = analysisData;

  // 确定置信度等级
  const getConfidenceLevel = () => {
    if (overallConfidence >= 0.8) return { label: '高置信度', color: '#4caf50' };
    if (overallConfidence >= 0.6) return { label: '中等置信度', color: '#ff9800' };
    return { label: '低置信度', color: '#f44336' };
  };

  // 转换 key 为 testid 格式（驼峰转短横线）
  const getTestId = (key: string) => {
    return `dimension-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  };

  const confidenceLevel = getConfidenceLevel();

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            风格分析结果
          </Typography>
        </Box>

        {/* AI 透明度标注 */}
        <Box
          data-testid="ai-result-badge"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            AI 分析结果
          </Typography>
        </Box>
      </Box>

      {/* 整体置信度 */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 1,
          bgcolor: confidenceLevel.color + '20',
          borderLeft: 4,
          borderColor: confidenceLevel.color,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          整体置信度
        </Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ color: confidenceLevel.color }}>
          {(overallConfidence * 100).toFixed(0)}%
        </Typography>
        <Typography variant="body2" sx={{ color: confidenceLevel.color, mt: 0.5 }}>
          {confidenceLevel.label}
        </Typography>
      </Box>

      {/* 四维度分析 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {Object.entries(dimensions).map(([key, dimension]) => (
          <Box key={key} data-testid={getTestId(key)}>
            <DimensionCard
              dimensionType={key}
              dimension={dimension}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
