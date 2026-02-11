import { replicate } from './index';

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
