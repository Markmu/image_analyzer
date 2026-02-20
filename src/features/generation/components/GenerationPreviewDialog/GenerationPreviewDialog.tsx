/**
 * Generation Preview Dialog Component
 *
 * Epic 6 - Story 6.1: Image Generation
 * Dialog component for previewing generated images
 */

'use client';

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close,
  Download,
  Share2,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Save,
} from 'lucide-react';
import type { ImageGenerationResult, GeneratedImage } from '../../types';
import { useState } from 'react';
import { downloadImage, shareImage } from '../../lib/share-handler';
import { SaveOptionsDialog } from '../SaveOptionsDialog';
import type { ImageSaveOptions } from '../../types/save';

export interface GenerationPreviewDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Generation result to display */
  result: ImageGenerationResult | null;
  /** Callback when dialog closes */
  onClose: () => void;
  /** Callback when user clicks regenerate */
  onRegenerate?: () => void;
}

/**
 * GenerationPreviewDialog component
 *
 * Features:
 * - Display generated images (AC4)
 * - Support zoom (AC4)
 * - Show metadata (AC4)
 * - Download, share, regenerate buttons (AC4)
 * - Glassmorphism styling (AC8)
 */
export function GenerationPreviewDialog({
  open,
  result,
  onClose,
  onRegenerate,
}: GenerationPreviewDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  if (!result || result.images.length === 0) {
    return null;
  }

  const selectedImage = result.images[selectedImageIndex];
  const totalImages = result.images.length;

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = async () => {
    setSaveDialogOpen(true);
  };

  const handleSaveWithOptions = async (options: ImageSaveOptions) => {
    try {
      const { downloadImage: downloadWithOptions } = await import('../../lib/image-downloader');
      await downloadWithOptions(selectedImage.url, {
        ...options,
        filename: options.filename || `${result.templateId}-${selectedImage.id}`,
      });
    } catch (error) {
      console.error('[GenerationPreviewDialog] Download failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      await shareImage({
        platform: 'twitter',
        imageUrl: selectedImage.url,
        generationId: result.id,
        templateId: result.templateId,
        isFirstTime: false, // Would track this in production
      });
    } catch (error) {
      console.error('[GenerationPreviewDialog] Share failed:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: 'ia-glass-card ia-glass-card--static',
        sx: {
          backgroundColor: 'var(--glass-bg-dark)',
          backgroundImage: 'none',
          maxHeight: '90vh',
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
        生成结果
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'var(--glass-text-gray-medium)' }}
        >
          <Close size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Image Preview */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Image Container */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--glass-bg-light)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={selectedImage.url}
              alt={`Generated image ${selectedImageIndex + 1}`}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.3s ease',
              }}
            />

            {/* Zoom Controls */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                display: 'flex',
                gap: 1,
              }}
            >
              <IconButton
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                size="small"
                sx={{
                  backgroundColor: 'var(--glass-bg-dark)',
                  color: 'var(--glass-text-white-medium)',
                  '&:hover': {
                    backgroundColor: 'var(--glass-bg-light)',
                  },
                }}
              >
                <ZoomOut size={16} />
              </IconButton>
              <IconButton
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                size="small"
                sx={{
                  backgroundColor: 'var(--glass-bg-dark)',
                  color: 'var(--glass-text-white-medium)',
                  '&:hover': {
                    backgroundColor: 'var(--glass-bg-light)',
                  },
                }}
              >
                <ZoomIn size={16} />
              </IconButton>
            </Box>

            {/* Image Navigation */}
            {totalImages > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <Button
                  onClick={handlePreviousImage}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--glass-bg-dark)',
                    color: 'var(--glass-text-white-medium)',
                    minWidth: 'auto',
                  }}
                >
                  上一张
                </Button>
                <Typography
                  variant="body2"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--glass-text-white-medium)',
                  }}
                >
                  {selectedImageIndex + 1} / {totalImages}
                </Typography>
                <Button
                  onClick={handleNextImage}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--glass-bg-dark)',
                    color: 'var(--glass-text-white-medium)',
                    minWidth: 'auto',
                  }}
                >
                  下一张
                </Button>
              </Box>
            )}
          </Box>

          {/* Image Metadata */}
          <Box
            sx={{
              width: '100%',
              p: 2,
              borderRadius: 1,
              backgroundColor: 'var(--glass-bg-light)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-medium)', mb: 1 }}>
              图片元数据
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: 'var(--glass-text-white-medium)' }}>
                模型: {result.provider}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--glass-text-white-medium)' }}>
                分辨率: {result.resolution.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--glass-text-white-medium)' }}>
                消耗 Credit: {result.creditsConsumed}
              </Typography>
              {result.completedAt && (
                <Typography variant="body2" sx={{ color: 'var(--glass-text-white-medium)' }}>
                  生成时间: {Math.round((result.completedAt.getTime() - result.createdAt.getTime()) / 1000)} 秒
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onRegenerate}
          startIcon={<RefreshCw size={16} />}
          sx={{ color: 'var(--glass-text-primary)' }}
        >
          重新生成
        </Button>
        <Button
          onClick={handleDownload}
          startIcon={<Save size={16} />}
          sx={{ color: 'var(--glass-text-success)' }}
        >
          保存选项
        </Button>
        <Button
          onClick={handleShare}
          startIcon={<Share2 size={16} />}
          sx={{ color: 'var(--glass-text-info)' }}
        >
          分享到 Twitter
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: 'var(--glass-text-primary)',
            color: 'var(--glass-text-white-heavy)',
            '&:hover': { bgcolor: 'var(--primary-active)' },
          }}
        >
          完成
        </Button>
      </DialogActions>

      <SaveOptionsDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveWithOptions}
        defaultFilename={`${result.templateId}-${selectedImage.id}`}
      />
    </Dialog>
  );
}
