'use client';

import { Box, Button, Typography } from '@mui/material';
import { Brain, CircleX } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { AnalysisCard } from '@/features/analysis/components/AnalysisResult/AnalysisCard';
import { FeedbackButtons } from '@/features/analysis/components/AnalysisResult/FeedbackButtons';
import type { AnalysisData } from '@/types/analysis';

type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error';

interface MiddleColumnProps {
  status: AnalysisStatus;
  analysisData: AnalysisData | null;
  onCancelAnalysis: () => void;
  onFeedback: (feedback: 'accurate' | 'inaccurate') => Promise<void>;
}

export default function MiddleColumn({
  status,
  analysisData,
  onCancelAnalysis,
  onFeedback,
}: MiddleColumnProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="workspace-middle-column">
      {status === 'idle' && (
        <EmptyState
          title="准备开始分析"
          description="上传后系统将在 0.5 秒内自动开始分析，中间区域会实时显示阶段和进度。"
          icon={<Brain size={34} />}
          testId="middle-column-empty"
        />
      )}

      {status === 'analyzing' && (
        <Box className="ia-glass-card ia-glass-card--static" sx={{ p: 3 }} data-testid="progress-display" aria-busy="true" aria-live="polite">
          <Box
            sx={{
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                border: '3px solid var(--glass-border)',
                borderTopColor: 'var(--glass-text-primary)',
                animation: 'ia-spin 0.9s linear infinite',
                '@keyframes ia-spin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
              aria-hidden="true"
              data-testid="analysis-loading-spinner"
            />
            <Typography variant="body1" sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 700 }}>
              分析中...
            </Typography>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={onCancelAnalysis}
              startIcon={<CircleX size={18} />}
              data-testid="cancel-analysis-button"
              sx={{
                borderColor: 'var(--error)',
                color: 'var(--error)',
                '&:hover': {
                  borderColor: 'var(--error)',
                  backgroundColor: 'var(--error-bg)',
                },
              }}
            >
              取消分析
            </Button>
          </Box>
        </Box>
      )}

      {status === 'completed' && analysisData && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="analysis-result">
          <AnalysisCard analysisData={analysisData} />
          <Box className="ia-glass-card ia-glass-card--static" sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ color: 'var(--glass-text-white-heavy)', mb: 1, fontWeight: 700 }}>
              结果反馈
            </Typography>
            <FeedbackButtons onFeedback={onFeedback} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
