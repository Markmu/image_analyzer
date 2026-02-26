/**
 * Template Snapshot Converter
 *
 * Converts SavedTemplate (with templateSnapshot) to Template format
 * for use in editors and other components that expect Template type.
 *
 * Epic 7 - Story 7.2: Template Library
 * Detail Page Optimization - Data Conversion Layer
 */

import type { AnalysisData } from '@/types/analysis';
import type { Template, TemplateJSONFormat, TemplateFieldKey } from '../types/template';
import type { SavedTemplate } from '../types/library';
import { FIELD_CONFIGS } from './field-configs';
import { validateAndConvertAnalysisData } from './validation-schemas';

/**
 * Validate analysisData from templateSnapshot
 *
 * This is a runtime type guard that validates the structure of
 * templateSnapshot.analysisData and converts it to AnalysisData.
 *
 * Uses Zod schema validation for strict type checking.
 *
 * @param data - Unknown data from templateSnapshot.analysisData
 * @returns AnalysisData or null if invalid
 *
 * @deprecated Use validateAndConvertAnalysisData from validation-schemas.ts instead.
 * This function is kept for backwards compatibility.
 */
export function validateAnalysisData(data: unknown): AnalysisData | null {
  return validateAndConvertAnalysisData(data);
}

/**
 * Create a blank TemplateJSONFormat for fallback
 *
 * @returns Empty TemplateJSONFormat
 */
function createBlankJsonFormat(): TemplateJSONFormat {
  return {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  };
}

/**
 * Extract features from a dimension's features array
 *
 * @param features - Array of style features
 * @returns Top 3 features joined by Chinese comma
 */
function extractTopFeatures(features: { value: string; confidence: number }[]): string {
  if (!features || features.length === 0) {
    return '';
  }

  return features
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map((f) => f.value)
    .join('、');
}

/**
 * Generate JSON format from analysis data
 *
 * @param analysisData - Analysis data from template snapshot
 * @returns TemplateJSONFormat
 */
function generateJsonFormatFromAnalysis(analysisData: AnalysisData): TemplateJSONFormat {
  const { dimensions } = analysisData;

  return {
    subject: extractTopFeatures(dimensions.artisticStyle?.features || []) || '主体对象',
    style: extractTopFeatures(dimensions.artisticStyle?.features || []) || '艺术风格',
    composition: extractTopFeatures(dimensions.composition?.features || []) || '构图方式',
    colors: extractTopFeatures(dimensions.color?.features || []) || '色彩方案',
    lighting: extractTopFeatures(dimensions.lighting?.features || []) || '光线设置',
    additional: extractTopFeatures(
      Object.values(dimensions || {})
        .flatMap((dim) => dim?.features || [])
        .filter((f) => f.confidence < 0.6 && f.confidence > 0.3)
    ) || '其他细节',
  };
}

/**
 * Generate variable format from JSON format
 *
 * @param jsonFormat - TemplateJSONFormat
 * @returns Variable format string
 */
function generateVariableFormatFromJson(jsonFormat: TemplateJSONFormat): string {
  const lines: string[] = [];

  const fieldOrder: TemplateFieldKey[] = ['subject', 'style', 'composition', 'colors', 'lighting', 'additional'];

  for (const key of fieldOrder) {
    const value = jsonFormat[key];
    const config = FIELD_CONFIGS[key];
    if (value && config) {
      lines.push(`${config.label}: ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Convert SavedTemplate to Template format
 *
 * This function extracts the analysisData from templateSnapshot and
 * converts it to the Template format expected by editors and other
 * components. It reuses the existing template-generator logic for
 * consistency.
 *
 * @param savedTemplate - The saved template from the library
 * @param templateId - The template ID (as string)
 * @returns Template object or blank template if conversion fails
 */
export function templateSnapshotToTemplate(
  savedTemplate: SavedTemplate,
  templateId: string
): Template {
  const { templateSnapshot, userId, analysisResultId } = savedTemplate;

  // Validate and extract analysisData
  const analysisData = validateAnalysisData(templateSnapshot.analysisData);

  if (!analysisData) {
    // Fallback: return blank template if validation fails
    console.warn('Invalid analysisData in templateSnapshot, returning blank template');
    return {
      id: templateId,
      userId,
      analysisResultId: String(analysisResultId),
      variableFormat: '',
      jsonFormat: createBlankJsonFormat(),
      createdAt: savedTemplate.createdAt,
      updatedAt: savedTemplate.updatedAt,
    };
  }

  // Reuse conversion logic
  try {
    const jsonFormat = generateJsonFormatFromAnalysis(analysisData);
    const variableFormat = generateVariableFormatFromJson(jsonFormat);

    return {
      id: templateId,
      userId,
      analysisResultId: String(analysisResultId),
      variableFormat,
      jsonFormat,
      createdAt: savedTemplate.createdAt,
      updatedAt: savedTemplate.updatedAt,
    };
  } catch (error) {
    console.error('Failed to convert templateSnapshot:', error);
    // Return blank template as fallback
    return {
      id: templateId,
      userId,
      analysisResultId: String(analysisResultId),
      variableFormat: '',
      jsonFormat: createBlankJsonFormat(),
      createdAt: savedTemplate.createdAt,
      updatedAt: savedTemplate.updatedAt,
    };
  }
}

/**
 * Check if a template has valid (populated) data
 *
 * @param template - Template to check
 * @returns true if template has at least one non-empty field
 */
export function isTemplateValid(template: Template | null): boolean {
  if (!template) {
    return false;
  }

  const { jsonFormat } = template;

  // Check if any field has content
  return Boolean(
    jsonFormat.subject ||
      jsonFormat.style ||
      jsonFormat.composition ||
      jsonFormat.colors ||
      jsonFormat.lighting ||
      jsonFormat.additional
  );
}
