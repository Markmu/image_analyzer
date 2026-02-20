/**
 * Image Generation API Client
 *
 * Epic 6 - Story 6.1: Image Generation
 * Core API functions for image generation using Replicate
 */

import { replicate } from '@/lib/replicate';
import type {
  ImageGenerationOptions,
  ImageGenerationResult,
  GeneratedImage,
  GenerationProgress,
  GenerationStage,
} from '../types';
import { buildGenerationPrompt, validatePromptLength } from './prompt-builder';
import { calculateCreditCost } from './resolution-config';
import { GENERATION_LIMITS, GENERATION_STAGES } from './generation-presets';
import { nanoid } from 'nanoid';

/**
 * Generate images using Replicate API
 */
export async function generateImage(
  options: ImageGenerationOptions,
  onProgress?: (progress: GenerationProgress) => void
): Promise<ImageGenerationResult> {
  const generationId = nanoid();
  const startTime = new Date();

  try {
    // Report initial stage
    onProgress?.({
      stage: 'initializing',
      stageName: GENERATION_STAGES.initializing,
      progress: 0,
    });

    // Build prompt from template
    const prompt = buildGenerationPrompt(options.template);

    // Validate prompt length
    if (!validatePromptLength(prompt)) {
      throw new Error('Prompt too long for generation');
    }

    // Report generating stage
    onProgress?.({
      stage: 'generating',
      stageName: GENERATION_STAGES.generating,
      progress: 10,
      estimatedTimeRemaining: options.provider === 'stability-ai' ? 15 : 30,
    });

    // Call Replicate API
    const model = options.model as `${string}/${string}`;
    const output = await replicate.run(model, {
      input: {
        prompt,
        width: options.resolution.width,
        height: options.resolution.height,
        num_outputs: options.quantity,
        // Additional parameters for better quality
        enhance_prompt: true,
        // @ts-ignore - Replicate model-specific parameters
        scheduler: 'DPMSolverMultistep',
        // @ts-ignore
        num_inference_steps: 30,
      },
    });

    // Report processing stage
    onProgress?.({
      stage: 'processing',
      stageName: GENERATION_STAGES.processing,
      progress: 80,
      estimatedTimeRemaining: 5,
    });

    // Process output
    const images: GeneratedImage[] = [];
    const outputs = Array.isArray(output) ? output : [output];

    for (let i = 0; i < outputs.length; i++) {
      const imageUrl = typeof outputs[i] === 'string' ? outputs[i] : String(outputs[i]);

      images.push({
        id: nanoid(),
        url: imageUrl,
        thumbnailUrl: imageUrl, // Same URL for now, could add thumbnail generation
        metadata: {
          width: options.resolution.width,
          height: options.resolution.height,
          format: 'png',
          size: 0, // Will be updated when image is loaded
        },
        safetyCheck: {
          passed: true, // Will be updated after safety check
          score: 1.0,
        },
      });
    }

    // Calculate credits consumed
    const creditsConsumed = calculateCreditCost(
      options.resolution,
      options.quantity
    );

    const result: ImageGenerationResult = {
      id: generationId,
      images,
      provider: options.provider,
      model: options.model,
      resolution: options.resolution,
      templateId: options.template.id,
      creditsConsumed,
      status: 'completed',
      createdAt: startTime,
      completedAt: new Date(),
    };

    // Report completion
    onProgress?.({
      stage: 'completed',
      stageName: GENERATION_STAGES.completed,
      progress: 100,
    });

    return result;
  } catch (error) {
    // Report failure
    onProgress?.({
      stage: 'failed',
      stageName: GENERATION_STAGES.failed,
      progress: 0,
    });

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      id: generationId,
      images: [],
      provider: options.provider,
      model: options.model,
      resolution: options.resolution,
      templateId: options.template.id,
      creditsConsumed: 0,
      status: 'failed',
      createdAt: startTime,
      error: errorMessage,
    };
  }
}

/**
 * Poll generation progress (placeholder for future enhancement)
 * Currently uses simple timeout-based estimation
 */
export async function pollGenerationProgress(
  generationId: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<void> {
  // This is a simplified implementation
  // In production, you would poll Replicate's prediction API
  const stages: GenerationStage[] = ['initializing', 'generating', 'processing'];
  const progressPerStage = 30;

  for (let i = 0; i < stages.length; i++) {
    onProgress?.({
      stage: stages[i],
      stageName: GENERATION_STAGES[stages[i]],
      progress: i * progressPerStage,
      estimatedTimeRemaining: (stages.length - i) * 10,
    });

    // Simulate progress
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

/**
 * Get available generation providers (placeholder)
 * In production, this would query Replicate's API for available models
 */
export async function getAvailableProviders(): Promise<Array<{
  id: string;
  name: string;
  models: Array<{
    id: string;
    name: string;
    version: string;
  }>;
}>> {
  // Placeholder implementation
  return [
    {
      id: 'stability-ai',
      name: 'Stability AI',
      models: [
        {
          id: 'stability-ai/sdxl',
          name: 'Stable Diffusion XL',
          version: '1.0',
        },
      ],
    },
  ];
}
