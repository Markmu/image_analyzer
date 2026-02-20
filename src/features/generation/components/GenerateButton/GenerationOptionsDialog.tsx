/**
 * Generation Options Dialog Component
 *
 * Epic 6 - Story 6.1: Image Generation
 * Dialog component for configuring generation options
 */

'use client';

import {
  Box,
  Paper,
  Typography,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { X } from 'lucide-react';
import type { Template } from '@/features/templates/types/template';
import type { ResolutionPreset, SubscriptionTier, GenerationProgress } from '../../types';
import type { BatchGenerationProgress } from '../../types/progress';
import { RESOLUTION_PRESETS, DEFAULT_GENERATION_OPTIONS } from '../../lib/generation-presets';
import { calculateCreditCost, getUpgradeMessage, getResolutionsForTier, isResolutionAvailable } from '../../lib/resolution-config';
import { useUserInfo } from '@/features/auth/hooks/useUserInfo';
import { useState, useEffect, useMemo } from 'react';

export interface GenerationOptionsDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Template to use for generation */
  template: Template;
  /** Callback when dialog closes */
  onClose: () => void;
  /** Callback when generation starts */
  onGenerationStart: () => void;
  /** Callback when generation completes */
  onGenerationComplete: (result: import('../../types').ImageGenerationResult) => void;
  /** Callback when generation fails */
  onGenerationError: () => void;
  /** Callback when progress updates */
  onProgressUpdate?: (progress: GenerationProgress | BatchGenerationProgress) => void;
}

/**
 * GenerationOptionsDialog component
 *
 * Features:
 * - Select model provider (AC2)
 * - Select resolution (AC6)
 * - Select quantity (AC7)
 * - Display credit cost (AC2)
 * - Save preferences to localStorage (AC2)
 */
export function GenerationOptionsDialog({
  open,
  template,
  onClose,
  onGenerationStart,
  onGenerationComplete,
  onGenerationError,
  onProgressUpdate,
}: GenerationOptionsDialogProps) {
  // Get user subscription tier
  const { user } = useUserInfo();
  const subscriptionTier: SubscriptionTier = user?.subscriptionTier || 'free';

  // Get available resolutions for user's subscription tier
  const availableResolutions = useMemo(() => {
    return getResolutionsForTier(subscriptionTier);
  }, [subscriptionTier]);

  // Default options (would load from localStorage in production)
  const [selectedResolution, setSelectedResolution] = useState<ResolutionPreset>(() => {
    // Try to load saved preference, otherwise use first available
    const savedPrefs = typeof window !== 'undefined' ? localStorage.getItem('generation-preferences') : null;
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.resolution && isResolutionAvailable(prefs.resolution, subscriptionTier)) {
          return prefs.resolution;
        }
      } catch (error) {
        console.error('Failed to load generation preferences:', error);
      }
    }
    return availableResolutions[0] || DEFAULT_GENERATION_OPTIONS.resolution;
  });
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    DEFAULT_GENERATION_OPTIONS.quantity
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('generation-preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.resolution) setSelectedResolution(prefs.resolution);
        if (prefs.quantity) setSelectedQuantity(prefs.quantity);
      } catch (error) {
        console.error('Failed to load generation preferences:', error);
      }
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    try {
      const prefs = {
        resolution: selectedResolution,
        quantity: selectedQuantity,
      };
      localStorage.setItem('generation-preferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save generation preferences:', error);
    }
  }, [selectedResolution, selectedQuantity]);

  const handleGenerate = async () => {
    if (!user?.id) {
      console.error('[GenerationOptionsDialog] User not authenticated');
      return;
    }

    setIsGenerating(true);
    onGenerationStart();

    try {
      // Call generation API
      const { generateImage } = await import('../../lib/image-generation');

      const result = await generateImage(
        {
          provider: 'stability-ai',
          model: 'stability-ai/sdxl',
          resolution: selectedResolution,
          quantity: selectedQuantity,
          template,
        },
        user.id,
        (progress) => {
          // Handle progress updates
          console.log('[GenerationOptionsDialog] Progress:', progress);
          onProgressUpdate?.(progress);
        }
      );

      onGenerationComplete(result);
    } catch (error) {
      console.error('[GenerationOptionsDialog] Generation failed:', error);
      onGenerationError();
    } finally {
      setIsGenerating(false);
    }
  };

  const totalCredits = calculateCreditCost(selectedResolution, selectedQuantity);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'ia-glass-card ia-glass-card--static',
        sx: {
          backgroundColor: 'var(--glass-bg-dark)',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--glass-text-white-heavy)',
          fontWeight: 700,
        }}
      >
        生成选项配置
        <Button
          onClick={onClose}
          disabled={isGenerating}
          startIcon={<X size={16} />}
          sx={{ minWidth: 'auto', color: 'var(--glass-text-gray-medium)' }}
        />
      </DialogTitle>

      <DialogContent>
        {/* Model Provider Selection (AC2) */}
        <Box mb={3}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: 'var(--glass-text-gray-medium)' }}
          >
            模型提供商
          </Typography>
          <FormControl component="fieldset" disabled={isGenerating}>
            <RadioGroup
              value="stability-ai"
            >
              <FormControlLabel
                value="stability-ai"
                control={<Radio />}
                label="Stability AI (Stable Diffusion XL)"
                sx={{
                  color: 'var(--glass-text-white-medium)',
                  '& .MuiFormControlLabel-label': {
                    color: 'var(--glass-text-white-medium)',
                  },
                }}
              />
            </RadioGroup>
          </FormControl>
          <Typography variant="caption" sx={{ color: 'var(--glass-text-gray-heavy)' }}>
            预计生成时间: ~15 秒
          </Typography>
        </Box>

        {/* Resolution Selection (AC6) */}
        <Box mb={3}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: 'var(--glass-text-gray-medium)' }}
          >
            分辨率
          </Typography>
          <FormControl component="fieldset" disabled={isGenerating}>
            <RadioGroup
              value={selectedResolution.name}
              onChange={(e) => {
                const resolution = availableResolutions.find(
                  (r) => r.name === e.target.value
                );
                if (resolution) setSelectedResolution(resolution);
              }}
            >
              {availableResolutions.map((resolution) => (
                <FormControlLabel
                  key={resolution.name}
                  value={resolution.name}
                  control={<Radio />}
                  label={`${resolution.name} (${resolution.creditCost} credit)`}
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
          {getUpgradeMessage(selectedResolution) && (
            <Typography variant="caption" sx={{ color: 'var(--glass-text-primary)' }}>
              {getUpgradeMessage(selectedResolution)}
            </Typography>
          )}
        </Box>

        {/* Quantity Selection (AC7) */}
        <Box mb={3}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: 'var(--glass-text-gray-medium)' }}
          >
            生成数量
          </Typography>
          <FormControl component="fieldset" disabled={isGenerating}>
            <RadioGroup
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4].map((qty) => (
                <FormControlLabel
                  key={qty}
                  value={qty}
                  control={<Radio />}
                  label={`${qty} 张`}
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

        {/* Credit Cost Summary */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            backgroundColor: 'var(--glass-bg-light)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'var(--glass-text-white-medium)' }}
          >
            总计消耗: <strong>{totalCredits} credits</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={isGenerating}
          sx={{ color: 'var(--glass-text-gray-medium)' }}
        >
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={isGenerating}
          sx={{
            bgcolor: 'var(--glass-text-primary)',
            color: 'var(--glass-text-white-heavy)',
            '&:hover': { bgcolor: 'var(--primary-active)' },
          }}
        >
          {isGenerating ? '生成中...' : '开始生成'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
