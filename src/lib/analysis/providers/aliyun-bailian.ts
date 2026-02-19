/**
 * Aliyun Bailian Provider
 *
 * Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入
 * 使用 OpenAI SDK 调用阿里百炼 OpenAI 兼容接口
 *
 * 阿里百炼 API 文档：
 * - https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api
 * - https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope
 *
 * 职责：
 * - 调用阿里百炼 OpenAI 兼容接口
 * - 支持图片 URL 和 Base64 输入
 * - 规范化响应格式（处理中文标点等）
 * - 启动时验证环境变量
 */

import OpenAI from 'openai';
import type { VisionAnalysisProvider, AnalyzeImageStyleParams, ValidateImageComplexityParams, ComplexityAnalysisResult } from './interface';
import type { AnalysisData } from '@/types/analysis';
import { extractJsonFromResponse, parseAnalysisResponse, normalizeProviderResponse } from '@/lib/analysis/parser';

/**
 * 将文件转换为 Base64 编码
 * @param file - File 对象或 Buffer
 * @returns Base64 编码的字符串(不含 data URL 前缀)
 */
async function fileToBase64(file: File | Buffer): Promise<string> {
  let buffer: Buffer;

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = file;
  }

  return buffer.toString('base64');
}

/**
 * 获取图片的 MIME 类型
 * @param file - File 对象或 Buffer
 * @returns MIME 类型字符串
 */
function getImageMimeType(file: File | Buffer): string {
  if (file instanceof File) {
    return file.type || 'image/jpeg';
  }
  // 对于 Buffer,默认使用 JPEG
  return 'image/jpeg';
}

/**
 * Aliyun Bailian Provider
 *
 * 实现 VisionAnalysisProvider 接口，封装阿里百炼特定逻辑
 */
export class AliyunBailianProvider implements VisionAnalysisProvider {
  readonly providerId = 'aliyun' as const;

  /**
   * OpenAI client instance
   * 复用连接，避免重复创建
   */
  private client: OpenAI;

  /**
   * Default model to use for analysis
   *
   * Note: qwen-vl-plus is Alibaba Bailian's multimodal vision model
   * See: https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api
   */
  private readonly defaultModel = 'qwen-vl-plus';

  /**
   * Constructor - Initialize OpenAI client and validate environment variables
   *
   * @throws Error if ALIYUN_API_KEY is not set
   */
  constructor() {
    // Validate required environment variables at startup
    if (!process.env.ALIYUN_API_KEY) {
      throw new Error(
        'ALIYUN_API_KEY is required for AliyunBailianProvider. ' +
        'Please set the environment variable before starting the application. ' +
        'Example: ALIYUN_API_KEY=sk-xxx'
      );
    }

    // Initialize OpenAI client with Aliyun configuration
    this.client = new OpenAI({
      apiKey: process.env.ALIYUN_API_KEY,
      baseURL: process.env.ALIYUN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
  }

  /**
   * Analyze image style using Aliyun Bailian vision model
   */
  async analyzeImageStyle(params: AnalyzeImageStyleParams): Promise<AnalysisData> {
    const { imageUrl, imageFile, prompt, maxTokens = 1000 } = params;

    const defaultPrompt = `Analyze the visual style of this image and extract the following four dimensions:

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

    const finalPrompt = prompt || defaultPrompt;

    // 准备图片内容:优先使用 Base64,其次使用 URL
    let imageContent: { type: string; image_url: { url: string } };

    if (imageFile) {
      // 使用 Base64 编码的图片(更可靠)
      const base64 = await fileToBase64(imageFile);
      const mimeType = getImageMimeType(imageFile);
      imageContent = {
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64}` },
      };
    } else if (imageUrl) {
      // 使用 URL(需要公网可访问)
      imageContent = {
        type: 'image_url',
        image_url: { url: imageUrl },
      };
    } else {
      throw new Error('Either imageUrl or imageFile must be provided');
    }

    // Call Aliyun API with image
    const response = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: finalPrompt },
            imageContent,
          ],
        },
      ],
      max_tokens: maxTokens,
    });

    // Extract response content
    const output = response.choices[0]?.message?.content || '';

    // Normalize and parse response (handles Chinese punctuation, markdown blocks, etc.)
    const cleanedJson = normalizeProviderResponse(output, 'aliyun');
    const analysisData = parseAnalysisResponse(cleanedJson);

    return analysisData;
  }

  /**
   * Validate image complexity using Aliyun Bailian vision model
   */
  async validateImageComplexity(params: ValidateImageComplexityParams): Promise<ComplexityAnalysisResult> {
    const { imageUrl, imageFile, prompt } = params;

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
- reason: Brief explanation in Chinese`;

    const finalPrompt = prompt || defaultPrompt;

    // 准备图片内容:优先使用 Base64,其次使用 URL
    let imageContent: { type: string; image_url: { url: string } };

    if (imageFile) {
      // 使用 Base64 编码的图片(更可靠)
      const base64 = await fileToBase64(imageFile);
      const mimeType = getImageMimeType(imageFile);
      imageContent = {
        type: 'image_url',
        image_url: { url: `data:${mimeType};base64,${base64}` },
      };
    } else if (imageUrl) {
      // 使用 URL(需要公网可访问)
      imageContent = {
        type: 'image_url',
        image_url: { url: imageUrl },
      };
    } else {
      throw new Error('Either imageUrl or imageFile must be provided');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: finalPrompt },
              imageContent,
            ],
          },
        ],
        max_tokens: 300,
      });

      const output = response.choices[0]?.message?.content || '';

      // Parse response
      const cleanedJson = normalizeProviderResponse(output, 'aliyun');
      const respObj = JSON.parse(cleanedJson);

      // Parse and validate response
      const subjectCount = respObj.subjectCount ?? 1;
      const complexity = respObj.complexity ?? 'medium';
      const confidence = respObj.confidence ?? 0.5;
      const reason = respObj.reason ?? '图像分析完成';

      return {
        subjectCount: typeof subjectCount === 'number' ? subjectCount : parseInt(String(subjectCount)) || 1,
        complexity: ['low', 'medium', 'high'].includes(complexity)
          ? complexity
          : 'medium',
        confidence: typeof confidence === 'number' ? confidence : parseFloat(String(confidence)) || 0.5,
        reason,
      };
    } catch (error) {
      // Fallback to conservative defaults on API error
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[AliyunBailianProvider] Complexity validation failed:', errorMessage);
      return {
        subjectCount: 1,
        complexity: 'medium',
        confidence: 0.5,
        reason: '无法完成深度分析，将使用基本验证',
      };
    }
  }
}
