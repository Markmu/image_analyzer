/**
 * 图片保存相关常量
 */

import { ImageFormat } from '../types/save';

export const SUPPORTED_FORMATS = [
  { value: ImageFormat.PNG, label: 'PNG', description: '无损格式' },
  { value: ImageFormat.JPEG, label: 'JPEG', description: '小体积' },
  { value: ImageFormat.WebP, label: 'WebP', description: '现代格式' },
];

export const RESOLUTION_OPTIONS = [
  { value: 'original', label: '原始尺寸', description: '保持生成尺寸' },
  { value: '1x', label: '1x', description: '1024x1024' },
  { value: '2x', label: '2x', description: '2048x2048' },
  { value: '4x', label: '4x', description: '4096x4096' },
];

export const DEFAULT_QUALITY = 90;
export const MIN_QUALITY = 70;
export const MAX_QUALITY = 100;

export const DEFAULT_SAVE_OPTIONS = {
  format: ImageFormat.PNG,
  quality: DEFAULT_QUALITY,
  resolution: 'original' as const,
};

export const BATCH_SAVE_CHUNK_SIZE = 5; // 每次处理5张图片
