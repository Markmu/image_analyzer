/**
 * Generation Presets Configuration
 *
 * Epic 6 - Story 6.1: Image Generation
 * Default presets and constants for image generation
 */

import type { ResolutionPreset, SubscriptionTier } from '../types/generation';

/**
 * Resolution presets by subscription tier
 * Based on AC6 and FR82
 */
export const RESOLUTION_PRESETS: Record<SubscriptionTier, ResolutionPreset[]> = {
  free: [
    {
      name: '标准 (512x512)',
      width: 512,
      height: 512,
      creditCost: 2,
      minSubscriptionTier: 'free',
    },
    {
      name: '标准 (768x768)',
      width: 768,
      height: 768,
      creditCost: 3,
      minSubscriptionTier: 'free',
    },
  ],
  lite: [
    {
      name: '标准 (768x768)',
      width: 768,
      height: 768,
      creditCost: 3,
      minSubscriptionTier: 'free',
    },
    {
      name: '高清 (1024x1024)',
      width: 1024,
      height: 1024,
      creditCost: 4,
      minSubscriptionTier: 'lite',
    },
  ],
  standard: [
    {
      name: '高清 (1024x1024)',
      width: 1024,
      height: 1024,
      creditCost: 4,
      minSubscriptionTier: 'lite',
    },
    {
      name: '超清 (1536x1536)',
      width: 1536,
      height: 1536,
      creditCost: 6,
      minSubscriptionTier: 'standard', // FR82: Standard exclusive
    },
  ],
};

/**
 * Default resolution preset
 */
export const DEFAULT_RESOLUTION: ResolutionPreset = RESOLUTION_PRESETS.free[0];

/**
 * Generation limits
 */
export const GENERATION_LIMITS = {
  /** Minimum number of images per generation */
  MIN_QUANTITY: 1,
  /** Maximum number of images per generation */
  MAX_QUANTITY: 4,
  /** Default quantity */
  DEFAULT_QUANTITY: 1,
  /** Maximum generation time in seconds (standard resolution) */
  MAX_GENERATION_TIME_STANDARD: 30,
  /** Maximum generation time in seconds (high resolution) */
  MAX_GENERATION_TIME_HIGH_RES: 60,
  /** Progress polling interval in milliseconds */
  POLLING_INTERVAL: 2000,
} as const;

/**
 * Generation stage display names
 */
export const GENERATION_STAGES = {
  initializing: '正在初始化模型...',
  generating: '正在生成图片...',
  processing: '正在处理结果...',
  completed: '生成完成',
  failed: '生成失败',
} as const;

/**
 * Toast notification messages
 */
export const TOAST_MESSAGES = {
  GENERATION_STARTED: '开始生成图片...',
  GENERATION_SUCCESS: '图片生成成功！',
  GENERATION_FAILED: '图片生成失败，请重试',
  UNSAFE_CONTENT: '检测到不安全内容，生成已取消',
  INSUFFICIENT_CREDITS: 'Credits 不足，请升级订阅',
  UNSAFE_IMAGE_GENERATED: '生成图片未通过安全检查，已为您退款',
  SHARE_SUCCESS: '分享成功！获得 {credits} credits',
  SHARE_FAILED: '分享失败，请重试',
} as const;

/**
 * Credit rewards for sharing
 */
export const SHARE_REWARDS = {
  FIRST_TIME_SHARE: 6, // FR72: First share reward
  SUBSEQUENT_SHARE: 2, // FR73: Subsequent share reward
} as const;

/**
 * Model providers (placeholder - to be populated from Replicate API)
 * Based on AC2
 */
export const DEFAULT_PROVIDERS = [
  {
    id: 'stability-ai',
    name: 'Stability AI',
    averageGenerationTime: 15,
    models: [
      {
        id: 'stable-diffusion-xl',
        name: 'Stable Diffusion XL',
        version: '1.0',
        supportedResolutions: RESOLUTION_PRESETS.free,
        creditMultiplier: 1,
      },
    ],
  },
] as const;

/**
 * Default generation options
 */
export const DEFAULT_GENERATION_OPTIONS = {
  quantity: GENERATION_LIMITS.DEFAULT_QUANTITY,
  resolution: DEFAULT_RESOLUTION,
} as const;
