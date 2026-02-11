'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import type { ImageData, UploadStatus } from './types';
import { validateImageUpload, type ValidationResult } from '@/lib/utils/image-validation';
import ValidationStatus from '../ValidationStatus';
import FirstTimeGuide from '../FirstTimeGuide';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploaderProps {
  onUploadSuccess?: (imageData: ImageData) => void;
  onUploadError?: (error: string) => void;
}

export function ImageUploader({ onUploadSuccess, onUploadError }: ImageUploaderProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [cancelTokenSource, setCancelTokenSource] = useState<CancelTokenSource | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const validateFile = useCallback(async (file: File): Promise<ValidationResult> => {
    const result = await validateImageUpload(file);
    setValidationResult(result);
    return result;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      // Run validation first
      const validation = await validateFile(file);

      if (!validation.valid) {
        onUploadError?.(validation.errors[0]?.message || 'Validation failed');
        return;
      }

      // If there are warnings, wait for user to decide
      if (validation.warnings.length > 0) {
        setPendingFile(file);
        return;
      }

      proceedWithUpload(file);
    },
    [validateFile, onUploadError]
  );

  const proceedWithUpload = useCallback(
    async (file: File) => {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setValidationResult(null);

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
          setPendingFile(null);
          onUploadSuccess?.(response.data.data);
        } else {
          const errorMessage = response.data.error?.message || 'Upload failed';
          setValidationResult({
            valid: false,
            errors: [{ code: 'UPLOAD_ERROR', message: errorMessage }],
            warnings: [],
          });
          setUploadStatus('error');
          onUploadError?.(errorMessage);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          setUploadStatus('idle');
          setUploadProgress(0);
          setValidationResult(null);
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Upload failed';
          setValidationResult({
            valid: false,
            errors: [{ code: 'UPLOAD_ERROR', message: errorMessage }],
            warnings: [],
          });
          setUploadStatus('error');
          onUploadError?.(errorMessage);
        }
      } finally {
        setCancelTokenSource(null);
      }
    },
    [onUploadSuccess, onUploadError]
  );

  const cancelUpload = useCallback(() => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Upload cancelled by user');
    }
  }, [cancelTokenSource]);

  const handleContinueAnyway = useCallback(() => {
    if (pendingFile) {
      proceedWithUpload(pendingFile);
    }
  }, [pendingFile, proceedWithUpload]);

  const handleChangeImage = useCallback(() => {
    setPendingFile(null);
    setValidationResult(null);
  }, []);

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
      <FirstTimeGuide />

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
          {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
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
              data-testid="cancel-upload-btn"
            >
              Cancel
            </Button>
          )}
        </Box>
      )}

      {validationResult && (
        <ValidationStatus
          result={validationResult}
          onContinueAnyway={handleContinueAnyway}
          onChangeImage={handleChangeImage}
        />
      )}

      {uploadStatus === 'success' && imageData && (
        <ValidationStatus
          result={{
            valid: true,
            errors: [],
            warnings: [],
          }}
        />
      )}
    </Box>
  );
}
