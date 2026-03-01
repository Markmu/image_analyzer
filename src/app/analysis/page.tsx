'use client';

import { useState, useCallback, useEffect, useRef, Fragment, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TermsDialog } from '@/components/shared/TermsDialog';
import {
  LeftColumn,
  MiddleColumn,
  RightColumn,
  type AnalysisModelOption,
} from '@/features/analysis/components/WorkspaceColumns';
import type { ImageData } from '@/features/analysis/components/ImageUploader/types';
import type { AnalysisData } from '@/types/analysis';
import { useProgressStore } from '@/stores/useProgressStore';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import {
  buildTemplateSnapshotFromAnalysis,
  normalizeTemplateSnapshot,
} from '@/lib/analysis/template-snapshot';

type ImageStatus = 'idle' | 'ready';
type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error';

interface ImageWorkspaceState {
  status: ImageStatus;
  data: ImageData | null;
}

interface AnalysisWorkspaceState {
  status: AnalysisStatus;
  data: AnalysisData | null;
  id: number | null;
  error: string | null;
}

interface TemplateWorkspaceState {
  content: string;
  copied: boolean;
  variables: Record<string, string>;
}

const TERMS_VERSION = '1.0';

const applyVariableValues = (template: string, values: Record<string, string>): string => {
  return template.replace(/\[([^\]]+)\]/g, (_match, key: string) => {
    const normalizedKey = key.trim();
    return values[normalizedKey] || `[${normalizedKey}]`;
  });
};

