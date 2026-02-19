'use client';

import { Box, Typography } from '@mui/material';

interface TemplatePreviewProps {
  content: string;
}

export default function TemplatePreview({ content }: TemplatePreviewProps) {
  const segments = content.split(/(\[[^\]]+\])/g);

  return (
    <Box>
      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
        可编辑模版预览
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          borderRadius: 2,
          border: '1px solid rgba(148, 163, 184, 0.35)',
          background: 'rgba(15, 23, 42, 0.72)',
          color: '#e2e8f0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        }}
      >
        {segments.map((segment, index) => {
          const isVariable = /^\[[^\]]+\]$/.test(segment);
          if (!isVariable) return <span key={index}>{segment}</span>;

          return (
            <span
              key={index}
              style={{
                color: '#22c55e',
                fontWeight: 700,
              }}
            >
              {segment}
            </span>
          );
        })}
      </Box>
    </Box>
  );
}
