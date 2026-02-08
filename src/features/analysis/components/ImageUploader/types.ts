export interface ImageData {
  imageId: string;
  filePath: string;
  fileSize: number;
  fileFormat: string;
  width: number;
  height: number;
  url: string;
  warning?: {
    message: string;
    suggestion: string;
    confidence: number;
  };
}

export interface UploadError {
  code: string;
  message: string;
}

export interface UploadResponse {
  success: boolean;
  data?: ImageData;
  error?: UploadError;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadState {
  status: UploadStatus;
  progress: number;
  imageData: ImageData | null;
  error: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