const buildPrefillImageDataFromHistory = (historyRecord: {
  id?: unknown;
  imageUrl?: unknown;
  analysisResult?: { imageUrl?: unknown } | null;
}): ImageData | null => {
  const rawUrl =
    typeof historyRecord.analysisResult?.imageUrl === 'string'
      ? historyRecord.analysisResult.imageUrl
      : typeof historyRecord.imageUrl === 'string'
        ? historyRecord.imageUrl
        : '';

  if (!rawUrl) return null;

  const filePath = rawUrl.split('?')[0] || rawUrl;
  const extension = filePath.split('.').pop()?.toLowerCase();
  const fileFormat = extension ? extension.toUpperCase() : '未知格式';
  const fallbackId =
    typeof historyRecord.id === 'number' || typeof historyRecord.id === 'string'
      ? String(historyRecord.id)
      : `history-${Date.now()}`;

  return {
    imageId: `history-${fallbackId}`,
    filePath,
    fileSize: 0,
    fileFormat,
    width: 0,
    height: 0,
    url: rawUrl,
  };
};

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const { session, isLoading, isAuthenticated } = useRequireAuth();
  const theme = useTheme();
  const isMobileLayout = useMediaQuery(theme.breakpoints.down('md'));

  const [imageState, setImageState] = useState<ImageWorkspaceState>({
    status: 'idle',
    data: null,
  });
  const [analysisState, setAnalysisState] = useState<AnalysisWorkspaceState>({
    status: 'idle',
    data: null,
    id: null,
    error: null,
  });
  const [templateState, setTemplateState] = useState<TemplateWorkspaceState>({
    content: '',
    copied: false,
    variables: {},
  });

  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [models, setModels] = useState<AnalysisModelOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState(false);

  const stopPollingRef = useRef(false);
  const autoStartTimerRef = useRef<number | null>(null);
  const copyResetTimerRef = useRef<number | null>(null);
  const appliedTemplateParamRef = useRef<string | null>(null);
  const appliedHistoryIdParamRef = useRef<string | null>(null);

  const { setAnalysisStage, setAnalysisProgress, resetAnalysis } = useProgressStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    async function checkTermsStatus() {
      try {
        const res = await fetch('/api/user/terms-status');
        const data = await res.json();
        if (data.success && data.data.requiresAgreement) {
          setShowTermsDialog(true);
        }
      } catch (error) {
        console.error('Failed to check terms status:', error);
      }
    }

    checkTermsStatus();
  }, [isAuthenticated]);

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

        const enabledModels = (data.data.models as AnalysisModelOption[]).filter((model) => model.enabled);
        setModels(enabledModels);

        const defaultModel =
          enabledModels.find((model) => model.isDefault && !model.isLocked) ||
          enabledModels.find((model) => !model.isLocked) ||
          enabledModels[0];

        if (defaultModel) {
          setSelectedModelId(defaultModel.id);
        }
      } catch (error) {
        console.error('Failed to load analysis models:', error);
      } finally {
        setModelsLoading(false);
      }
    }

    loadModels();
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (autoStartTimerRef.current) {
        window.clearTimeout(autoStartTimerRef.current);
      }
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (analysisState.status !== 'completed' || !analysisState.data) {
      return;
    }

    const template = buildTemplateSnapshotFromAnalysis(analysisState.data).variableFormat;
    setTemplateState({
      content: template,
      copied: false,
      variables: {},
    });
  }, [analysisState.data, analysisState.status]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const historyIdParam = searchParams.get('historyId');
    if (!historyIdParam || appliedHistoryIdParamRef.current === historyIdParam) {
      return;
    }
    const parsedHistoryId = Number(historyIdParam);
    if (!Number.isInteger(parsedHistoryId) || parsedHistoryId <= 0) {
      appliedHistoryIdParamRef.current = historyIdParam;
      console.error('Invalid historyId query param:', historyIdParam);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/history/${parsedHistoryId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.message || '获取历史记录详情失败');
        }

        if (cancelled) return;
        appliedHistoryIdParamRef.current = historyIdParam;

        const historyRecord = result.data as {
          id?: unknown;
          imageUrl?: unknown;
          analysisResultId?: unknown;
          templateSnapshot?: unknown;
          analysisResult?: { analysisData?: unknown; imageUrl?: unknown } | null;
        };

        const normalizedTemplate = normalizeTemplateSnapshot(historyRecord.templateSnapshot);
        const restoredAnalysisData = historyRecord.analysisResult?.analysisData as AnalysisData | null;
        const restoredAnalysisResultId =
          typeof historyRecord.analysisResultId === 'number' ? historyRecord.analysisResultId : null;
        const restoredImageData = buildPrefillImageDataFromHistory(historyRecord);

        if (restoredImageData) {
          setImageState({
            status: 'ready',
            data: restoredImageData,
          });
        }

        if (restoredAnalysisData) {
          stopPollingRef.current = true;
          setAnalysisState({
            status: 'completed',
            data: restoredAnalysisData,
            id: restoredAnalysisResultId,
            error: null,
          });
          setAnalysisStage('completed');
          setAnalysisProgress(100);
        } else {
          setAnalysisState((prev) => ({
            ...prev,
            id: restoredAnalysisResultId ?? prev.id,
            error: null,
          }));
        }

        setTemplateState({
          content: normalizedTemplate.variableFormat,
          copied: false,
          variables: {},
        });
      } catch (error) {
        console.error('Failed to prefill analysis page from historyId:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, searchParams, setAnalysisProgress, setAnalysisStage]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const templateParam = searchParams.get('template');
    if (!templateParam || appliedTemplateParamRef.current === templateParam) {
      return;
    }

    appliedTemplateParamRef.current = templateParam;
    try {
      const parsed = JSON.parse(templateParam);
      const normalized = normalizeTemplateSnapshot(parsed);
      setTemplateState({
        content: normalized.variableFormat,
        copied: false,
        variables: {},
      });
      setAnalysisState((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to parse template from query param:', error);
    }
  }, [isAuthenticated, searchParams]);

  const renderedTemplate = useMemo(() => {
    if (!templateState.content) return '';
    return applyVariableValues(templateState.content, templateState.variables);
  }, [templateState.content, templateState.variables]);

  const handleCopyTemplate = useCallback(async () => {
    if (!renderedTemplate) return;

    await navigator.clipboard.writeText(renderedTemplate);
    setTemplateState((prev) => ({ ...prev, copied: true }));

    if (copyResetTimerRef.current) {
      window.clearTimeout(copyResetTimerRef.current);
    }

    copyResetTimerRef.current = window.setTimeout(() => {
      setTemplateState((prev) => ({ ...prev, copied: false }));
      copyResetTimerRef.current = null;
    }, 1500);
  }, [renderedTemplate]);

  useEffect(() => {
    if (!renderedTemplate || analysisState.status !== 'completed') return;

    const onCopyShortcut = (event: KeyboardEvent) => {
      const isCopyShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c';
      if (!isCopyShortcut) return;

      const selectedText = window.getSelection()?.toString();
      if (selectedText) return;

      event.preventDefault();
      void handleCopyTemplate();
    };

    window.addEventListener('keydown', onCopyShortcut);
    return () => {
      window.removeEventListener('keydown', onCopyShortcut);
    };
  }, [analysisState.status, handleCopyTemplate, renderedTemplate]);

  const pollAnalysisStatus = useCallback(
    async (analysisId: number) => {
      const maxAttempts = 120;
      const interval = 1000;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (stopPollingRef.current) {
          return;
        }

        try {
          const response = await fetch(`/api/analysis/${analysisId}/status`);
          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error?.message || '获取分析状态失败');
          }

          const { status, progress, result } = data.data;
          const analysisResultId =
            typeof data.data.analysisResultId === 'number' ? data.data.analysisResultId : null;

          setAnalysisProgress(progress || 0);
          setAnalysisStage(status === 'generating' ? 'generating' : 'analyzing');

          if (status === 'completed') {
            setAnalysisState((prev) => ({
              ...prev,
              status: 'completed',
              data: result,
              id: analysisResultId ?? prev.id,
            }));
            setAnalysisStage('completed');
            return;
          }

          if (status === 'failed') {
            throw new Error('分析失败');
          }

          await new Promise((resolve) => setTimeout(resolve, interval));
        } catch (error) {
          if (stopPollingRef.current) {
            return;
          }

          const message = error instanceof Error ? error.message : '分析失败';
          setAnalysisState((prev) => ({
            ...prev,
            status: 'error',
            error: message,
          }));
          setAnalysisStage('error');
          return;
        }
      }

      setAnalysisState((prev) => ({
        ...prev,
        status: 'error',
        error: '分析超时，请稍后重试',
      }));
      setAnalysisStage('error');
    },
    [setAnalysisProgress, setAnalysisStage]
  );

  const handleStartAnalysis = useCallback(
    async (imageDataOverride?: ImageData) => {
      const activeImage = imageDataOverride || imageState.data;
      if (!activeImage || analysisState.status === 'analyzing') return;

      stopPollingRef.current = false;
      setAnalysisState((prev) => ({
        ...prev,
        status: 'analyzing',
        data: null,
        id: null,
        error: null,
      }));
      setTemplateState((prev) => ({ ...prev, content: '', copied: false, variables: {} }));

      setAnalysisStage('analyzing');
      setAnalysisProgress(0);

      try {
        const response = await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageId: activeImage.imageId,
            modelId: selectedModelId || undefined,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || '分析请求失败');
        }

        const analysisId = data.data.analysisId;
        setAnalysisState((prev) => ({ ...prev, id: analysisId }));
        void pollAnalysisStatus(analysisId);
      } catch (error) {
        const message = error instanceof Error ? error.message : '分析失败';
        setAnalysisState((prev) => ({
          ...prev,
          status: 'error',
          error: message,
        }));
        setAnalysisStage('error');
      }
    },
    [analysisState.status, imageState.data, pollAnalysisStatus, selectedModelId, setAnalysisProgress, setAnalysisStage]
  );

  const handleAutoStartAnalysis = useCallback(
    (imageData: ImageData) => {
      if (autoStartTimerRef.current) {
        window.clearTimeout(autoStartTimerRef.current);
      }

      // Defer to the next macrotask so upload-success state commits before analysis bootstraps.
      autoStartTimerRef.current = window.setTimeout(() => {
        void handleStartAnalysis(imageData);
        autoStartTimerRef.current = null;
      }, 0);
    },
    [handleStartAnalysis]
  );

  const handleUploadSuccess = useCallback((imageData: ImageData) => {
    setImageState({
      status: 'ready',
      data: imageData,
    });
    setAnalysisState({
      status: 'idle',
      data: null,
      id: null,
      error: null,
    });
    setTemplateState({
      content: '',
      copied: false,
      variables: {},
    });
  }, []);

  const handleUploadError = useCallback((error: string, errorCode?: string) => {
    if (errorCode === 'TERMS_NOT_AGREED') {
      setShowTermsDialog(true);
      return;
    }

    setAnalysisState((prev) => ({
      ...prev,
      status: 'error',
      error,
    }));
  }, []);

  const handleCancelAnalysis = useCallback(() => {
    if (autoStartTimerRef.current) {
      window.clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }

    stopPollingRef.current = true;
    setAnalysisState((prev) => ({
      ...prev,
      status: imageState.data ? 'idle' : 'error',
      error: null,
    }));
    setAnalysisStage('idle');
    setAnalysisProgress(0);
  }, [imageState.data, setAnalysisProgress, setAnalysisStage]);

  const handleResetWorkspace = useCallback(() => {
    if (autoStartTimerRef.current) {
      window.clearTimeout(autoStartTimerRef.current);
      autoStartTimerRef.current = null;
    }

    stopPollingRef.current = true;
    setImageState({ status: 'idle', data: null });
    setAnalysisState({ status: 'idle', data: null, id: null, error: null });
    setTemplateState({ content: '', copied: false, variables: {} });
    resetAnalysis();
  }, [resetAnalysis]);

  const handleFeedback = useCallback(async (feedback: 'accurate' | 'inaccurate'): Promise<void> => {
    if (!analysisState.id) return;

    try {
      const response = await fetch(`/api/analysis/${analysisState.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      const data = await response.json();
      if (!data.success) {
        console.error('提交反馈失败:', data.error);
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
    }
  }, [analysisState.id]);

  const handleSaveTemplate = useCallback(async (payload: {
    analysisResultId: number;
    title?: string;
    description?: string;
    tags?: string[];
  }): Promise<void> => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || '保存模版失败');
    }
  }, []);

  const handleAgreeTerms = async () => {
    const res = await fetch('/api/user/agree-terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: TERMS_VERSION }),
    });
    const data = await res.json();
    if (data.success) {
      setShowTermsDialog(false);
    }
    return data;
  };

  const handleCancelTerms = () => {
    setShowTermsDialog(false);
  };

  const selectedModelDescription = models.find((model) => model.id === selectedModelId)?.description;

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
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          py: 4,
          px: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {analysisState.error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setAnalysisState((prev) => ({ ...prev, error: null }))}
          >
            {analysisState.error}
          </Alert>
        )}

        {isMobileLayout && (
          <Alert severity="info" sx={{ mb: 3 }}>
            移动端已简化展示。在桌面端可查看更完整的分析细节和模版编辑能力。
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 4fr 4fr',
            },
            alignItems: 'start',
          }}
        >
          <LeftColumn
            imageData={imageState.data}
            models={models}
            modelsLoading={modelsLoading}
            selectedModelId={selectedModelId}
            selectedModelDescription={selectedModelDescription}
            onModelChange={setSelectedModelId}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            onAutoStartAnalysis={handleAutoStartAnalysis}
            onResetWorkspace={handleResetWorkspace}
          />

          <MiddleColumn
            status={analysisState.status}
            analysisData={analysisState.data}
            onCancelAnalysis={handleCancelAnalysis}
            onFeedback={handleFeedback}
          />

          <RightColumn
            status={analysisState.status}
            analysisData={analysisState.data}
            analysisResultId={analysisState.id}
            userId={session?.user?.id ?? null}
            templateContent={templateState.content}
            isMobileLayout={isMobileLayout}
            onSaveTemplate={handleSaveTemplate}
          />
        </Box>
      </Container>

      <TermsDialog open={showTermsDialog} onAgree={handleAgreeTerms} onCancel={handleCancelTerms} />
    </Fragment>
  );
}
