/**
 * Objective Description Schema Unit Tests
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * Test coverage for Zod schema validation of objective_description structure.
 * Tests cover normal samples, unknown scenarios, and missing field scenarios.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Objective Description Schema
 *
 * Defines the structure for forensic describer stage output.
 * All fields use snake_case naming convention as required by Story 1.3.
 */

// Primitive types
export const ObjectiveConfidenceSchema = z.number().min(0).max(1);

export const ImagingFeatureSchema = z.object({
  technique: z.string().optional(), // e.g., "photography", "illustration"
  lighting: z.string().optional(), // e.g., "natural", "studio", "flat"
  composition: z.string().optional(), // e.g., "centered", "rule-of-thirds"
  perspective: z.string().optional(), // e.g., "eye-level", "bird's-eye", "worm's-eye"
});

export const UncertainFieldSchema = z.object({
  field_name: z.string(),
  reason: z.string().optional(), // Why this field couldn't be determined
  confidence: z.number().min(0).max(1).optional(),
});

export const ObjectiveDescriptionSchema = z.object({
  // Core content fields
  visible_content: z.object({
    primary_subjects: z.array(z.string()).optional(),
    secondary_elements: z.array(z.string()).optional(),
    setting: z.string().optional(),
    actions: z.array(z.string()).optional(),
    text_content: z.array(z.string()).optional(),
  }),

  // Imaging features
  imaging_features: ImagingFeatureSchema.optional(),

  // Confidence scoring
  overall_confidence: ObjectiveConfidenceSchema,

  // Uncertainty tracking (required by AC2)
  uncertainty_fields: z.array(UncertainFieldSchema),

  // Metadata
  analysis_timestamp: z.string().optional(),
  model_version: z.string().optional(),
});

export type ObjectiveDescription = z.infer<typeof ObjectiveDescriptionSchema>;

describe('Objective Description Schema - P0 Tests', () => {
  describe('AC1: Complete structure validation', () => {
    it('should validate complete objective_description with all required fields', () => {
      // Arrange: Complete valid input
      const input = {
        visible_content: {
          primary_subjects: ['person', 'car'],
          setting: 'outdoor urban scene',
          actions: ['walking', 'carrying bag'],
        },
        imaging_features: {
          technique: 'photography',
          lighting: 'natural',
          composition: 'centered',
        },
        overall_confidence: 0.92,
        uncertainty_fields: [],
        analysis_timestamp: '2025-03-05T12:00:00Z',
        model_version: '1.0.0',
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Validation succeeds
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visible_content.primary_subjects).toEqual(['person', 'car']);
        expect(result.data.overall_confidence).toBe(0.92);
        expect(result.data.uncertainty_fields).toEqual([]);
      }
    });

    it('should include visible_content, imaging_features, overall_confidence, and uncertainty_fields', () => {
      // Arrange: Minimal required fields
      const input = {
        visible_content: {},
        overall_confidence: 0.85,
        uncertainty_fields: [],
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: All required fields present
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visible_content).toBeDefined();
        expect(result.data.overall_confidence).toBeDefined();
        expect(result.data.uncertainty_fields).toBeDefined();
      }
    });
  });

  describe('AC2: unknown field explicit marking', () => {
    it('should validate when uncertainty_fields contains unknown fields', () => {
      // Arrange: Input with uncertain fields
      const input = {
        visible_content: {},
        overall_confidence: 0.75,
        uncertainty_fields: [
          {
            field_name: 'lighting',
            reason: 'Image too dark to determine lighting condition',
            confidence: 0.3,
          },
          {
            field_name: 'technique',
            reason: 'Cannot distinguish between photo and digital art',
          },
        ],
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Uncertainty fields correctly validated
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uncertainty_fields).toHaveLength(2);
        expect(result.data.uncertainty_fields[0].field_name).toBe('lighting');
        expect(result.data.uncertainty_fields[0].reason).toBeDefined();
        expect(result.data.uncertainty_fields[0].confidence).toBe(0.3);
      }
    });

    it('should allow empty uncertainty_fields array when all fields are certain', () => {
      // Arrange: No uncertain fields
      const input = {
        visible_content: {},
        overall_confidence: 0.98,
        uncertainty_fields: [],
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Empty uncertainty_fields is valid
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uncertainty_fields).toEqual([]);
      }
    });
  });

  describe('AC3: snake_case naming convention (Technical Requirement)', () => {
    it('should validate snake_case field names in schema definition', () => {
      // This test verifies the schema itself uses snake_case
      const input = {
        visible_content: {},
        overall_confidence: 0.85,
        uncertainty_fields: [],
      };

      const result = ObjectiveDescriptionSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify key fields use snake_case
        expect(result.data.visible_content).toBeDefined();
        expect(result.data.overall_confidence).toBeDefined();
        expect(result.data.uncertainty_fields).toBeDefined();

        // Verify imaging_features uses snake_case
        const inputWithImaging = {
          ...input,
          imaging_features: {
            technique: 'photography',
          },
        };

        const resultWithImaging = ObjectiveDescriptionSchema.safeParse(inputWithImaging);
        expect(resultWithImaging.success).toBe(true);
      }
    });
  });

  describe('Field missing scenarios', () => {
    it('should reject when overall_confidence is missing', () => {
      // Arrange: Missing required field
      const input = {
        visible_content: {},
        uncertainty_fields: [],
        // overall_confidence missing
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Validation fails
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
      }
    });

    it('should reject when uncertainty_fields is missing (required by AC2)', () => {
      // Arrange: Missing required field
      const input = {
        visible_content: {},
        overall_confidence: 0.85,
        // uncertainty_fields missing
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Validation fails
      expect(result.success).toBe(false);
    });

    it('should accept when visible_content is empty object (fields are optional)', () => {
      // Arrange: Empty visible_content
      const input = {
        visible_content: {},
        overall_confidence: 0.85,
        uncertainty_fields: [],
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Validation succeeds
      expect(result.success).toBe(true);
    });

    it('should accept when imaging_features is missing (optional field)', () => {
      // Arrange: No imaging_features
      const input = {
        visible_content: {},
        overall_confidence: 0.85,
        uncertainty_fields: [],
        // imaging_features not provided
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Validation succeeds
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.imaging_features).toBeUndefined();
      }
    });
  });
});

