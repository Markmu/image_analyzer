'use client';

import { useEffect, useCallback, KeyboardEvent } from 'react';
import { Box, Paper, Typography, Button, Divider, useTheme, useMediaQuery } from '@mui/material';
import {
  Edit,
  Eye,
  Undo,
  Redo,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { TemplateFieldKey } from '../../types/template';
import { useTemplateEditorStore } from '../../stores';
import { FIELD_CONFIGS } from '../../lib/field-configs';
import { FieldEditor } from './FieldEditor';
import { FieldPreview } from '../TemplatePreview';
import { CopyButton } from '../CopyButton';
import { ExportButton } from '../ExportButton';

interface EnhancedTemplateEditorProps {
  /** Initial field values */
  initialFields?: Partial<{ [K in TemplateFieldKey]?: string }>;
  /** On save callback (requires Story 5.4 implementation) */
  onSave?: (fields: { [K in TemplateFieldKey]: string }) => void;
  /** Show save button (disabled until Story 5.4) */
  showSaveButton?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Enhanced template editor with history, suggestions, and real-time preview
 *
 * Features:
 * - Edit all 6 template fields
 * - Real-time preview (no delay)
 * - Smart suggestions for each field
 * - Undo/Redo with keyboard shortcuts (Ctrl/Cmd + Z, Ctrl/Cmd + Shift + Z)
 * - Field validation (required fields, character limits)
 * - History management (max 10 versions)
 * - Responsive layout (desktop/tablet/mobile)
 * - Glassmorphism styling
 * - Copy, Export, and Save buttons
 *
 * @example
 * ```tsx
 * <EnhancedTemplateEditor
 *   initialFields={{
 *     subject: '一位美丽的女性',
 *     style: '肖像摄影风格',
 *   }}
 *   onSave={(fields) => console.log('Save:', fields)}
 *   showSaveButton={false}
 * />
 * ```
 */
export function EnhancedTemplateEditor({
  initialFields,
  onSave,
  showSaveButton = false,
  readOnly = false,
  'data-testid': testId,
}: EnhancedTemplateEditorProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const {
    fields,
    history,
    historyIndex,
    isPreviewExpanded,
    activeField,
    updateField,
    undo,
    redo,
    canUndo,
    canRedo,
    togglePreview,
    setActiveField,
    reset,
  } = useTemplateEditorStore();

  // Initialize with initial fields
  useEffect(() => {
    if (initialFields) {
      reset(initialFields);
    }
  }, [initialFields, reset]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      if (!cmdOrCtrl) return;

      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((event.key === 'z' && event.shiftKey) || (event.key === 'y' && !event.shiftKey)) {
        event.preventDefault();
        redo();
      } else if (event.key === 's') {
        event.preventDefault();
        if (showSaveButton && onSave) {
          onSave(fields);
        }
      }
    },
    [undo, redo, onSave, showSaveButton, fields]
  );

  // Handle field update
  const handleFieldUpdate = useCallback(
    (field: TemplateFieldKey) => (value: string) => {
      if (!readOnly) {
        updateField(field, value);
      }
    },
    [readOnly, updateField]
  );

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(fields);
  }, [onSave, fields]);

  // Generate formatted prompt from fields
  const generatePrompt = useCallback(() => {
    const parts = Object.entries(fields)
      .filter(([_, value]) => value.trim())
      .map(([key, value]) => {
        const config = FIELD_CONFIGS[key];
        return `${config?.label || key}: ${value}`;
      });

    return parts.join('\n');
  }, [fields]);

  const promptText = generatePrompt();

  return (
    <Paper
      elevation={0}
      className="ia-glass-card ia-glass-card--static"
      sx={{
        p: 3,
        backgroundColor: 'var(--glass-bg-dark)',
        backgroundImage: 'none',
        minHeight: 600,
      }}
      onKeyDown={handleKeyDown}
      data-testid={testId || 'enhanced-template-editor'}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit size={20} className="text-green-500" />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'var(--glass-text-white-heavy)' }}
          >
            模版编辑器
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Undo/Redo */}
          <Button
            size="small"
            startIcon={<Undo size={16} />}
            onClick={undo}
            disabled={!canUndo() || readOnly}
            sx={{
              color: canUndo() ? 'var(--glass-text-white-medium)' : 'var(--glass-text-gray-light)',
              minWidth: 'auto',
              px: 1,
            }}
            data-testid="undo-button"
          >
            撤销
          </Button>
          <Button
            size="small"
            startIcon={<Redo size={16} />}
            onClick={redo}
            disabled={!canRedo() || readOnly}
            sx={{
              color: canRedo() ? 'var(--glass-text-white-medium)' : 'var(--glass-text-gray-light)',
              minWidth: 'auto',
              px: 1,
            }}
            data-testid="redo-button"
          >
            重做
          </Button>

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(148, 163, 184, 0.3)' }} />

          {/* Action buttons */}
          <CopyButton
            text={promptText}
            tooltipText="复制提示词"
            data-testid="copy-prompt"
          />
          <ExportButton
            template={{
              id: 'temp',
              userId: 'temp',
              analysisResultId: 'temp',
              variableFormat: promptText,
              jsonFormat: fields,
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
            tooltipText="导出为 JSON"
            data-testid="export-json"
          />
          {showSaveButton && (
            <Button
              variant="contained"
              startIcon={<Save size={16} />}
              onClick={handleSave}
              disabled={readOnly}
              data-testid="save-button"
              sx={{
                bgcolor: 'var(--glass-text-primary)',
                color: 'var(--glass-text-white-heavy)',
                '&:hover': { bgcolor: 'var(--primary-active)' },
                '&:disabled': {
                  bgcolor: 'rgba(148, 163, 184, 0.3)',
                  color: 'var(--glass-text-gray-light)',
                },
              }}
            >
              保存到模版库
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isDesktop
            ? '1fr 1fr 280px'
            : isTablet
            ? '1fr 1fr'
            : '1fr',
          gap: 2,
        }}
      >
        {/* Left Column: Field Editors */}
        <Box
          sx={{
            gridColumn: isDesktop ? '1' : isTablet ? '1 / 2' : '1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 1.5,
            }}
          >
            <Edit size={16} className="text-green-500" />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: 'var(--glass-text-white-heavy)' }}
            >
              字段编辑
            </Typography>
          </Box>

          <Paper
            elevation={0}
            className="ia-glass-card"
            sx={{
              p: 2,
              backgroundColor: 'var(--glass-bg-dark-medium)',
              backgroundImage: 'none',
            }}
          >
            {Object.entries(FIELD_CONFIGS).map(([key, config]) => (
              <FieldEditor
                key={key}
                config={config}
                value={fields[config.key as TemplateFieldKey]}
                onChange={handleFieldUpdate(config.key as TemplateFieldKey)}
                isFocused={activeField === config.key}
                onFocus={() => setActiveField(config.key as TemplateFieldKey)}
                data-testid={`field-editor-${key}`}
              />
            ))}
          </Paper>
        </Box>

        {/* Right Column: Preview & Actions */}
        <Box
          sx={{
            gridColumn: isDesktop ? '2 / 4' : isTablet ? '2' : '2',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Preview Section */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Eye size={16} className="text-green-500" />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: 'var(--glass-text-white-heavy)' }}
                >
                  实时预览
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={isPreviewExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                onClick={togglePreview}
                sx={{
                  color: 'var(--glass-text-gray-medium)',
                  minWidth: 'auto',
                  px: 1,
                }}
                data-testid="toggle-preview"
              >
                {isPreviewExpanded ? '收起' : '展开'}
              </Button>
            </Box>

            <FieldPreview
              fields={fields}
              expanded={isPreviewExpanded}
              data-testid="template-preview"
            />
          </Box>

          {/* History Info (Desktop only) */}
          {isDesktop && (
            <Paper
              elevation={0}
              className="ia-glass-card"
              sx={{
                p: 2,
                backgroundColor: 'var(--glass-bg-dark-medium)',
                backgroundImage: 'none',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'var(--glass-text-gray-medium)', display: 'block', mb: 1 }}
              >
                历史记录
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'var(--glass-text-white-medium)' }}
              >
                版本 {historyIndex + 1} / {history.length}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'var(--glass-text-gray-light)', display: 'block', mt: 0.5 }}
              >
                快捷键: Ctrl/Cmd + Z (撤销) | Ctrl/Cmd + Shift + Z (重做)
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
