'use client';

import { useCallback, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Check, Clipboard, Save, Sparkles, SquarePen } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { CollapsibleSection } from '@/components/shared/CollapsibleSection';
import TemplatePreview from '@/features/analysis/components/TemplatePreview';
import VariableReplacer from '@/features/analysis/components/VariableReplacer';
import { TemplateGenerationSection } from '@/features/analysis/components/TemplateGenerationSection';
import type { AnalysisData } from '@/types/analysis';

type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error';

interface RightColumnProps {
  status: AnalysisStatus;
  analysisData: AnalysisData | null;
  analysisResultId: number | null;
  userId?: string | null;
  templateContent: string;
  renderedTemplate: string;
  copied: boolean;
  variables: Record<string, string>;
  isMobileLayout: boolean;
  onCopyTemplate: () => Promise<void>;
  onSaveTemplate: (payload: {
    analysisResultId: number;
    title?: string;
    description?: string;
  }) => Promise<void>;
  onVariableChange: (key: string, value: string) => void;
}

export default function RightColumn({
  status,
  analysisData,
  analysisResultId,
  userId,
  templateContent,
  renderedTemplate,
  copied,
  variables,
  isMobileLayout,
  onCopyTemplate,
  onSaveTemplate,
  onVariableChange,
}: RightColumnProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const hasTemplateContent = templateContent.trim().length > 0;

  const handleOpenSaveDialog = useCallback(() => {
    setSaveError(null);
    setSaveDialogOpen(true);
  }, []);

  const handleCloseSaveDialog = useCallback(() => {
    if (isSaving) return;
    setSaveDialogOpen(false);
  }, [isSaving]);

  const handleSaveToLibrary = useCallback(async () => {
    if (!analysisResultId) {
      setSaveError('未找到分析结果 ID，请重新分析后重试。');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSaveTemplate({
        analysisResultId,
        title: saveTitle.trim() || undefined,
        description: saveDescription.trim() || undefined,
      });

      setSaveDialogOpen(false);
      setSaveSuccess('已保存到模版库');
      setSaveTitle('');
      setSaveDescription('');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败，请稍后重试。');
    } finally {
      setIsSaving(false);
    }
  }, [analysisResultId, onSaveTemplate, saveDescription, saveTitle]);

  if (!hasTemplateContent && (status !== 'completed' || !analysisData)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="workspace-right-column">
        <EmptyState
          title="等待分析完成"
          description="分析结果完成后，系统会在右侧自动生成可直接复用的模版内容。"
          icon={<SquarePen size={34} />}
          testId="right-column-empty"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="workspace-right-column">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box className="ia-glass-card ia-glass-card--static" sx={{ p: 2.5 }}>
          <Box className="ia-glass-card ia-glass-card--active" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => void onCopyTemplate()}
                startIcon={copied ? <Check size={18} /> : <Clipboard size={18} />}
                data-testid="copy-template-button"
                sx={{ bgcolor: 'var(--glass-text-primary)', color: 'var(--glass-text-white-heavy)', '&:hover': { bgcolor: 'var(--primary-active)' } }}
              >
                {copied ? '已复制！' : '一键复制'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleOpenSaveDialog}
                startIcon={<Save size={18} />}
                data-testid="open-save-template-dialog"
                disabled={!analysisResultId}
                sx={{ borderColor: 'var(--glass-border-active)', color: 'var(--glass-text-white-heavy)' }}
              >
                保存模版
              </Button>
            </Box>
          </Box>
          {saveSuccess && (
            <Alert
              severity="success"
              onClose={() => setSaveSuccess(null)}
              sx={{ mb: 2 }}
              data-testid="save-template-success"
            >
              {saveSuccess}
            </Alert>
          )}
          <TemplatePreview content={renderedTemplate} />
        </Box>

        <CollapsibleSection title="变量替换" defaultExpanded storageKey="template-variables">
          {isMobileLayout ? (
            <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-heavy)' }}>
              移动端已隐藏高级变量替换，桌面端可编辑变量并实时预览。
            </Typography>
          ) : (
            <VariableReplacer
              template={templateContent}
              values={variables}
              onValueChange={onVariableChange}
            />
          )}
        </CollapsibleSection>

        {/* Template Generation Section with Image Generation (Story 6.1) */}
        {status === 'completed' && analysisData && analysisResultId && (
          <TemplateGenerationSection
            analysisData={analysisData}
            analysisResultId={String(analysisResultId)}
            userId={userId || 'current-user'}
          />
        )}

      </Box>

      <Dialog
        open={saveDialogOpen}
        onClose={handleCloseSaveDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          className: 'ia-glass-card ia-glass-card--heavy ia-glass-card--lg ia-glass-card--static',
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backgroundImage: 'linear-gradient(180deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.94) 100%)',
            border: '1px solid var(--glass-border-white-heavy)',
            boxShadow: '0 14px 48px rgba(2, 6, 23, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            transition: 'var(--glass-transition)',
            '&:hover': {
              transform: 'none',
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              backgroundImage: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.97) 100%)',
              borderColor: 'rgba(248, 250, 252, 0.32)',
              boxShadow: '0 18px 56px rgba(2, 6, 23, 0.62), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'var(--glass-text-white-heavy)',
            fontWeight: 700,
            pb: 1,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--glass-bg-blue-medium)',
              border: '1px solid var(--glass-border-active)',
            }}
          >
            <Sparkles size={16} color="var(--glass-text-primary)" />
          </Box>
          保存到模版库
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 1,
            borderTop: '1px solid var(--glass-border-white-light)',
          }}
          data-testid="template-modal"
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              mb: 1,
            }}
          >
            <TextField
              fullWidth
              label="标题（可选）"
              value={saveTitle}
              onChange={(event) => setSaveTitle(event.target.value)}
              margin="normal"
              inputProps={{ maxLength: 200 }}
              placeholder="例如：北欧极简客厅"
              data-testid="save-template-title-input"
              sx={{
                '& .MuiInputLabel-root': { color: 'var(--glass-text-white-medium)' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'var(--glass-text-primary)' },
                '& .MuiOutlinedInput-root': {
                  color: 'var(--glass-text-white-heavy)',
                  backgroundColor: 'rgba(15, 23, 42, 0.72)',
                  '& fieldset': { borderColor: 'var(--glass-border)' },
                  '&:hover fieldset': { borderColor: 'var(--glass-border-white-medium)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--glass-border-active)' },
                },
              }}
            />
          </Box>
          <TextField
            fullWidth
            label="描述（可选）"
            value={saveDescription}
            onChange={(event) => setSaveDescription(event.target.value)}
            margin="normal"
            multiline
            minRows={3}
            inputProps={{ maxLength: 1000 }}
            placeholder="记录这套模版的适用场景、风格关键词和使用建议"
            data-testid="save-template-description-input"
            sx={{
              '& .MuiInputLabel-root': { color: 'var(--glass-text-white-medium)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'var(--glass-text-primary)' },
              '& .MuiOutlinedInput-root': {
                color: 'var(--glass-text-white-heavy)',
                backgroundColor: 'rgba(15, 23, 42, 0.72)',
                '& fieldset': { borderColor: 'var(--glass-border)' },
                '&:hover fieldset': { borderColor: 'var(--glass-border-white-medium)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--glass-border-active)' },
              },
            }}
          />
          {saveError && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                color: 'var(--glass-text-white-heavy)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
              }}
              data-testid="save-template-error"
            >
              {saveError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0.5, borderTop: '1px solid var(--glass-border-white-light)' }}>
          <Button
            onClick={handleCloseSaveDialog}
            disabled={isSaving}
            sx={{ color: 'var(--glass-text-gray-medium)' }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveToLibrary()}
            disabled={isSaving || !analysisResultId}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            data-testid="confirm-save-template"
            sx={{
              bgcolor: 'var(--glass-text-primary)',
              color: 'var(--glass-text-white-heavy)',
              '&:hover': { bgcolor: 'var(--primary-active)' },
            }}
          >
            {isSaving ? '保存中...' : '确认保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
