/**
 * Confidence Badge Component
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 * Displays confidence score with color-coded badge
 */

'use client';

import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { getConfidenceLevel, type ConfidenceLevel } from '@/lib/analysis/confidence';

interface ConfidenceBadgeProps {
  /** 置信度分数 0-100 */
  score: number;
  /** 维度名称 */
  label?: string;
  /** 是否显示详细提示 */
  showTooltip?: boolean;
  /** 尺寸 */
  size?: 'small' | 'medium';
}

/**
 * 获取置信度对应的颜色
 */
function getConfidenceColor(level: ConfidenceLevel): 'success' | 'warning' | 'error' | 'default' {
  switch (level) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    case 'low':
    case 'critical':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * 获取置信度等级文本
 */
function getConfidenceText(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return '高置信度';
    case 'medium':
      return '中等置信度';
    case 'low':
      return '低置信度';
    case 'critical':
      return '极低置信度';
    default:
      return '未知';
  }
}

/**
 * 置信度徽章组件
 */
export default function ConfidenceBadge({
  score,
  label,
  showTooltip = true,
  size = 'small',
}: ConfidenceBadgeProps) {
  const level = getConfidenceLevel(score);
  const color = getConfidenceColor(level);
  const text = getConfidenceText(level);

  const badge = (
    <Chip
      label={`${label ? `${label}: ` : ''}${score}%`}
      color={color}
      size={size}
      variant="outlined"
    />
  );

  if (showTooltip) {
    return (
      <Tooltip title={`${text} (${score}%)`} arrow>
        <span>{badge}</span>
      </Tooltip>
    );
  }

  return badge;
}
