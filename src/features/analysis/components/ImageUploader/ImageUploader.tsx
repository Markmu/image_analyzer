'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';
import { Box, Typography, LinearProgress, Button, Alert } from '@mui/material';
import { CloudUpload, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import type { ImageData, UploadStatus } from './types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploaderProps {
  onUploadSuccess?: (imageData: ImageData) => void;
  onUploadError?: (error: string) => void;
}

export function ImageUploader({ onUploadSuccess, onUploadError }: ImageUploaderProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [cancelTokenSource, setCancelTokenSource] = useState<CancelTokenSource | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP formats are supported';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploadStatus('error');
        onUploadError?.(validationError);
        return;
      }

      setUploadStatus('uploading');
      setUploadProgress(0);
      setError(null);

      const source = axios.CancelToken.source();
      setCancelTokenSource(source);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
          cancelToken: source.token,
        });

        if (response.data.success) {
          setImageData(response.data.data);
          setUploadStatus('success');
          onUploadSuccess?.(response.data.data);
        } else {
          const errorMessage = response.data.error?.message || 'Upload failed';
          setError(errorMessage);
          setUploadStatus('error');
          onUploadError?.(errorMessage);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          setUploadStatus('idle');
          setUploadProgress(0);
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Upload failed';
          setError(errorMessage);
          setUploadStatus('error');
          onUploadError?.(errorMessage);
        }
      } finally {
        setCancelTokenSource(null);
      }
    },
    [validateFile, onUploadSuccess, onUploadError]
  );

  const cancelUpload = useCallback(() => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Upload cancelled by user');
    }
  }, [cancelTokenSource]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadFile(acceptedFiles[0]);
      }
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploadStatus === 'uploading',
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? '#22C55E' : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isDragActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
          '&:hover': {
            borderColor: uploadStatus === 'uploading' ? 'rgba(255, 255, 255, 0.2)' : '#22C55E',
            backgroundColor: uploadStatus === 'uploading' ? 'transparent' : 'rgba(34, 197, 94, 0.1)',
          },
        }}
        data-testid="drop-zone"
      >
        <input {...getInputProps()} data-testid="image-upload-input" />
        <CloudUpload
          sx={{
            fontSize: 48,
            mb: 2,
            color: isDragActive ? '#22C55E' : 'rgba(255, 255, 255, 0.7)',
          }}
        />
        <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
          {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          or click to select (Max 10MB)
        </Typography>
      </Box>

      {uploadStatus === 'uploading' && (
        <Box sx={{ mt: 3 }}>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#22C55E',
              },
            }}
            data-testid="upload-progress"
          />
          <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
            Uploading... {uploadProgress}%
          </Typography>
          {uploadProgress > 0 && (
            <Button
              onClick={cancelUpload}
              variant="outlined"
              size="small"
              sx={{ mt: 2, borderColor: 'rgba(255, 255, 255, 0.3)', color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Cancel
            </Button>
          )}
        </Box>
      )}

      {uploadStatus === 'success' && imageData && (
        <Alert
          icon={<CheckCircle sx={{ color: '#22C55E' }} />}
          severity="success"
          sx={{ mt: 3, backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}
          data-testid="upload-success"
        >
          Image uploaded successfully! ({imageData.width}x{imageData.height} {imageData.fileFormat})
        </Alert>
      )}

      {uploadStatus === 'error' && error && (
        <Alert
          icon={<ErrorIcon sx={{ color: '#EF4444' }} />}
          severity="error"
          sx={{ mt: 3, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
          data-testid="upload-error"
        >
          {error}
        </Alert>
      )}

      {imageData?.warning && (
        <Alert
          severity="warning"
          sx={{ mt: 2, backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {imageData.warning.message}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {imageData.warning.suggestion}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
