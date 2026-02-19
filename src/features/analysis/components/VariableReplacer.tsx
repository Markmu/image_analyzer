'use client';

import { useMemo } from 'react';
import { Box, TextField, Typography } from '@mui/material';

interface VariableReplacerProps {
  template: string;
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
}

const extractVariables = (template: string): string[] => {
  const matches = template.match(/\[([^\]]+)\]/g) || [];
  return [...new Set(matches.map((entry) => entry.slice(1, -1).trim()).filter(Boolean))];
};

export default function VariableReplacer({ template, values, onValueChange }: VariableReplacerProps) {
  const variables = useMemo(() => extractVariables(template), [template]);

  if (variables.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
        当前模版不包含可替换变量。
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {variables.map((variable) => (
        <TextField
          key={variable}
          size="small"
          label={variable}
          value={values[variable] || ''}
          onChange={(event) => onValueChange(variable, event.target.value)}
          slotProps={{
            inputLabel: {
              sx: { color: '#94a3b8' },
            },
            input: {
              sx: { color: '#e2e8f0' },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
              '&:hover fieldset': { borderColor: 'rgba(34, 197, 94, 0.45)' },
              '&.Mui-focused fieldset': { borderColor: '#22c55e' },
            },
          }}
        />
      ))}
    </Box>
  );
}
