/**
 * Image Validation Utilities
 *
 * Provides comprehensive validation for uploaded images including:
 * - Format validation (JPEG, PNG, WebP)
 * - Size validation (max 10MB)
 * - Resolution validation (200px - 8192px)
 * - Complexity detection (heuristic-based)
 * - Combined validation flow
 */

// Validation result types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationWarning {
  code: string;
  message: string;
  suggestion: string;
  confidence?: number;
}

// Constants
export const VALID_FORMATS = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_RESOLUTION = 200;
export const MAX_RESOLUTION = 8192;
export const COMPLEXITY_THRESHOLD = 5; // bytes per pixel threshold for complexity detection

// Error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_FORMAT: '仅支持 JPEG、PNG、WebP 格式',
  FILE_TOO_LARGE: '图片大小超过 10MB,请压缩后重试',
  RESOLUTION_TOO_LOW: '图片分辨率过低,建议使用至少 200×200px 的图片',
  RESOLUTION_TOO_HIGH: '图片分辨率过高,请使用小于 8192×8192px 的图片',
  CORRUPTED_FILE: '图片文件损坏或格式不正确,无法读取',
} as const;

// Warning messages mapping
const WARNING_MESSAGES: Record<string, { message: string; suggestion: string }> = {
  COMPLEX_SCENE: {
    message: '这张图片可能包含多个主体或复杂场景',
    suggestion: '建议使用单主体、风格明显的图片以获得更好的分析效果',
  },
  LOW_CONFIDENCE: {
    message: '这张图片可能不适合分析',
    suggestion: '建议使用单主体图片,或继续尝试',
  },
} as const;

/**
 * Creates a validation error object
 * @param code - Error code
 * @param details - Optional error details
 * @returns Validation result with error
 */
function createError(code: string, details?: Record<string, unknown>): ValidationResult {
  return {
    valid: false,
    errors: [{ code, message: ERROR_MESSAGES[code] || '图片验证失败,请检查文件格式和大小', details }],
    warnings: [],
  };
}

/**
 * Creates a validation success result
 * @returns Validation result with no errors
 */
function createSuccess(): ValidationResult {
  return { valid: true, errors: [], warnings: [] };
}

/**
 * Creates a validation warning
 * @param code - Warning code
 * @param confidence - Optional confidence level
 * @returns Validation result with warning
 */
function createWarning(code: string, confidence?: number): ValidationResult {
  const warningData = WARNING_MESSAGES[code];
  return {
    valid: true,
    errors: [],
    warnings: [
      {
        code,
        message: warningData?.message || '图片可能不适合分析',
        suggestion: warningData?.suggestion || '建议更换图片或继续尝试',
        confidence,
      },
    ],
  };
}

/**
 * Validates image format
 * @param file - The file to validate
 * @returns Validation result
 */
export const validateImageFormat = (file: File): ValidationResult => {
  if (!VALID_FORMATS.includes(file.type as typeof VALID_FORMATS[number])) {
    return createError('INVALID_FORMAT', { receivedFormat: file.type });
  }

  return createSuccess();
};

/**
 * Validates image file size
 * @param file - The file to validate
 * @returns Validation result
 */
export const validateImageSize = (file: File): ValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return createError('FILE_TOO_LARGE', {
      fileSize: file.size,
      maxSize: MAX_FILE_SIZE,
    });
  }

  return createSuccess();
};

/**
 * Loads an image file and returns its dimensions
 * @param file - The file to load
 * @returns Promise resolving to HTMLImageElement
 */
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. The file may be corrupted.'));
    };

    img.src = url;
  });
};

/**
 * Validates image resolution
 * @param file - The file to validate
 * @returns Promise resolving to validation result
 */
