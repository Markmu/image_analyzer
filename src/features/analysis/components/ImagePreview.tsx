'use client';

import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import type { ImageData } from '@/features/analysis/components/ImageUploader/types';

interface ImagePreviewProps {
  imageData: ImageData;
}

export default function ImagePreview({ imageData }: ImagePreviewProps) {
  const fileName = imageData.filePath?.split('/').pop() || 'uploaded-image';
  const sizeInMb = (imageData.fileSize / 1024 / 1024).toFixed(2);

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
      <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-heavy)' }}>
        {sizeInMb} MB · {imageData.width}x{imageData.height} · {imageData.fileFormat}
      </Typography>
    </Box>
  );
}
