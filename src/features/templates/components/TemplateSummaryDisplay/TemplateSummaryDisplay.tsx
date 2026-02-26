/**
 * Template Summary Display Component
 *
 * Epic 7 - Story 7.2: Template Library
 * Detail Page Optimization - Core Parameters Summary
 *
 * Displays a read-only summary of the template's core parameters.
 * This component is designed to replace the JSON string display with
 * a user-friendly view of the template fields.
 */

'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Card, Grid, Chip } from '@mui/material';
import type { TemplateJSONFormat, TemplateFieldKey } from '../../types/template';
import { FIELD_CONFIGS } from '../../lib/field-configs';
import { GLASS_CARD_SX, GLASS_TEXT_COLORS, GLASS_BORDER_COLORS } from '../../styles';

export interface TemplateSummaryDisplayProps {
  /** Template JSON format data */
  jsonFormat: TemplateJSONFormat | null;
  /** Optional className */
  className?: string;
  /** Whether to show labels (default: true) */
  showLabels?: boolean;
  /** Test ID */
  'data-testid'?: string;
}

/**
 * Field summary item component
 */
interface FieldSummaryItemProps {
  label: string;
  value: string;
  color?: string;
}

function FieldSummaryItem({ label, value, color }: FieldSummaryItemProps) {
  if (!value || !value.trim()) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2,
        '&:last-child': { mb: 0 },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: GLASS_TEXT_COLORS.grayMedium,
          fontWeight: 500,
          display: 'block',
          mb: 0.5,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.7rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: GLASS_TEXT_COLORS.whiteMedium,
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/**
 * Template Summary Display
 *
 * Shows a read-only summary of template fields in a user-friendly format.
 * Fields are displayed in the order defined by FIELD_CONFIGS.
 *
 * Features:
 * - Read-only field display
 * - Glassmorphism styling
 * - Responsive layout (grid on desktop, stack on mobile)
 * - Handles null/empty data gracefully
 * - Truncates long text with visual indication
 */
export function TemplateSummaryDisplay({
  jsonFormat,
  className,
  showLabels = true,
  'data-testid': testId = 'template-summary-display',
}: TemplateSummaryDisplayProps) {
  // Calculate filled fields count
  const filledFieldsCount = useMemo(() => {
    if (!jsonFormat) return 0;
    return Object.values(jsonFormat).filter((value) => value && value.trim()).length;
  }, [jsonFormat]);

  // Check if any data is available
  const hasData = filledFieldsCount > 0;

  // Get field entries in order
  const fieldEntries = useMemo(() => {
    return Object.entries(FIELD_CONFIGS) as Array<[string, typeof FIELD_CONFIGS[keyof typeof FIELD_CONFIGS]]>;
  }, []);

  if (!jsonFormat) {
    return (
      <Card
        className={`ia-glass-card ia-glass-card--static ${className || ''}`}
        sx={{
          p: 3,
          backgroundColor: 'var(--glass-bg-dark)',
          backgroundImage: 'none',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          boxShadow: 'var(--glass-shadow)',
        }}
        data-testid={testId}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            px: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: GLASS_TEXT_COLORS.grayMedium,
              fontStyle: 'italic',
            }}
          >
            暂无模板数据
          </Typography>
        </Box>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card
        className={`ia-glass-card ia-glass-card--static ${className || ''}`}
        sx={{
          p: 3,
          backgroundColor: 'var(--glass-bg-dark)',
          backgroundImage: 'none',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          boxShadow: 'var(--glass-shadow)',
        }}
        data-testid={testId}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            px: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: GLASS_TEXT_COLORS.grayMedium,
              fontStyle: 'italic',
            }}
          >
            模板数据为空
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      className={`ia-glass-card ia-glass-card--static ${className || ''}`}
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: 'var(--glass-bg-dark)',
        backgroundImage: 'none',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: 'var(--glass-shadow)',
      }}
      data-testid={testId}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          pb: 1.5,
          borderBottom: `1px solid ${GLASS_BORDER_COLORS.whiteLight}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: GLASS_TEXT_COLORS.whiteHeavy,
            fontWeight: 600,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
          }}
        >
          核心参数
        </Typography>
        <Chip
          label={`${filledFieldsCount} / ${Object.keys(FIELD_CONFIGS).length}`}
          size="small"
          sx={{
            backgroundColor: 'var(--glass-bg-blue-medium)',
            color: GLASS_TEXT_COLORS.whiteMedium,
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      </Box>

      {/* Fields Grid */}
      <Grid container spacing={3}>
        {fieldEntries.map(([key, config]) => {
          const value = jsonFormat[config.key as TemplateFieldKey];

          // Skip empty fields
          if (!value || !value.trim()) {
            return null;
          }

          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={config.key}
              data-testid={`template-summary-field-${config.key}`}
            >
              <FieldSummaryItem
                label={config.label}
                value={value}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Empty state hint - only shown if some fields are missing */}
      {filledFieldsCount < Object.keys(FIELD_CONFIGS).length && (
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: `1px solid ${GLASS_BORDER_COLORS.whiteLight}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: GLASS_TEXT_COLORS.grayLight,
              fontStyle: 'italic',
            }}
          >
            部分字段未填写，点击"高级编辑"补充信息
          </Typography>
        </Box>
      )}
    </Card>
  );
}
