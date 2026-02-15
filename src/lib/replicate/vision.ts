import { replicate } from './index';
import type { AnalysisData } from '@/types/analysis';
import { extractJsonFromResponse, parseAnalysisResponse } from '@/lib/analysis/parser';
import { modelRegistry, getModelPrompt, MODEL_ERROR_CONFIG, handleModelError } from '@/lib/analysis/models';

/**
 * Input parameters for image analysis
 */
export interface AnalyzeImageInput {
  /** URL of the image to analyze */
  image: string;
  /** Optional prompt to guide the analysis */
  prompt?: string;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
}

/**
 * Output from image analysis
 */
export interface AnalyzeImageOutput {
  /** Description of the image */
  description: string;
  /** Tags or labels detected */
  tags: string[];
  /** Confidence scores for each tag */
  confidence: Record<string, number>;
  /** Style information detected */
  style?: string;
}

/**
 * Replicate API response type for vision models
 */
interface ReplicateVisionResponse {
  description?: string;
  tags?: string[];
  confidence?: Record<string, number>;
  style?: string;
  [key: string]: unknown;
}

/**
 * Analyze an image using Replicate's vision model
 * @param input - Image analysis parameters
 * @returns Analysis results including description, tags, and confidence scores
 */
export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  const model = process.env.REPLICATE_VISION_MODEL_ID || 'your-vision-model-id';

  const response = await replicate.run(model as `${string}/${string}` | `${string}/${string}:${string}`, {
    input: {
      image: input.image,
      prompt: input.prompt || 'Analyze this image and describe its content, style, and characteristics',
      max_tokens: input.maxTokens || 500,
    },
  });

  const respObj = response as ReplicateVisionResponse;

  // Transform response to expected output format
  return {
    description: respObj.description || '',
    tags: respObj.tags || [],
    confidence: respObj.confidence || {},
    style: respObj.style,
  };
}

/**
 * Check if an image contains specific content
 * @param imageUrl - URL of the image to check
 * @param criteria - Content criteria to check for
 * @returns Whether the image meets the criteria
 */
export async function checkImageContent(
  imageUrl: string,
  criteria: string[]
): Promise<{ matches: boolean; details: string[] }> {
  const analysis = await analyzeImage({ image: imageUrl });

  const matches = criteria.filter((c) =>
    analysis.tags.some((tag) => tag.toLowerCase().includes(c.toLowerCase()))
  );

  return {
    matches: matches.length > 0,
    details: matches,
  };
}

/**
 * Complexity analysis result for image validation
 */
export interface ComplexityAnalysis {
  /** Estimated number of main subjects/objects in the image */
  subjectCount: number;
  /** Overall complexity level */
  complexity: 'low' | 'medium' | 'high';
  /** Confidence in the analysis (0-1) */
  confidence: number;
  /** Explanation of the analysis */
  reason: string;
}

/**
 * Replicate API response for complexity validation
 */
interface ComplexityValidationResponse {
  subjectCount?: number;
  complexity?: 'low' | 'medium' | 'high';
  confidence?: number;
  reason?: string;
  [key: string]: unknown;
}

/**
 * Validates image complexity using AI vision model
 * Analyzes the image to determine if it's suitable for style analysis
 * @param imageUrl - URL of the uploaded image to validate
 * @returns Complexity analysis with subject count, complexity level, and confidence
 */
