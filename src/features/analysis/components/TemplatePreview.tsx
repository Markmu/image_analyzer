'use client';

import { Box, Typography } from '@mui/material';

interface TemplatePreviewProps {
  content: string;
  showLabel?: boolean;
}

export default function TemplatePreview({
  content,
  showLabel = true,
}: TemplatePreviewProps) {
  const segments = content.split(/(\[[^\]]+\])/g);

  return (
    <Box>
      {showLabel ? (
        <Typography
          variant="caption"
          sx={{ color: 'var(--glass-text-gray-heavy)', display: 'block', mb: 1 }}
        >
          可编辑模版预览
        </Typography>
      ) : null}
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
        }}
      >
        {segments.map((segment, index) => {
          const isVariable = /^\[[^\]]+\]$/.test(segment);
          if (!isVariable) return <span key={index}>{segment}</span>;

          return (
            <span
              key={index}
              style={{
                color: 'var(--glass-text-primary)',
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
