'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Paper, TextField, Typography, Tabs, Tab, Button, Dialog } from '@mui/material';
import { Save } from 'lucide-react';
import type { Template } from '../../types';
import type { PromptOptimizationOptions, PromptOptimizationResult } from '../../types/optimization';
import { TemplatePreview } from '../TemplatePreview';
import { CopyButton } from '../CopyButton';
import { ExportButton } from '../ExportButton';
import { OptimizeButton } from '../OptimizeButton';
import { OptimizationOptionsPanel } from '../OptimizeButton/OptimizationOptionsPanel';
import { OptimizationPreviewDialog } from '../OptimizationPreviewDialog';
import { optimizePrompt, buildFullPrompt } from '../../lib/optimize-prompt';
import {
  loadOptimizationPreferences,
  DEFAULT_OPTIMIZATION_PREFERENCES,
} from '../../lib/optimization-constants';
import { useToast } from '../../hooks/useToast';

interface TemplateEditorProps {
  /** Template to edit */
  template: Template;
  /** On template change callback */
  onChange?: (template: Template) => void;
  /** On save callback (requires Story 5.4 implementation) */
  onSave?: (template: Template) => void;
  /** Show save button (disabled until Story 5.4) */
  showSaveButton?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Test ID */
  'data-testid'?: string;
  /** Show optimize button (AC1) */
  showOptimizeButton?: boolean;
  /** On optimize callback */
  onOptimize?: (result: PromptOptimizationResult) => void;
}

/**
 * Template editor with real-time preview
 *
 * Features:
 * - Edit variable format template
 * - Edit JSON format fields
 * - Real-time preview
 * - Copy to clipboard
 * - Save to template library (requires Story 5.4)
 * - AI optimization (Story 5.4) (AC1)
 * - Toast notifications (AC3, AC5, AC8)
 * - Glassmorphism styling
 *
 * NOTE: Save button is hidden by default (showSaveButton=false) because
 * the save functionality depends on Story 5.4 (Template Library Management).
 * Once Story 5.4 is implemented, set showSaveButton={true} and provide onSave callback.
 */
