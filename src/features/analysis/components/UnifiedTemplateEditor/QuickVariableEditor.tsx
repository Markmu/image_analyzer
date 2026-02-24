'use client';

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';

export interface QuickVariableEditorProps {
  /** Template content to extract variables from */
  templateContent: string;
  /** Callback when a variable value changes */
  onVariableChange: (name: string, value: string) => void;
}

/**
 * Quick variable editor component
 *
 * Features:
 * - Extracts variables from template text using regex /\[([^\]]+)\]/g
 * - Deduplicates variable names using Set
 * - Displays variable name and value input fields
 * - When variable value changes, syncs to template text (via parent component)
 * - Real-time updates: onChange event syncs immediately
 * - Handles edge cases:
 *   - Empty variable values: shown as gray placeholder
 *   - Duplicate variable names: deduplicated, only one shown
 *
 * @example
 * ```tsx
 * <QuickVariableEditor
 *   templateContent="Create [subject] in [style] style"
 *   onVariableChange={(name, value) => console.log(name, value)}
 * />
 * ```
 */
export function QuickVariableEditor({
  templateContent,
  onVariableChange,
}: QuickVariableEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Track previous variables to detect changes
  const prevVarsRef = useRef<string>('');

  // Extract variables from template content
  const variables = useMemo(() => {
    const matches = templateContent.match(/\[([^\]]+)\]/g) || [];
    const uniqueVars = [...new Set(matches.map((entry) => entry.slice(1, -1).trim()).filter(Boolean))];
    return uniqueVars;
  }, [templateContent]);

  // Store variable values internally
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});

  // Initialize variable values when variables change
  useEffect(() => {
    const varsKey = variables.join(',');
    if (prevVarsRef.current !== varsKey) {
      prevVarsRef.current = varsKey;

      // Preserve existing values for variables that still exist
      setVariableValues((prev) => {
        const newValues: Record<string, string> = {};
        variables.forEach((name) => {
          newValues[name] = prev[name] || '';
        });
        return newValues;
      });
    }
  }, [variables]);

  // Handle variable value change
  const handleValueChange = useCallback(
    (name: string, value: string) => {
      setVariableValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Notify parent component
      onVariableChange(name, value);
    },
    [onVariableChange]
  );

  if (variables.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px dashed var(--glass-border)',
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: 'var(--glass-text-gray-heavy)', textAlign: 'center' }}
        >
          在模板中输入 [变量名] 创建变量
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        maxHeight: isMobile ? 'none' : '100%',
        overflowY: 'auto',
        pr: 1,
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(15, 23, 42, 0.3)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(148, 163, 184, 0.4)',
          borderRadius: '3px',
          '&:hover': {
            background: 'rgba(148, 163, 184, 0.6)',
          },
        },
      }}
      data-testid="quick-variable-editor"
    >
      {variables.map((variable) => (
        <TextField
          key={variable}
          size="small"
          fullWidth
          label={variable}
          value={variableValues[variable] || ''}
          onChange={(e) => handleValueChange(variable, e.target.value)}
          placeholder={`输入 ${variable} 的值...`}
          slotProps={{
            inputLabel: {
              sx: {
                color: 'var(--glass-text-gray-heavy)',
                fontSize: '0.8125rem',
              },
            },
            input: {
              sx: {
                color: 'var(--glass-text-white-medium)',
                fontSize: '0.875rem',
                '&::placeholder': {
                  color: 'var(--glass-text-gray-medium)',
                  opacity: 1,
                },
              },
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
          data-testid={`variable-input-${variable}`}
        />
      ))}
    </Box>
  );
}
