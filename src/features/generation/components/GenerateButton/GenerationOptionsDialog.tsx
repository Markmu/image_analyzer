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
import { Close } from 'lucide-react';
import type { Template } from '@/features/templates/types/template';
import type { ResolutionPreset } from '../../types';
import { RESOLUTION_PRESETS, DEFAULT_GENERATION_OPTIONS } from '../../lib/generation-presets';
import { calculateCreditCost, getUpgradeMessage } from '../../lib/resolution-config';
import { useState, useEffect } from 'react';

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
}: GenerationOptionsDialogProps) {
  // Default options (would load from localStorage in production)
  const [selectedResolution, setSelectedResolution] = useState<ResolutionPreset>(
    DEFAULT_GENERATION_OPTIONS.resolution
  );
  const [selectedQuantity, setSelectedQuantity] = useState(
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
    const prefs = {
      resolution: selectedResolution,
      quantity: selectedQuantity,
    };
    localStorage.setItem('generation-preferences', JSON.stringify(prefs));
  }, [selectedResolution, selectedQuantity]);

  const handleGenerate = async () => {
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
        (progress) => {
          // Handle progress updates
          console.log('[GenerationOptionsDialog] Progress:', progress);
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
          startIcon={<Close size={16} />}
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
          <FormControl component="fieldset">
            <RadioGroup
              value="stability-ai"
              disabled={isGenerating}
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
          <FormControl component="fieldset">
            <RadioGroup
              value={selectedResolution.name}
              onChange={(e) => {
                const resolution = RESOLUTION_PRESETS.free.find(
                  (r) => r.name === e.target.value
                );
                if (resolution) setSelectedResolution(resolution);
              }}
            >
              {RESOLUTION_PRESETS.free.map((resolution) => (
                <FormControlLabel
                  key={resolution.name}
                  value={resolution.name}
                  control={<Radio />}
                  label={`${resolution.name} (${resolution.creditCost} credit)`}
                  disabled={isGenerating}
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
          <FormControl component="fieldset">
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
                  disabled={isGenerating}
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