export const validateImageResolution = async (file: File): Promise<ValidationResult> => {
  try {
    const image = await loadImage(file);
    const { width, height } = image;

    if (width < MIN_RESOLUTION || height < MIN_RESOLUTION) {
      return createError('RESOLUTION_TOO_LOW', { width, height });
    }

    if (width > MAX_RESOLUTION || height > MAX_RESOLUTION) {
      return createError('RESOLUTION_TOO_HIGH', { width, height });
    }

    return createSuccess();
  } catch (error) {
    return createError('CORRUPTED_FILE', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Detects image complexity using heuristic analysis
 * Uses bytes per pixel ratio to estimate complexity
 * @param file - The file to analyze
 * @param width - Image width
 * @param height - Image height
 * @returns Validation result with warnings for complex images
 */
export const detectImageComplexity = (
  file: File,
  width: number,
  height: number
): ValidationResult => {
  const pixelCount = width * height;

  if (pixelCount === 0) {
    return createSuccess();
  }

  const bytesPerPixel = file.size / pixelCount;

  // High bytes per pixel suggests complex scene with many subjects
  // Typical values:
  // - Simple images: 0.5 - 2 bytes/pixel
  // - Normal photos: 2 - 5 bytes/pixel
  // - Complex/multi-subject: > 5 bytes/pixel
  if (bytesPerPixel > COMPLEXITY_THRESHOLD) {
    return createWarning('COMPLEX_SCENE', 0.6);
  }

  return createSuccess();
};

/**
 * Combined validation flow
 * Validates format, size, resolution, and complexity in sequence
 * Short-circuits on first error
 * @param file - The file to validate
 * @returns Promise resolving to validation result
 */
export const validateImageUpload = async (file: File): Promise<ValidationResult> => {
  // 1. Format validation (fast, synchronous)
  const formatResult = validateImageFormat(file);
  if (!formatResult.valid) {
    return formatResult;
  }

  // 2. Size validation (fast, synchronous)
  const sizeResult = validateImageSize(file);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  // 3. Resolution validation (requires loading image)
  const resolutionResult = await validateImageResolution(file);
  if (!resolutionResult.valid) {
    return resolutionResult;
  }

  // 4. Complexity detection (heuristic, optional warning)
  try {
    const image = await loadImage(file);
    const complexityResult = detectImageComplexity(file, image.width, image.height);

    // Combine warnings from all steps
    const allWarnings = [
      ...(formatResult.warnings || []),
      ...(sizeResult.warnings || []),
      ...(resolutionResult.warnings || []),
      ...(complexityResult.warnings || []),
    ];

    return {
      valid: true,
      errors: [],
      warnings: allWarnings,
    };
  } catch {
    // If complexity detection fails, still valid but with note
    return createSuccess();
  }
};

/**
 * Formats error code to human-readable message
 * @param code - Error code
 * @returns Formatted error message
 */
export const getErrorMessage = (code: string): string => {
  return ERROR_MESSAGES[code] || '图片验证失败,请检查文件格式和大小';
};

/**
 * Formats warning code to human-readable message and suggestion
 * @param warning - Validation warning
 * @returns Formatted warning object
 */
export const formatWarning = (warning: ValidationWarning): {
  message: string;
  suggestion: string;
} => {
  const formatted = WARNING_MESSAGES[warning.code];
  return (
    formatted || {
      message: warning.message,
      suggestion: warning.suggestion,
    }
  );
};

/**
 * API validation response interface
 */
export interface ApiValidationResponse {
  success: boolean;
  data?: {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    analysis: {
      subjectCount: number;
      complexity: 'low' | 'medium' | 'high';
      confidence: number;
      reason: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Performs API-based validation using Replicate vision model
 * This is a deep validation that analyzes image complexity and confidence
 * Should be called after local validation passes
 *
 * @param imageUrl - URL of the uploaded image (from R2 or similar storage)
 * @returns Promise resolving to API validation result
 *
 * @example
 * ```typescript
 * // Upload file first, get URL
 * const uploadedUrl = await uploadToR2(file);
 *
 * // Then perform API validation
 * const apiResult = await validateWithApi(uploadedUrl);
 *
 * if (apiResult.data?.warnings.length > 0) {
 *   // Show warnings to user with "continue" or "cancel" options
 * }
 * ```
 */
export const validateWithApi = async (
  imageUrl: string
): Promise<ValidationResult & { analysis?: ApiValidationResponse['data']['analysis'] }> => {
  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: '验证失败' } }));
      throw new Error(errorData.error?.message || 'API 验证失败');
    }

    const apiResponse: ApiValidationResponse = await response.json();

    if (!apiResponse.success || !apiResponse.data) {
      throw new Error(apiResponse.error?.message || 'API 验证失败');
    }

    // Transform API response to ValidationResult format
    return {
      valid: apiResponse.data.valid,
      errors: apiResponse.data.errors,
      warnings: apiResponse.data.warnings,
      analysis: apiResponse.data.analysis,
    };
  } catch (error) {
    // On API failure, log but don't block upload
    console.error('API validation failed:', error);

    // Return valid result with warning about API failure
    return {
      valid: true,
      errors: [],
      warnings: [
        {
          code: 'LOW_CONFIDENCE',
          message: '无法完成深度验证',
          suggestion: '您可以直接继续，或更换图片重试',
          confidence: 0.5,
        },
      ],
    };
  }
};

/**
 * Complete validation flow combining local and API validation
 * This is the recommended validation flow for production use
 *
 * Flow:
 * 1. Local validation (instant) - format, size, resolution
 * 2. If local validation passes and imageUrl is provided, perform API validation
 * 3. Combine results from both validations
 *
 * @param file - The file to validate
 * @param imageUrl - Optional URL of uploaded image for API validation
 * @returns Promise resolving to combined validation result
 *
 * @example
 * ```typescript
 * // Step 1: Local validation before upload
 * const localResult = await validateImageUpload(file);
 * if (!localResult.valid) {
 *   // Show errors to user, don't upload
 *   return;
 * }
 *
 * // Step 2: Upload file
 * const uploadedUrl = await uploadToR2(file);
 *
 * // Step 3: API validation after upload
 * const completeResult = await validateImageUploadComplete(file, uploadedUrl);
 * if (completeResult.warnings.length > 0) {
 *   // Show warnings with "continue" or "cancel" options
 * }
 * ```
 */
export const validateImageUploadComplete = async (
  file: File,
  imageUrl?: string
): Promise<ValidationResult & { analysis?: ApiValidationResponse['data']['analysis'] }> => {
  // Step 1: Local validation (fast, synchronous)
  const localResult = await validateImageUpload(file);

  // If local validation fails, return immediately
  if (!localResult.valid) {
    return localResult;
  }

  // Step 2: API validation (if imageUrl provided)
  if (imageUrl) {
    const apiResult = await validateWithApi(imageUrl);

    // Combine warnings from both validations
    return {
      valid: apiResult.valid,
      errors: apiResult.errors,
      warnings: [...(localResult.warnings || []), ...(apiResult.warnings || [])],
      analysis: apiResult.analysis,
    };
  }

  // No API validation, return local result only
  return localResult;
};
