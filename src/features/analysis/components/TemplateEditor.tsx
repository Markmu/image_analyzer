'use client';

import { useMemo } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { RotateCcw } from 'lucide-react';

export interface TemplateEditorProps {
  templateContent: string;
  renderedTemplate: string;
  variables: Record<string, string>;
  onVariableChange: (key: string, value: string) => void;
  onResetVariables: () => void;
}

const extractVariables = (template: string): string[] => {
  const matches = template.match(/\[([^\]]+)\]/g) || [];
  return [...new Set(matches.map((entry) => entry.slice(1, -1).trim()).filter(Boolean))];
};

export default function TemplateEditor({
  templateContent,
  renderedTemplate,
  variables,
  onVariableChange,
  onResetVariables,
}: TemplateEditorProps) {
  const variablesList = useMemo(() => extractVariables(templateContent), [templateContent]);

  const segments = useMemo(
    () => (renderedTemplate || '').split(/(\[[^\]]+\])/g),
    [renderedTemplate]
  );

  const hasVariables = variablesList.length > 0;

  // 安全检查
  if (!renderedTemplate) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 预览区域 */}
      <Box>
        <Typography
          variant="caption"
          sx={{ color: 'var(--glass-text-gray-heavy)', display: 'block', mb: 1 }}
        >
          预览
        </Typography>
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
                aria-label={`变量: ${segment.slice(1, -1)}`}
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

      {/* 变量编辑区域 */}
      <Box>
        {!hasVariables ? (
          <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-heavy)' }}>
            当前模版不包含可替换变量。
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {variablesList.map((variable) => (
              <TextField
                key={variable}
                size="small"
                label={variable}
                value={variables[variable] || ''}
                onChange={(event) => onVariableChange(variable, event.target.value)}
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
                    '&.Mui-focused fieldset': { borderColor: 'var(--glass-text-primary)' },
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* 重置按钮 */}
        {hasVariables && (
          <Button
            variant="text"
            size="small"
            startIcon={<RotateCcw size={14} />}
            onClick={onResetVariables}
            aria-label="重置所有变量"
            sx={{
              mt: 1.5,
              color: 'var(--glass-text-gray-heavy)',
              fontSize: '0.75rem',
              '&:hover': {
                color: 'var(--glass-text-white-medium)',
                backgroundColor: 'rgba(148, 163, 184, 0.08)',
              },
            }}
          >
            重置所有变量
          </Button>
        )}
      </Box>
    </Box>
  );
}
