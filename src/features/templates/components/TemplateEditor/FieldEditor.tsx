'use client';

import { useState, useCallback, useMemo } from 'react';
import { Box, TextField, Typography, Chip, Collapse, IconButton } from '@mui/material';
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import type { FieldConfig } from '../../types/editor';

interface FieldEditorProps {
  /** Field configuration */
  config: FieldConfig;
  /** Current field value */
  value: string;
  /** On value change callback */
  onChange: (value: string) => void;
  /** Whether field is focused */
  isFocused?: boolean;
  /** On focus callback */
  onFocus?: () => void;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Single field editor component with suggestions and validation
 *
 * Features:
 * - Field input with character counter
 * - Smart suggestions (clickable chips)
 * - Validation feedback
 * - Collapsible suggestions panel
 * - Required field indicator
 */
export function FieldEditor({
  config,
  value,
  onChange,
  isFocused = false,
  onFocus,
  'data-testid': testId,
}: FieldEditorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const error = useMemo(() => {
    if (config.validation) {
      return config.validation(value);
    }
    return null;
  }, [value, config]);

  // Handle value change
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (newValue.length <= config.maxLength) {
        onChange(newValue);
      }
    },
    [config.maxLength, onChange]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      onChange(suggestion);
    },
    [onChange]
  );

  // Toggle suggestions panel
  const handleToggleSuggestions = useCallback(() => {
    setShowSuggestions((prev) => !prev);
  }, []);

  // Handle focus
  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  const characterCount = value.length;
  const isNearLimit = characterCount > config.maxLength * 0.8;
  const isAtLimit = characterCount >= config.maxLength;
  const hasSuggestions = config.suggestions && config.suggestions.length > 0;

  return (
    <Box
      sx={{
        mb: 2,
        opacity: isFocused ? 1 : 0.9,
        transition: 'opacity 0.2s ease',
      }}
      data-testid={testId || `field-editor-${config.key}`}
    >
      {/* Field Label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'var(--glass-text-white-heavy)',
            }}
          >
            {config.label}
          </Typography>
          {config.required && (
            <Typography
              variant="caption"
              sx={{ color: 'var(--glass-text-primary)' }}
            >
              *
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Character counter */}
          <Typography
            variant="caption"
            sx={{
              color: isAtLimit
                ? '#ef4444'
                : isNearLimit
                ? '#f59e0b'
                : 'var(--glass-text-gray-medium)',
              fontWeight: isAtLimit || isNearLimit ? 600 : 400,
            }}
          >
            {characterCount}/{config.maxLength}
          </Typography>

          {/* Suggestions toggle */}
          {hasSuggestions && (
            <IconButton
              size="small"
              onClick={handleToggleSuggestions}
              sx={{
                color: 'var(--glass-text-gray-medium)',
                p: 0.5,
              }}
              data-testid={`toggle-suggestions-${config.key}`}
            >
              <Lightbulb size={16} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Field Input */}
      <TextField
        fullWidth
        multiline
        rows={config.key === 'additional' ? 4 : 2}
        placeholder={config.placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        error={!!error}
        helperText={error || (config.key === 'subject' || config.key === 'style' ? '必填字段' : '')}
        slotProps={{
          inputLabel: {
            sx: { color: 'var(--glass-text-gray-heavy)' },
          },
          input: {
            sx: {
              color: 'var(--glass-text-white-medium)',
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              fontSize: '0.875rem',
            },
          },
          formHelperText: {
            sx: {
              color: error ? '#ef4444' : 'var(--glass-text-gray-medium)',
              fontSize: '0.75rem',
              mt: 0.5,
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--glass-bg-dark-medium)',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: error
                ? '#ef4444'
                : isFocused
                ? 'var(--glass-border-active)'
                : 'rgba(148, 163, 184, 0.35)',
              borderWidth: isFocused ? '2px' : '1px',
            },
            '&:hover fieldset': {
              borderColor: error ? '#ef4444' : 'var(--glass-border-active)',
            },
            '&.Mui-focused fieldset': {
              borderColor: error ? '#ef4444' : '#22c55e',
            },
          },
        }}
        data-testid={`input-${config.key}`}
      />

      {/* Suggestions Panel */}
      {hasSuggestions && (
        <Collapse in={showSuggestions} timeout={300}>
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              backgroundColor: 'var(--glass-bg-light)',
              borderRadius: 1,
              border: '1px solid rgba(148, 163, 184, 0.2)',
            }}
            data-testid={`suggestions-${config.key}`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Lightbulb size={14} className="text-yellow-500" />
              <Typography
                variant="caption"
                sx={{ color: 'var(--glass-text-gray-heavy)', fontWeight: 500 }}
              >
                建议关键词
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {config.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--glass-bg-dark-medium)',
                    color: 'var(--glass-text-white-medium)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    '&:hover': {
                      backgroundColor: 'var(--glass-text-primary)',
                      color: 'var(--glass-text-white-heavy)',
                      borderColor: 'var(--glass-text-primary)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  data-testid={`suggestion-${config.key}-${index}`}
                />
              ))}
            </Box>
          </Box>
        </Collapse>
      )}

      {/* Validation Error */}
      {error && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <AlertCircle size={14} className="text-red-500" />
          <Typography
            variant="caption"
            sx={{ color: '#ef4444', fontSize: '0.75rem' }}
          >
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
