'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Tab, Tabs } from '@mui/material';
import type { Template } from '../../types';
import { highlightVariables, formatTemplateAsJSON } from '../../lib';

interface TemplatePreviewProps {
  /** Template to preview */
  template: Template;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Template preview with syntax highlighting
 *
 * Features:
 * - Highlight variables in different color
 * - Support variable format and JSON format
 * - Responsive layout
 * - Glassmorphism styling
 */
export function TemplatePreview({ template, 'data-testid': testId }: TemplatePreviewProps) {
  const [tabValue, setTabValue] = React.useState(0);

  const highlightedSegments = useMemo(
    () => highlightVariables(template.variableFormat),
    [template.variableFormat]
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box data-testid={testId || 'template-preview'}>
      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            color: 'var(--glass-text-gray-medium)',
            fontWeight: 600,
            fontSize: '0.875rem',
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
        <Tab label="JSON 格式" />
      </Tabs>

      {/* Variable Format Preview */}
      {tabValue === 0 && (
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'var(--glass-text-gray-heavy)', display: 'block', mb: 1 }}
          >
            可编辑模版预览（变量已高亮）
          </Typography>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid rgba(148, 163, 184, 0.35)',
              background: 'var(--glass-bg-dark-heavy)',
              color: 'var(--glass-text-white-medium)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              fontSize: '0.875rem',
              lineHeight: 1.75,
            }}
          >
            {highlightedSegments.map((segment, index) => (
              <span
                key={index}
                style={{
                  color: segment.isVariable ? 'var(--glass-text-primary)' : 'inherit',
                  fontWeight: segment.isVariable ? 700 : 400,
                }}
              >
                {segment.text}
              </span>
            ))}
          </Box>
        </Box>
      )}

      {/* JSON Format Preview */}
      {tabValue === 1 && (
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'var(--glass-text-gray-heavy)', display: 'block', mb: 1 }}
          >
            JSON 格式预览
          </Typography>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid rgba(148, 163, 184, 0.35)',
              background: 'var(--glass-bg-dark-heavy)',
              color: 'var(--glass-text-white-medium)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
            }}
          >
            {formatTemplateAsJSON(template)}
          </Box>
        </Box>
      )}
    </Box>
  );
}
