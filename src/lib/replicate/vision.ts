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
