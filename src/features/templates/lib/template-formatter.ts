/**
 * Template Formatter
 *
 * Epic 5 - Story 5.1: Template Generation
 * Format templates for display and export
 */

import type { Template, TemplateJSONFormat } from '../types';

/**
 * Format template as plain text
 */
export function formatTemplateAsText(template: Template): string {
  return template.variableFormat;
}

/**
 * Format template as JSON string
 */
export function formatTemplateAsJSON(template: Template): string {
  return JSON.stringify(template.jsonFormat, null, 2);
}

/**
 * Format template as markdown
 */
export function formatTemplateAsMarkdown(template: Template): string {
  const { jsonFormat } = template;
  const lines: string[] = [];

  lines.push('# 模版提示词');
  lines.push('');

  if (jsonFormat.subject) {
    lines.push(`**主体**: ${jsonFormat.subject}`);
  }
  if (jsonFormat.style) {
    lines.push(`**风格**: ${jsonFormat.style}`);
  }
  if (jsonFormat.composition) {
    lines.push(`**构图**: ${jsonFormat.composition}`);
  }
  if (jsonFormat.colors) {
    lines.push(`**色彩**: ${jsonFormat.colors}`);
  }
  if (jsonFormat.lighting) {
    lines.push(`**光线**: ${jsonFormat.lighting}`);
  }
  if (jsonFormat.additional) {
    lines.push(`**其他**: ${jsonFormat.additional}`);
  }

  return lines.join('\n');
}

/**
 * Highlight variables in template text
 */
export function highlightVariables(templateText: string): Array<{
  text: string;
  isVariable: boolean;
}> {
  const segments = templateText.split(/(\[[^\]]+\])/g);

  return segments.map((segment) => ({
    text: segment,
    isVariable: /^\[[^\]]+\]$/.test(segment),
  }));
}

/**
 * Validate template JSON format
 */
export function validateTemplateJSON(data: unknown): data is TemplateJSONFormat {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check if all required fields are strings
  const stringFields = ['subject', 'style', 'composition', 'colors', 'lighting', 'additional'];

  return stringFields.every((field) => {
    const value = obj[field];
    return value === undefined || value === null || typeof value === 'string';
  });
}

/**
 * Merge user edits with original template
 */
export function mergeTemplateEdits(
  original: Template,
  edits: {
    variableFormat?: string;
    jsonFormat?: Partial<TemplateJSONFormat>;
  }
): Template {
  return {
    ...original,
    variableFormat: edits.variableFormat || original.variableFormat,
    jsonFormat: {
      ...original.jsonFormat,
      ...edits.jsonFormat,
    },
    updatedAt: new Date(),
  };
}
