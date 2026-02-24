'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import { CopyButton } from '@/features/templates/components/CopyButton/CopyButton';
import { GenerateButton } from '@/features/generation/components/GenerateButton/GenerateButton';
import type { Template } from '@/features/templates/types/template';
import type { AnalysisData } from '@/types/analysis';
import { QuickVariableEditor } from './QuickVariableEditor';

export interface UnifiedTemplateEditorProps {
  /** Template content to edit */
  templateContent: string;
  /** Analysis data for context */
  analysisData?: AnalysisData | null;
  /** Analysis result ID */
  analysisResultId?: string | null;
  /** User ID */
  userId?: string | null;
}

/**
 * Unified template editor component
 *
 * Features:
 * - Single editable preview area (direct editing in one TextArea)
 * - Quick variable editing area (extracts variables from template, allows quick value editing)
 * - Action bar (copy/export/generate)
 * - Responsive layout (two columns/single column)
 * - Anti-loop mechanism: uses useRef to mark update source
 * - External props handling: monitors templateContent changes and syncs
 *
 * @example
 * ```tsx
 * <UnifiedTemplateEditor
 *   templateContent="Create an image of [subject] in [style] style"
 *   analysisData={analysisData}
 *   analysisResultId="123"
 *   userId="user-123"
 * />
 * ```
 */
