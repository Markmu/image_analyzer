/**
 * Replicate Webhook 工具函数
 *
 * 包含：
 * - Signature 验签
 * - Prediction 创建和管理
 * - Webhook 回调处理
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { replicate } from './index';
import { getDb } from '@/lib/db';
import { replicatePredictions, creditTransactions, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Replicate Webhook Secret 配置
 */
export function getWebhookSecret(): string {
  const secret = process.env.REPLICATE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('REPLICATE_WEBHOOK_SECRET environment variable is not configured');
  }
  return secret;
}

/**
 * 获取 Webhook URL
 */
export function getWebhookUrl(): string {
  const url = process.env.REPLICATE_WEBHOOK_URL;
  if (!url) {
    throw new Error('REPLICATE_WEBHOOK_URL environment variable is not configured');
  }
  return url;
}

/**
 * 验证 Replicate Webhook 签名
 *
 * @param payload - 原始 raw request body
 * @param signature - Replicate 提供的签名 (hex 格式)
 * @param secret - Webhook secret
 * @returns 验证结果
 * @throws secret 未配置时抛出错误
 */
export function verifyReplicateSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // 运行时验证：secret 未配置时拒绝所有请求
  if (!secret) {
    throw new Error('REPLICATE_WEBHOOK_SECRET is not configured');
  }

  const hmac = createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const digestBuffer = Buffer.from(digest, 'hex');

  if (sigBuffer.length !== digestBuffer.length) {
    return false;
  }

  // 必须使用 timingSafeEqual 防止 timing attack
  return timingSafeEqual(sigBuffer, digestBuffer);
}

/**
 * Replicate 预测状态类型
 */
export type PredictionStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * 任务类型
 */
export type TaskType = 'analysis' | 'generation';

/**
 * 创建预测输入参数
 */
export interface CreatePredictionInput {
  model: string;
  input: Record<string, unknown>;
  webhookUrl?: string;
}

/**
 * 创建预测结果
 */
export interface CreatePredictionResult {
  id: string;
  status: PredictionStatus;
  output?: unknown;
  error?: string;
}

/**
 * 创建 Replicate 预测
 *
 * @param input - 预测输入参数
 * @returns 创建的预测结果
 */
export async function createPrediction(input: CreatePredictionInput): Promise<CreatePredictionResult> {
  const prediction = await replicate.predictions.create({
    model: input.model,
    input: input.input,
    webhook: input.webhookUrl,
    webhook_events_filter: ['completed'] as const,
  });

  return {
    id: prediction.id,
    status: prediction.status as PredictionStatus,
    output: prediction.output,
    error: prediction.error as string | undefined,
  };
}

/**
 * 创建预测（带重试）
 *
 * @param input - 预测输入参数
 * @param maxRetries - 最大重试次数
 * @returns 创建的预测结果
 */
export async function createPredictionWithRetry(
  input: CreatePredictionInput,
  maxRetries: number = 3
): Promise<CreatePredictionResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await createPrediction(input);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = lastError.message.toUpperCase();

      // 只对可重试的错误进行重试
      const isRetryable = errorMessage.includes('TIMEOUT') || errorMessage.includes('RATE_LIMIT');

      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }

      // 指数退避: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.warn(`Prediction creation attempt ${attempt} failed, retrying in ${delay}ms...`, lastError);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * 获取预测状态
 *
 * @param predictionId - 预测 ID
 * @returns 预测状态
 */
export async function getPredictionStatus(predictionId: string): Promise<CreatePredictionResult> {
  const prediction = await replicate.predictions.get(predictionId);

  return {
    id: prediction.id,
    status: prediction.status as PredictionStatus,
    output: prediction.output,
    error: prediction.error as string | undefined,
  };
}

/**
 * 轮询预测直到完成（同步模式备用）
 *
 * @param predictionId - 预测 ID
 * @param timeout - 超时时间（毫秒）
 * @returns 预测结果
 * @throws 超时时抛出错误
 */
export async function pollPrediction(
  predictionId: string,
  timeout: number = 300000 // 默认 5 分钟
): Promise<CreatePredictionResult> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2 秒

  while (Date.now() - startTime < timeout) {
    const status = await getPredictionStatus(predictionId);

    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`Prediction polling timed out after ${timeout}ms`);
}

/**
 * Webhook 回调处理结果
 */
export interface HandleWebhookCallbackResult {
  success: boolean;
  message: string;
  predictionId?: string;
  newStatus?: PredictionStatus;
}

/**
 * 处理 Webhook 回调
 *
 * @param predictionId - 预测 ID
 * @param status - 回调状态
 * @param output - 预测输出
 * @param error - 错误信息
 * @returns 处理结果
 */
