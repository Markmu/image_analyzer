'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Paper, TextField, Typography, Tabs, Tab, Button } from '@mui/material';
import { Save } from 'lucide-react';
import type { Template } from '../../types';
import { TemplatePreview } from '../TemplatePreview';
import { CopyButton } from '../CopyButton';
import { ExportButton } from '../ExportButton';

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
}: TemplateEditorProps) {
  const [tabValue, setTabValue] = useState(0);
  const [editedTemplate, setEditedTemplate] = useState<Template>(template);

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

        <Box sx={{ display: 'flex', gap: 1 }}>
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
    </Paper>
  );
}
