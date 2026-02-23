'use client';

import React from 'react';
import { Box } from '@mui/material';

export interface TemplatePreviewProps {
  /** Template content to render */
  templateContent: string;
  /** Variables extracted from template */
  variables: Array<{ name: string; value: string }>;
}

/**
 * Template preview component with variable highlighting
 *
 * Features:
 * - Renders template content with variable highlighting
 * - Highlights [variable] format placeholders
 * - Non-variable square brackets like [普通文本] are NOT highlighted
 *
 * @example
 * ```tsx
 * <TemplatePreview
 *   templateContent="Create [subject] in [style] style"
 *   variables={[{ name: 'subject', value: 'a cat' }, { name: 'style', value: 'watercolor' }]}
 * />
 * ```
 */
export function TemplatePreview({ templateContent, variables }: TemplatePreviewProps) {
  // Create variable map for quick lookup
  const variableMap = React.useMemo(
    () => new Map(variables.map((v) => [v.name, v.value])),
    [variables]
  );

  // Split template into segments for rendering
  const segments = React.useMemo(() => {
    if (!templateContent) return [];
    return templateContent.split(/(\[[^\]]+\])/g);
  }, [templateContent]);

  // Check if a segment is a variable placeholder
  const isVariable = (segment: string): boolean => {
    return /^\[[^\]]+\]$/.test(segment);
  };

  // Extract variable name from placeholder
  const getVariableName = (placeholder: string): string => {
    return placeholder.slice(1, -1).trim();
  };

  // Render each segment
  const renderSegments = () => {
    return segments.map((segment, index) => {
      if (!isVariable(segment)) {
        // Regular text
        return <span key={index}>{segment}</span>;
      }

      // Variable placeholder
      const varName = getVariableName(segment);
      const varValue = variableMap.get(varName);

      return (
        <span
          key={index}
          aria-label={`变量: ${varName}`}
          style={{
            color: 'var(--glass-text-primary)',
            fontWeight: 700,
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            padding: '0.1em 0.3em',
            borderRadius: '0.25em',
            margin: '0 0.1em',
          }}
        >
          {varValue || segment}
        </span>
      );
    });
  };

  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 1.75,
        borderRadius: 2,
        border: '1px solid rgba(148, 163, 184, 0.22)',
        background: 'rgba(15, 23, 42, 0.35)',
        color: 'var(--glass-text-white-medium)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
        fontSize: '0.8125rem',
        lineHeight: 1.5,
        height: '100%',
        overflow: 'auto',
      }}
      data-testid="template-preview"
    >
      {segments.length > 0 ? renderSegments() : <span style={{ color: 'var(--glass-text-gray-medium)' }}>模板预览区域</span>}
    </Box>
  );
}
