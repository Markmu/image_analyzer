/**
 * Image Generation API Client
 *
 * Epic 6 - Story 6.1: Image Generation
 *
 * This is a pure client-side module that calls the server-side API.
 * All server-side logic (Replicate SDK, moderation, database) is in /api/generate-images/route.ts
 */

import { buildGenerationPrompt, validatePromptLength } from './prompt-builder';
import type {
  ImageGenerationOptions,
  ImageGenerationResult,
  GenerationProgress,
  GeneratedImage,
} from '../types';
import { GENERATION_STAGES } from './generation-presets';
import { calculateCreditCost } from './resolution-config';
import { nanoid } from 'nanoid';

/**
 * Generate images by calling server-side API
 */
export async function generateImage(
  options: ImageGenerationOptions,
  userId: string,
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

    // Call server-side API (handles moderation, generation, and safety checks)
    const response = await fetch('/api/generate-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: options.template,
        provider: options.provider,
        model: options.model,
        resolution: options.resolution,
        quantity: options.quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle content policy violation
      if (errorData.error?.code === 'CONTENT_POLICY_VIOLATION') {
        throw new Error(`内容安全检查未通过: ${errorData.error.message}`);
      }

      throw new Error(errorData.error?.message || '生成图片失败');
    }

    const apiResult = await response.json();

    if (!apiResult.success) {
      throw new Error(apiResult.error?.message || '生成图片失败');
    }

    // Report processing stage
    onProgress?.({
      stage: 'processing',
      stageName: GENERATION_STAGES.processing,
      progress: 80,
      estimatedTimeRemaining: 5,
    });

    // Process returned images (already moderated by server)
    const images: GeneratedImage[] = apiResult.data.images.map((img: any) => ({
      ...img,
      safetyCheck: {
        passed: img.safetyCheck?.passed || true,
        score: img.safetyCheck?.score || 1.0,
        reason: img.safetyCheck?.reason,
      },
    }));

    // Calculate credits consumed
    const creditsConsumed = apiResult.data.creditsConsumed || calculateCreditCost(
      options.resolution,
      images.length
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
    console.error('[ImageGeneration] Error:', error);

    // Report failure
    onProgress?.({
      stage: 'failed',
      stageName: '生成失败',
      progress: 0,
    });

    throw error;
  }
}