export function TemplateEditor({
  template,
  onChange,
  onSave,
  showSaveButton = false,
  readOnly = false,
  'data-testid': testId,
  showOptimizeButton = true,
  onOptimize,
}: TemplateEditorProps) {
  const [tabValue, setTabValue] = useState(0);
  const [editedTemplate, setEditedTemplate] = useState<Template>(template);

  // Optimization state (AC1, AC7)
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<PromptOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Toast notifications (AC8)
  const { showSuccess, showError, showInfo } = useToast();

  // Load user preferences (AC7)
  const [optimizationOptions, setOptimizationOptions] = useState<PromptOptimizationOptions>(
    () => loadOptimizationPreferences()
  );

  // Update edited template when prop changes
  useEffect(() => {
    setEditedTemplate(template);
  }, [template]);

  const handleVariableFormatChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      const updated = {
        ...editedTemplate,
        variableFormat: newValue,
        updatedAt: new Date(),
      };
      setEditedTemplate(updated);
      onChange?.(updated);
    },
    [editedTemplate, onChange]
  );

  const handleJsonFieldChange = useCallback(
    (field: keyof typeof editedTemplate.jsonFormat) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        const updated = {
          ...editedTemplate,
          jsonFormat: {
            ...editedTemplate.jsonFormat,
            [field]: newValue,
          },
          updatedAt: new Date(),
        };
        setEditedTemplate(updated);
        onChange?.(updated);
      },
    [editedTemplate, onChange]
  );

  const handleSave = useCallback(() => {
    onSave?.(editedTemplate);
  }, [editedTemplate, onSave]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  // Optimization handlers (AC1, AC2)
  const handleOptimizeClick = useCallback(() => {
    if (!readOnly) {
      setOptimizeDialogOpen(true);
    }
  }, [readOnly]);

  const handleOptimizeConfirm = useCallback(async () => {
    setOptimizeDialogOpen(false);
    setIsOptimizing(true);

    // Show start notification (AC8)
    showInfo('开始优化提示词...');

    try {
      const result = await optimizePrompt(editedTemplate.jsonFormat, optimizationOptions);
      setOptimizationResult(result);
      setPreviewDialogOpen(true);

      // Show success notification (AC8)
      showSuccess(
        `提示词优化完成! 消耗 ${result.creditsConsumed} credits`
      );
    } catch (error) {
      console.error('[TemplateEditor] Optimization failed:', error);

      // Show error notification (AC8)
      showError(
        `提示词优化失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsOptimizing(false);
    }
  }, [editedTemplate.jsonFormat, optimizationOptions, showSuccess, showError, showInfo]);

  const handleAcceptOptimization = useCallback(() => {
    if (optimizationResult) {
      // TODO: Parse and apply optimized prompt to template fields
      onOptimize?.(optimizationResult);
    }
  }, [optimizationResult, onOptimize]);

  const handleRejectOptimization = useCallback(() => {
    setPreviewDialogOpen(false);
    setOptimizationResult(null);
  }, []);

  // Check if template has content for optimization
  const hasContent = Object.values(editedTemplate.jsonFormat).some(
    (value) => value && value.trim().length > 0
  );

  return (
    <Paper
      elevation={0}
      className="ia-glass-card ia-glass-card--static"
      sx={{
        p: 3,
        backgroundColor: 'var(--glass-bg-dark)',
        backgroundImage: 'none',
      }}
      data-testid={testId || 'template-editor'}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--glass-text-white-heavy)' }}>
          模版编辑器
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <CopyButton
            text={editedTemplate.variableFormat}
            tooltipText="复制变量模版"
            data-testid="copy-variable-template"
          />
          <CopyButton
            text={JSON.stringify(editedTemplate.jsonFormat, null, 2)}
            tooltipText="复制 JSON 格式"
            data-testid="copy-json-template"
          />
          <ExportButton
            template={editedTemplate}
            tooltipText="导出为 JSON 文件"
            data-testid="export-template"
          />
          {/* AI Optimize Button (AC1) */}
          {showOptimizeButton && (
            <OptimizeButton
              loading={isOptimizing}
              disabled={!hasContent || readOnly}
              onClick={handleOptimizeClick}
              data-testid="optimize-template"
            />
          )}
          {showSaveButton && (
            <Button
              variant="contained"
              startIcon={<Save size={16} />}
              onClick={handleSave}
              data-testid="save-template"
              sx={{
                bgcolor: 'var(--glass-text-primary)',
                color: 'var(--glass-text-white-heavy)',
                '&:hover': { bgcolor: 'var(--primary-active)' },
              }}
            >
              保存到模版库
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            color: 'var(--glass-text-gray-medium)',
            fontWeight: 600,
            '&.Mui-selected': {
              color: 'var(--glass-text-primary)',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--glass-text-primary)',
          },
        }}
      >
        <Tab label="变量格式" />
        <Tab label="JSON 字段" />
        <Tab label="预览" />
      </Tabs>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="变量格式模版"
            value={editedTemplate.variableFormat}
            onChange={handleVariableFormatChange}
            disabled={readOnly}
            slotProps={{
              inputLabel: {
                sx: { color: 'var(--glass-text-gray-heavy)' },
              },
              input: {
                sx: {
                  color: 'var(--glass-text-white-medium)',
                  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--glass-bg-dark-medium)',
                '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                '&:hover fieldset': { borderColor: 'var(--glass-border-active)' },
                '&.Mui-focused fieldset': { borderColor: '#22c55e' },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{
              mt: 1,
              display: 'block',
              color: 'var(--glass-text-gray-heavy)',
            }}
          >
            使用 [变量名] 标记可替换部分，例如: [主体描述]、[风格描述]
          </Typography>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(editedTemplate.jsonFormat).map(([key, value]) => (
            <TextField
              key={key}
              fullWidth
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={value}
              onChange={handleJsonFieldChange(key as keyof typeof editedTemplate.jsonFormat)}
              disabled={readOnly}
              multiline
              rows={2}
              slotProps={{
                inputLabel: {
                  sx: { color: 'var(--glass-text-gray-heavy)' },
                },
                input: {
                  sx: { color: 'var(--glass-text-white-medium)' },
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'var(--glass-bg-dark-medium)',
                  '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                  '&:hover fieldset': { borderColor: 'var(--glass-border-active)' },
                  '&.Mui-focused fieldset': { borderColor: '#22c55e' },
                },
              }}
            />
          ))}
        </Box>
      )}

      {tabValue === 2 && (
        <TemplatePreview template={editedTemplate} />
      )}

      {/* Optimization Options Dialog (AC1, AC2) */}
      <Dialog
        open={optimizeDialogOpen}
        onClose={() => setOptimizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'ia-glass-card ia-glass-card--static',
          sx: {
            backgroundColor: 'var(--glass-bg-dark)',
            backgroundImage: 'none',
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <OptimizationOptionsPanel
            mode={optimizationOptions.mode}
            target={optimizationOptions.target}
            intensity={optimizationOptions.intensity}
            language={optimizationOptions.language}
            onModeChange={(mode) =>
              setOptimizationOptions((prev) => ({ ...prev, mode }))
            }
            onTargetChange={(target) =>
              setOptimizationOptions((prev) => ({ ...prev, target }))
            }
            onIntensityChange={(intensity) =>
              setOptimizationOptions((prev) => ({ ...prev, intensity }))
            }
            onLanguageChange={(language) =>
              setOptimizationOptions((prev) => ({ ...prev, language }))
            }
            onConfirm={handleOptimizeConfirm}
            loading={isOptimizing}
          />
        </Box>
      </Dialog>

      {/* Optimization Preview Dialog (AC4) */}
      <OptimizationPreviewDialog
        open={previewDialogOpen}
        result={optimizationResult}
        onAccept={handleAcceptOptimization}
        onReject={handleRejectOptimization}
        onClose={() => setPreviewDialogOpen(false)}
        loading={isOptimizing}
      />
    </Paper>
  );
}
