'use client';

import { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import { ImageIcon, Wand2 } from 'lucide-react';
import type { Template } from '@/features/templates/types/template';
import type { ImageGenerationResult } from '../../types';
import { GenerationOptionsDialog } from './GenerationOptionsDialog';
import { GenerationProgressDialog } from '../GenerationProgressDialog';
import type { GenerationProgress, BatchGenerationProgress } from '../../types/progress';

interface GenerateButtonProps {
  /** Template to use for generation */
  template: Template | null;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Button variant */
  variant?: 'text' | 'outlined' | 'contained';
  /** Additional class name */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
  /** Callback when generation completes */
  onGenerationComplete?: (result: ImageGenerationResult) => void;
}

/**
 * Generate button with options dialog
 *
 * Features:
 * - Opens generation options dialog on click
 * - Shows loading state during generation
 * - Displays success/error feedback
 * - Integrates with template editor
 */
export function GenerateButton({
  template,
  size = 'small',
  variant = 'outlined',
  className,
  'data-testid': testId,
  onGenerationComplete,
}: GenerateButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<GenerationProgress | BatchGenerationProgress | null>(null);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleGenerationStart = () => {
    setIsGenerating(true);
  };

  const handleProgressUpdate = (progress: GenerationProgress | BatchGenerationProgress) => {
    setCurrentProgress(progress);
    // Show progress dialog after a short delay
    if (!showProgressDialog) {
      setTimeout(() => setShowProgressDialog(true), 500);
    }
  };

  const handleGenerationComplete = (result: ImageGenerationResult) => {
    setIsGenerating(false);
    setIsDialogOpen(false);
    setShowProgressDialog(false);
    setCurrentProgress(null);
    onGenerationComplete?.(result);
  };

  const handleGenerationError = () => {
    setIsGenerating(false);
    setShowProgressDialog(false);
    setCurrentProgress(null);
  };

  const handleCancelGeneration = () => {
    // Implement cancel logic
    setIsGenerating(false);
    setShowProgressDialog(false);
    setCurrentProgress(null);
  };

  const isDisabled = !template || isGenerating;

  return (
    <>
      <Tooltip title={isDisabled ? '请先创建模版' : '生成图片'} arrow>
        <Button
          size={size}
          variant={variant}
          onClick={handleOpenDialog}
          disabled={isDisabled}
          startIcon={isGenerating ? <Wand2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          className={className}
          data-testid={testId || 'generate-button'}
          sx={{
            minWidth: 'auto',
            '& .MuiButton-startIcon': {
              color: isDisabled ? 'rgba(0, 0, 0, 0.26)' : 'rgb(168, 85, 247)',
            },
          }}
        >
          {isGenerating ? '生成中...' : '生成图片'}
        </Button>
      </Tooltip>

      {template && (
        <>
          <GenerationOptionsDialog
            open={isDialogOpen}
            template={template}
            onClose={handleCloseDialog}
            onGenerationStart={handleGenerationStart}
            onGenerationComplete={handleGenerationComplete}
            onGenerationError={handleGenerationError}
            onProgressUpdate={handleProgressUpdate}
          />

          {currentProgress && (
            <GenerationProgressDialog
              open={showProgressDialog}
              onOpenChange={setShowProgressDialog}
              singleProgress={'totalItems' in currentProgress ? undefined : currentProgress}
              batchProgress={'totalItems' in currentProgress ? currentProgress : undefined}
              onCancel={handleCancelGeneration}
              onViewResults={() => {
                setShowProgressDialog(false);
                // Navigate to results or show preview dialog
              }}
            />
          )}
        </>
      )}
    </>
  );
}
