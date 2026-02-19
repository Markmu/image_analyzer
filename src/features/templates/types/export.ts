/**
 * Export Types
 *
 * Epic 5 - Story 5.2: JSON Export
 * Type definitions for template export functionality
 */

import type { Template } from './template';

/**
 * Template export metadata
 */
export interface TemplateExportMetadata {
  /** Export format version (e.g., "1.0.0") */
  version: string;
  /** Unique template ID */
  templateId: string;
  /** Analysis result ID this template was generated from */
  analysisResultId: string;
  /** Template creation timestamp (ISO 8601 format) */
  createdAt: string;
  /** Export timestamp (ISO 8601 format) */
  exportedAt: string;
  /** Platform identifier */
  platform: string;
}

/**
 * Template export data structure
 */
export interface TemplateExportData {
  /** Variable format template (with [variable] placeholders) */
  variableFormat: string;
  /** JSON format template */
  jsonFormat: {
    /** Subject/主体描述 */
    subject: string;
    /** Style/风格描述 */
    style: string;
    /** Composition/构图信息 */
    composition: string;
    /** Colors/色彩方案 */
    colors: string;
    /** Lighting/光线设置 */
    lighting: string;
    /** Additional details/其他细节 */
    additional: string;
  };
}

/**
 * Template usage information
 */
export interface TemplateExportUsage {
  /** Description of the template */
  description: string;
  /** Usage examples */
  examples: string[];
  /** Additional notes */
  notes: string[];
}

/**
 * Complete template export structure
 */
export interface TemplateExport {
  /** Export metadata */
  metadata: TemplateExportMetadata;
  /** Template content */
  template: TemplateExportData;
  /** Usage information */
  usage: TemplateExportUsage;
}

/**
 * Export options
 */
export interface ExportOptions {
  /** Whether to include usage information */
  includeUsage?: boolean;
  /** Custom filename (overrides auto-generated filename) */
  filename?: string;
  /** Whether to format JSON with indentation */
  format?: boolean;
}

/**
 * Export result
 */
export interface ExportResult {
  /** Whether export was successful */
  success: boolean;
  /** Generated filename */
  filename: string;
  /** Export data size in bytes */
  size: number;
  /** Error message if export failed */
  error?: string;
}

/**
 * Content safety check result
 */
export interface ContentSafetyCheckResult {
  /** Whether content is safe to export */
  isSafe: boolean;
  /** Detected unsafe content (if any) */
  unsafeContent?: string[];
  /** Warning message */
  warning?: string;
}
