/**
 * Provider Router
 *
 * Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入
 * 根据 model ID 路由到对应的 Provider 实例
 *
 * 职责：
 * - 根据模型配置路由到对应的 Provider
 * - 缓存 Provider 实例（复用连接）
 * - 提供统一的调用接口
 * - 处理模型不存在和 Provider 未实现的错误
 */

import type { VisionAnalysisProvider } from './interface';
import type { AnalyzeImageStyleParams, ValidateImageComplexityParams, ComplexityAnalysisResult } from './interface';
import type { AnalysisData } from '@/types/analysis';
import { modelRegistry, getModelPrompt } from '@/lib/analysis/models';
import { ModelNotFoundError, UnknownProviderError } from './errors';
import { ReplicateVisionProvider } from './replicate';
import { AliyunBailianProvider } from './aliyun-bailian';

/**
 * Provider Router
 *
 * 根据模型 ID 自动路由到对应的 Provider，并缓存实例以提高性能
 */
export class ProviderRouter {
  /**
   * Provider 实例缓存
   * 键为 provider 类型（'replicate' | 'aliyun'）
   */
  private providerCache = new Map<string, VisionAnalysisProvider>();

  /**
   * Get provider instance for a given model ID
   *
   * 从缓存获取或创建新的 Provider 实例
   *
   * @param modelId - Model identifier
   * @returns Provider instance
   * @throws ModelNotFoundError if model does not exist
   * @throws UnknownProviderError if provider is not implemented
   *
   * @example
   * ```typescript
   * const router = new ProviderRouter();
   * const provider = router.getProvider('qwen3-vl');
   * // Returns ReplicateVisionProvider instance (cached)
   * ```
   */
  getProvider(modelId: string): VisionAnalysisProvider {
    // Get model configuration
    const model = modelRegistry.getModelById(modelId);

    if (!model) {
      throw new ModelNotFoundError(modelId);
    }

    // Get provider type from model config
    const providerType = (model as any).provider;

    if (!providerType) {
      throw new Error(`Model ${modelId} does not have a 'provider' field configured`);
    }

    // Check cache first
    const cachedProvider = this.providerCache.get(providerType);
    if (cachedProvider) {
      return cachedProvider;
    }

    // Create new provider instance
    const provider = this.createProvider(providerType);

    // Cache for future use
    this.providerCache.set(providerType, provider);

    return provider;
  }

  /**
   * Analyze image with provider routing
   *
   * 根据 modelId 自动路由到对应的 Provider 执行分析
   *
   * @param imageUrl - Image URL
   * @param modelId - Model identifier
   * @param prompt - Optional custom prompt
   * @param imageFile - Optional image file object (Buffer or File)
   * @returns Analysis data
   * @throws ModelNotFoundError if model does not exist
   * @throws UnknownProviderError if provider is not implemented
   *
   * @example
   * ```typescript
   * const router = new ProviderRouter();
   * const result = await router.analyzeImageWithProvider(
   *   'https://example.com/image.jpg',
   *   'qwen3-vl'
   * );
   * ```
   */
  async analyzeImageWithProvider(
    imageUrl: string,
    modelId: string,
    prompt?: string,
    imageFile?: File | Buffer
  ): Promise<AnalysisData> {
    const provider = this.getProvider(modelId);

    // Get model-specific prompt if not provided
    const finalPrompt = prompt || this.getModelPrompt(modelId);

    return provider.analyzeImageStyle({
      imageUrl,
      imageFile,
      prompt: finalPrompt,
    });
  }

  /**
   * Validate complexity with provider routing
   *
   * 根据 modelId 自动路由到对应的 Provider 执行复杂度验证
   *
   * @param imageUrl - Image URL
   * @param modelId - Model identifier
   * @param prompt - Optional custom prompt
   * @param imageFile - Optional image file object (Buffer or File)
   * @returns Complexity analysis result
   * @throws ModelNotFoundError if model does not exist
   * @throws UnknownProviderError if provider is not implemented
   *
   * @example
   * ```typescript
   * const router = new ProviderRouter();
   * const result = await router.validateComplexityWithProvider(
   *   'https://example.com/image.jpg',
   *   'qwen3-vl'
   * );
   * ```
   */
  async validateComplexityWithProvider(
    imageUrl: string,
    modelId: string,
    prompt?: string,
    imageFile?: File | Buffer
  ): Promise<ComplexityAnalysisResult> {
    const provider = this.getProvider(modelId);

    return provider.validateImageComplexity({
      imageUrl,
      imageFile,
      prompt,
    });
  }

  /**
   * Create provider instance by type
   *
   * @private
   */
  private createProvider(providerType: string): VisionAnalysisProvider {
    switch (providerType) {
      case 'replicate':
        return new ReplicateVisionProvider();
      case 'aliyun':
        return new AliyunBailianProvider();
      default:
        throw new UnknownProviderError(providerType);
    }
  }

  /**
   * Get model prompt from model registry
   *
   * @private
   */
  private getModelPrompt(modelId: string): string {
    return getModelPrompt(modelId);
  }

  /**
   * Reset provider cache
   *
   * 清除所有缓存的 Provider 实例
   * 主要用于测试环境，确保测试隔离
   *
   * @example
   * ```typescript
   * // In test setup
   * beforeEach(() => {
   *   router.resetCache();
   * });
   * ```
   */
  resetCache(): void {
    this.providerCache.clear();
  }

  /**
   * Get cached provider count
   *
   * 主要用于调试和测试
   *
   * @returns Number of cached providers
   */
  getCacheSize(): number {
    return this.providerCache.size;
  }
}

// Singleton instance
export const providerRouter = new ProviderRouter();
