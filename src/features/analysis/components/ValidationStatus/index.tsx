'use client';

import React from 'react';
import { Alert, AlertTitle, Box, Collapse, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import { CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import type { ValidationResult, ValidationError, ValidationWarning } from '@/lib/utils/image-validation';

export interface ValidationStatusProps {
  result: ValidationResult | null;
  onContinueAnyway?: () => void;
  onChangeImage?: () => void;
  isMobile?: boolean;
}

/**
 * Validation Status Component
 * Displays validation results with appropriate styling and actions
 */
export function ValidationStatus({ result, onContinueAnyway, onChangeImage, isMobile = false }: ValidationStatusProps) {
  if (!result) {
    return null;
  }

  // Errors block upload
  if (result.errors.length > 0) {
    return <ValidationError errors={result.errors} isMobile={isMobile} />;
  }

  // Warnings allow user to decide
  if (result.warnings.length > 0) {
    return (
      <ValidationWarning
        warnings={result.warnings}
        onContinueAnyway={onContinueAnyway}
        onChangeImage={onChangeImage}
        isMobile={isMobile}
      />
    );
  }

  // Success - all validations passed
  return (
    <Alert
      icon={<CheckCircle sx={{ color: '#22C55E' }} />}
      severity="success"
      sx={{
        mt: 3,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        color: '#22C55E',
        border: '1px solid #22C55E',
        borderRadius: '8px',
      }}
      data-testid="validation-status"
    >
      <AlertTitle>图片验证通过</AlertTitle>
      图片符合所有要求,可以开始分析。
    </Alert>
  );
}

interface ValidationErrorProps {
  errors: ValidationError[];
  isMobile?: boolean;
}

/**
 * Validation Error Component
 * Displays error messages with optional details
 */
function ValidationError({ errors, isMobile = false }: ValidationErrorProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Alert
      icon={<ErrorIcon sx={{ color: '#EF4444' }} />}
      severity="error"
      sx={{
        mt: 3,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        color: '#EF4444',
        border: '1px solid #EF4444',
        borderRadius: '8px',
      }}
      data-testid="validation-error"
    >
      <AlertTitle>图片验证失败</AlertTitle>
      <List disablePadding>
        {errors.map((error, index) => (
          <ListItem key={index} disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <ListItemText
              primary={error.message}
              primaryTypographyProps={{
                variant: 'body2',
                sx: { color: 'rgba(255, 255, 255, 0.9)' },
              }}
            />
            {error.details && isMobile && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}
                data-testid="view-details-btn"
              >
                {expanded ? '隐藏' : '查看详细建议'}
              </Button>
            )}
            {error.details && (!isMobile || expanded) && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                  width: '100%',
                }}
                data-testid="error-details"
              >
                {Object.entries(error.details).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {key}:
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', ml: 1 }}>
                      {String(value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Alert>
  );
}

interface ValidationWarningProps {
  warnings: ValidationWarning[];
  onContinueAnyway?: () => void;
  onChangeImage?: () => void;
  isMobile?: boolean;
}

/**
 * Validation Warning Component
 * Displays warnings with action buttons for degraded processing
 */
function ValidationWarning({ warnings, onContinueAnyway, onChangeImage, isMobile = false }: ValidationWarningProps) {
  return (
    <Alert
      icon={<Warning sx={{ color: '#FBBF24' }} />}
      severity="warning"
      sx={{
        mt: 3,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        color: '#FBBF24',
        border: '1px solid #FBBF24',
        borderRadius: '8px',
      }}
      data-testid="validation-warning"
    >
      <AlertTitle>这张图片可能不适合分析</AlertTitle>
      <List disablePadding>
        {warnings.map((warning, index) => (
          <ListItem key={index} disablePadding sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <ListItemText
              primary={warning.message}
              secondary={warning.suggestion}
              primaryTypographyProps={{
                variant: 'body2',
                sx: { color: 'rgba(255, 255, 255, 0.9)' },
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {onChangeImage && (
          <Button
            variant="outlined"
            onClick={onChangeImage}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              minWidth: isMobile ? '100%' : 'auto',
              minHeight: isMobile ? '48px' : 'auto',
            }}
            data-testid="change-image-btn"
          >
            更换图片
          </Button>
        )}
        {onContinueAnyway && (
          <Button
            variant="contained"
            onClick={onContinueAnyway}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              backgroundColor: '#FBBF24',
              color: '#000',
              minWidth: isMobile ? '100%' : 'auto',
              minHeight: isMobile ? '48px' : 'auto',
              '&:hover': {
                backgroundColor: '#F59E0B',
              },
            }}
            data-testid="continue-anyway-btn"
          >
            继续尝试
          </Button>
        )}
      </Box>
    </Alert>
  );
}

export default ValidationStatus;
