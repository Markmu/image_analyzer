/**
 * Template Library Types
 *
 * Epic 7 - Story 7.2: Template Library
 * Type definitions for permanent template library functionality
 */

import type { Template } from './template';

/**
 * Saved template from permanent library
 */
export interface SavedTemplate {
  /** Unique template ID */
  id: number;
  /** User ID who owns this template */
  userId: string;
  /** Analysis result ID this template was generated from */
  analysisResultId: number;
  /** User-defined title */
  title: string | null;
  /** User-defined description */
  description: string | null;
  /** Template snapshot (avoids dependency on original analysis result)
   *
   * FIX H2: 更新类型以支持完整的分析结果快照
   */
  templateSnapshot: {
    /** Analysis data from the original result */
    analysisData: any;
    /** Confidence score */
    confidenceScore: number;
    /** Model ID used for analysis */
    modelId?: string;
    /** Creation timestamp of original analysis */
    createdAt: Date;
  };
  /** Whether this template is marked as favorite */
  isFavorite: boolean;
  /** Usage count (redundant field for query performance) */
  usageCount: number;
  /** Tags associated with this template */
  tags: string[];
  /** Categories associated with this template */
  categories: Array<{
    parent: string | null;
    child: string | null;
  }>;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Template library query parameters
 */
export interface TemplateLibraryParams {
  /** Page number (starts from 1) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Keyword search (searches title, description, tags) */
  search?: string;
  /** Filter by tags */
  tags?: string[];
  /** Filter by categories */
  categories?: Array<{ parent?: string; child?: string }>;
  /** Filter by favorite status */
  isFavorite?: boolean;
  /** Sort field */
  sortBy?: 'createdAt' | 'usageCount' | 'title';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Input for saving template to library
 */
export interface SaveToLibraryInput {
  /** Analysis result ID to save template from */
  analysisResultId: number;
  /** Optional title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Optional tags (max 10 tags, each max 20 chars) */
  tags?: string[];
  /** Optional category (two-level hierarchy) */
  category?: {
    parent?: string;
    child?: string;
  };
}

/**
 * Input for updating template
 */
export interface UpdateTemplateInput {
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated tags */
  tags?: string[];
  /** Updated category */
  category?: {
    parent?: string;
    child?: string;
  };
}

/**
 * Template generation history item
 */
export interface TemplateGenerationHistory {
  /** Generation ID */
  id: number;
  /** Image URL */
  imageUrl: string;
  /** Thumbnail URL (nullable) */
  thumbnailUrl?: string | null;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Template with generation history
 */
export interface TemplateWithHistory extends SavedTemplate {
  /** Generations based on this template */
  generations: TemplateGenerationHistory[];
}

/**
 * Template library response
 */
export interface TemplateLibraryResponse {
  /** List of templates */
  templates: SavedTemplate[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
}

/**
 * Constants for template library
 */
export const TEMPLATE_CONSTANTS = {
  /** Maximum tags per template */
  MAX_TAGS_PER_TEMPLATE: 10,
  /** Maximum tag length */
  MAX_TAG_LENGTH: 20,
  /** Maximum title length */
  MAX_TITLE_LENGTH: 200,
  /** Maximum parent category length */
  MAX_PARENT_CATEGORY_LENGTH: 50,
  /** Maximum child category length */
  MAX_CHILD_CATEGORY_LENGTH: 50,
  /** Default page size */
  DEFAULT_PAGE_SIZE: 12,
  /** Maximum page size */
  MAX_PAGE_SIZE: 100,
} as const;
