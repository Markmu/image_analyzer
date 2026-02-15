/**
 * Confidence Warning Component
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 * Displays warning when confidence is low with retry option
 */

'use client';

import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Collapse,
  LinearProgress,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { ConfidenceWarning as ConfidenceWarningType, ConfidenceScores } from '@/lib/analysis/confidence';
import ConfidenceBadge from '../ConfidenceBadge';

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

  return (
    <Alert
      severity={severity}
      icon={<WarningIcon />}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? '收起' : '详情'}
        </Button>
      }
    >
      <AlertTitle>置信度警告</AlertTitle>
      <Typography variant="body2">{warning.message}</Typography>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {/* 置信度分数可视化 */}
          <Stack spacing={1}>
            {Object.entries(scores).map(([key, value]) => {
              if (key === 'overall') return null;

              const label = DIMENSION_LABELS[key] || key;
              const progressColor = value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error';

              return (
                <Box key={key}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    color={progressColor}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              );
            })}
          </Stack>

          {/* 重试按钮 */}
          {warning.suggestedAction === 'retry' && onRetry && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              disabled={disableRetry || isRetrying}
              sx={{ mt: 2 }}
            >
              {isRetrying ? '重新分析中...' : '重新分析'}
            </Button>
          )}

          {disableRetry && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              请等待3秒后再次尝试
            </Typography>
          )}
        </Box>
      </Collapse>
    </Alert>
  );
}
