'use client';

import Image from 'next/image';
import { Box, Button, Typography } from '@mui/material';
import type { ImageData } from '@/features/analysis/components/ImageUploader/types';

interface ImagePreviewProps {
  imageData: ImageData;
  onResetWorkspace?: () => void;
}

export default function ImagePreview({ imageData, onResetWorkspace }: ImagePreviewProps) {
  const fileName = imageData.filePath?.split('/').pop() || 'uploaded-image';
  const metadataParts = [
    imageData.fileSize > 0 ? `${(imageData.fileSize / 1024 / 1024).toFixed(2)} MB` : '',
    imageData.width > 0 && imageData.height > 0 ? `${imageData.width}x${imageData.height}` : '',
    imageData.fileFormat || '',
  ].filter(Boolean);

  return (
    <Box className="ia-glass-card" sx={{ p: 2 }}>
      <Box sx={{ position: 'relative', width: '100%', height: 260, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <Image
          src={imageData.url}
          alt="已上传参考图"
          fill
          unoptimized
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 960px) 100vw, 25vw"
        />
      </Box>
      <Typography variant="body1" sx={{ color: 'var(--glass-text-white-heavy)', fontWeight: 600 }}>
        {fileName}
      </Typography>
      {metadataParts.length > 0 && (
        <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-heavy)' }}>
          {metadataParts.join(' · ')}
        </Typography>
      )}
      {onResetWorkspace && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onResetWorkspace}
            sx={{
              borderColor: 'var(--glass-border)',
              color: 'var(--glass-text-white-heavy)',
              '&:hover': {
                borderColor: 'var(--glass-border-active)',
                backgroundColor: 'var(--glass-bg-active)',
              },
            }}
          >
            更换图片
          </Button>
        </Box>
      )}
    </Box>
  );
}
