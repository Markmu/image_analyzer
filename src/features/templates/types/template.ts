/**
 * Template Types
 *
 * Epic 5 - Story 5.1: Template Generation
 * Type definitions for prompt template generation and management
 */

import type { AnalysisData } from '@/types/analysis';

/**
 * Template field keys
 */
export type TemplateFieldKey = 'subject' | 'style' | 'composition' | 'colors' | 'lighting' | 'additional';

/**
 * Template field metadata
 */
export interface TemplateField {
  /** Field key */
  key: TemplateFieldKey;
  /** Display label */
  label: string;
  /** Placeholder text */
  placeholder: string;
  /** Whether this field is required */
  required: boolean;
}

/**
 * JSON format template structure
 */
export interface TemplateJSONFormat {
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
}

/**
 * Template data structure
 */
export interface Template {
  /** Unique template ID */
  id: string;
  /** User ID who owns this template */
  userId: string;
  /** Analysis result ID this template was generated from */
  analysisResultId: string;
  /** Variable format template (with [variable] placeholders) */
  variableFormat: string;
  /** JSON format template */
  jsonFormat: TemplateJSONFormat;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Template generation options
 */
export interface TemplateGenerationOptions {
  /** Whether to include all fields or only populated ones */
  includeEmptyFields?: boolean;
  /** Custom field order */
  fieldOrder?: TemplateFieldKey[];
}

/**
 * Template editor state
 */
export interface TemplateEditorState {
  /** Current template being edited */
  template: Template | null;
  /** Edited variable format */
  editedVariableFormat: string;
  /** Edited JSON format */
  editedJsonFormat: TemplateJSONFormat;
  /** Whether editor is in read-only mode */
  readOnly?: boolean;
}
