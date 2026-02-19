'use client';

import { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { TemplateFieldKey, TemplateJSONFormat } from '../../types';
import { FIELD_CONFIGS } from '../../lib/field-configs';

interface FieldPreviewProps {
  /** Field values */
  fields: TemplateJSONFormat;
  /** Whether preview is expanded */
  expanded?: boolean;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Template preview with real-time field display
 *
 * Features:
 * - Real-time preview from field values
 * - JetBrains Mono font
 * - Expandable/collapsible
 * - Glassmorphism styling
 * - Character count per field
 */
export function FieldPreview({ fields, expanded = true, 'data-testid': testId }: FieldPreviewProps) {
  // Generate formatted prompt text
  const promptText = useMemo(() => {
    const parts: string[] = [];

    Object.entries(FIELD_CONFIGS).forEach(([, config]) => {
      const value = fields[config.key as TemplateFieldKey];
      if (value && value.trim()) {
        parts.push(`${config.label}: ${value}`);
      }
    });

    return parts.join('\n\n');
  }, [fields]);

  // Calculate total characters
  const totalCharacters = useMemo(() => {
    return Object.values(fields).reduce((sum, value) => sum + value.length, 0);
  }, [fields]);

  // Count filled fields
  const filledFields = useMemo(() => {
    return Object.values(fields).filter((value) => value && value.trim()).length;
  }, [fields]);

  return (
    <Paper
      elevation={0}
      className="ia-glass-card"
      sx={{
        p: 2,
        backgroundColor: 'var(--glass-bg-dark-medium)',
        backgroundImage: 'none',
        transition: 'all 0.3s ease',
      }}
      data-testid={testId || 'field-preview'}
    >
      {/* Preview Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: expanded ? 1.5 : 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'var(--glass-text-gray-medium)', fontWeight: 500 }}
        >
          完整提示词预览
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{ color: 'var(--glass-text-gray-light)' }}
          >
            {filledFields} / {Object.keys(fields).length} 字段已填写
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'var(--glass-text-gray-light)' }}
          >
            {totalCharacters} 字符
          </Typography>
        </Box>
      </Box>

      {/* Preview Content */}
      {expanded && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: '1px solid rgba(148, 163, 184, 0.3)',
            backgroundColor: 'var(--glass-bg-dark-heavy)',
            minHeight: 200,
            maxHeight: 400,
            overflow: 'auto',
            transition: 'all 0.3s ease',
          }}
        >
          {promptText ? (
            <Typography
              sx={{
                fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                fontSize: '0.875rem',
                lineHeight: 1.75,
                color: 'var(--glass-text-white-medium)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {promptText}
            </Typography>
          ) : (
            <Typography
              sx={{
                fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                fontSize: '0.875rem',
                color: 'var(--glass-text-gray-light)',
                fontStyle: 'italic',
              }}
            >
              开始编辑字段以查看预览...
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
