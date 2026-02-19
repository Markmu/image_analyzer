/**
 * 阶段指示器组件
 * 显示分析过程的四个阶段
 */

import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import {
  Upload,
  Brain,
  Sparkles,
  CircleCheck,
  type LucideIcon,
} from 'lucide-react';
import type { AnalysisStage } from '@/lib/utils/time-estimation';

export interface StageConfig {
  id: AnalysisStage;
  label: string;
  description: string;
  icon: LucideIcon;
}

const STAGES: StageConfig[] = [
  {
    id: 'uploading',
    label: '上传中',
    description: '正在上传图片',
    icon: Upload,
  },
  {
    id: 'analyzing',
    label: '分析中',
    description: 'AI 正在分析图片',
    icon: Brain,
  },
  {
    id: 'generating',
    label: '生成中',
    description: '正在生成提示词',
    icon: Sparkles,
  },
  {
    id: 'completed',
    label: '完成',
    description: '分析完成',
    icon: CircleCheck,
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
                    ? 'var(--glass-bg-blue-medium)'
                    : currentStageIndex > index
                    ? 'var(--glass-bg-active)'
                    : 'var(--glass-bg-dark)',
                border: '2px solid',
                borderColor:
                  currentStageIndex >= index
                    ? 'var(--glass-text-primary)'
                    : 'var(--glass-border)',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              <stage.icon
                size={28}
                color={currentStageIndex >= index ? '#3B82F6' : '#94a3b8'}
                aria-hidden="true"
              />

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
                    border: '2px solid var(--glass-text-primary)',
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
                color: 'var(--glass-text-gray-heavy)',
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
                  currentStageIndex > index ? 'var(--glass-text-primary)' : 'var(--glass-border)',
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
                    backgroundColor: 'var(--glass-text-primary)',
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
