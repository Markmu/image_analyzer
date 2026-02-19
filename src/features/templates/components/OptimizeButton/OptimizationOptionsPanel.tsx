/**
 * Optimization Options Panel Component
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Panel component for configuring optimization options
 */

'use client';

import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
} from '@mui/material';
import {
  OptimizationMode,
  OptimizationTarget,
  OptimizationIntensity,
  OptimizationLanguage,
} from '@/features/templates/types';
import {
  OPTIMIZATION_MODES,
  OPTIMIZATION_TARGETS,
  OPTIMIZATION_INTENSITIES,
  OPTIMIZATION_LANGUAGES,
  saveOptimizationPreferences,
} from '@/features/templates/lib/optimization-constants';
import { useEffect } from 'react';

export interface OptimizationOptionsPanelProps {
  /** Current optimization mode */
  mode: OptimizationMode;
  /** Current optimization target */
  target: OptimizationTarget;
  /** Current optimization intensity */
  intensity: OptimizationIntensity;
  /** Current language */
  language: OptimizationLanguage;
  /** Callback when mode changes */
  onModeChange: (mode: OptimizationMode) => void;
  /** Callback when target changes */
  onTargetChange: (target: OptimizationTarget) => void;
  /** Callback when intensity changes */
  onIntensityChange: (intensity: OptimizationIntensity) => void;
  /** Callback when language changes */
  onLanguageChange: (language: OptimizationLanguage) => void;
  /** Callback when user confirms optimization */
  onConfirm: () => void;
  /** Whether the panel is loading */
  loading?: boolean;
}

/**
 * OptimizationOptionsPanel component
 *
 * Features:
 * - Configure optimization mode, target, intensity, and language
 * - Auto-save preferences to localStorage (AC7)
 * - Glassmorphism styling
 */
export function OptimizationOptionsPanel({
  mode,
  target,
  intensity,
  language,
  onModeChange,
  onTargetChange,
  onIntensityChange,
  onLanguageChange,
  onConfirm,
  loading = false,
}: OptimizationOptionsPanelProps) {
  // Auto-save preferences when options change (AC7)
  useEffect(() => {
    saveOptimizationPreferences({ lastMode: mode, lastTarget: target, lastIntensity: intensity, lastLanguage: language });
  }, [mode, target, intensity, language]);

  return (
    <Paper
      className="ia-glass-card ia-glass-card--static"
      sx={{
        p: 3,
        backgroundColor: 'var(--glass-bg-dark)',
        backgroundImage: 'none',
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 700 }}
      >
        优化选项配置
      </Typography>

      {/* Optimization Mode */}
      <Box mb={3}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: 'var(--glass-text-gray-medium)' }}
        >
          优化模式
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={mode}
            onChange={(e) => onModeChange(e.target.value as OptimizationMode)}
          >
            {(Object.keys(OPTIMIZATION_MODES) as OptimizationMode[]).map((modeKey) => (
              <FormControlLabel
                key={modeKey}
                value={modeKey}
                control={<Radio />}
                label={`${OPTIMIZATION_MODES[modeKey].label} (${OPTIMIZATION_MODES[modeKey].credits} credit)`}
                disabled={loading}
                sx={{
                  color: 'var(--glass-text-white-medium)',
                  '& .MuiFormControlLabel-label': {
                    color: 'var(--glass-text-white-medium)',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-heavy)' }}>
          {OPTIMIZATION_MODES[mode].description}
        </Typography>
      </Box>

      {/* Optimization Target */}
      <Box mb={3}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: 'var(--glass-text-gray-medium)' }}
        >
          优化目标
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={target}
            onChange={(e) => onTargetChange(e.target.value as OptimizationTarget)}
          >
            {(Object.keys(OPTIMIZATION_TARGETS) as OptimizationTarget[]).map((targetKey) => (
              <FormControlLabel
                key={targetKey}
                value={targetKey}
                control={<Radio />}
                label={OPTIMIZATION_TARGETS[targetKey].label}
                disabled={loading}
                sx={{
                  color: 'var(--glass-text-white-medium)',
                  '& .MuiFormControlLabel-label': {
                    color: 'var(--glass-text-white-medium)',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Optimization Intensity */}
      <Box mb={3}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: 'var(--glass-text-gray-medium)' }}
        >
          优化强度
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={intensity}
            onChange={(e) => onIntensityChange(e.target.value as OptimizationIntensity)}
          >
            {(Object.keys(OPTIMIZATION_INTENSITIES) as OptimizationIntensity[]).map((intensityKey) => (
              <FormControlLabel
                key={intensityKey}
                value={intensityKey}
                control={<Radio />}
                label={OPTIMIZATION_INTENSITIES[intensityKey].label}
                disabled={loading}
                sx={{
                  color: 'var(--glass-text-white-medium)',
                  '& .MuiFormControlLabel-label': {
                    color: 'var(--glass-text-white-medium)',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Language Selection */}
      <Box mb={3}>
        <Typography
          variant="subtitle2"
          gutterBottom
          sx={{ color: 'var(--glass-text-gray-medium)' }}
        >
          语言
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as OptimizationLanguage)}
          >
            {(Object.keys(OPTIMIZATION_LANGUAGES) as OptimizationLanguage[]).map((langKey) => (
              <FormControlLabel
                key={langKey}
                value={langKey}
                control={<Radio />}
                label={OPTIMIZATION_LANGUAGES[langKey].label}
                disabled={loading}
                sx={{
                  color: 'var(--glass-text-white-medium)',
                  '& .MuiFormControlLabel-label': {
                    color: 'var(--glass-text-white-medium)',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Confirm Button */}
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onConfirm}
          disabled={loading}
          sx={{
            bgcolor: 'var(--glass-text-primary)',
            color: 'var(--glass-text-white-heavy)',
            '&:hover': { bgcolor: 'var(--primary-active)' },
          }}
        >
          {loading ? '优化中...' : '开始优化'}
        </Button>
      </Box>
    </Paper>
  );
}
