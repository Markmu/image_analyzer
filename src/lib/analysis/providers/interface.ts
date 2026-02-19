/**
 * Vision Analysis Provider Interface
 *
 * Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入
 * Epic 3: Story 3-4 - Vision Model Integration
 *
 * 定义统一的图片分析 Provider 接口，支持多平台模型调用
 */

import type { AnalysisData } from '@/types/analysis';

/**
 * 复杂度分析结果
 * 用于验证图片是否适合进行风格分析
 */
export interface ComplexityAnalysisResult {
  /** 图片中的主要对象数量 */
  subjectCount: number;
  /** 整体复杂度级别 */
  complexity: 'low' | 'medium' | 'high';
  /** 分析置信度 (0-1) */
  confidence: number;
  /** 分析结果说明 */
  reason: string;
}

/**
 * 图片风格分析参数
 */
export interface AnalyzeImageStyleParams {
  /**
   * 图片 URL（支持 http/https 或 base64 data URI）
   *
   * 支持格式：
   * - HTTP/HTTPS URL: `https://example.com/image.jpg`
   * - Base64 Data URI: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`
   *
   * @example
   * ```typescript
   * // 使用 URL
   * { imageUrl: 'https://example.com/image.jpg' }
   *
   * // 使用 Base64
   * { imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' }
   * ```
   */
  imageUrl: string;
  /** 分析提示词（可选，默认使用模型默认 prompt） */
  prompt?: string;
  /** 最大生成 token 数（可选） */
  maxTokens?: number;
}

/**
 * 图片复杂度验证参数
 */
export interface ValidateImageComplexityParams {
  /**
   * 图片 URL（支持 http/https 或 base64 data URI）
   *
   * 支持格式：
   * - HTTP/HTTPS URL: `https://example.com/image.jpg`
   * - Base64 Data URI: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`
   */
  imageUrl: string;
  /** 验证提示词（可选，默认使用模型默认 prompt） */
  prompt?: string;
}

/**
 * 视觉分析 Provider 接口
 *
 * 所有视觉分析 Provider 必须实现此接口，确保：
 * 1. 统一的方法签名
 * 2. 一致的返回类型
 * 3. 可替换性
 *
 * @example
 * ```typescript
 * class ReplicateVisionProvider implements VisionAnalysisProvider {
 *   readonly providerId = 'replicate';
 *
 *   async analyzeImageStyle(params: AnalyzeImageStyleParams): Promise<AnalysisData> {
 *     // Replicate 特定实现
 *   }
 *
 *   async validateImageComplexity(params: ValidateImageComplexityParams): Promise<ComplexityAnalysisResult> {
 *     // Replicate 特定实现
 *   }
 * }
 * ```
 */
export interface VisionAnalysisProvider {
  /**
   * 执行图片风格分析
   *
   * 提取四维度风格特征：光影、构图、色彩、艺术风格
   *
   * @param params - 分析参数
   * @returns 结构化的风格分析数据
   * @throws Error 当分析失败时抛出错误（由上层决定是否重试）
   *
   * @example
   * ```typescript
   * const result = await provider.analyzeImageStyle({
   *   imageUrl: 'https://example.com/image.jpg',
   *   prompt: '分析这张图片的视觉风格',
   *   maxTokens: 1000
   * });
   * ```
   */
  analyzeImageStyle(params: AnalyzeImageStyleParams): Promise<AnalysisData>;

  /**
   * 验证图片复杂度
   *
   * 判断图片是否适合进行风格分析，避免过于复杂或简单的图片
   *
   * @param params - 验证参数
   * @returns 复杂度分析结果
   * @throws Error 当验证失败时抛出错误（由上层决定是否重试）
   *
   * @example
   * ```typescript
   * const result = await provider.validateImageComplexity({
   *   imageUrl: 'https://example.com/image.jpg'
   * });
   *
   * if (result.complexity === 'high') {
   *   console.warn('图片过于复杂，可能影响分析准确度');
   * }
   * ```
   */
  validateImageComplexity(params: ValidateImageComplexityParams): Promise<ComplexityAnalysisResult>;

  /**
   * Provider 标识符
   *
   * 用于：
   * - 日志记录和监控
   * - 错误追踪
   * - Provider 路由和缓存
   *
   * @readonly
   * @example 'replicate' | 'aliyun' | 'azure-openai'
   */
  readonly providerId: string;
}
