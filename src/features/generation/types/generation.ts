/**
 * Generation Types
 *
 * Epic 6 - Story 6.1: Image Generation
 * Type definitions for AI image generation functionality
 */

import type { Template } from '@/features/templates/types/template';

/**
 * Subscription tier levels
 */
export type SubscriptionTier = 'free' | 'lite' | 'standard';

/**
 * Generation status
 */
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Image format types
 */
export type ImageFormat = 'png' | 'jpg' | 'webp';

/**
 * Resolution preset configuration
 */
export interface ResolutionPreset {
  /** Resolution name (e.g., "标准", "高清") */
  name: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Credit cost for this resolution */
  creditCost: number;
  /** Minimum subscription tier required */
  minSubscriptionTier?: SubscriptionTier;
}

/**
 * Image generation options
 */
export interface ImageGenerationOptions {
  /** Model provider (e.g., "stability-ai", "midjourney") */
  provider: string;
  /** Specific model version */
  model: string;
  /** Resolution preset */
  resolution: ResolutionPreset;
  /** Number of images to generate (1-4) */
  quantity: number;
  /** Template to use for generation */
  template: Template;
}

/**
 * Generated image metadata
 */
export interface GeneratedImageMetadata {
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Image format (e.g., "png", "jpg") */
  format: ImageFormat;
  /** File size in bytes */
  size: number;
}

/**
 * Safety check result
 */
export interface SafetyCheckResult {
  /** Whether the content passed safety check */
  passed: boolean;
  /** Safety score (0-1) */
  score?: number;
  /** Reason for failure */
  reason?: string;
}

/**
 * Generated image
 */
export interface GeneratedImage {
  /** Unique image ID */
  id: string;
  /** Image URL */
  url: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Image metadata */
  metadata: GeneratedImageMetadata;
  /** Safety check result */
  safetyCheck: SafetyCheckResult;
}

/**
 * Image generation result
 */
export interface ImageGenerationResult {
  /** Unique generation record ID */
  id: string;
  /** Generated images list */
  images: GeneratedImage[];
  /** Provider used */
  provider: string;
  /** Model used */
  model: string;
  /** Resolution used */
  resolution: ResolutionPreset;
  /** Template ID used */
  templateId: string;
  /** Credits consumed */
  creditsConsumed: number;
  /** Generation status */
  status: GenerationStatus;
  /** Creation timestamp */
  createdAt: Date;
  /** Completion timestamp */
  completedAt?: Date;
  /** Error message if failed */
  error?: string;
}

/**
 * Generation provider information
 */
export interface GenerationProvider {
  /** Provider identifier */
  id: string;
  /** Provider display name */
  name: string;
  /** Available models */
  models: GenerationModel[];
  /** Average generation time in seconds */
  averageGenerationTime: number;
}

/**
 * Generation model information
 */
export interface GenerationModel {
  /** Model identifier */
  id: string;
  /** Model display name */
  name: string;
  /** Model version */
  version: string;
  /** Supported resolutions */
  supportedResolutions: ResolutionPreset[];
  /** Credit cost multiplier */
  creditMultiplier: number;
}

/**
 * Generation progress stages
 */
export type GenerationStage = 'initializing' | 'generating' | 'processing' | 'completed' | 'failed';

/**
 * Generation progress information
 */
export interface GenerationProgress {
  /** Current stage */
  stage: GenerationStage;
  /** Stage display name */
  stageName: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Estimated remaining time in seconds */
  estimatedTimeRemaining?: number;
}

/**
 * Generation options dialog state
 */
export interface GenerationOptionsDialogState {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Selected provider */
  selectedProvider: GenerationProvider | null;
  /** Selected model */
  selectedModel: GenerationModel | null;
  /** Selected resolution */
  selectedResolution: ResolutionPreset | null;
  /** Selected quantity */
  selectedQuantity: number;
}

/**
 * Generation preview dialog state
 */
export interface GenerationPreviewDialogState {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Generation result to display */
  result: ImageGenerationResult | null;
  /** Currently selected image index */
  selectedImageIndex: number;
}

/**
 * Share platform types
 */
export type SharePlatform = 'twitter' | 'facebook' | 'linkedin';

/**
 * Share result
 */
export interface ShareResult {
  /** Whether share was successful */
  success: boolean;
  /** Share URL */
  shareUrl?: string;
  /** Credits earned from sharing */
  creditsEarned?: number;
  /** Error message if failed */
  error?: string;
}
