import { z } from 'zod';
import type { AnalysisData, StyleDimension, StyleFeature } from '@/types/analysis';

/**
 * Zod schema for validating style features
 */
const StyleFeatureSchema = z.object({
  name: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Zod schema for validating style dimensions
 */
const StyleDimensionSchema = z.object({
  name: z.string(),
  features: z.array(StyleFeatureSchema).min(1),
  confidence: z.number().min(0).max(1),
});

/**
 * Zod schema for validating complete analysis data
 */
const AnalysisDataSchema = z.object({
  dimensions: z.object({
    lighting: StyleDimensionSchema,
    composition: StyleDimensionSchema,
    color: StyleDimensionSchema,
    artisticStyle: StyleDimensionSchema,
  }),
  overallConfidence: z.number().min(0).max(1),
  // Model raw output usually doesn't include these fields.
  // They are filled by service layer after parsing.
  modelUsed: z.string().default('unknown'),
  analysisDuration: z.number().default(0),
});

/**
 * Parse and validate analysis response from Replicate API
 * @param response - Raw response string from the model
 * @returns Parsed and validated AnalysisData
 * @throws Error if response is invalid
 */
export function parseAnalysisResponse(response: string | unknown): AnalysisData {
  let parsed: unknown;

  // Try to parse as JSON
  if (typeof response === 'string') {
    try {
      // First extract JSON from potential markdown code blocks
      const cleanedJson = extractJsonFromResponse(response);
      parsed = JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Failed to parse analysis response as JSON:', error);
      throw new Error('Invalid JSON response from model');
    }
  } else {
    parsed = response;
  }

  // Validate using Zod schema
  const validationResult = AnalysisDataSchema.safeParse(parsed);

  if (!validationResult.success) {
    console.error('Analysis data validation failed:', validationResult.error);
    throw new Error(`Invalid analysis data structure: ${validationResult.error.message}`);
  }

  return validationResult.data;
}

/**
 * Extract JSON from model response
 * Some models wrap JSON in markdown code blocks
 * @param response - Raw response string
 * @returns Cleaned JSON string
 */
export function extractJsonFromResponse(response: string): string {
  // Remove markdown code blocks if present
  let cleaned = response.trim();

  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  return cleaned;
}

/**
 * Calculate overall confidence from dimensions
 * @param dimensions - Style dimensions
 * @returns Average confidence across all dimensions
 */
export function calculateOverallConfidence(dimensions: {
  lighting: StyleDimension;
  composition: StyleDimension;
  color: StyleDimension;
  artisticStyle: StyleDimension;
}): number {
  const confidences = [
    dimensions.lighting.confidence,
    dimensions.composition.confidence,
    dimensions.color.confidence,
    dimensions.artisticStyle.confidence,
  ];

  const sum = confidences.reduce((acc, c) => acc + c, 0);
  return sum / confidences.length;
}
