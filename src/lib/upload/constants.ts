/**
 * Batch upload constants
 *
 * Used by:
 * - /src/app/api/upload/batch/route.ts
 * - /src/features/analysis/components/BatchUploader/*
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_DIMENSION = 200;
export const MAX_DIMENSION = 8192;
export const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILES = 5;
export const CONCURRENCY_LIMIT = 3;

// Dropzone accepted formats
export const DROPZONE_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};
