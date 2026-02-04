/**
 * Analysis Factory for Test Data Generation
 *
 * Creates realistic image analysis test data for the image analyzer app.
 * Represents the results and metadata of AI-powered image analysis.
 */

import { faker } from '@faker-js/faker';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type AnalysisType = 'style_analysis' | 'color_analysis' | 'composition_analysis' | 'full_analysis';

export interface AnalysisStyleResult {
  name: string;
  confidence: number;
  description?: string;
}

export interface AnalysisColorPalette {
  dominant: string[];
  secondary: string[];
  accent?: string;
}

export interface AnalysisComposition {
  ruleOfThirdsScore: number;
  balanceScore: number;
  focalPointDetected: boolean;
  elements: string[];
}

export interface AnalysisMetadata {
  imageWidth: number;
  imageHeight: number;
  imageFormat: string;
  fileSize: number;
  processingTimeMs: number;
  modelVersion: string;
}

export interface Analysis {
  id: string;
  userId: string;
  templateId?: string;
  status: AnalysisStatus;
  type: AnalysisType;
  inputImageUrl: string;
  resultImageUrl?: string;
  styleResults: AnalysisStyleResult[];
  colorPalette?: AnalysisColorPalette;
  composition?: AnalysisComposition;
  metadata: AnalysisMetadata;
  errorMessage?: string;
  creditCost: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateAnalysisInput extends Partial<Omit<Analysis, 'id' | 'createdAt' | 'completedAt'>> {
  // Override any field except id, createdAt, completedAt
}

// ============================================
// STYLE PRESETS FOR RESULTS
// ============================================

const DETECTED_STYLES: AnalysisStyleResult[] = [
  { name: 'Minimalist', confidence: 0.95, description: 'Clean lines and simple composition' },
  { name: 'Modern', confidence: 0.88, description: 'Contemporary design elements' },
  { name: 'Vintage', confidence: 0.82, description: 'Retro aesthetic with warm tones' },
  { name: 'Industrial', confidence: 0.79, description: 'Raw materials and urban elements' },
  { name: 'Boho', confidence: 0.75, description: 'Bohemian and eclectic style' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateRandomColorPalette(): AnalysisColorPalette {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF7F50',
  ];

  const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

  return {
    dominant: shuffle(colors).slice(0, 3),
    secondary: shuffle(colors).slice(3, 5),
    accent: faker.datatype.boolean() ? shuffle(colors)[5] : undefined,
  };
}

function generateRandomComposition(): AnalysisComposition {
  return {
    ruleOfThirdsScore: faker.number.float({ min: 0.5, max: 1.0, precision: 0.01 }),
    balanceScore: faker.number.float({ min: 0.5, max: 1.0, precision: 0.01 }),
    focalPointDetected: faker.datatype.boolean(),
    elements: faker.helpers.arrayElements(
      ['foreground', 'background', 'text', 'person', 'object', 'nature', 'architecture'],
      { min: 2, max: 4 },
    ),
  };
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a test analysis with realistic data
 *
 * @param overrides - Partial analysis data to override defaults
 * @returns Complete Analysis object with unique, collision-free data
 *
 * @example
 * // Default analysis (pending)
 * const analysis = createAnalysis();
 *
 * // Completed analysis
 * const analysis = createAnalysis({ status: 'completed' });
 *
 * // Failed analysis
 * const analysis = createAnalysis({ status: 'failed', errorMessage: 'Invalid image format' });
 */
export function createAnalysis(overrides: CreateAnalysisInput = {}): Analysis {
  const now = new Date();
  const randomStyles = faker.helpers.arrayElements(DETECTED_STYLES, { min: 1, max: 3 });

  const analysis: Analysis = {
    id: faker.string.uuid(),
    userId: 'test-user-id',
    templateId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
    status: 'pending',
    type: faker.helpers.arrayElement([
      'style_analysis',
      'color_analysis',
      'composition_analysis',
      'full_analysis',
    ]),
    inputImageUrl: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
    resultImageUrl: undefined,
    styleResults: randomStyles,
    colorPalette: generateRandomColorPalette(),
    composition: generateRandomComposition(),
    metadata: {
      imageWidth: faker.number.int({ min: 400, max: 4096 }),
      imageHeight: faker.number.int({ min: 400, max: 4096 }),
      imageFormat: 'image/jpeg',
      fileSize: faker.number.int({ min: 100000, max: 10000000 }),
      processingTimeMs: faker.number.int({ min: 1000, max: 60000 }),
      modelVersion: 'v1.0.0',
    },
    errorMessage: undefined,
    creditCost: faker.number.int({ min: 1, max: 10 }),
    createdAt: now,
    completedAt: undefined,
    ...overrides,
  };

  return analysis;
}

// ============================================
// SPECIALIZED FACTORIES
// ============================================

/**
 * Create a completed analysis with results
 */
export function createCompletedAnalysis(overrides: CreateAnalysisInput = {}): Analysis {
  const completedAt = new Date();

  return createAnalysis({
    status: 'completed',
    resultImageUrl: faker.image.urlPicsumPhotos({ width: 800, height: 600 }),
    metadata: {
      imageWidth: faker.number.int({ min: 800, max: 2048 }),
      imageHeight: faker.number.int({ min: 800, max: 2048 }),
      imageFormat: 'image/jpeg',
      fileSize: faker.number.int({ min: 500000, max: 5000000 }),
      processingTimeMs: faker.number.int({ min: 5000, max: 30000 }),
      modelVersion: 'v1.0.0',
    },
    completedAt,
    ...overrides,
  });
}

/**
 * Create a processing analysis (in progress)
 */
export function createProcessingAnalysis(overrides: CreateAnalysisInput = {}): Analysis {
  return createAnalysis({
    status: 'processing',
    resultImageUrl: undefined,
    completedAt: undefined,
    ...overrides,
  });
}

/**
 * Create a failed analysis
 */
export function createFailedAnalysis(overrides: CreateAnalysisInput = {}): Analysis {
  const errorMessages = [
    'Unable to process image: Invalid format',
    'Analysis failed: Model timeout',
    'Error: Image too large for processing',
    'Failed: Content violates safety guidelines',
    'Error: Network timeout during processing',
  ];

  return createAnalysis({
    status: 'failed',
    errorMessage: faker.helpers.arrayElement(errorMessages),
    ...overrides,
  });
}

/**
 * Create a pending analysis (queued for processing)
 */
export function createPendingAnalysis(overrides: CreateAnalysisInput = {}): Analysis {
  return createAnalysis({
    status: 'pending',
    resultImageUrl: undefined,
    completedAt: undefined,
    ...overrides,
  });
}

/**
 * Create a cancelled analysis
 */
export function createCancelledAnalysis(overrides: CreateAnalysisInput = {}): Analysis {
  return createAnalysis({
    status: 'cancelled',
    errorMessage: 'User cancelled the analysis',
    ...overrides,
  });
}

/**
 * Create a full analysis (all analysis types)
 */
export function createFullAnalysis(overrides: CreateAnalysisInput = {}): Analysis {
  return createCompletedAnalysis({
    type: 'full_analysis',
    ...overrides,
  });
}

// ============================================
// BATCH CREATION
// ============================================

/**
 * Create multiple analyses for bulk testing
 */
export function createAnalyses(
  count: number,
  baseOverrides: CreateAnalysisInput = {},
): Analysis[] {
  return Array.from({ length: count }, () => createAnalysis(baseOverrides));
}

/**
 * Create analyses with mixed statuses
 */
export function createAnalysesWithStatus(
  statusCount: Record<AnalysisStatus, number>,
): Analysis[] {
  const analyses: Analysis[] = [];

  const statusFactories: Record<AnalysisStatus, () => Analysis> = {
    pending: () => createPendingAnalysis(),
    processing: () => createProcessingAnalysis(),
    completed: () => createCompletedAnalysis(),
    failed: () => createFailedAnalysis(),
    cancelled: () => createCancelledAnalysis(),
  };

  Object.entries(statusCount).forEach(([status, count]) => {
    const factory = statusFactories[status as AnalysisStatus];
    const statusAnalyses = Array.from({ length: count }, () => factory());
    analyses.push(...statusAnalyses);
  });

  return analyses;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate analysis object matches expected structure
 */
export function validateAnalysis(analysis: unknown): analysis is Analysis {
  if (!analysis || typeof analysis !== 'object') {
    return false;
  }

  const a = analysis as Record<string, unknown>;

  return (
    typeof a.id === 'string' &&
    typeof a.userId === 'string' &&
    ['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(a.status as string) &&
    ['style_analysis', 'color_analysis', 'composition_analysis', 'full_analysis'].includes(a.type as string) &&
    typeof a.inputImageUrl === 'string' &&
    typeof a.creditCost === 'number' &&
    a.createdAt instanceof Date
  );
}

/**
 * Validate analysis completion status
 */
export function isAnalysisComplete(analysis: Analysis): boolean {
  return analysis.status === 'completed' && !!analysis.resultImageUrl;
}

/**
 * Validate analysis failed
 */
export function isAnalysisFailed(analysis: Analysis): boolean {
  return analysis.status === 'failed';
}

// ============================================
// MOCK DATA SETS
// ============================================

/**
 * Predefined analyses for common test scenarios
 */
export const MockAnalyses = {
  default: createAnalysis(),
  pending: createPendingAnalysis(),
  processing: createProcessingAnalysis(),
  completed: createCompletedAnalysis(),
  failed: createFailedAnalysis(),
  cancelled: createCancelledAnalysis(),
  full: createFullAnalysis(),
};

/**
 * Generate a mock analysis database response
 */
export function createAnalysisDatabaseResponse(analyses: Analysis[]) {
  return {
    success: true,
    data: analyses,
  };
}

/**
 * Generate a mock single analysis response
 */
export function createAnalysisResponse(analysis: Analysis) {
  return {
    success: true,
    data: analysis,
  };
}

/**
 * Generate an analysis error response
 */
export function createAnalysisErrorResponse(code: string, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
