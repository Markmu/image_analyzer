/**
 * 批量分析 API 端点
 *
 * Story 3-3: 分析进度与队列管理
 * AC-1: 并发控制机制
 * AC-2: 等待队列透明化
 * AC-5: 高并发场景处理
 * AC-6: 后台异步处理
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { user, images, batchAnalysisResults, batchAnalysisImages } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { checkCredits, deductCredits, refundCredits } from '@/lib/credit';
import { executeBatchAnalysis } from '@/lib/analysis/batch';
import {
  getUserSubscriptionTier,
  getMaxConcurrent,
  checkUserConcurrencyLimit,
  addActiveTask,
  removeActiveTask,
  addToQueue,
  activateTask,
  processQueue,
} from '@/lib/analysis/queue';

/**
 * POST /api/analysis/batch
 * 发起批量分析
 *
 * Request body:
 * - imageIds: string[] - 图片 ID 数组（最多5个）
 * - mode: 'serial' | 'parallel' - 分析模式
 *
 * Response:
 * - success: boolean
 * - data: { batchId, status, creditRequired, queuePosition?, estimatedWaitTime? }
 *
 * Errors:
 * - UNAUTHORIZED: 用户未登录
 * - INVALID_IMAGE_COUNT: 图片数量无效（0 或超过5）
 * - INVALID_MODE: 无效的分析模式
 * - IMAGE_NOT_FOUND: 图片不存在
 * - FORBIDDEN: 图片不属于当前用户
 * - INSUFFICIENT_CREDITS: Credit 不足
 * - QUEUE_FULL: 队列已满
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => null);

    // 2. 验证请求参数
    if (!body || !Array.isArray(body.imageIds)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_IMAGE_COUNT', message: '图片 ID 列表无效' } },
        { status: 400 }
      );
    }

    const imageIds: string[] = body.imageIds;
    const mode = body.mode;

    // 验证图片数量
    if (imageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'EMPTY_IMAGE_LIST', message: '图片列表不能为空' } },
        { status: 400 }
      );
    }

    if (imageIds.length > 5) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_IMAGE_COUNT', message: '最多只能分析 5 张图片' } },
        { status: 400 }
      );
    }

    // 验证模式
    if (mode !== 'serial' && mode !== 'parallel') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_MODE', message: '分析模式必须是 serial 或 parallel' } },
        { status: 400 }
      );
    }

    const db = getDb();

    // 3. 验证图片存在且属于当前用户
    const imageList = await db
      .select()
      .from(images)
      .where(
        and(
          inArray(images.id, imageIds),
          eq(images.userId, userId)
        )
      );

    if (imageList.length !== imageIds.length) {
      // 检查哪些图片不存在
      const foundIds = new Set(imageList.map((img) => img.id));
      const missingIds = imageIds.filter((id) => !foundIds.has(id));

      if (missingIds.length > 0) {
        return NextResponse.json(
          { success: false, error: { code: 'IMAGE_NOT_FOUND', message: `图片不存在: ${missingIds.join(', ')}` } },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问部分图片' } },
        { status: 403 }
      );
    }

    // 4. 检查 credit 余额
    const creditRequired = imageIds.length;
    const hasEnoughCredits = await checkCredits(userId, creditRequired);

    if (!hasEnoughCredits) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: `需要 ${creditRequired} credit，当前余额不足`,
          },
        },
        { status: 402 }
      );
    }

    // 5. 检查并发限制（AC-1: 并发控制机制）
    const tier = await getUserSubscriptionTier(userId);
    const concurrencyCheck = await checkUserConcurrencyLimit(userId, tier);

    // 6. 先创建批量分析记录，获取 batchId
    const { createBatchAnalysis } = await import('@/lib/analysis/batch');
    const batchId = await createBatchAnalysis(userId, imageIds, mode);

    // 7. 如果队列已满，返回 503（AC-5: 高并发场景处理）
    if (!concurrencyCheck.canProcess) {
      // 更新任务为入队状态
      await db
        .update(batchAnalysisResults)
        .set({
          isQueued: true,
          queuedAt: new Date(),
          status: 'pending',
          queuePosition: concurrencyCheck.queuePosition,
          estimatedWaitTime: concurrencyCheck.estimatedWaitTime,
        })
        .where(eq(batchAnalysisResults.id, batchId));

      // 添加到等待队列
      addToQueue({
        id: batchId,
        userId,
        status: 'pending',
        isQueued: true,
        queuePosition: concurrencyCheck.queuePosition || 1,
        estimatedWaitTime: concurrencyCheck.estimatedWaitTime || 60,
        createdAt: new Date(),
        queuedAt: new Date(),
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUEUE_FULL',
            message: `服务器繁忙，当前有 ${getMaxConcurrent(tier)} 个任务正在处理`,
            data: {
              queuePosition: concurrencyCheck.queuePosition,
              estimatedWaitTime: concurrencyCheck.estimatedWaitTime,
              maxConcurrent: getMaxConcurrent(tier),
            },
          },
        },
        { status: 503 }
      );
    }

    // 8. 扣除 credit（此时可以传入正确的 batchId）
    const deducted = await deductCredits(
      userId,
      creditRequired,
      `批量分析 ${imageIds.length} 张图片`,
      batchId
    );

    if (!deducted) {
      // 如果扣除失败，更新批量状态为 failed
      await db
        .update(batchAnalysisResults)
        .set({ status: 'failed', completedAt: new Date() })
        .where(eq(batchAnalysisResults.id, batchId));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CREDIT_DEDUCT_FAILED',
            message: 'Credit 扣除失败，请稍后重试',
          },
        },
        { status: 500 }
      );
    }

    // 9. 标记为活跃任务
    addActiveTask(userId);

    // 10. 异步执行批量分析（带错误追踪）
    const analysisPromise = executeBatchAnalysis(batchId, {
      userId,
      imageIds,
      mode,
      onProgress: (progress) => {
        console.log('Batch progress:', progress);
      },
    });

    // 为 Promise 添加错误处理，避免未被捕获的异常
    analysisPromise.catch(async (error) => {
      console.error('Batch analysis error:', error);

      // 更新批量状态为 failed
      try {
        await db
          .update(batchAnalysisResults)
          .set({
            status: 'failed',
            failedImages: imageIds.length,
            completedAt: new Date(),
          })
          .where(eq(batchAnalysisResults.id, batchId));
      } catch (updateError) {
        console.error('Failed to update batch status:', updateError);
      }

      // 如果分析失败，退还 credit
      try {
        await refundCredits(userId, creditRequired, '批量分析失败退款', batchId);
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError);
      }

      removeActiveTask(userId);

      // 处理队列中的下一个任务
      await processQueue();
    });

    // 忽略 Promise，不等待完成
    void analysisPromise;

    return NextResponse.json(
      {
        success: true,
        data: {
          batchId,
          status: 'processing',
          creditRequired,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Batch analysis API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
