'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios, { CancelTokenSource } from 'axios';
import pLimit from 'p-limit';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Alert,
  IconButton,
  Card,
  CardMedia,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Close,
} from '@mui/icons-material';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILES = 5;
const CONCURRENCY_LIMIT = 3;

export interface BatchImageData {
  imageId: string;
  filePath: string;
  url: string;
  fileSize: number;
  fileFormat: string;
  width: number;
  height: number;
}

export interface UploadResult {
  success: boolean;
  imageId?: string;
  filePath?: string;
  url?: string;
  fileSize?: number;
  fileFormat?: string;
  width?: number;
  height?: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface BatchUploaderProps {
  onBatchUploadSuccess?: (data: { batchId: string; images: BatchImageData[] }) => void;
  onBatchUploadError?: (error: string) => void;
  onBatchUploadCancel?: () => void;
  onProgress?: (progress: { completed: number; total: number }) => void;
}

interface FileState {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  preview: string;
  result?: UploadResult;
}

export function BatchUploader({
  onBatchUploadSuccess,
  onBatchUploadError,
  onBatchUploadCancel,
  onProgress,
}: BatchUploaderProps) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [warning, setWarning] = useState<{ code: string; message: string; details: any } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const cancelTokenSources = useRef<Map<string, CancelTokenSource>>(new Map());
  const startTimeRef = useRef<number | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Reset estimated time when upload starts
  useEffect(() => {
    if (isUploading && completedCount === 0) {
      startTimeRef.current = Date.now();
      setEstimatedTime(null);
    }
  }, [isUploading, completedCount]);

  // Calculate estimated time
  useEffect(() => {
    if (completedCount > 0 && startTimeRef.current && files.length > completedCount) {
      const elapsed = Date.now() - startTimeRef.current;
      const avgTimePerFile = elapsed / completedCount;
      const remainingFiles = files.length - completedCount;
      setEstimatedTime(Math.round((avgTimePerFile * remainingFiles) / 1000));
    }
  }, [completedCount, files.length]);

