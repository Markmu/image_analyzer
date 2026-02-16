/**
 * 阶段指示器组件
 * 显示分析过程的四个阶段
 */

import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import {
  CloudUpload,
  Psychology,
  AutoAwesome,
  CheckCircle,
} from '@mui/icons-material';
import type { AnalysisStage } from '@/lib/utils/time-estimation';

export interface StageConfig {
  id: AnalysisStage;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const STAGES: StageConfig[] = [
  {
    id: 'uploading',
    label: '上传中',
    description: '正在上传图片',
    icon: <CloudUpload />,
  },
  {
    id: 'analyzing',
    label: '分析中',
    description: 'AI 正在分析图片',
    icon: <Psychology />,
  },
  {
    id: 'generating',
    label: '生成中',
    description: '正在生成提示词',
    icon: <AutoAwesome />,
  },
  {
    id: 'completed',
    label: '完成',
    description: '分析完成',
    icon: <CheckCircle />,
  },
];

export interface StageIndicatorProps {
  currentStage: AnalysisStage;
  sx?: SxProps<Theme>;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ currentStage, sx }) => {
  const getCurrentStageIndex = () => {
    const index = STAGES.findIndex((stage) => stage.id === currentStage);
    return index >= 0 ? index : 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4,
        px: 2,
        ...sx,
      }}
    >
      {STAGES.map((stage, index) => (
        <React.Fragment key={stage.id}>
          {/* 阶段图标和标签 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: currentStageIndex >= index ? 1 : 0.4,
              transition: 'opacity 0.3s ease',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  currentStageIndex === index
                    ? 'rgba(34, 197, 94, 0.2)'
                    : currentStageIndex > index
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(15, 23, 42, 0.04)',
                border: '2px solid',
                borderColor:
                  currentStageIndex >= index
                    ? '#22C55E'
                    : '#cbd5e1',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {React.cloneElement(stage.icon as React.ReactElement, {
                sx: {
                  fontSize: 28,
                  color:
                    currentStageIndex >= index ? '#22C55E' : '#94a3b8',
                },
              } as any)}

              {/* 脉冲动画 - 当前阶段 */}
              {currentStageIndex === index && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: '50%',
                    border: '2px solid #22C55E',
                    opacity: 0,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        opacity: 0.5,
                      },
                      '100%': {
                        transform: 'scale(1.3)',
                        opacity: 0,
                      },
                    },
                  }}
                />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                mt: 1,
                color: '#475569',
                fontWeight: currentStageIndex === index ? 'bold' : 'normal',
                fontSize: '0.75rem',
              }}
            >
              {stage.label}
            </Typography>
          </Box>

          {/* 连接线 */}
          {index < STAGES.length - 1 && (
            <Box
              sx={{
                width: { xs: '30px', sm: '50px', md: '70px' },
                height: '2px',
                backgroundColor:
                  currentStageIndex > index ? '#22C55E' : '#cbd5e1',
                mx: 1,
                transition: 'background-color 0.3s ease',
                position: 'relative',
              }}
            >
              {/* 连接线动画 - 当前正在进行的连接 */}
              {currentStageIndex === index && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '30%',
                    backgroundColor: '#22C55E',
                    animation: 'progress 1.5s ease-in-out infinite',
                    '@keyframes progress': {
                      '0%': {
                        left: '0%',
                        width: '0%',
                      },
                      '50%': {
                        width: '50%',
                      },
                      '100%': {
                        left: '100%',
                        width: '0%',
                      },
                    },
                  }}
                />
              )}
            </Box>
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};
