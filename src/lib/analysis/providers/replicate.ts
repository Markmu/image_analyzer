/**
 * Replicate Vision Provider
 *
 * Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入
 * 封装 Replicate API 调用逻辑，实现 VisionAnalysisProvider 接口
 *
 * 职责：
 * - 调用 Replicate vision API
 * - 处理版本回退逻辑（Replicate 特有）
 * - 规范化响应格式
 * - 不处理通用重试（由调用方决定）
 */

import type { VisionAnalysisProvider, AnalyzeImageStyleParams, ValidateImageComplexityParams, ComplexityAnalysisResult } from './interface';
import type { AnalysisData } from '@/types/analysis';
import { replicate } from '@/lib/replicate';
import { parseAnalysisResponse, normalizeProviderResponse } from '@/lib/analysis/parser';

/**
 * Replicate Vision Provider
 *
 * 实现 VisionAnalysisProvider 接口，封装所有 Replicate 特定逻辑
 */
export class ReplicateVisionProvider implements VisionAnalysisProvider {
  readonly providerId = 'replicate' as const;

  /**
   * Analyze image style using Replicate vision model
   */
  async analyzeImageStyle(params: AnalyzeImageStyleParams): Promise<AnalysisData> {
    const { imageUrl, prompt, maxTokens = 1000 } = params;

    // Use version fallback for better compatibility
    const output = await this.runModelWithVersionFallback(imageUrl, prompt, maxTokens);

    // Normalize and parse response
    const outputStr = typeof output === 'string' ? output : JSON.stringify(output);
    const cleanedJson = normalizeProviderResponse(outputStr, 'replicate');
    const analysisData = parseAnalysisResponse(cleanedJson);

    return analysisData;
  }

  /**
   * Validate image complexity using Replicate vision model
   */
  async validateImageComplexity(params: ValidateImageComplexityParams): Promise<ComplexityAnalysisResult> {
    const { imageUrl, prompt } = params;

    const defaultPrompt = `Analyze this image for style analysis suitability and respond ONLY with valid JSON in this exact format:
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

    const finalPrompt = prompt || defaultPrompt;

    try {
      const response = await this.runModelWithVersionFallback(imageUrl, finalPrompt, 300);

      // Parse response
      const respObj = typeof response === 'string' ? JSON.parse(response) : response;

      // Parse and validate response
      const subjectCount = (respObj as { subjectCount?: number }).subjectCount ?? 1;
      const complexity = (respObj as { complexity?: string }).complexity ?? 'medium';
      const confidence = (respObj as { confidence?: number }).confidence ?? 0.5;
      const reason = (respObj as { reason?: string }).reason ?? '图像分析完成';

      return {
        subjectCount: typeof subjectCount === 'number' ? subjectCount : parseInt(String(subjectCount)) || 1,
        complexity: ['low', 'medium', 'high'].includes(complexity as string)
          ? complexity as 'low' | 'medium' | 'high'
          : 'medium',
        confidence: typeof confidence === 'number' ? confidence : parseFloat(String(confidence)) || 0.5,
        reason,
      };
    } catch (error) {
      // Fallback to conservative defaults on API error
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[ReplicateVisionProvider] Complexity validation failed:', errorMessage);
      return {
        subjectCount: 1,
        complexity: 'medium',
        confidence: 0.5,
        reason: '无法完成深度分析，将使用基本验证',
      };
    }
  }

  /**
   * Run Replicate model with version fallback
   *
   * Replicate 特有功能：如果固定版本不可用，自动回退到最新版本
   *
   * @param imageUrl - Image URL
   * @param prompt - Analysis prompt
   * @param maxTokens - Maximum tokens to generate
   * @returns Model output
   * @throws Error if both pinned and unpinned model fail
   *
   * @private
   */
  private async runModelWithVersionFallback(
    imageUrl: string,
    prompt: string | undefined,
    maxTokens: number
  ): Promise<unknown> {
    // Get model ID from environment or use default
    const model = process.env.REPLICATE_VISION_MODEL_ID || 'lucataco/qwen3-vl-8b-instruct:39e893666996acf464cff75688ad49ac95ef54e9f1c688fbc677330acc478e11';

    try {
      return await replicate.run(model as `${string}/${string}` | `${string}/${string}:${string}`, {
        input: {
          image: imageUrl,
          prompt: prompt || 'Analyze this image',
          max_tokens: maxTokens,
        },
      });
    } catch (error) {
      // Check if we should retry without pinned version
      const unpinnedModel = this.toUnpinnedModel(model);
      if (!unpinnedModel || !this.shouldRetryWithoutPinnedVersion(error)) {
        throw error;
      }

      console.warn('[ReplicateVisionProvider] Pinned model version unavailable, retrying with latest model', {
        pinnedModel: model,
        fallbackModel: unpinnedModel,
      });

      return replicate.run(unpinnedModel as `${string}/${string}`, {
        input: {
          image: imageUrl,
          prompt: prompt || 'Analyze this image',
          max_tokens: maxTokens,
        },
      });
    }
  }

  /**
   * Check if error indicates we should retry without pinned version
   *
   * @private
   */
  private shouldRetryWithoutPinnedVersion(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes('Invalid version or not permitted') ||
      message.includes('The specified version does not exist') ||
      message.includes('status 422')
    );
  }

  /**
   * Convert pinned model to unpinned model
   *
   * @example
   * toUnpinnedModel('owner/model:abc123') // => 'owner/model'
   * toUnpinnedModel('owner/model') // => null
   *
   * @private
   */
  private toUnpinnedModel(model: string): string | null {
    const separatorIndex = model.indexOf(':');
    if (separatorIndex <= 0) return null;
    return model.slice(0, separatorIndex);
  }
}