export function UnifiedTemplateEditor({
  templateContent,
  analysisResultId,
  userId,
}: UnifiedTemplateEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Internal template state
  const [internalTemplate, setInternalTemplate] = useState(templateContent);
  const [variables, setVariables] = useState<Array<{ name: string; value: string }>>([]);

  // Ref for tracking previous template content
  const prevTemplateContentRef = useRef<string>(templateContent);

  // Extract variables from template content
  const extractVariablesFromTemplate = useCallback((template: string) => {
    const matches = template.match(/\[([^\]]+)\]/g) || [];
    const uniqueVars = [...new Set(matches.map((entry) => entry.slice(1, -1).trim()).filter(Boolean))];

    // Preserve existing values for variables that still exist
    setVariables((prevVars) => {
      const prevVarMap = new Map(prevVars.map((v) => [v.name, v.value]));
      return uniqueVars.map((name) => ({
        name,
        value: prevVarMap.get(name) || '',
      }));
    });
  }, []);

  // Sync external templateContent changes to internal state
  useEffect(() => {
    if (prevTemplateContentRef.current !== templateContent) {
      setInternalTemplate(templateContent);
      prevTemplateContentRef.current = templateContent;
      extractVariablesFromTemplate(templateContent);
    }
  }, [templateContent, extractVariablesFromTemplate]);

  // Initialize variables on mount and when template changes
  useEffect(() => {
    extractVariablesFromTemplate(internalTemplate);
  }, [internalTemplate, extractVariablesFromTemplate]);

  // Handle template content change
  const handleTemplateChange = useCallback((newTemplate: string) => {
    setInternalTemplate(newTemplate);
    // Variables will be extracted automatically by the useEffect
  }, []);

  // Handle variable value change
  // Note: This only updates the variable value, NOT the template text.
  // The template text keeps the [placeholder] format.
  // Variable values are only used in preview (via TemplatePreview) and export/generation.
  const handleVariableChange = useCallback((name: string, value: string) => {
    setVariables((prev) =>
      prev.map((v) => (v.name === name ? { ...v, value } : v))
    );
  }, []);

  // Prepare template for export/generation
  const preparedTemplate = useMemo((): Template | null => {
    if (!analysisResultId || !userId) {
      return null;
    }

    // Convert variable values to jsonFormat (using values, not names)
    // Maps first 6 variables to specific fields, remaining to 'additional' separated by newlines
    const jsonFormat = {
      subject: variables[0]?.value || '',
      style: variables[1]?.value || '',
      composition: variables[2]?.value || '',
      colors: variables[3]?.value || '',
      lighting: variables[4]?.value || '',
      additional: variables.slice(5).map(v => v.value).filter(Boolean).join('\n') || '',
    };

    return {
      id: `temp-${analysisResultId}`,
      userId,
      analysisResultId,
      variableFormat: internalTemplate,
      jsonFormat,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [variables, internalTemplate, analysisResultId, userId]);

  // Handle copy - use replaced content
  const copyText = useMemo(() => {
    let replacedContent = internalTemplate;
    variables.forEach((v) => {
      if (v.value) {
        replacedContent = replacedContent.replace(new RegExp(`\\[${v.name}\\]`, 'g'), v.value);
      }
    });
    return replacedContent;
  }, [internalTemplate, variables]);

  // Responsive layout - use MUI sx instead of Tailwind classes
  const layoutSx = useMemo(() => {
    if (isMobile) {
      return { display: 'flex' as const, flexDirection: 'column' as const, gap: 2 };
    }
    if (isTablet) {
      return { display: 'grid' as const, gridTemplateColumns: '1fr 1fr', gap: 2 };
    }
    return {
      display: 'grid' as const,
      gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
      gap: 2,
    };
  }, [isMobile, isTablet]);

  return (
    <Box
      className="ia-glass-card ia-glass-card--static"
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: {
          xs: 'auto',
          md: 'calc(100svh - 220px)',
        },
        minHeight: {
          md: 560,
        },
      }}
      data-testid="unified-template-editor"
    >
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'var(--glass-text-white-heavy)',
          }}
        >
          模板编辑器
        </Typography>
        <CopyButton
          text={copyText}
          data-testid="unified-copy-button"
          className="ia-glass-card"
          tooltipText="复制替换后的内容"
        />
      </Box>

      {/* Main Layout */}
      <Box
        sx={{
          ...layoutSx,
          flex: 1,
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        {/* Unified Preview/Edit Area */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minHeight: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'var(--glass-text-gray-heavy)', display: 'block' }}
          >
            预览（可直接编辑）
          </Typography>
          <TextField
            multiline
            fullWidth
            minRows={isMobile ? 10 : 14}
            maxRows={20}
            value={internalTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            placeholder="在此预览框中直接编辑模板内容，使用 [变量名] 创建变量..."
            slotProps={{
              inputLabel: {
                sx: { color: 'var(--glass-text-gray-heavy)' },
              },
              input: {
                sx: {
                  color: 'var(--glass-text-white-medium)',
                  fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  '&::placeholder': {
                    color: 'var(--glass-text-gray-medium)',
                    opacity: 1,
                  },
                },
              },
            }}
            sx={{
              flex: 1,
              minHeight: 0,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--glass-bg-dark-medium)',
                height: '100%',
                alignItems: 'flex-start',
                '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
                '&:hover fieldset': { borderColor: 'var(--glass-border-active)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--glass-text-primary)' },
              },
              '& .MuiInputBase-inputMultiline': {
                height: '100% !important',
                overflowY: 'auto !important',
              },
            }}
            data-testid="template-textarea"
          />
        </Box>

        {/* Quick Variable Editor */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minHeight: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'var(--glass-text-gray-heavy)', display: 'block' }}
          >
            快速变量编辑
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <QuickVariableEditor
              templateContent={internalTemplate}
              onVariableChange={handleVariableChange}
            />
          </Box>
        </Box>

      </Box>

      {preparedTemplate && (
        <Box
          sx={{
            mt: 2,
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : isTablet
                ? '1fr 1fr'
                : 'minmax(0, 1.8fr) minmax(0, 1fr)',
            gap: 2,
          }}
        >
          <Box
            sx={{
              gridColumn: isMobile ? '1' : '2',
              '& .MuiButton-root': {
                width: '100%',
                minWidth: 0,
                px: 2.5,
              },
            }}
          >
            <GenerateButton
              template={preparedTemplate}
              data-testid="unified-generate-button"
              className="ia-glass-card"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
