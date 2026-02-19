/**
 * Confidence Warning Component
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 * Displays warning when confidence is low with retry option
 */

'use client';

import React, { useState } from 'react';
import {
  Button,
  Collapse,
  LinearProgress,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import {
  TriangleAlert,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ConfidenceWarning as ConfidenceWarningType, ConfidenceScores } from '@/lib/analysis/confidence';

interface ConfidenceWarningProps {
  /** 置信度警告信息 */
  warning: ConfidenceWarningType;
  /** 置信度分数 */
  scores: ConfidenceScores;
  /** 重新分析回调 */
  onRetry?: () => void;
  /** 是否正在重试 */
  isRetrying?: boolean;
  /** 是否禁用重试按钮 */
  disableRetry?: boolean;
}

/**
 * 维度名称映射
 */
const DIMENSION_LABELS: Record<string, string> = {
  lighting: '光影',
  composition: '构图',
  color: '色彩',
  style: '艺术风格',
  overall: '整体',
};

/**
 * 获取警告严重程度
 */
function getAlertSeverity(level: string): 'warning' | 'error' | 'info' {
  switch (level) {
    case 'critical':
    case 'low':
      return 'error';
    case 'medium':
      return 'warning';
    default:
      return 'info';
  }
}

/**
 * 置信度警告组件
 */
export default function ConfidenceWarning({
  warning,
  scores,
  onRetry,
  isRetrying = false,
  disableRetry = false,
}: ConfidenceWarningProps) {
  const [expanded, setExpanded] = useState(false);

  const severity = getAlertSeverity(warning.level);

  // 根据严重程度获取设计系统颜色
  const getSeverityColors = () => {
    switch (severity) {
      case 'error':
        return {
          bg: 'var(--error-bg)',
          border: 'var(--error)',
          text: 'var(--error)',
        };
      case 'warning':
        return {
          bg: 'var(--warning-bg)',
          border: 'var(--warning)',
          text: 'var(--warning)',
        };
      default:
        return {
          bg: 'var(--info-bg)',
          border: 'var(--info)',
          text: 'var(--info)',
        };
    }
  };

  const colors = getSeverityColors();

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 'var(--glass-radius)',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <TriangleAlert size={20} style={{ color: colors.text, flexShrink: 0 }} aria-hidden="true" />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 700 }}>
              置信度警告
            </Typography>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              sx={{
                color: colors.text,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: `${colors.text}20`,
                },
              }}
            >
              {expanded ? '收起' : '详情'}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: 'var(--glass-text-white-heavy)' }}>
            {warning.message}
          </Typography>

          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              {/* 置信度分数可视化 */}
              <Stack spacing={1}>
                {Object.entries(scores).map(([key, value]) => {
                  if (key === 'overall') return null;

                  const label = DIMENSION_LABELS[key] || key;
                  const progressColor = value >= 80 ? 'var(--success)' : value >= 60 ? 'var(--warning)' : 'var(--error)';

                  return (
                    <Box key={key}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-medium)' }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 700 }}>
                          {value}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={value}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          backgroundColor: 'var(--glass-bg-dark-heavy)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: progressColor,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>

              {/* 重试按钮 */}
              {warning.suggestedAction === 'retry' && onRetry && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<RotateCcw size={16} />}
                  onClick={onRetry}
                  disabled={disableRetry || isRetrying}
                  sx={{
                    mt: 2,
                    backgroundColor: colors.text,
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: colors.text,
                      opacity: 0.8,
                    },
                    '&:disabled': {
                      backgroundColor: 'var(--glass-text-gray-light)',
                      color: 'var(--glass-text-gray-light)',
                    },
                  }}
                >
                  {isRetrying ? '重新分析中...' : '重新分析'}
                </Button>
              )}

              {disableRetry && (
                <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-medium)', mt: 1, display: 'block' }}>
                  请等待3秒后再次尝试
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
}