export async function validateImageComplexity(imageUrl: string): Promise<ComplexityAnalysis> {
  const model = process.env.REPLICATE_VISION_MODEL_ID || 'qwen/qwen-vl-max:7b';

  const prompt = `Analyze this image for style analysis suitability and respond ONLY with valid JSON in this exact format:
{
  "subjectCount": <number of main subjects/objects>,
  "complexity": "low" or "medium" or "high",
  "confidence": <0.0 to 1.0>,
  "reason": "<brief explanation>"
}

Guidelines:
- subjectCount: Count distinct main objects/people (background objects don't count)
- complexity: "low" for single subject, clean background; "medium" for 2-5 subjects; "high" for 5+ subjects or chaotic scenes
- confidence: How confident are you in this analysis? (0.0-1.0)
- reason: Brief explanation in Chinese

Image URL: ${imageUrl}`;

  try {
    const response = await replicate.run(
      model as `${string}/${string}` | `${string}/${string}:${string}`,
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          max_tokens: 300,
        },
      }
    );

    const respObj = response as ComplexityValidationResponse;

    // Parse and validate response
    const subjectCount = respObj.subjectCount ?? 1;
    const complexity = respObj.complexity ?? 'medium';
    const confidence = respObj.confidence ?? 0.5;
    const reason = respObj.reason ?? '图像分析完成';

    return {
      subjectCount: typeof subjectCount === 'number' ? subjectCount : parseInt(String(subjectCount)) || 1,
      complexity: ['low', 'medium', 'high'].includes(complexity as string) ? complexity as 'low' | 'medium' | 'high' : 'medium',
      confidence: typeof confidence === 'number' ? confidence : parseFloat(String(confidence)) || 0.5,
      reason,
    };
  } catch (error) {
    // Fallback to conservative defaults on API error
    console.error('Complexity validation failed:', error);
    return {
      subjectCount: 1,
      complexity: 'medium',
      confidence: 0.5,
      reason: '无法完成深度分析，将使用基本验证',
    };
  }
}

// ============================================================================
// Style Analysis Functions (Epic 3: Story 3-1)
// ============================================================================

/**
 * Analyze image style using Replicate vision model
 * Extracts four dimensions of style: lighting, composition, color, and artistic style
 *
 * @param imageUrl - URL of the image to analyze
 * @returns Structured style analysis data
 *
 * @throws Error if analysis fails after max retries
 */
export async function analyzeImageStyle(imageUrl: string): Promise<AnalysisData> {
  const model = process.env.REPLICATE_VISION_MODEL_ID || 'yorickvp/llava-13b:2facb4a274b3e660f8e3b2db36195b5e4f2b6b5e';
  const MAX_RETRIES = 3;
  const TIMEOUT = 60000; // 60 seconds

  const prompt = `Analyze the visual style of this image and extract the following four dimensions:

1. **Lighting & Shadow**: Identify the main light source direction, light-shadow contrast, shadow characteristics
2. **Composition**: Identify the viewpoint, visual balance, depth of field
3. **Color**: Identify the main color palette, color contrast, color temperature
4. **Artistic Style**: Identify the style movement, art period, emotional tone

For each dimension, provide 3-5 specific feature tags with confidence scores (0-1).

Return the result in JSON format:
{
  "dimensions": {
    "lighting": {
      "name": "光影",
      "features": [
        {"name": "主光源方向", "value": "侧光", "confidence": 0.85},
        {"name": "光影对比度", "value": "高对比度", "confidence": 0.9},
        {"name": "阴影特征", "value": "柔和阴影", "confidence": 0.8}
      ],
      "confidence": 0.85
    },
    "composition": {
      "name": "构图",
      "features": [
        {"name": "视角", "value": "平视", "confidence": 0.92},
        {"name": "画面平衡", "value": "对称构图", "confidence": 0.88}
      ],
      "confidence": 0.90
    },
    "color": {
      "name": "色彩",
      "features": [
        {"name": "主色调", "value": "暖色调", "confidence": 0.95},
        {"name": "色彩对比度", "value": "中等对比", "confidence": 0.82}
      ],
      "confidence": 0.88
    },
    "artisticStyle": {
      "name": "艺术风格",
      "features": [
        {"name": "风格流派", "value": "印象派", "confidence": 0.78},
        {"name": "艺术时期", "value": "现代", "confidence": 0.85}
      ],
      "confidence": 0.81
    }
  },
  "overallConfidence": 0.86
}`;

  const startTime = Date.now();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const output = await replicate.run(
        model as `${string}/${string}` | `${string}/${string}:${string}`,
        {
          input: {
            image: imageUrl,
            prompt: prompt,
            max_tokens: 1000,
          },
        }
      );

      clearTimeout(timeoutId);

      // Extract and parse response
      const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
      const cleanedJson = extractJsonFromResponse(outputStr);
      const analysisData = parseAnalysisResponse(cleanedJson);

      // Add metadata
      analysisData.modelUsed = model;
      analysisData.analysisDuration = (Date.now() - startTime) / 1000;

      return analysisData;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error('Replicate Vision API failed after max retries', {
          error,
          imageUrl,
          attempts: attempt,
        });
        throw new Error('分析失败，请稍后重试');
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Analysis attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error('分析失败，请稍后重试');
}

