import { z } from 'zod';
import type { AnalysisData, StyleDimension } from '@/types/analysis';

export type AnalysisParseErrorCode = 'INVALID_JSON' | 'INVALID_STRUCTURE';

export class AnalysisParseError extends Error {
  readonly code: AnalysisParseErrorCode;
  readonly rawSnippet: string;

  constructor(message: string, code: AnalysisParseErrorCode, rawSnippet: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AnalysisParseError';
    this.code = code;
    this.rawSnippet = rawSnippet;
  }
}

function buildResponseSnippet(response: string | unknown, maxLength = 500): string {
  const raw =
    typeof response === 'string'
      ? response
      : (() => {
          try {
            return JSON.stringify(response);
          } catch {
            return String(response);
          }
        })();

  return raw.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

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
  const rawSnippet = buildResponseSnippet(response);

  // Try to parse as JSON
  if (typeof response === 'string') {
    try {
      // First extract JSON from potential markdown code blocks
      const cleanedJson = extractJsonFromResponse(response);
      parsed = JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Failed to parse analysis response as JSON:', error, { rawSnippet });
      throw new AnalysisParseError('Invalid JSON response from model', 'INVALID_JSON', rawSnippet, { cause: error });
    }
  } else {
    parsed = response;
  }

  // Validate using Zod schema
  const validationResult = AnalysisDataSchema.safeParse(parsed);

  if (!validationResult.success) {
    console.error('Analysis data validation failed:', validationResult.error, { rawSnippet });
    throw new AnalysisParseError(
      `Invalid analysis data structure: ${validationResult.error.message}`,
      'INVALID_STRUCTURE',
      rawSnippet
    );
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
  const cleaned = response.trim();

  // Prefer extracting JSON from markdown code blocks if present.
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  const codeBlocks = [...cleaned.matchAll(codeBlockRegex)];
  for (const match of codeBlocks) {
    const content = match[1]?.trim();
    if (!content) continue;
    const extractedFromBlock = extractFirstBalancedJson(content);
    if (extractedFromBlock) return extractedFromBlock;
    if (content.startsWith('{') || content.startsWith('[')) return content;
  }

  const extracted = extractFirstBalancedJson(cleaned);
  if (extracted) return extracted;

  // Fallback to previous behavior for compatibility.
  let fallback = cleaned;
  fallback = fallback.replace(/^```json\s*/i, '');
  fallback = fallback.replace(/^```\s*/i, '');
  fallback = fallback.replace(/\s*```$/i, '');
  return fallback;
}

function extractFirstBalancedJson(text: string): string | null {
  const objectStart = text.indexOf('{');
  const arrayStart = text.indexOf('[');

  const candidates = [objectStart, arrayStart].filter((i) => i >= 0);
  if (candidates.length === 0) return null;

  const start = Math.min(...candidates);
  const openChar = text[start];
  const closeChar = openChar === '{' ? '}' : ']';

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (inString) {
      if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) {
      depth++;
      continue;
    }

    if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1).trim();
      }
    }
  }

  return null;
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

// ============================================================================
// Provider Response Normalization (Tech-Spec: Provider Abstraction)
// ============================================================================

/**
 * Supported provider types
 */
export type ProviderType = 'replicate' | 'aliyun';

/**
 * Normalize provider response to standard JSON format
 *
 * Handles different response formats from various providers:
 * - Replicate: May return string or object, with/without markdown code blocks
 * - Aliyun: May return string with markdown code blocks, Chinese punctuation
 *
 * @param raw - Raw response from provider
 * @param provider - Provider type
 * @returns Normalized JSON string
 * @throws TypeError if provider is unknown
 *
 * @example
 * ```typescript
 * const replicateResponse = '{"dimensions": {...}}';
 * const normalized = normalizeProviderResponse(replicateResponse, 'replicate');
 *
 * const aliyunResponse = '```json\n{"dimensions": {...}}\n```';
 * const normalized2 = normalizeProviderResponse(aliyunResponse, 'aliyun');
 * ```
 */
export function normalizeProviderResponse(raw: string, provider: ProviderType): string {
  switch (provider) {
    case 'replicate':
      return normalizeReplicateResponse(raw);
    case 'aliyun':
      return normalizeAliyunResponse(raw);
    default:
      // TypeScript should catch this at compile time, but runtime safety
      const _exhaustiveCheck: never = provider;
      throw new TypeError(`Unknown provider: ${String(_exhaustiveCheck)}. Valid providers: 'replicate', 'aliyun'`);
  }
}

/**
 * Normalize Replicate provider response
 *
 * Replicate responses may be:
 * - JSON string
 * - JSON object (already parsed)
 * - Wrapped in markdown code blocks
 * - Contain extra whitespace
 *
 * @param raw - Raw response from Replicate
 * @returns Cleaned JSON string
 */
export function normalizeReplicateResponse(raw: string): string {
  let cleaned = raw.trim();

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Validate that we have something that looks like JSON
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    console.warn('[normalizeReplicateResponse] Response does not appear to be JSON, returning as-is:', cleaned.slice(0, 100));
  }

  return cleaned;
}

/**
 * Normalize Aliyun Bailian provider response
 *
 * Aliyun responses may be:
 * - Wrapped in markdown code blocks (```json ... ```)
 * - Contain Chinese punctuation (，"")
 * - Have excessive line breaks
 * - Mixed Chinese/English content
 *
 * @param raw - Raw response from Aliyun Bailian
 * @returns Cleaned JSON string with standardized punctuation
 */
export function normalizeAliyunResponse(raw: string): string {
  let cleaned = raw.trim();

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // Replace Chinese punctuation with English equivalents
  cleaned = cleaned.replace(/，/g, ',');        // Chinese comma → English comma
  cleaned = cleaned.replace(/"/g, '"');        // Chinese left quote → English quote
  cleaned = cleaned.replace(/"/g, '"');        // Chinese right quote → English quote
  cleaned = cleaned.replace(/：/g, ':');       // Chinese colon → English colon

  // Remove excessive line breaks (more than 2 consecutive)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remove extra whitespace around common punctuation
  cleaned = cleaned.replace(/\s*([,:{}\[\]])\s*/g, '$1');

  cleaned = cleaned.trim();

  // Validate that we have something that looks like JSON
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    console.warn('[normalizeAliyunResponse] Response does not appear to be JSON, returning as-is:', cleaned.slice(0, 100));
  }

  return cleaned;
}
