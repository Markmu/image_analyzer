/**
 * 进度显示主组件
 * 整合所有进度相关的子组件
 */

import React from 'react';
import { Box, useTheme, useMediaQuery, type SxProps, type Theme } from '@mui/material';
import { ProgressBar } from './ProgressBar';
import { StageIndicator } from './StageIndicator';
import { BatchProgressDisplay } from './BatchProgressDisplay';
import { MobileProgressBar } from './MobileProgressBar';
import { QueuePositionDisplay } from './MobileProgressBar';
import {
  useAnalysisStage,
  useAnalysisProgress,
  useQueuePosition,
  useBatchProgress,
  useAnalysisEstimatedTime,
} from '@/stores/useProgressStore';
import type { BatchImage } from './BatchProgressDisplay';

export interface ProgressDisplayProps {
  type?: 'upload' | 'analysis' | 'batch';
  showStageIndicator?: boolean;
  showTermScroller?: boolean;
  showMobileProgress?: boolean;
  batchImages?: BatchImage[];
  sx?: SxProps<Theme>;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  type = 'analysis',
  showStageIndicator = true,
  showTermScroller = true,
  showMobileProgress = false,
  batchImages = [],
  sx,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const stage = useAnalysisStage();
  const progress = useAnalysisProgress();
  const queuePosition = useQueuePosition();
  const batchProgress = useBatchProgress();
  const estimatedTime = useAnalysisEstimatedTime();
  const stageDescription =
    stage === 'uploading'
      ? '正在上传图片并进行基础校验'
      : stage === 'analyzing'
        ? '正在识别光影技巧、构图结构和色彩特征'
        : stage === 'generating'
          ? '正在生成可复用的分析结论'
          : stage === 'completed'
            ? '分析已完成'
            : '准备分析中';

  // 如果需要显示移动端进度栏
  if (showMobileProgress && isMobile) {
    const stageLabel = stage === 'uploading' ? '上传中' :
                      stage === 'analyzing' ? '分析中' :
                      stage === 'generating' ? '生成中' : '';
    return <MobileProgressBar progress={progress} stage={stageLabel} sx={sx} />;
  }

  // 上传进度显示
  if (type === 'upload') {
    return (
      <Box sx={sx}>
        <ProgressBar
          value={progress}
          label="正在上传..."
          estimatedTime={estimatedTime}
        />
      </Box>
    );
  }

  // 批量分析进度显示
  if (type === 'batch' && batchProgress) {
    return (
      <Box sx={sx}>
        <BatchProgressDisplay
          completed={batchProgress.completed}
          total={batchProgress.total}
          current={batchProgress.current}
          images={batchImages}
          estimatedTime={estimatedTime}
        />
      </Box>
    );
  }

  // 分析进度显示（默认）
  return (
    <Box sx={{ ...sx, width: '100%' }}>
      {/* 阶段指示器 */}
      {showStageIndicator && <StageIndicator currentStage={stage} />}

      {/* 整体进度条 */}
      <ProgressBar
        value={progress}
        label={
          stage === 'uploading' ? '上传中' :
          stage === 'analyzing' ? '分析中' :
          stage === 'generating' ? '生成中' :
          stage === 'completed' ? '已完成' : '准备中'
        }
        estimatedTime={estimatedTime}
        color={stage === 'error' ? 'error' : 'success'}
      />

      {(stage === 'uploading' || stage === 'analyzing' || stage === 'generating') && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 'var(--glass-radius)',
            border: '1px solid var(--glass-border)',
            backgroundColor: 'var(--glass-bg-dark-light)',
          }}
          data-testid="analysis-stage-description"
        >
          <Box component="p" sx={{ m: 0, fontSize: '0.875rem', color: 'var(--glass-text-gray-heavy)', fontWeight: 600 }}>
            当前阶段：{stageDescription}
          </Box>
        </Box>
      )}

      {/* 队列位置显示 */}
      {queuePosition && queuePosition > 0 && (
        <QueuePositionDisplay
          position={queuePosition}
          estimatedTime={estimatedTime}
          sx={{ mb: 2 }}
        />
      )}
    </Box>
  );
};

export default ProgressDisplay;
