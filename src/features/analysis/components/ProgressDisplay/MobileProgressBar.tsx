/**
 * 移动端进度栏组件
 * 固定在顶部，显示简化的进度信息
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CircularProgress,
  Box,
  SxProps,
  Theme,
} from '@mui/material';

export interface MobileProgressBarProps {
  progress: number;
  stage?: string;
  sx?: SxProps<Theme>;
}

export const MobileProgressBar: React.FC<MobileProgressBarProps> = ({
  progress,
  stage,
  sx,
}) => {
  return (
    <AppBar
      position="sticky"
      sx={{
        top: 0,
        backgroundColor: 'var(--glass-text-white-heavy)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 100,
        ...sx,
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 56, px: 2 }}>
        {/* 进度百分比 */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--glass-text-primary)',
              lineHeight: 1,
            }}
          >
            {Math.round(progress)}%
          </Typography>
          {stage && (
            <Typography
              variant="caption"
              sx={{
                color: 'var(--glass-text-gray-heavy)',
                fontSize: '0.75rem',
                display: 'block',
              }}
            >
              {stage}
            </Typography>
          )}
        </Box>

        {/* 圆形进度指示器 */}
        <CircularProgress
          variant="determinate"
          value={progress}
          size={32}
          sx={{
            color: 'var(--glass-text-primary)',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </Toolbar>

      {/* 顶部进度条 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'var(--glass-bg-dark-heavy)',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'var(--glass-text-primary)',
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </AppBar>
  );
};

/**
 * 队列位置显示组件
 * 当用户在队列中等待时显示
 */
export interface QueuePositionDisplayProps {
  position: number;
  estimatedTime?: string;
  sx?: SxProps<Theme>;
}

export const QueuePositionDisplay: React.FC<QueuePositionDisplayProps> = ({
  position,
  estimatedTime,
  sx,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: 'var(--warning-bg)',
        border: '1px solid var(--warning)',
        borderRadius: 'var(--glass-radius)',
        padding: 2,
        mb: 2,
        ...sx,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'var(--warning)',
          mb: 0.5,
          fontWeight: 700,
        }}
      >
        当前排队第 {position} 位
      </Typography>
      {estimatedTime && (
        <Typography
          variant="caption"
          sx={{
            color: 'var(--glass-text-gray-medium)',
          }}
        >
          预计等待 {estimatedTime}
        </Typography>
      )}
    </Box>
  );
};
