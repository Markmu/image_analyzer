'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import { Upload } from 'lucide-react';
import type { ImageData, UploadStatus } from './types';
import { validateImageUpload, type ValidationResult } from '@/lib/utils/image-validation';
import ValidationStatus from '../ValidationStatus';
import FirstTimeGuide from '../FirstTimeGuide';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageUploaderProps {
  onUploadSuccess?: (imageData: ImageData) => void;
  onUploadError?: (error: string, errorCode?: string) => void;
  onAutoStartAnalysis?: (imageData: ImageData) => void;
}

const getUploadError = (err: unknown): { message: string; code?: string } => {
  if (axios.isAxiosError(err)) {
    const responseData = err.response?.data as
      | { error?: { message?: string; code?: string } }
      | undefined;

    return {
      message: responseData?.error?.message || err.message || 'Upload failed',
      code: responseData?.error?.code,
    };
  }

  if (err instanceof Error) {
    return { message: err.message };
  }

  return { message: 'Upload failed' };
};

export function ImageUploader({ onUploadSuccess, onUploadError, onAutoStartAnalysis }: ImageUploaderProps) {
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
          onAutoStartAnalysis?.(response.data.data);
        } else {
          const errorMessage = response.data.error?.message || 'Upload failed';
          const errorCode = response.data.error?.code;
          setValidationResult({
            valid: false,
            errors: [{ code: 'UPLOAD_ERROR', message: errorMessage }],
            warnings: [],
          });
          setUploadStatus('error');
          onUploadError?.(errorMessage, errorCode);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          setUploadStatus('idle');
          setUploadProgress(0);
          setValidationResult(null);
        } else {
          const { message: errorMessage, code: errorCode } = getUploadError(err);
          setValidationResult({
            valid: false,
            errors: [{ code: 'UPLOAD_ERROR', message: errorMessage }],
            warnings: [],
          });
          setUploadStatus('error');
          onUploadError?.(errorMessage, errorCode);
        }
      } finally {
        setCancelTokenSource(null);
      }
    },
    [onAutoStartAnalysis, onUploadSuccess, onUploadError]
  );

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
    [onUploadError, proceedWithUpload, validateFile]
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
        className={`ia-glass-card ia-glass-card--clickable ${isDragActive ? 'ia-glass-card--active' : ''}`}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? '#3B82F6' : '#cbd5e1',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer',
          transition: 'var(--glass-transition)',
          backgroundColor: isDragActive ? 'var(--glass-bg-green-light)' : 'var(--glass-bg-dark)',
          '&:hover': {
            borderColor: uploadStatus === 'uploading' ? '#cbd5e1' : '#3B82F6',
            backgroundColor:
              uploadStatus === 'uploading' ? 'var(--glass-bg-dark)' : 'var(--glass-bg-green-light)',
          },
        }}
        data-testid="drop-zone"
      >
        <input {...getInputProps()} data-testid="image-upload-input" />
        <Upload
          size={48}
          color={isDragActive ? '#3B82F6' : '#94a3b8'}
          aria-hidden="true"
          style={{ marginBottom: 16 }}
        />
        <Typography variant="h6" sx={{ mb: 1, color: 'var(--glass-text-white-heavy)' }}>
          {isDragActive ? '将图片拖放到这里' : '拖拽图片到此处'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--glass-text-gray-medium)' }}>
          或点击选择（最大 10MB）
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
              backgroundColor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#3B82F6',
              },
            }}
            data-testid="upload-progress"
          />
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            上传中... {uploadProgress}%
          </Typography>
          {uploadProgress > 0 && (
            <Button
              onClick={cancelUpload}
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                borderColor: '#cbd5e1',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: '#f8fafc',
                },
              }}
              data-testid="cancel-upload-btn"
            >
              取消上传
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
