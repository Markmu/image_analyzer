import { replicate } from './index';

/**
 * Input parameters for image generation
 */
export interface GenerateImageInput {
  /** Text prompt describing the image to generate */
  prompt: string;
  /** Negative prompt (what to avoid) */
  negativePrompt?: string;
  /** Number of images to generate */
  numOutputs?: number;
  /** Image dimensions */
  width?: number;
  height?: number;
  /** Inference steps */
  steps?: number;
  /** Guidance scale (strength of prompt) */
  guidanceScale?: number;
  /** Random seed for reproducibility */
  seed?: number;
}

/**
 * Output from image generation
 */
export interface GenerateImageOutput {
  /** Array of generated image URLs */
  images: string[];
  /** Seed used for generation */
  seed: number;
  /** Time taken to generate */
  latency: number;
  /** Model version used */
  model: string;
}

/**
 * Replicate API response type (varies by model)
 */
interface ReplicateImageResponse {
  url?: string;
  path?: string;
  seed?: number;
  latency?: number;
  [key: string]: unknown;
}

/**
 * Generate images using Replicate's image models
 * @param input - Image generation parameters
 * @returns Generated images and metadata
 */
export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  // Model ID should be configured via environment variable in production
  const model = process.env.REPLICATE_IMAGE_MODEL_ID || 'your-image-model-id';

  const response = await replicate.run(model as `${string}/${string}` | `${string}/${string}:${string}`, {
    input: {
      prompt: input.prompt,
      negative_prompt: input.negativePrompt,
      num_outputs: input.numOutputs || 1,
      width: input.width || 1024,
      height: input.height || 1024,
      steps: input.steps || 50,
      guidance_scale: input.guidanceScale || 7.5,
      seed: input.seed,
    },
  });

  // Handle different response formats from different models
  const isArray = Array.isArray(response);
  const respObj = isArray ? response[0] : response;
  const images = isArray
    ? response.map((r) => r.url || r.path || String(r))
    : [respObj.url || respObj.path || String(respObj)];

  return {
    images,
    seed: respObj.seed || input.seed || Math.floor(Math.random() * 1000000),
    latency: respObj.latency || 0,
    model,
  };
}

/**
 * Generate a single image with default settings
 * @param prompt - Text prompt for image generation
 * @returns Generated image URL
 */
export async function quickGenerate(prompt: string): Promise<string> {
  const result = await generateImage({ prompt });
  return result.images[0];
}

/**
 * Variate an existing image while maintaining style
 * @param imageUrl - URL of the source image
 * @param prompt - Modification prompt
 * @returns Variated image URL
 */
export async function variateImage(
  imageUrl: string,
  prompt: string
): Promise<GenerateImageOutput> {
  // Model ID should be configured via environment variable in production
  const model = process.env.REPLICATE_IMAGE_VARIATION_MODEL_ID || 'your-image-variation-model-id';

  const response = await replicate.run(model as `${string}/${string}` | `${string}/${string}:${string}`, {
    input: {
      image: imageUrl,
      prompt,
      num_outputs: 1,
    },
  });

  const isArray = Array.isArray(response);
  const respObj = isArray ? response[0] : response;
  const images = isArray
    ? response.map((r) => r.url || r.path || String(r))
    : [respObj.url || respObj.path || String(respObj)];

  return {
    images,
    seed: respObj.seed || Math.floor(Math.random() * 1000000),
    latency: respObj.latency || 0,
    model,
  };
}
