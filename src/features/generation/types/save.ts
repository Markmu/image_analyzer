/**
 * 图片保存相关类型定义
 */

export enum ImageFormat {
  PNG = 'png',
  JPEG = 'jpeg',
  WebP = 'webp',
}

export type ImageResolutionOption = 'original' | '1x' | '2x' | '4x';

export interface ImageSaveOptions {
  format: ImageFormat;
  quality?: number; // 70-100, 仅 JPEG
  resolution: ImageResolutionOption;
  filename?: string;
  metadata?: ImageMetadata; // 元数据
}

export interface ImageMetadata {
  templateId: string;
  templateName: string;
  generationParams: Record<string, any>;
  createdAt: Date;
  generatedBy: string;
}

export interface BatchSaveProgress {
  totalItems: number;
  completedItems: number;
  failedItems: number;
  currentFile?: string;
  percentage: number;
}

export interface SaveResult {
  success: boolean;
  filename?: string;
  error?: string;
  // 批量操作相关字段
  successCount?: number;
  failedCount?: number;
  failedImages?: string[];
}
