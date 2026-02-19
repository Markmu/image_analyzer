'use client';

import { useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, Collapse } from '@mui/material';
import { Brain, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisData } from '@/types/analysis';
import { DimensionCard } from './DimensionCard';
import { AITransparencyBadge } from '@/components/shared/AITransparency';

interface AnalysisCardProps {
  analysisData: AnalysisData;
}

/**
 * 主分析结果卡片
 * 显示整体置信度、AI 标注和四维度分析
 */
export function AnalysisCard({ analysisData }: AnalysisCardProps) {
  const { overallConfidence, dimensions } = analysisData;
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // 确定置信度等级
  const getConfidenceLevel = () => {
    if (overallConfidence >= 0.8) return { label: '高置信度', color: 'var(--success)' };
    if (overallConfidence >= 0.6) return { label: '中等置信度', color: 'var(--warning)' };
    return { label: '低置信度', color: 'var(--error)' };
  };

  // 转换 key 为 testid 格式（驼峰转短横线）
  const getTestId = (key: string) => {
    return `dimension-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
  };

  const confidenceLevel = getConfidenceLevel();
  const summaryText = useMemo(() => {
    const lines = [
      `整体置信度: ${(overallConfidence * 100).toFixed(0)}% (${confidenceLevel.label})`,
      ...Object.values(dimensions).map(
        (dimension) => `${dimension.name}: ${dimension.features.map((feature) => feature.value).join(' / ')}`
      ),
    ];
    return lines.join('\n');
  }, [confidenceLevel.label, dimensions, overallConfidence]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Paper
      elevation={0}
      className="ia-glass-card ia-glass-card--static ia-glass-card--lg"
      sx={{
        p: 3,
        backgroundColor: 'var(--glass-bg-dark)',
        backgroundImage: 'none',
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
          pb: 2.5,
          borderBottom: '1px solid var(--glass-border-white-light)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: '10px',
              background: 'var(--glass-bg-blue-medium)',
              border: '1px solid var(--glass-border-white-medium)',
            }}
          >
            <Brain size={22} color="#3B82F6" aria-hidden="true" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--glass-text-white-heavy)' }}>
            风格分析结果
          </Typography>
        </Box>

        <Box data-testid="ai-result-badge">
          <AITransparencyBadge size="small" />
        </Box>
      </Box>

      {/* 整体置信度 */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 'var(--glass-radius)',
          background: confidenceLevel.color === 'var(--success)'
            ? 'var(--glass-bg-blue-medium)'
            : confidenceLevel.color === 'var(--warning)'
              ? 'var(--glass-bg-highlight)'
              : 'var(--error-bg)',
          border: '1px solid ' + confidenceLevel.color + '40',
          boxShadow: confidenceLevel.color === 'var(--success)'
            ? 'var(--glass-shadow-blue)'
            : 'var(--glass-shadow)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'var(--glass-text-gray-medium)',
            mb: 1,
          }}
        >
          整体置信度
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: confidenceLevel.color,
              fontSize: '2.5rem',
              lineHeight: 1,
            }}
          >
            {(overallConfidence * 100).toFixed(0)}%
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: confidenceLevel.color,
              fontWeight: 600,
            }}
          >
            {confidenceLevel.label}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={handleCopy}
          startIcon={copied ? <Check size={18} /> : <Copy size={18} />}
          data-testid="copy-analysis-summary"
          sx={{
            bgcolor: 'var(--glass-text-primary)',
            color: 'var(--glass-text-white-heavy)',
            '&:hover': { bgcolor: 'var(--primary-active)' },
          }}
        >
          {copied ? '已复制' : '一键复制'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          data-testid="toggle-analysis-details"
        >
          {expanded ? '收起详细分析' : '展开详细分析'}
        </Button>
      </Box>

      {/* 四维度分析 */}
      <Collapse in={expanded} timeout={300}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(4, minmax(0, 1fr))' },
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
      </Collapse>
    </Paper>
  );
}
