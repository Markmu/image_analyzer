'use client';

import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, Collapse } from '@mui/material';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisData } from '@/types/analysis';
import { TemplateEditor, useTemplateGeneration } from '@/features/templates';

interface TemplateGenerationSectionProps {
  /** Analysis data to generate template from */
  analysisData: AnalysisData;
  /** Analysis result ID */
  analysisResultId: string;
  /** User ID */
  userId: string;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Template generation section integrated into analysis results
 *
 * Features:
 * - Auto-generate template from analysis data
 * - Edit template in place
 * - Copy template to clipboard
 * - Save to template library
 * - Expandable/collapsible (300ms animation)
 */
export function TemplateGenerationSection({
  analysisData,
  analysisResultId,
  userId,
  'data-testid': testId,
}: TemplateGenerationSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Generate template from analysis data
  const { template } = useTemplateGeneration(analysisData, {
    analysisResultId,
    userId,
  });

  if (!template) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      className="ia-glass-card ia-glass-card--static ia-glass-card--lg"
      sx={{
        mt: 3,
        p: 3,
        backgroundColor: 'var(--glass-bg-dark)',
        backgroundImage: 'none',
      }}
      data-testid={testId || 'template-generation-section'}
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
          pb: 2.5,
          borderBottom: '1px solid var(--glass-border-white-light)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: '10px',
              background: 'var(--glass-bg-purple-medium)',
              border: '1px solid var(--glass-border-white-medium)',
            }}
          >
            <Sparkles size={22} color="#A855F7" aria-hidden="true" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--glass-text-white-heavy)' }}>
            提示词模版
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          data-testid="toggle-template-section"
        >
          {expanded ? '收起模版' : '展开模版'}
        </Button>
      </Box>

      {/* Template Editor (expandable, 300ms animation) */}
      <Collapse in={expanded} timeout={300}>
        <TemplateEditor
          template={template}
          showSaveButton={false}
          data-testid="template-editor-in-analysis"
        />
      </Collapse>
    </Paper>
  );
}