// ============================================================================
// Multi-Model Support (Epic 3: Story 3-4)
// ============================================================================

/**
 * Analyze image with a specific model
 * Supports model selection and dynamic prompt adaptation
 *
 * @param imageUrl - URL of the image to analyze
 * @param modelId - Model identifier (e.g., 'qwen3-vl', 'kimi-k2.5', 'gemini-flash')
 * @returns Structured style analysis data
 *
 * @throws Error if analysis fails after max retries
 * @throws Error if model is not found or disabled
 */
export async function analyzeImageWithModel(imageUrl: string, modelId: string): Promise<AnalysisData> {
  // Get model configuration
  const model = modelRegistry.getModelById(modelId);

  if (!model) {
    throw new Error(`模型 ${modelId} 不存在`);
  }

  if (!model.enabled) {
    throw new Error(`模型 ${modelId} 已禁用`);
  }

  const MAX_RETRIES = MODEL_ERROR_CONFIG.maxRetries;
  const TIMEOUT = 60000; // 60 seconds

  // Get model-specific prompt
  const prompt = getModelPrompt(modelId);

  const startTime = Date.now();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const output = await replicate.run(
        model.replicateModelId as `${string}/${string}` | `${string}/${string}:${string}`,
        {
          input: {
            image: imageUrl,
            prompt: prompt,
            max_tokens: 1000,
          },
        }
      );

      // Extract and parse response
      const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
      const cleanedJson = extractJsonFromResponse(outputStr);
      const analysisData = parseAnalysisResponse(cleanedJson);

      // Add metadata
      analysisData.modelUsed = modelId;
      analysisData.analysisDuration = (Date.now() - startTime) / 1000;

      return analysisData;
    } catch (error) {
      // Check if error is retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = MODEL_ERROR_CONFIG.retryableErrors.some((e) =>
        errorMessage.toUpperCase().includes(e)
      );

      if (attempt === MAX_RETRIES || !isRetryable) {
        console.error(`Model ${modelId} failed after ${attempt} attempts`, {
          error,
          imageUrl,
          attempts: attempt,
        });

        // Re-throw with user-friendly message
        if (isRetryable) {
          throw new Error('分析超时，请稍后重试');
        }
        throw new Error(`模型 ${modelId} 暂时不可用，请稍后重试或选择其他模型`);
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * MODEL_ERROR_CONFIG.retryDelayMs;
      console.warn(`Model ${modelId} attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('分析失败，请稍后重试');
}

/**
 * Get the default model for style analysis
 * Uses the model's default setting or falls back to qwen3-vl
 */
export function getDefaultModel(): string {
  const defaultModel = modelRegistry.getDefaultModel();
  return defaultModel?.id || 'qwen3-vl';
}

/**
 * List all available models for the user based on their subscription tier
 */
export async function getAvailableModelsForUser(userId: string): Promise<{
  models: Array<{
    id: string;
    name: string;
    description: string;
    features: string[];
    isDefault: boolean;
    enabled: boolean;
    requiresTier: string;
  }>;
  tier: string;
}> {
  const { getUserAvailableModels } = await import('@/lib/analysis/models');
  const { models, tier } = await getUserAvailableModels(userId);

  return {
    models: models.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      features: m.features,
      isDefault: m.isDefault,
      enabled: m.enabled,
      requiresTier: m.requiresTier,
    })),
    tier,
  };
}

