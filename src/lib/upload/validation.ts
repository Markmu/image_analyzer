/**
 * Shared file validation utilities
 *
 * Used by:
 * - /api/upload/route.ts (single file upload)
 * - /api/upload/batch/route.ts (batch upload)
 */

import sharp from 'sharp';
import {
  MAX_FILE_SIZE,
  MIN_DIMENSION,
  MAX_DIMENSION,
  ALLOWED_FORMATS,
  MAX_FILES,
  CONCURRENCY_LIMIT,
} from './constants';

export interface ValidationResult {
  success: boolean;
  width?: number;
  height?: number;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Validate file type
 */
export function validateFileType(file: File): { valid: boolean; code?: string; message?: string } {
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: `File type ${file.type} is not supported. Only JPEG, PNG, and WebP are allowed.`,
    };
  }
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): { valid: boolean; code?: string; message?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
    };
  }
  return { valid: true };
}

/**
 * Validate image dimensions using sharp
 */
export async function validateImageDimensions(
  buffer: Buffer
): Promise<{ valid: boolean; width?: number; height?: number; error?: { code: string; message: string } }> {
  try {
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (
      width < MIN_DIMENSION ||
      height < MIN_DIMENSION ||
      width > MAX_DIMENSION ||
      height > MAX_DIMENSION
    ) {
      return {
        valid: false,
        width,
        height,
        error: {
          code: 'INVALID_DIMENSIONS',
          message: `Image dimensions must be between ${MIN_DIMENSION}x${MIN_DIMENSION} and ${MAX_DIMENSION}x${MAX_DIMENSION} pixels.`,
        },
      };
    }

    return { valid: true, width, height };
  } catch {
    return {
      valid: false,
      error: {
        code: 'INVALID_IMAGE',
        message: 'Failed to process image. Please ensure it is a valid image file.',
      },
    };
  }
}

/**
 * Validate file for upload (type, size, and dimensions)
 */
export async function validateFileForUpload(
  file: File
): Promise<ValidationResult> {
  // Validate type
  const typeResult = validateFileType(file);
  if (!typeResult.valid) {
    return {
      success: false,
      error: { code: typeResult.code!, message: typeResult.message! },
    };
  }

  // Validate size
  const sizeResult = validateFileSize(file);
  if (!sizeResult.valid) {
    return {
      success: false,
      error: { code: sizeResult.code!, message: sizeResult.message! },
    };
  }

  // Validate dimensions
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dimensionResult = await validateImageDimensions(buffer);

    if (!dimensionResult.valid) {
      return {
        success: false,
        width: dimensionResult.width,
        height: dimensionResult.height,
        error: dimensionResult.error,
      };
    }

    return {
      success: true,
      width: dimensionResult.width,
      height: dimensionResult.height,
    };
  } catch {
    return {
      success: false,
      error: {
        code: 'INVALID_FILE',
        message: 'Failed to read file content.',
      },
    };
  }
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  return mimeToExt[mimeType] || 'bin';
}

/**
 * Generate unique filename for upload
 */
export function generateFilename(userId: string, mimeType: string): {
  filename: string;
  filePath: string;
  imageId: string;
} {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(mimeType);
  const filename = `${timestamp}-${random}.${extension}`;
  const filePath = `images/${userId}/${filename}`;
  const imageId = `${timestamp}-${random}`;

  return { filename, filePath, imageId };
}
