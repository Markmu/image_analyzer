'use client';

import { Box, Button, Typography } from '@mui/material';
import { Brain, CircleX } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { ProgressDisplay } from '@/features/analysis/components/ProgressDisplay';
import { AnalysisCard } from '@/features/analysis/components/AnalysisResult/AnalysisCard';
import { FeedbackButtons } from '@/features/analysis/components/AnalysisResult/FeedbackButtons';
import type { AnalysisData } from '@/types/analysis';

type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error';

interface MiddleColumnProps {
  status: AnalysisStatus;
  analysisData: AnalysisData | null;
  onCancelAnalysis: () => void;
  onResetWorkspace: () => void;
  onFeedback: (feedback: 'accurate' | 'inaccurate') => Promise<void>;
}

export default function MiddleColumn({
  status,
  analysisData,
  onCancelAnalysis,
  onResetWorkspace,
  onFeedback,
}: MiddleColumnProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="workspace-middle-column">
      <Box className="ia-glass-card" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 700 }}>
          分析作业区
        </Typography>
      </Box>

      {status === 'idle' && (
        <EmptyState
          title="准备开始分析"
          description="上传后系统将在 0.5 秒内自动开始分析，中间区域会实时显示阶段、进度和剩余时间。"
          icon={<Brain size={34} />}
          testId="middle-column-empty"
        />
      )}

      {status === 'analyzing' && (
        <Box className="ia-glass-card" sx={{ p: 3 }} data-testid="progress-display" aria-busy="true" aria-live="polite">
          <ProgressDisplay type="analysis" showStageIndicator={false} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={onCancelAnalysis}
              startIcon={<CircleX size={18} />}
              data-testid="cancel-analysis-button"
            >
              取消分析
            </Button>
          </Box>
        </Box>
      )}

      {status === 'completed' && analysisData && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="analysis-result">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              分析完成
            </Typography>
            <Button variant="outlined" onClick={onResetWorkspace}>
              更换图片
            </Button>
          </Box>
          <AnalysisCard analysisData={analysisData} />
          <Box className="ia-glass-card" sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ color: '#f8fafc', mb: 1, fontWeight: 700 }}>
              结果反馈
            </Typography>
            <FeedbackButtons onFeedback={onFeedback} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
