/**
 * Editor Types
 *
 * Epic 5 - Story 5.3: Template Editor
 * Type definitions for the template editor component
 */

import type { TemplateFieldKey, TemplateJSONFormat } from './template';

/**
 * Template field configuration
 */
export interface FieldConfig {
  /** Field key */
  key: TemplateFieldKey;
  /** Display label */
  label: string;
  /** Placeholder text */
  placeholder: string;
  /** Whether this field is required */
  required: boolean;
  /** Maximum character length */
  maxLength: number;
  /** Smart suggestion keywords */
  suggestions: string[];
  /** Validation function (returns error message or null) */
  validation?: (value: string) => string | null;
}

/**
 * History record entry
 */
export interface HistoryRecord {
  /** Field values at this point in history */
  fields: TemplateJSONFormat;
  /** Timestamp when this record was created */
  timestamp: number;
}

/**
 * Template editor state
 */
export interface TemplateEditorState {
  /** Current field values */
  fields: TemplateJSONFormat;

  /** History records */
  history: HistoryRecord[];
  /** Current history index */
  historyIndex: number;

  /** UI state */
  isPreviewExpanded: boolean;
  activeField: TemplateFieldKey | null;

  /** Actions */
  updateField: (field: TemplateFieldKey, value: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  togglePreview: () => void;
  setActiveField: (field: TemplateFieldKey | null) => void;
  reset: (initialFields: Partial<TemplateJSONFormat>) => void;
}
