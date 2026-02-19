/**
 * 进度显示主组件
 * 整合所有进度相关的子组件
 */

import React from 'react';
import { Box, useTheme, useMediaQuery, type SxProps, type Theme } from '@mui/material';
import { ProgressBar } from './ProgressBar';
import { StageIndicator } from './StageIndicator';
import { TermScroller } from './TermScroller';
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
import { getTermSequence } from '../../constants/analysis-terms';
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
  const isAnalyzing = stage === 'analyzing' || stage === 'generating';
  const terms = isAnalyzing ? getTermSequence(stage) : [];

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
            borderRadius: 2,
            border: '1px solid var(--glass-border-active)',
            backgroundColor: 'var(--glass-bg-green-light)',
          }}
          data-testid="analysis-stage-description"
        >
          <Box component="p" sx={{ m: 0, fontSize: '0.875rem', color: 'var(--glass-text-gray-heavy)', fontWeight: 600 }}>
            当前阶段：{stageDescription}
          </Box>
          <Box component="p" sx={{ m: 0, mt: 0.5, fontSize: '0.8125rem', color: 'var(--glass-text-gray-heavy)' }}>
            预计剩余时间：{estimatedTime}
          </Box>
          <Box component="p" sx={{ m: 0, mt: 0.5, fontSize: '0.8125rem', color: 'var(--glass-text-primary)' }}>
            质量承诺：优先保证分析准确性，结果将在完成后自动展示。
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

      {/* 专业术语滚动器 */}
      {showTermScroller && isAnalyzing && terms.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <TermScroller terms={terms} />
        </Box>
      )}

      {/* 长时间处理提示 */}
      {stage === 'analyzing' && parseInt(estimatedTime.replace(/\D/g, '')) > 90 && (
        <Box
          sx={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 2,
            padding: 2,
            mb: 2,
          }}
        >
          <Box
            component="p"
            sx={{
              color: 'var(--glass-text-gray-heavy)',
              fontSize: '0.875rem',
              m: 0,
            }}
          >
            正在确保分析准确性，可能需要较长时间...
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProgressDisplay;