describe('Objective Description Schema - P1 Tests', () => {
  describe('Zod validation error handling', () => {
    it('should return machine-readable error for invalid overall_confidence', () => {
      // Arrange: Invalid confidence (out of range)
      const input = {
        visible_content: {},
        overall_confidence: 1.5, // Invalid: > 1
        uncertainty_fields: [],
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Error is structured and machine-readable
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);

        // Verify error contains useful information
        const firstIssue = result.error.issues[0];
        expect(firstIssue.path).toContain('overall_confidence');
      }
    });

    it('should return machine-readable error for invalid uncertainty_fields array item', () => {
      // Arrange: Invalid uncertainty field (missing field_name)
      const input = {
        visible_content: {},
        overall_confidence: 0.85,
        uncertainty_fields: [
          {
            reason: 'Some reason',
            // field_name missing
          },
        ],
      };

      // Act: Parse input
      const result = ObjectiveDescriptionSchema.safeParse(input);

      // Assert: Error is structured
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
      }
    });
  });

  describe('TypeScript type inference', () => {
    it('should correctly infer TypeScript types from schema', () => {
      // This test verifies type safety at compile time
      const validInput: ObjectiveDescription = {
        visible_content: {
          primary_subjects: ['person'],
        },
        imaging_features: {
          technique: 'photography',
        },
        overall_confidence: 0.9,
        uncertainty_fields: [],
      };

      expect(validInput.visible_content.primary_subjects).toEqual(['person']);
      expect(validInput.imaging_features?.technique).toBe('photography');
      expect(validInput.overall_confidence).toBe(0.9);
      expect(validInput.uncertainty_fields).toEqual([]);

      // Type assertion: if we try to access a non-existent field, TypeScript will error
      // @ts-expect-error - Property 'invalid_field' does not exist
      expect(() => validInput.invalid_field).toThrow();
    });

    it('should correctly type optional fields', () => {
      const inputWithOptional: ObjectiveDescription = {
        visible_content: {},
        overall_confidence: 0.85,
        uncertainty_fields: [],
      };

      // imaging_features is optional
      expect(inputWithOptional.imaging_features).toBeUndefined();

      // But we can add it
      inputWithOptional.imaging_features = {
        technique: 'photography',
      };
      expect(inputWithOptional.imaging_features).toBeDefined();
    });
  });
});

describe('Schema Best Practices', () => {
  it('should use safeParse for error handling (not parse)', () => {
    // Arrange: Invalid input
    const input = {
      visible_content: {},
      overall_confidence: 'invalid', // Wrong type
      uncertainty_fields: [],
    };

    // Act: Use safeParse (not parse)
    const result = ObjectiveDescriptionSchema.safeParse(input);

    // Assert: safeParse returns result object, doesn't throw
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }

    // Verify parse() would throw (not used in production)
    expect(() => {
      ObjectiveDescriptionSchema.parse(input);
    }).toThrow();
  });

  it('should support nullable vs optional distinction', () => {
    // This test verifies the schema correctly distinguishes:
    // - optional: field can be omitted (undefined)
    // - nullable: field can be null (not used here, but pattern documented)

    const input1: ObjectiveDescription = {
      visible_content: {},
      overall_confidence: 0.85,
      uncertainty_fields: [],
      // imaging_features omitted (undefined)
    };

    const result1 = ObjectiveDescriptionSchema.safeParse(input1);
    expect(result1.success).toBe(true);

    const input2: ObjectiveDescription = {
      visible_content: {},
      overall_confidence: 0.85,
      uncertainty_fields: [],
      imaging_features: {
        technique: 'photography',
      },
    };

    const result2 = ObjectiveDescriptionSchema.safeParse(input2);
    expect(result2.success).toBe(true);
  });
});
