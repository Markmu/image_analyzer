/**
 * 检查超时的预测任务 Cron 任务
 *
 * Story: Replicate Webhook 支持
 * GET /api/cron/check-predictions
 *
 * 检查超时的 Replicate 预测任务，回补积分并标记为失败
 * - 查询 createdAt 超过 N 分钟（默认 15 分钟）且 status=pending 的记录
 * - 标记为 failed 并回补积分
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { replicatePredictions, creditTransactions, user } from '@/lib/db/schema';
import { eq, and, lt } from 'drizzle-orm';

/**
 * 验证 Cron 密钥
 */
function validateCronKey(request: NextRequest): boolean {
  const cronKey = request.headers.get('X-Cron-Key');
  const expectedKey = process.env.CRON_SECRET_KEY;

  if (!expectedKey) {
    console.error('[CheckPredictions] CRON_SECRET_KEY not configured');
    return false;
  }

  return cronKey === expectedKey;
}

/**
 * 获取超时时间（分钟）
 */
function getTimeoutMinutes(): number {
  const config = process.env.REPLICATE_PREDICTION_TIMEOUT_MINUTES;
  if (config) {
    const parsed = parseInt(config, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 15; // 默认 15 分钟
}

export async function GET(request: NextRequest) {
  try {
    // 1. 验证 Cron 密钥
    if (!validateCronKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid cron key',
          },
        },
        { status: 401 }
      );
    }

    console.log('[CheckPredictions] Starting check for timed out predictions');

    const db = getDb();
    const timeoutMinutes = getTimeoutMinutes();
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    // 2. 查找超时的预测（pending 状态超过 N 分钟）
    const timedOutPredictions = await db
      .select()
      .from(replicatePredictions)
      .where(
        and(
          eq(replicatePredictions.status, 'pending'),
          lt(replicatePredictions.createdAt, cutoffTime)
        )
      );

    console.log(`[CheckPredictions] Found ${timedOutPredictions.length} timed out predictions`);

    const stats = {
      processed: 0,
      refunded: 0,
      errors: [] as string[],
    };

    // 3. 处理每个超时的预测
    for (const prediction of timedOutPredictions) {
      try {
        // 查找预扣的积分事务
        const [preholdTx] = await db
          .select()
          .from(creditTransactions)
          .where(eq(creditTransactions.predictionId, prediction.predictionId))
          .limit(1);

        const refundAmount = preholdTx?.amount || 0;

        // 获取当前用户数据
        const [userData] = await db
          .select()
          .from(user)
          .where(eq(user.id, prediction.userId))
          .limit(1);

        if (userData) {
          // 使用事务处理回补
          await db.transaction(async (tx) => {
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
                  reason: `Prediction timed out: ${prediction.predictionId}`,
                  transactionId: prediction.predictionId,
                  predictionId: prediction.predictionId,
                });
            }

            // 更新预测状态为 failed
            await tx
              .update(replicatePredictions)
              .set({
                status: 'failed',
                errorMessage: `Prediction timed out after ${timeoutMinutes} minutes`,
                completedAt: new Date(),
              })
              .where(eq(replicatePredictions.id, prediction.id));
          });

          stats.refunded++;
          console.log(`[CheckPredictions] Refunded ${refundAmount} credits for prediction ${prediction.predictionId}`);
        }
      } catch (error) {
        const errorMsg = `Failed to process prediction ${prediction.predictionId}: ${error}`;
        console.error('[CheckPredictions]', errorMsg);
        stats.errors.push(errorMsg);
      }

      stats.processed++;
    }

    console.log('[CheckPredictions] Check completed:', stats);

    return NextResponse.json({
      success: true,
      data: {
        processed: stats.processed,
        refunded: stats.refunded,
        timeoutMinutes,
        errors: stats.errors,
      },
    });
  } catch (error) {
    console.error('[CheckPredictions] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Check predictions failed',
        },
      },
      { status: 500 }
    );
  }
}
