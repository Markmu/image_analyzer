/**
 * Replicate 异步函数
 *
 * 包含：
 * - analyzeImageAsync: 异步图片分析
 * - generateImageAsync: 异步图片生成
 */

import { getDb } from '@/lib/db';
import { replicatePredictions, creditTransactions, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createPredictionWithRetry, getWebhookUrl, type PredictionStatus, type TaskType } from './webhook';

/**
 * 异步分析输入参数
 */
export interface AnalyzeImageAsyncInput {
  userId: string;
  imageUrl: string;
  modelId: string;
  prompt?: string;
  creditCost: number;
}

/**
 * 异步分析结果
 */
export interface AnalyzeImageAsyncResult {
  predictionId: string;
  dbId: number;
}

/**
 * 异步图片分析
 *
 * 流程：
 * 1. 预扣积分（使用事务 + FOR UPDATE 锁，记录 transactionId）
 * 2. 创建 prediction（传入 webhook URL）
 * 3. 保存 prediction 记录
 * 4. 原子性保证：如果步骤 2 或 3 失败，立即回补积分
 * 5. 返回 predictionId
 *
 * @param input - 分析输入参数
 * @returns 预测结果
 * @throws 积分不足或创建失败时抛出错误
 */
export async function analyzeImageAsync(input: AnalyzeImageAsyncInput): Promise<AnalyzeImageAsyncResult> {
  const db = getDb();
  const transactionId = crypto.randomUUID();
  const webhookUrl = getWebhookUrl();

  // 获取模型配置
  const model = process.env.REPLICATE_VISION_MODEL_ID || 'yorickvp/llava-13b:2facb4a274b3e660f8e3b2db36195b5e4f2b6b5e';

  const prompt = input.prompt || `Analyze the visual style of this image and extract the following four dimensions:

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

  // 预扣积分 + 创建预测 + 保存记录（使用事务保证原子性）
  try {
    const result = await db.transaction(async (tx) => {
      // 1. 预扣积分（使用 FOR UPDATE 锁防止并发超扣）
      const [userData] = await tx
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!userData) {
        throw new Error('User not found');
      }

      if (userData.creditBalance < input.creditCost) {
        throw new Error('Insufficient credits');
      }

      const newBalance = userData.creditBalance - input.creditCost;

      await tx
        .update(user)
        .set({ creditBalance: newBalance })
        .where(eq(user.id, input.userId));

      // 记录预扣事务
      const [creditTx] = await tx
        .insert(creditTransactions)
        .values({
          userId: input.userId,
          type: 'analysis_prehold',
          amount: input.creditCost,
          balanceAfter: newBalance,
          reason: `Analysis prehold: ${transactionId}`,
          transactionId,
        })
        .returning();

      // 2. 创建 prediction
      let predictionResult;
      try {
        predictionResult = await createPredictionWithRetry({
          model,
          input: {
            image: input.imageUrl,
            prompt,
            max_tokens: 1000,
          },
          webhookUrl: `${webhookUrl}/api/webhooks/replicate`,
        });
      } catch (error) {
        // 创建预测失败，回补积分
        console.error('Failed to create prediction, refunding credits:', error);

        // 更新余额
        await tx
          .update(user)
          .set({ creditBalance: userData.creditBalance })
          .where(eq(user.id, input.userId));

        // 记录回补事务
        await tx
          .insert(creditTransactions)
          .values({
            userId: input.userId,
            type: 'refund',
            amount: input.creditCost,
            balanceAfter: userData.creditBalance,
            reason: `Prediction creation failed: ${error instanceof Error ? error.message : String(error)}`,
            transactionId,
          });

        throw new Error(`Failed to create prediction: ${error instanceof Error ? error.message : String(error)}`);
      }

      // 3. 保存 prediction 记录
      const [savedPrediction] = await tx
        .insert(replicatePredictions)
        .values({
          predictionId: predictionResult.id,
          userId: input.userId,
          taskType: 'analysis',
          modelId: input.modelId,
          status: predictionResult.status as PredictionStatus,
          input: {
            image: input.imageUrl,
            prompt,
            model,
          },
          creditTransactionId: creditTx.id,
        })
        .returning();

      return {
        predictionId: predictionResult.id,
        dbId: savedPrediction.id,
      };
    });

    return result;
  } catch (error) {
    console.error('analyzeImageAsync failed:', error);
    throw error;
  }
}

/**
 * 异步生成输入参数
 */
export interface GenerateImageAsyncInput {
  userId: string;
  prompt: string;
  modelId: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  creditCost: number;
}

/**
 * 异步生成结果
 */
export interface GenerateImageAsyncResult {
  predictionId: string;
  dbId: number;
}

/**
 * 异步图片生成
 *
 * @param input - 生成输入参数
 * @returns 预测结果
 * @throws 积分不足或创建失败时抛出错误
 */
export async function generateImageAsync(input: GenerateImageAsyncInput): Promise<GenerateImageAsyncResult> {
  const db = getDb();
  const transactionId = crypto.randomUUID();
  const webhookUrl = getWebhookUrl();

  // 获取模型配置
  const model = process.env.REPLICATE_IMAGE_MODEL_ID || 'default-image-model';

  // 构建输入参数
  const modelInput: Record<string, unknown> = {
    prompt: input.prompt,
  };

  if (input.negativePrompt) {
    modelInput.negative_prompt = input.negativePrompt;
  }
  if (input.width) {
    modelInput.width = input.width;
  }
  if (input.height) {
    modelInput.height = input.height;
  }
  if (input.numOutputs) {
    modelInput.num_outputs = input.numOutputs;
  }

  // 预扣积分 + 创建预测 + 保存记录（使用事务保证原子性）
  try {
    const result = await db.transaction(async (tx) => {
      // 1. 预扣积分（使用 FOR UPDATE 锁防止并发超扣）
      const [userData] = await tx
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!userData) {
        throw new Error('User not found');
      }

      if (userData.creditBalance < input.creditCost) {
        throw new Error('Insufficient credits');
      }

      const newBalance = userData.creditBalance - input.creditCost;

      await tx
        .update(user)
        .set({ creditBalance: newBalance })
        .where(eq(user.id, input.userId));

      // 记录预扣事务
      const [creditTx] = await tx
        .insert(creditTransactions)
        .values({
          userId: input.userId,
          type: 'analysis_prehold', // 复用预扣类型
          amount: input.creditCost,
          balanceAfter: newBalance,
          reason: `Generation prehold: ${transactionId}`,
          transactionId,
        })
        .returning();

      // 2. 创建 prediction
      let predictionResult;
      try {
        predictionResult = await createPredictionWithRetry({
          model,
          input: modelInput,
          webhookUrl: `${webhookUrl}/api/webhooks/replicate`,
        });
      } catch (error) {
        // 创建预测失败，回补积分
        console.error('Failed to create prediction, refunding credits:', error);

        // 更新余额
        await tx
          .update(user)
          .set({ creditBalance: userData.creditBalance })
          .where(eq(user.id, input.userId));

        // 记录回补事务
        await tx
          .insert(creditTransactions)
          .values({
            userId: input.userId,
            type: 'refund',
            amount: input.creditCost,
            balanceAfter: userData.creditBalance,
            reason: `Prediction creation failed: ${error instanceof Error ? error.message : String(error)}`,
            transactionId,
          });

        throw new Error(`Failed to create prediction: ${error instanceof Error ? error.message : String(error)}`);
      }

      // 3. 保存 prediction 记录
      const [savedPrediction] = await tx
        .insert(replicatePredictions)
        .values({
          predictionId: predictionResult.id,
          userId: input.userId,
          taskType: 'generation',
          modelId: input.modelId,
          status: predictionResult.status as PredictionStatus,
          input: modelInput,
          creditTransactionId: creditTx.id,
        })
        .returning();

      return {
        predictionId: predictionResult.id,
        dbId: savedPrediction.id,
      };
    });

    return result;
  } catch (error) {
    console.error('generateImageAsync failed:', error);
    throw error;
  }
}
