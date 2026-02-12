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
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
              color: '#22C55E',
              lineHeight: 1,
            }}
          >
            {Math.round(progress)}%
          </Typography>
          {stage && (
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
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
            color: '#22C55E',
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
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#22C55E',
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
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: 2,
        padding: 2,
        mb: 2,
        ...sx,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#FBBF24',
          mb: 0.5,
          fontWeight: 'bold',
        }}
      >
        当前排队第 {position} 位
      </Typography>
      {estimatedTime && (
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(251, 191, 36, 0.8)',
          }}
        >
          预计等待 {estimatedTime}
        </Typography>
      )}
    </Box>
  );
};