export async function handleWebhookCallback(
  predictionId: string,
  status: PredictionStatus,
  output?: unknown,
  error?: string
): Promise<HandleWebhookCallbackResult> {
  const db = getDb();

  // 查找预测记录
  const [prediction] = await db
    .select()
    .from(replicatePredictions)
    .where(eq(replicatePredictions.predictionId, predictionId))
    .limit(1);

  if (!prediction) {
    console.error(`Prediction not found: ${predictionId}`);
    return {
      success: false,
      message: 'Prediction not found',
      predictionId,
    };
  }

  // 幂等处理：检查状态避免重复处理
  if (prediction.status === 'completed' || prediction.status === 'failed') {
    console.log(`Prediction ${predictionId} already processed, status: ${prediction.status}`);
    return {
      success: true,
      message: 'Already processed (idempotent)',
      predictionId,
      newStatus: prediction.status,
    };
  }

  // 使用事务处理状态更新和积分操作
  try {
    await db.transaction(async (tx) => {
      if (status === 'completed') {
        // 获取当前余额
        const [currentUser] = await tx
          .select()
          .from(user)
          .where(eq(user.id, prediction.userId))
          .limit(1);

        const currentBalance = currentUser?.creditBalance || 0;

        // 成功回调：更新状态为 completed，记录积分确认
        await tx
          .update(replicatePredictions)
          .set({
            status: 'completed',
            output: output as object,
            completedAt: new Date(),
          })
          .where(eq(replicatePredictions.predictionId, predictionId));

        // 记录积分确认事务（不改变余额，只记录确认）
        if (prediction.creditTransactionId) {
          await tx
            .insert(creditTransactions)
            .values({
              userId: prediction.userId,
              type: 'analysis_complete',
              amount: 0,
              balanceAfter: currentBalance,
              reason: `Analysis completed: ${predictionId}`,
              transactionId: prediction.predictionId,
              predictionId: predictionId,
            });
        }

        console.log(`Prediction ${predictionId} completed successfully`);
      } else if (status === 'failed') {
        // 查找预扣的事务获取金额
        const [preholdTx] = await tx
          .select()
          .from(creditTransactions)
          .where(eq(creditTransactions.predictionId, predictionId))
          .limit(1);

        const refundAmount = preholdTx?.amount || 0;

        // 获取当前用户数据
        const [userData] = await tx
          .select()
          .from(user)
          .where(eq(user.id, prediction.userId))
          .limit(1);

        if (userData) {
          // 计算回补后的新余额
          const newBalance = userData.creditBalance + refundAmount;

          // 回补积分
          await tx
            .update(user)
            .set({ creditBalance: newBalance })
            .where(eq(user.id, prediction.userId));

          // 记录回补事务
          if (refundAmount > 0) {
            await tx
              .insert(creditTransactions)
              .values({
                userId: prediction.userId,
                type: 'refund',
                amount: refundAmount,
                balanceAfter: newBalance,
                reason: `Analysis failed: ${predictionId}`,
                transactionId: prediction.predictionId,
                predictionId: predictionId,
              });
          }
        }

        // 更新预测状态
        await tx
          .update(replicatePredictions)
          .set({
            status: 'failed',
            errorMessage: error || 'Prediction failed',
            completedAt: new Date(),
          })
          .where(eq(replicatePredictions.predictionId, predictionId));

        console.log(`Prediction ${predictionId} failed, credits refunded`);
      } else if (status === 'processing') {
        // 处理中回调：更新状态为 processing，不执行积分操作
        await tx
          .update(replicatePredictions)
          .set({ status: 'processing' })
          .where(eq(replicatePredictions.predictionId, predictionId));

        console.log(`Prediction ${predictionId} is processing`);
      }
    });

    return {
      success: true,
      message: `Status updated to ${status}`,
      predictionId,
      newStatus: status,
    };
  } catch (error) {
    console.error(`Failed to handle webhook callback for ${predictionId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      predictionId,
    };
  }
}

/**
 * 获取用户的预测列表
 *
 * @param userId - 用户 ID
 * @param limit - 返回数量限制
 * @returns 预测列表
 */
export async function getUserPredictions(
  userId: string,
  limit: number = 10
) {
  const db = getDb();

  const predictions = await db
    .select()
    .from(replicatePredictions)
    .where(eq(replicatePredictions.userId, userId))
    .orderBy(replicatePredictions.createdAt)
    .limit(limit);

  return predictions;
}

/**
 * 根据 ID 获取预测
 *
 * @param id - 预测 ID（数据库自增 ID）
 * @returns 预测记录
 */
export async function getPredictionById(id: number) {
  const db = getDb();

  const [prediction] = await db
    .select()
    .from(replicatePredictions)
    .where(eq(replicatePredictions.id, id))
    .limit(1);

  return prediction;
}

/**
 * 根据 predictionId 获取预测
 *
 * @param predictionId - Replicate 预测 ID
 * @returns 预测记录
 */
export async function getPredictionByPredictionId(predictionId: string) {
  const db = getDb();

  const [prediction] = await db
    .select()
    .from(replicatePredictions)
    .where(eq(replicatePredictions.predictionId, predictionId))
    .limit(1);

  return prediction;
}
