/**
 * Image History Types
 *
 * Epic 6 - Story 6-3: Image Save
 * Types for saving generated images to user history
 */

import { generations, generationRequests } from '@/lib/db/schema';

/**
 * Image metadata for saving to history
 */
export interface ImageMetadata {
  templateId?: number;
  templateName?: string;
  generationParams: Record<string, any>;
  createdAt: Date;
}

/**
 * Options for saving image to history
 */
export interface SaveToHistoryOptions {
  generationId: number;
  metadata?: ImageMetadata;
}

/**
 * Image history record (from generations table)
 */
export interface ImageHistoryRecord {
  id: number;
  imageUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  format: string;
  createdAt: Date;
  generationRequest: {
    id: number;
    prompt: string;
    provider: string;
    model: string;
  };
}

/**
 * Image history list response
 */
export interface ImageHistoryResponse {
  records: ImageHistoryRecord[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Save to history result
 */
export interface SaveToHistoryResult {
  success: boolean;
  record?: ImageHistoryRecord;
  error?: string;
}

/**
 * Image history list params
 */
export interface ImageHistoryParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'width' | 'height';
  sortOrder?: 'asc' | 'desc';
}
