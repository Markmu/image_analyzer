/**
 * Vision Model Configuration System
 *
 * Epic 3: Story 3-4 - Vision Model Integration
 * Defines model configuration, registry, and subscription tier access control
 */

import type { AnalysisData } from '@/types/analysis';

/**
 * Vision model definition
 */
export interface VisionModel {
  /** Unique model identifier */
  id: string;
  /** Display name */
  name: string;
  /** Model description */
  description: string;
  /** Model features/tags */
  features: string[];
  /** Replicate model identifier */
  replicateModelId: string;
  /** Whether this is the default model */
  isDefault: boolean;
  /** Whether this model is enabled */
  enabled: boolean;
  /** Minimum subscription tier required */
  requiresTier: 'free' | 'lite' | 'standard';
  /** Estimated cost per call (in credits) */
  costPerCall: number;
  /** Average analysis duration in seconds */
  avgDuration: number;
}

/**
 * Model configuration from database
 */
export interface ModelConfig {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  isDefault: boolean;
  requiresTier: string | null;
  costPerCall: number | null;
  avgDuration: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}

/**
 * Model usage statistics
 */
export interface ModelUsageStats {
  modelId: string;
  userId: string;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  lastUsedAt: Date | null;
}

/**
 * Aggregated model statistics for admin dashboard
 */
export interface ModelStats {
  modelId: string;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgDuration: number;
}

/**
 * User's model access information
 */
export interface UserModelAccess {
  userId: string;
  tier: 'free' | 'lite' | 'standard';
  availableModels: string[];
  preferredModel: string | null;
}

// ============================================================================
// Built-in Model Definitions (from environment variables or defaults)
// ============================================================================

/**
 * Default vision models
 * These can be overridden by environment variables
 */
export const DEFAULT_VISION_MODELS: VisionModel[] = [
  {
    id: 'qwen3-vl',
    name: 'Qwen3 VL 8B',
    description: '性价比高，适合日常使用，支持中文',
    features: ['快速', '经济', '中文优化'],
    replicateModelId: process.env.REPLICATE_VISION_MODEL_ID || 'lucataco/qwen3-vl-8b-instruct:39e893666996acf464cff75688ad49ac95ef54e9f1c688fbc677330acc478e11',
    isDefault: true,
    enabled: true,
    requiresTier: 'free',
    costPerCall: 1,
    avgDuration: 15,
  },
  {
    id: 'kimi-k2.5',
    name: 'Kimi K2.5',
    description: '中文理解能力强，适合中文图片分析',
    features: ['中文优化', '准确'],
    replicateModelId: 'moonshotai/kimi-k2.5',
    isDefault: false,
    enabled: true,
    requiresTier: 'lite',
    costPerCall: 2,
    avgDuration: 20,
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 3 Flash',
    description: '最高准确率，适合复杂分析场景',
    features: ['最高准确率', '详细分析'],
    replicateModelId: 'google/gemini-3-flash',
    isDefault: false,
    enabled: false,
    requiresTier: 'standard',
    costPerCall: 3,
    avgDuration: 25,
  },
];

/**
 * Subscription tier to model access mapping
 */
export const TIER_ACCESS: Record<'free' | 'lite' | 'standard', string[]> = {
  free: ['qwen3-vl'],
  lite: ['qwen3-vl', 'kimi-k2.5'],
  standard: ['qwen3-vl', 'kimi-k2.5', 'gemini-flash'],
};

// ============================================================================
// Model Registry
// ============================================================================

/**
 * In-memory model registry
 * Models can be added/removed dynamically
 */
class ModelRegistry {
  private models: Map<string, VisionModel> = new Map();
  private defaultModelId: string = 'qwen3-vl';

  constructor() {
    // Initialize with default models
    DEFAULT_VISION_MODELS.forEach((model) => {
      this.models.set(model.id, model);
      if (model.isDefault) {
        this.defaultModelId = model.id;
      }
    });
  }

  /**
   * Get all registered models
   */
  getAllModels(): VisionModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Get enabled models only
   */
  getEnabledModels(): VisionModel[] {
    return this.getAllModels().filter((m) => m.enabled);
  }

  /**
   * Get model by ID
   */
  getModelById(id: string): VisionModel | undefined {
    return this.models.get(id);
  }

  /**
   * Get default model
   */
  getDefaultModel(): VisionModel | undefined {
    return this.models.get(this.defaultModelId);
  }

  /**
   * Add or update a model
   */
  registerModel(model: VisionModel): void {
    this.models.set(model.id, model);
    if (model.isDefault) {
      this.defaultModelId = model.id;
    }
  }

  /**
   * Remove a model
   */
  unregisterModel(id: string): boolean {
    return this.models.delete(id);
  }

  /**
   * Enable/disable a model
   */
  setModelEnabled(id: string, enabled: boolean): boolean {
    const model = this.models.get(id);
    if (!model) return false;

    model.enabled = enabled;
    this.models.set(id, model);
    return true;
  }

  /**
   * Get models available for a subscription tier
   */
  getModelsForTier(tier: 'free' | 'lite' | 'standard'): VisionModel[] {
    const allowedIds = TIER_ACCESS[tier];
    return this.getEnabledModels().filter((m) => allowedIds.includes(m.id));
  }

  /**
   * Check if a model is accessible for a subscription tier
   */
  isModelAccessible(modelId: string, tier: 'free' | 'lite' | 'standard'): boolean {
    const model = this.models.get(modelId);
    if (!model || !model.enabled) return false;

    const tierLevels = ['free', 'lite', 'standard'];
    const modelTierIndex = tierLevels.indexOf(model.requiresTier);
    const userTierIndex = tierLevels.indexOf(tier);

    return userTierIndex >= modelTierIndex;
  }
}

