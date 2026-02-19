/**
 * Template Generator
 *
 * Epic 5 - Story 5.1: Template Generation
 * Generate structured prompt templates from style analysis results
 */

import type { AnalysisData, StyleDimension, StyleFeature } from '@/types/analysis';
import type {
  Template,
  TemplateFieldKey,
  TemplateGenerationOptions,
  TemplateJSONFormat,
} from '../types';
import { DEFAULT_FIELD_ORDER, getFieldLabel } from '../types/constants';

/**
 * Extract key features from a style dimension
 */
function extractDimensionFeatures(dimension: StyleDimension): string {
  if (!dimension.features || dimension.features.length === 0) {
    return '';
  }

  // Get top 3 features by confidence
  const topFeatures = [...dimension.features]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map((feature) => feature.value)
    .join('、');

  return topFeatures;
}

/**
 * Generate a value for a specific template field from analysis data
 */
function generateFieldValue(fieldKey: TemplateFieldKey, analysisData: AnalysisData): string {
  const { dimensions } = analysisData;

  switch (fieldKey) {
    case 'subject':
      // Extract from artistic style (often contains subject info)
      return extractDimensionFeatures(dimensions.artisticStyle) || '主体对象';

    case 'style':
      // Extract from artistic style
      return extractDimensionFeatures(dimensions.artisticStyle) || '艺术风格';

    case 'composition':
      // Extract from composition dimension
      return extractDimensionFeatures(dimensions.composition) || '构图方式';

    case 'colors':
      // Extract from color dimension
      return extractDimensionFeatures(dimensions.color) || '色彩方案';

    case 'lighting':
      // Extract from lighting dimension
      return extractDimensionFeatures(dimensions.lighting) || '光线设置';

    case 'additional':
      // Combine low-confidence features from all dimensions
      const additionalFeatures: string[] = [];
      Object.values(dimensions).forEach((dimension) => {
        dimension.features.forEach((feature) => {
          if (feature.confidence < 0.6 && feature.confidence > 0.3) {
            additionalFeatures.push(feature.value);
          }
        });
      });
      return additionalFeatures.slice(0, 3).join('、') || '其他细节';

    default:
      return '';
  }
}

/**
 * Generate JSON format template from analysis data
 */
function generateJSONFormat(
  analysisData: AnalysisData,
  options?: TemplateGenerationOptions
): TemplateJSONFormat {
  const fieldOrder = options?.fieldOrder || DEFAULT_FIELD_ORDER;
  const includeEmptyFields = options?.includeEmptyFields ?? false;

  const jsonFormat: Partial<TemplateJSONFormat> = {};

  fieldOrder.forEach((fieldKey) => {
    const value = generateFieldValue(fieldKey, analysisData);

    // Skip empty fields if option is disabled
    if (!includeEmptyFields && !value) {
      return;
    }

    jsonFormat[fieldKey] = value;
  });

  // Ensure all fields have values (even if empty)
  return {
    subject: jsonFormat.subject || '',
    style: jsonFormat.style || '',
    composition: jsonFormat.composition || '',
    colors: jsonFormat.colors || '',
    lighting: jsonFormat.lighting || '',
    additional: jsonFormat.additional || '',
  };
}

/**
 * Generate variable format template from JSON format
 */
function generateVariableFormat(jsonFormat: TemplateJSONFormat): string {
  const lines: string[] = [];

  // Add subject (always first)
  if (jsonFormat.subject) {
    lines.push(`主体: [${jsonFormat.subject}]`);
  }

  // Add style
  if (jsonFormat.style) {
    lines.push(`风格: [${jsonFormat.style}]`);
  }

  // Add composition if present
  if (jsonFormat.composition) {
    lines.push(`构图: [${jsonFormat.composition}]`);
  }

  // Add colors if present
  if (jsonFormat.colors) {
    lines.push(`色彩: [${jsonFormat.colors}]`);
  }

  // Add lighting if present
  if (jsonFormat.lighting) {
    lines.push(`光线: [${jsonFormat.lighting}]`);
  }

  // Add additional details if present
  if (jsonFormat.additional) {
    lines.push(`其他: [${jsonFormat.additional}]`);
  }

  return lines.join('\n');
}

/**
 * Generate a complete template from analysis data
 *
 * @param analysisResultId - ID of the analysis result
 * @param userId - User ID
 * @param analysisData - Analysis data from style analysis
 * @param options - Generation options
 * @returns Generated template
 */
export function generateTemplate(
  analysisResultId: string,
  userId: string,
  analysisData: AnalysisData,
  options?: TemplateGenerationOptions
): Template {
  const now = new Date();
  const jsonFormat = generateJSONFormat(analysisData, options);
  const variableFormat = generateVariableFormat(jsonFormat);

  return {
    id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    analysisResultId,
    variableFormat,
    jsonFormat,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Extract variable names from variable format template
 */
export function extractVariables(variableFormat: string): string[] {
  const matches = variableFormat.match(/\[([^\]]+)\]/g) || [];
  return [...new Set(matches.map((entry) => entry.slice(1, -1).trim()).filter(Boolean))];
}

/**
 * Replace variables in template with values
 */
export function replaceVariables(
  variableFormat: string,
  values: Record<string, string>
): string {
  let result = variableFormat;

  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Format JSON template as display string
 */
export function formatJSONAsText(jsonFormat: TemplateJSONFormat): string {
  const lines: string[] = [];

  if (jsonFormat.subject) {
    lines.push(`Subject: ${jsonFormat.subject}`);
  }
  if (jsonFormat.style) {
    lines.push(`Style: ${jsonFormat.style}`);
  }
  if (jsonFormat.composition) {
    lines.push(`Composition: ${jsonFormat.composition}`);
  }
  if (jsonFormat.colors) {
    lines.push(`Colors: ${jsonFormat.colors}`);
  }
  if (jsonFormat.lighting) {
    lines.push(`Lighting: ${jsonFormat.lighting}`);
  }
  if (jsonFormat.additional) {
    lines.push(`Additional: ${jsonFormat.additional}`);
  }

  return lines.join('\n');
}
