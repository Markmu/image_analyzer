/**
 * Template Constants
 *
 * Epic 5 - Story 5.1: Template Generation
 * Constants for template fields and metadata
 */

import type { TemplateField, TemplateFieldKey } from './template';

/**
 * All available template fields with metadata
 */
export const TEMPLATE_FIELDS: readonly TemplateField[] = [
  {
    key: 'subject',
    label: '主体描述',
    placeholder: '描述图片中的主要对象或场景',
    required: true,
  },
  {
    key: 'style',
    label: '风格描述',
    placeholder: '描述艺术风格、绘画技巧或视觉风格',
    required: true,
  },
  {
    key: 'composition',
    label: '构图信息',
    placeholder: '描述构图方式、视角、布局等',
    required: false,
  },
  {
    key: 'colors',
    label: '色彩方案',
    placeholder: '描述主要颜色、色调、色彩搭配等',
    required: false,
  },
  {
    key: 'lighting',
    label: '光线设置',
    placeholder: '描述光线方向、强度、氛围等',
    required: false,
  },
  {
    key: 'additional',
    label: '其他细节',
    placeholder: '描述其他值得注意的细节或元素',
    required: false,
  },
] as const;

/**
 * Default field order for template generation
 */
export const DEFAULT_FIELD_ORDER: readonly TemplateFieldKey[] = [
  'subject',
  'style',
  'composition',
  'colors',
  'lighting',
  'additional',
] as const;

/**
 * Template variable marker format
 */
export const VARIABLE_FORMAT = {
  /** Opening bracket for variable placeholder */
  OPEN: '[',
  /** Closing bracket for variable placeholder */
  CLOSE: ']',
  /** Regex pattern to extract variables */
  PATTERN: /\[([^\]]+)\]/g,
} as const;

/**
 * Get field metadata by key
 */
export function getFieldByKey(key: TemplateFieldKey): TemplateField | undefined {
  return TEMPLATE_FIELDS.find((field) => field.key === key);
}

/**
 * Get field label by key
 */
export function getFieldLabel(key: TemplateFieldKey): string {
  return getFieldByKey(key)?.label || key;
}