// Singleton instance
export const modelRegistry = new ModelRegistry();

// ============================================================================
// Prompt Templates for Different Models
// ============================================================================

/**
 * Prompt templates for different models
 */
export const PROMPT_TEMPLATES: Record<string, {
  base: string;
  features: string[];
}> = {
  'qwen3-vl': {
    base: `Analyze the visual style of this image and extract the following four dimensions:

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
}`,
    features: ['standard', 'fast'],
  },

  'kimi-k2.5': {
    base: `分析这张图片的视觉风格，提取以下四个维度：

1. 光影 (Lighting & Shadow): 主光源方向、光影对比度、阴影特征
2. 构图 (Composition): 视角、画面平衡、景深
3. 色彩 (Color): 主色调、色彩对比度、色温
4. 艺术风格 (Artistic Style): 风格流派、艺术时期、情感基调

请为每个维度提供 3-5 个具体特征标签及置信度分数 (0-1)。

请用中文返回 JSON 格式结果。`,
    features: ['chinese', 'accurate'],
  },

  'gemini-flash': {
    base: `Perform a comprehensive visual style analysis of this image with extreme detail.

Analyze and provide:

1. **Lighting & Shadow** - light source, contrast, shadows, highlights, tonal range
2. **Composition** - viewpoint, balance, depth, rule of thirds, leading lines
3. **Color** - palette, contrast, temperature, saturation, harmony
4. **Artistic Style** - movement, period, emotional tone, artistic influences

Provide detailed analysis with high confidence scores for each feature. Return detailed JSON.`,
    features: ['detailed', 'high-accuracy'],
  },
};

/**
 * Get prompt for a specific model
 */
export function getModelPrompt(modelId: string, basePrompt?: string): string {
  const template = PROMPT_TEMPLATES[modelId];
  if (!template) {
    // Fallback to qwen3-vl template
    return basePrompt || PROMPT_TEMPLATES['qwen3-vl'].base;
  }
  return basePrompt || template.base;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Model error configuration
 */
export const MODEL_ERROR_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 2000,
  retryableErrors: [
    'RATE_LIMIT',
    'TIMEOUT',
    'TEMPORARILY_UNAVAILABLE',
  ],
};

/**
 * Handle model error
 */
export async function handleModelError(
  error: Error,
  modelId: string,
  context: { imageUrl: string; userId: string }
): Promise<never> {
  const isRetryable = MODEL_ERROR_CONFIG.retryableErrors.includes(error.message);

  if (isRetryable) {
    throw error;
  }

  // Non-retryable errors: log and throw without deducting credit
  console.error('模型调用失败（不扣 credit）:', {
    modelId,
    error: error.message,
    ...context,
    timestamp: new Date().toISOString(),
  });

  throw new Error(`模型 ${modelId} 暂时不可用，请稍后重试或选择其他模型`);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get user's subscription tier (placeholder - uses user table)
 * Note: Epic 8 (Subscription & Payment) will replace this
 */
export async function getUserSubscriptionTier(userId: string): Promise<'free' | 'lite' | 'standard'> {
  const { getDb } = await import('@/lib/db');
  const { user } = await import('@/lib/db/schema');
  const { eq } = await import('drizzle-orm');

  const db = getDb();
  const userList = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (userList.length === 0) {
    return 'free';
  }

  const tier = userList[0].subscriptionTier;
  if (tier === 'lite' || tier === 'standard') {
    return tier;
  }
  return 'free';
}

/**
 * Check if user can use a specific model
 */
export async function canUserUseModel(
  userId: string,
  modelId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const tier = await getUserSubscriptionTier(userId);

  if (!modelRegistry.isModelAccessible(modelId, tier)) {
    const model = modelRegistry.getModelById(modelId);
    return {
      allowed: false,
      reason: `该模型需要 ${model?.requiresTier || 'standard'} 订阅`,
    };
  }

  return { allowed: true };
}

/**
 * Get models available for user
 */
export async function getUserAvailableModels(
  userId: string
): Promise<{ models: VisionModel[]; tier: 'free' | 'lite' | 'standard' }> {
  const tier = await getUserSubscriptionTier(userId);
  const models = modelRegistry.getModelsForTier(tier);

  return { models, tier };
}

// ============================================================================
// Model Usage Statistics
// ============================================================================

/**
 * Record model usage statistics
 */
export async function recordModelUsage(
  modelId: string,
  userId: string,
  success: boolean,
  duration: number
): Promise<void> {
  const { getDb } = await import('@/lib/db');
  const { modelUsageStats } = await import('@/lib/db/schema');
  const { eq, and } = await import('drizzle-orm');

  const db = getDb();

  // 查询现有统计记录
  const existingStats = await db
    .select()
    .from(modelUsageStats)
    .where(and(eq(modelUsageStats.modelId, modelId), eq(modelUsageStats.userId, userId)))
    .limit(1);

  if (existingStats.length > 0) {
    // 更新现有记录
    const record = existingStats[0];
    await db
      .update(modelUsageStats)
      .set({
        successCount: record.successCount + (success ? 1 : 0),
        failureCount: record.failureCount + (success ? 0 : 1),
        totalDuration: record.totalDuration + duration,
        lastUsedAt: new Date(),
      })
      .where(and(eq(modelUsageStats.modelId, modelId), eq(modelUsageStats.userId, userId)));
  } else {
    // 创建新记录
    await db.insert(modelUsageStats).values({
      modelId,
      userId,
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      totalDuration: duration,
      lastUsedAt: new Date(),
    });
  }
}