  // Cleanup on unmount: cancel all uploads and revoke preview URLs
  useEffect(() => {
    return () => {
      // Cancel all ongoing uploads
      cancelTokenSources.current.forEach((source) => {
        source.cancel('Component unmounted');
      });
      cancelTokenSources.current.clear();

      // Revoke all preview URLs to prevent memory leaks
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  const createFilePreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const cancelUpload = useCallback(() => {
    // Cancel all ongoing requests
    cancelTokenSources.current.forEach((source) => {
      source.cancel('Upload cancelled by user');
    });
    cancelTokenSources.current.clear();

    // Update file states
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        status: f.status === 'uploading' ? 'cancelled' : f.status,
        progress: f.status === 'uploading' ? 0 : f.progress,
      }))
    );

    setIsUploading(false);
    onBatchUploadCancel?.();
  }, [onBatchUploadCancel]);

  const cancelSingleFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.status === 'uploading') {
        const source = cancelTokenSources.current.get(id);
        if (source) {
          source.cancel('Upload cancelled by user');
          cancelTokenSources.current.delete(id);
        }
      }
      return prev.map((f) =>
        f.id === id
          ? { ...f, status: 'cancelled' as const, progress: 0 }
          : f
      );
    });
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP formats are supported';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    return null;
  }, []);

  const uploadFiles = useCallback(async () => {
    const filesToUpload = files.filter((f) => f.status === 'pending');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    setCompletedCount(0);
    setWarning(null);
    startTimeRef.current = Date.now();

    // Create cancel tokens for each upload
    cancelTokenSources.current.clear();
    filesToUpload.forEach((fileState) => {
      cancelTokenSources.current.set(fileState.id, axios.CancelToken.source());
    });

    const results: UploadResult[] = [];
    const uploadedImages: BatchImageData[] = [];

    // Process files with concurrency control
    const processFile = async (fileState: FileState, fileId: string) => {
      // Find the index of this file in filesToUpload for cancel token access
      const fileIndex = filesToUpload.findIndex((f) => f.id === fileId);
      const validationError = validateFile(fileState.file);
      if (validationError) {
        const result: UploadResult = {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: validationError },
        };
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileState.id
              ? { ...f, status: 'failed' as const, result }
              : f
          )
        );
        results[fileIndex] = result;
        return result;
      }

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileState.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
        )
      );

      const formData = new FormData();
      formData.append('files', fileState.file);

      try {
        const response = await axios.post('/api/upload/batch', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          cancelToken: cancelTokenSources.current.get(fileState.id)?.token,
        });

        const result: UploadResult = {
          success: true,
          imageId: response.data.data.images[0]?.imageId,
          filePath: response.data.data.images[0]?.filePath,
          url: response.data.data.images[0]?.url,
          fileSize: response.data.data.images[0]?.fileSize,
          fileFormat: response.data.data.images[0]?.fileFormat,
          width: response.data.data.images[0]?.width,
          height: response.data.data.images[0]?.height,
        };

        if (response.data.warning) {
          setWarning(response.data.warning);
        }

        setBatchId(response.data.data.batchId);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileState.id
              ? { ...f, status: 'completed' as const, progress: 100, result }
              : f
          )
        );

        uploadedImages.push({
          imageId: result.imageId!,
          filePath: result.filePath!,
          url: result.url!,
          fileSize: result.fileSize!,
          fileFormat: result.fileFormat!,
          width: result.width!,
          height: result.height!,
        });

        results[fileIndex] = result;
        setCompletedCount((prev) => {
          const newCount = prev + 1;
          onProgress?.({ completed: newCount, total: filesToUpload.length });
          return newCount;
        });
        return result;
      } catch (err) {
        if (axios.isCancel(err)) {
          const result: UploadResult = {
            success: false,
            error: { code: 'CANCELLED', message: 'Upload cancelled' },
          };
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileState.id
                ? { ...f, status: 'cancelled' as const, progress: 0, result }
                : f
            )
          );
          results[fileIndex] = result;
          return result;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';
        const result: UploadResult = {
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: errorMessage,
          },
        };

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileState.id ? { ...f, status: 'failed' as const, result } : f
          )
        );

        results[fileIndex] = result;
        return result;
      }
    };

    // Use concurrency control with p-limit
    const limiter = pLimit(CONCURRENCY_LIMIT);
    const promises = filesToUpload.map((fileState) =>
      limiter(() => processFile(fileState, fileState.id))
    );

    await Promise.all(promises);

    setIsUploading(false);
    cancelTokenSources.current.clear();

    // Check if all uploads completed successfully
    const successfulUploads = results.filter((r) => r.success);
    if (successfulUploads.length > 0 && batchId) {
      onBatchUploadSuccess?.({ batchId, images: uploadedImages });
    } else if (results.some((r) => r.error?.code !== 'CANCELLED')) {
      onBatchUploadError?.('All uploads failed');
    }
  }, [files, validateFile, batchId, onBatchUploadSuccess, onBatchUploadError, onBatchUploadCancel, onProgress]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check if adding these files would exceed the limit
      const totalFiles = files.length + acceptedFiles.length;

      if (totalFiles > MAX_FILES) {
        setWarning({
          code: 'TOO_MANY_FILES',
          message: `最多只能上传 ${MAX_FILES} 张图片，已自动处理前 ${MAX_FILES} 张`,
          details: {
            totalFiles,
            processedFiles: MAX_FILES,
            skippedFiles: totalFiles - MAX_FILES,
          },
        });
        acceptedFiles.splice(MAX_FILES - files.length);
      } else {
        setWarning(null);
      }

      const newFiles: FileState[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: 'pending' as const,
        progress: 0,
        preview: createFilePreview(file),
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, createFilePreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: isUploading || files.length >= MAX_FILES,
  });

  const handleStartUpload = () => {
    uploadFiles();
  };

  const totalProgress = files.length > 0
    ? (completedCount / files.length) * 100
    : 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Drop zone */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? '#22C55E' : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: isUploading || files.length >= MAX_FILES ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isDragActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
          '&:hover': {
            borderColor:
              isUploading || files.length >= MAX_FILES
                ? 'rgba(255, 255, 255, 0.2)'
                : '#22C55E',
            backgroundColor:
              isUploading || files.length >= MAX_FILES
                ? 'transparent'
                : 'rgba(34, 197, 94, 0.1)',
          },
        }}
        data-testid="batch-drop-zone"
      >
        <input {...getInputProps()} data-testid="batch-file-input" />
        <CloudUpload
          sx={{
            fontSize: 48,
            mb: 2,
            color: isDragActive ? '#22C55E' : 'rgba(255, 255, 255, 0.7)',
          }}
        />
        <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
          {isDragActive ? 'Drop images here' : 'Drag & drop multiple images'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          or click to select (Max {MAX_FILES} images, 10MB each)
        </Typography>
      </Box>

      {/* Warning about file count */}
      {warning && (
        <Alert
          severity="warning"
          sx={{ mt: 2, backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24' }}
          data-testid="file-count-warning"
        >
          <Typography variant="body2">
            {warning.message} (跳过 {warning.details.skippedFiles} 张)
          </Typography>
        </Alert>
      )}

      {/* Progress section */}
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          {/* Overall progress */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              已上传 {completedCount}/{files.length} 张图片
            </Typography>
            <LinearProgress
              variant="determinate"
              value={totalProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                mt: 1,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#22C55E',
                },
              }}
              data-testid="batch-progress-bar"
            />
            {estimatedTime !== null && (
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                预计剩余时间: {estimatedTime} 秒
              </Typography>
            )}
          </Box>

          {/* Thumbnail list - Desktop */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                padding: 2,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                maxHeight: 200,
              }}
              data-testid="thumbnail-list"
            >
              {files.map((file) => (
                <ThumbnailCard
                  key={file.id}
                  file={file}
                  onRemove={() => removeFile(file.id)}
                  onCancel={() => cancelSingleFile(file.id)}
                />
              ))}
            </Box>
          )}

          {/* Thumbnail list - Mobile */}
          {isMobile && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                padding: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                mt: 2,
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
              }}
              data-testid="mobile-thumbnail-list"
            >
              {files.map((file) => (
                <ThumbnailCard
                  key={file.id}
                  file={file}
                  onRemove={() => removeFile(file.id)}
                  onCancel={() => cancelSingleFile(file.id)}
                  compact
                />
              ))}
            </Box>
          )}

          {/* Action buttons */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            {isUploading ? (
              <Button
                onClick={cancelUpload}
                variant="outlined"
                color="error"
                data-testid="cancel-all-button"
                sx={{
                  borderColor: 'rgba(239, 68, 68, 0.5)',
                  color: 'rgba(239, 68, 68, 0.9)',
                  minWidth: 120,
                  minHeight: 44,
                }}
              >
                取消全部
              </Button>
            ) : (
              <Button
                onClick={handleStartUpload}
                variant="contained"
                disabled={files.filter((f) => f.status === 'pending').length === 0}
                sx={{
                  backgroundColor: '#22C55E',
                  '&:hover': { backgroundColor: '#16A34A' },
                  minWidth: 120,
                  minHeight: 44,
                }}
              >
                开始上传
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface ThumbnailCardProps {
  file: FileState;
  onRemove: () => void;
  onCancel: () => void;
  compact?: boolean;
}

function ThumbnailCard({ file, onRemove, onCancel, compact = false }: ThumbnailCardProps) {
  const getStatusColor = () => {
    switch (file.status) {
      case 'completed':
        return '#22C55E';
      case 'failed':
        return '#EF4444';
      case 'cancelled':
        return '#F59E0B';
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <CheckCircle sx={{ color: '#22C55E', fontSize: 16 }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: '#EF4444', fontSize: 16 }} />;
      case 'cancelled':
        return <Close sx={{ color: '#F59E0B', fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const size = compact ? 60 : 100;

  return (
    <Card
      sx={{
        minWidth: size,
        width: size,
        height: size,
        position: 'relative',
        border: '2px solid',
        borderColor: getStatusColor(),
        borderRadius: 2,
        overflow: 'visible',
      }}
      data-testid={`thumbnail-${file.file.name}`}
    >
      <CardMedia
        component="img"
        image={file.preview}
        alt={file.file.name}
        sx={{
          width: size,
          height: size,
          objectFit: 'cover',
        }}
        data-testid={`thumbnail-${file.file.name}-image`}
      />

      {/* Status icon */}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: getStatusColor(),
          borderRadius: '50%',
          padding: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        data-testid={`thumbnail-${file.file.name}-status`}
      >
        {getStatusIcon()}
      </Box>

      {/* Progress indicator */}
      {file.status === 'uploading' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <LinearProgress
            variant="determinate"
            value={file.progress}
            sx={{
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#22C55E',
              },
            }}
          />
        </Box>
      )}

      {/* Cancel button (shown on hover) */}
      {file.status === 'uploading' && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.8)' },
            width: 24,
            height: 24,
          }}
          data-testid={`cancel-${file.file.name}-button`}
        >
          <Close sx={{ fontSize: 14, color: 'white' }} />
        </IconButton>
      )}

      {/* File name (compact mode) */}
      {compact && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: 0.5,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.file.name}
        </Typography>
      )}
    </Card>
  );
}
