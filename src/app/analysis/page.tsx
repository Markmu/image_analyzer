'use client';

import { useState, useCallback, useEffect, Fragment } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
} from '@mui/material';
import { Psychology as PsychologyIcon } from '@mui/icons-material';
import { ImageUploader } from '@/features/analysis/components/ImageUploader';
import { ProgressDisplay } from '@/features/analysis/components/ProgressDisplay';
import { AnalysisCard } from '@/features/analysis/components/AnalysisResult/AnalysisCard';
import { FeedbackButtons } from '@/features/analysis/components/AnalysisResult/FeedbackButtons';
import { TermsDialog } from '@/components/shared/TermsDialog';
import type { ImageData } from '@/features/analysis/components/ImageUploader/types';
import type { AnalysisData } from '@/types/analysis';
import { useProgressStore } from '@/stores/useProgressStore';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';

type AnalysisStatus = 'idle' | 'uploading' | 'ready' | 'analyzing' | 'completed' | 'error';

interface AnalysisState {
  status: AnalysisStatus;
  imageData: ImageData | null;
  analysisData: AnalysisData | null;
  analysisId: number | null;
  error: string | null;
}

interface TermsStatus {
  hasAgreed: boolean;
  requiresAgreement: boolean;
}

interface AnalysisModelOption {
  id: string;
  name: string;
  description: string;
  features: string[];
  isDefault: boolean;
  enabled: boolean;
  requiresTier: 'free' | 'lite' | 'standard';
  isLocked: boolean;
}

const TERMS_VERSION = '1.0';

