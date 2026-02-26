/**
 * Validation Schemas for Template Data
 *
 * Epic 7 - Story 7.2: Template Library
 * Detail Page Optimization - Data Validation Layer
 *
 * Provides runtime type validation using Zod schemas.
 * Ensures data integrity when converting between different formats.
 */

import { z } from 'zod';

/**
 * Style Feature Schema
 * Represents a single detected feature with confidence score
 */
const StyleFeatureSchema = z.object({
  name: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Dimension Schema
 * Represents a single analysis dimension (lighting, composition, etc.)
 */
const DimensionSchema = z.object({
  name: z.string(),
  features: z.array(StyleFeatureSchema),
  confidence: z.number().min(0).max(1),
});

/**
 * Analysis Data Dimensions Schema
 * All dimensions are optional for backwards compatibility
 */
const AnalysisDataDimensionsSchema = z.object({
  lighting: DimensionSchema.optional(),
  composition: DimensionSchema.optional(),
  color: DimensionSchema.optional(),
  artisticStyle: DimensionSchema.optional(),
});

/**
 * Analysis Data Schema
 *
 * Runtime validation for template snapshot analysis data.
 * Uses partial() to allow missing dimensions for backwards compatibility.
 */
export const AnalysisDataSchema = z.object({
  dimensions: AnalysisDataDimensionsSchema.refine(
    (dims) => {
      // At least one dimension must be present
      return Boolean(
        dims.lighting || dims.composition || dims.color || dims.artisticStyle
      );
    },
    {
      message: 'At least one dimension must be present',
    }
  ),
  overallConfidence: z.number().min(0).max(1).optional(),
  modelUsed: z.string().optional(),
  analysisDuration: z.number().optional(),
});

/**
 * Type inference from schema
 */
export type AnalysisDataValidationInput = z.input<typeof AnalysisDataSchema>;
export type AnalysisDataValidationOutput = z.output<typeof AnalysisDataSchema>;

/**
 * Validate analysis data from template snapshot
 *
 * @param data - Unknown data from templateSnapshot.analysisData
 * @returns Validated analysis data or null if invalid
 */
export function validateAnalysisDataWithZod(data: unknown): AnalysisDataValidationOutput | null {
  try {
    const result = AnalysisDataSchema.safeParse(data);

    if (result.success) {
      return result.data;
    }

    // Log validation errors for debugging
    if (process.env.NODE_ENV === 'development') {
      console.warn('AnalysisData validation failed:', result.error.format());
    }

    return null;
  } catch (error) {
    console.error('Unexpected error during validation:', error);
    return null;
  }
}

/**
 * Validate and convert to AnalysisData type
 *
 * This function performs runtime validation and returns the proper
 * AnalysisData type or null if validation fails.
 *
 * @param data - Unknown data from templateSnapshot
 * @returns AnalysisData or null if invalid
 */
export function validateAndConvertAnalysisData(data: unknown): AnalysisDataValidationOutput | null {
  return validateAnalysisDataWithZod(data);
}
