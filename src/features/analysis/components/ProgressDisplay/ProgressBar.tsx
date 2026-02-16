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
        return '#22C55E';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#22C55E';
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
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
        )}
        {showPercentage && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
          backgroundColor: '#e2e8f0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(),
            transition: 'width 0.3s ease',
          },
        }}
      />
      {estimatedTime && (
        <Typography
          variant="caption"
          sx={{ mt: 1, color: '#64748b', display: 'block' }}
        >
          {estimatedTime}
        </Typography>
      )}
    </Box>
  );
};