export default function AnalysisPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    imageData: null,
    analysisData: null,
    analysisId: null,
    error: null,
  });
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [termsStatus, setTermsStatus] = useState<TermsStatus | null>(null);
  const [models, setModels] = useState<AnalysisModelOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState(false);

  const {
    setAnalysisStage,
    setAnalysisProgress,
    resetAnalysis,
  } = useProgressStore();

  // 检查用户条款同意状态
  useEffect(() => {
    if (!isAuthenticated) return;

    async function checkTermsStatus() {
      try {
        const res = await fetch('/api/user/terms-status');
        const data = await res.json();
        if (data.success && data.data.requiresAgreement) {
          setTermsStatus(data.data);
          setShowTermsDialog(true);
        }
      } catch (err) {
        console.error('Failed to check terms status:', err);
      }
    }

    checkTermsStatus();
  }, [isAuthenticated]);

  // 拉取可用模型并设置默认选中项
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadModels() {
      setModelsLoading(true);
      try {
        const res = await fetch('/api/analysis/models');
        const data = await res.json();

        if (!data.success || !data.data?.models) {
          return;
        }

        const enabledModels = (data.data.models as AnalysisModelOption[]).filter((m) => m.enabled);
        setModels(enabledModels);

        const defaultModel =
          enabledModels.find((m) => m.isDefault && !m.isLocked) ||
          enabledModels.find((m) => !m.isLocked) ||
          enabledModels[0];

        if (defaultModel) {
          setSelectedModelId(defaultModel.id);
        }
      } catch (err) {
        console.error('Failed to load analysis models:', err);
      } finally {
        setModelsLoading(false);
      }
    }

    loadModels();
  }, [isAuthenticated]);

  // 处理同意条款
  const handleAgreeTerms = async () => {
    const res = await fetch('/api/user/agree-terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: TERMS_VERSION }),
    });
    const data = await res.json();
    if (data.success) {
      setShowTermsDialog(false);
      setTermsStatus({ hasAgreed: true, requiresAgreement: false });
    }
    return data;
  };

  // 处理取消同意
  const handleCancelTerms = () => {
    setShowTermsDialog(false);
  };

  // 处理上传成功
  const handleUploadSuccess = useCallback((imageData: ImageData) => {
    setState((prev) => ({
      ...prev,
      status: 'ready',
      imageData,
      error: null,
    }));
  }, []);

  // 处理上传错误
  const handleUploadError = useCallback((error: string, errorCode?: string) => {
    if (errorCode === 'TERMS_NOT_AGREED') {
      setTermsStatus({ hasAgreed: false, requiresAgreement: true });
      setShowTermsDialog(true);
      setState((prev) => ({
        ...prev,
        status: 'idle',
        error: null,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: 'error',
      error,
    }));
  }, []);

  // 开始分析
  const handleStartAnalysis = useCallback(async () => {
    if (!state.imageData) return;

    setState((prev) => ({
      ...prev,
      status: 'analyzing',
      error: null,
    }));

    setAnalysisStage('analyzing');
    setAnalysisProgress(0);

    try {
      // 调用分析 API
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: state.imageData.imageId,
          modelId: selectedModelId || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || '分析请求失败');
      }

      const analysisId = data.data.analysisId;
      setState((prev) => ({
        ...prev,
        analysisId,
      }));

      // 开始轮询分析状态（不等待完成）
      pollAnalysisStatus(analysisId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '分析失败';
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      setAnalysisStage('error');
    }
  }, [state.imageData, selectedModelId, setAnalysisStage, setAnalysisProgress]);

  // 轮询分析状态
  const pollAnalysisStatus = async (analysisId: number) => {
    const maxAttempts = 60; // 最多轮询 60 次（2 分钟）
    const interval = 2000; // 2 秒间隔

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`/api/analysis/${analysisId}/status`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || '获取分析状态失败');
        }

        const { status, progress, result } = data.data;

        // 更新进度
        setAnalysisProgress(progress || 0);

        if (status === 'completed') {
          setState((prev) => ({
            ...prev,
            status: 'completed',
            analysisData: result,
          }));
          setAnalysisStage('completed');
          return;
        }

        if (status === 'failed') {
          throw new Error('分析失败');
        }

        // 等待下一次轮询
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '分析失败';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));
        setAnalysisStage('error');
        return;
      }
    }

    // 超时
    setState((prev) => ({
      ...prev,
      status: 'error',
      error: '分析超时，请稍后重试',
    }));
    setAnalysisStage('error');
  };

  // 提交反馈
  const handleFeedback = useCallback(
    async (feedback: 'accurate' | 'inaccurate'): Promise<void> => {
      if (!state.analysisId) return;

      try {
        const response = await fetch(`/api/analysis/${state.analysisId}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedback }),
        });

        const data = await response.json();

        if (!data.success) {
          console.error('提交反馈失败:', data.error);
        }
      } catch (error) {
        console.error('提交反馈失败:', error);
      }
    },
    [state.analysisId]
  );

  // 重新分析
  const handleReset = useCallback(() => {
    setState({
      status: 'idle',
      imageData: null,
      analysisData: null,
      analysisId: null,
      error: null,
    });
    resetAnalysis();
  }, [resetAnalysis]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info">请先登录后再上传图片，正在跳转到登录页面...</Alert>
      </Container>
    );
  }

  return (
    <Fragment>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <PsychologyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" fontWeight="bold">
            AI 风格分析
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#475569' }}>
          上传图片，获取专业的四维度风格分析（光影、构图、色彩、艺术风格）
        </Typography>
      </Box>

      {/* 错误提示 */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setState((prev) => ({ ...prev, error: null }))}>
          {state.error}
        </Alert>
      )}

      {/* 步骤 1: 上传图片 */}
      {(state.status === 'idle' || state.status === 'uploading') && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="medium">
            步骤 1: 上传图片
          </Typography>
          <ImageUploader
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </Box>
      )}

      {/* 步骤 2: 开始分析 */}
      {state.status === 'ready' && state.imageData && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="medium">
            步骤 2: 开始分析
          </Typography>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <img
                src={state.imageData.url}
                alt="已上传图片"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {state.imageData.filePath?.split('/').pop() || 'Uploaded Image'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  {(state.imageData.fileSize / 1024 / 1024).toFixed(2)} MB · {state.imageData.width}x{state.imageData.height}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth size="small" disabled={modelsLoading || models.length === 0}>
                <InputLabel id="analysis-model-select-label">分析模型</InputLabel>
                <Select
                  labelId="analysis-model-select-label"
                  label="分析模型"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  data-testid="analysis-model-select"
                >
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id} disabled={model.isLocked}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {model.name}
                        </Typography>
                        {model.isDefault && <Chip size="small" label="默认" />}
                        {model.isLocked && <Chip size="small" color="warning" label={`需 ${model.requiresTier}`} />}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedModelId && (
                <Typography variant="body2" sx={{ mt: 1, color: '#475569' }}>
                  {models.find((m) => m.id === selectedModelId)?.description}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartAnalysis}
              startIcon={<PsychologyIcon />}
              data-testid="analyze-button"
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              开始分析
            </Button>
          </Box>
        </Box>
      )}

      {/* 分析进度 */}
      {state.status === 'analyzing' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="medium">
            正在分析...
          </Typography>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
            data-testid="progress-display"
          >
            <ProgressDisplay type="analysis" />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography
                variant="body2"
                sx={{ color: '#475569' }}
                data-testid="analysis-status"
              >
                分析中，请稍候...
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* 分析结果 */}
      {state.status === 'completed' && state.analysisData && (
        <Box data-testid="analysis-result">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="medium">
              分析结果
            </Typography>
            <Button variant="outlined" onClick={handleReset}>
              分析新图片
            </Button>
          </Box>

          {/* 低置信度警告 */}
          {state.analysisData.overallConfidence < 0.6 && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                分析置信度较低，结果可能不够准确。建议尝试使用更清晰的图片。
              </Alert>
              <Button
                variant="outlined"
                onClick={handleReset}
                startIcon={<PsychologyIcon />}
                sx={{
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  '&:hover': {
                    borderColor: 'warning.dark',
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                  },
                }}
              >
                重新分析
              </Button>
            </Box>
          )}

          {/* 分析结果卡片 */}
          <AnalysisCard analysisData={state.analysisData} />

          {/* 用户反馈 */}
          <Box
            sx={{
              mt: 3,
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" gutterBottom>
              这个分析结果准确吗？
            </Typography>
            <FeedbackButtons onFeedback={handleFeedback} />
          </Box>
        </Box>
      )}
    </Container>

      <TermsDialog
        open={showTermsDialog}
        onAgree={handleAgreeTerms}
        onCancel={handleCancelTerms}
      />
    </Fragment>
  );
}
