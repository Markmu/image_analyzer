/**
 * 进度条组件
 * 用于显示上传和分析进度
 */

import React from 'react';
import { Box, Typography, LinearProgress, SxProps, Theme } from '@mui/material';

export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  estimatedTime?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  estimatedTime,
  showPercentage = true,
  color = 'success',
  size = 'medium',
  sx,
}) => {
  const getHeight = () => {
    switch (size) {
      case 'small':
        return 4;
      case 'large':
        return 12;
      default:
        return 8;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return '#3B82F6';
      case 'success':
        return '#3B82F6';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        {label && (
          <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-medium)' }}>
            {label}
          </Typography>
        )}
        {showPercentage && (
          <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-medium)' }}>
            {Math.round(value)}%
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: getHeight(),
          borderRadius: size === 'large' ? 6 : 4,
          backgroundColor: 'var(--glass-bg-dark-heavy)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
            transition: 'width 0.3s ease',
          },
        }}
      />
    </Box>
  );
};
