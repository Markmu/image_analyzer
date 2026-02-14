import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { user, images, analysisResults, batchAnalysisResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { analyzeImageStyle } from '@/lib/replicate/vision';
import { validateImageComplexity } from '@/lib/replicate/vision';
import { auth } from '@/lib/auth';
import {
  getUserSubscriptionTier,
  getMaxConcurrent,
  checkUserConcurrencyLimit,
  addActiveTask,
  removeActiveTask,
  addToQueue,
  removeFromQueue,
  activateTask,
  processQueue,
} from '@/lib/analysis/queue';

/**
 * POST /api/analysis
 * 发起图片风格分析请求（异步模式）
 *
 * Request body:
 * - imageId: string - 图片 ID
 *
 * Response:
 * - success: boolean
 * - data: { analysisId: number, status: string, queuePosition?: number, estimatedWaitTime?: number }
 *
 * Errors:
 * - UNAUTHORIZED: 用户未登录
 * - INVALID_IMAGE_ID: 图片 ID 无效
 * - IMAGE_NOT_FOUND: 图片不存在
 * - INSUFFICIENT_CREDITS: Credit 不足
 * - UNSAFE_CONTENT: 内容安全检查失败
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

    if (!body || typeof body.imageId !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_IMAGE_ID', message: '图片 ID 无效' } },
        { status: 400 }
      );
    }

    const imageId = body.imageId;
    const db = getDb();

    // 2. 验证图片存在且属于当前用户
    const imageList = await db
      .select()
      .from(images)
      .where(and(eq(images.id, imageId), eq(images.userId, userId)))
      .limit(1);

    if (imageList.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'IMAGE_NOT_FOUND', message: '图片不存在' } },
        { status: 404 }
      );
    }

    const image = imageList[0];

    // 3. 检查是否已经分析过
    const existingAnalysis = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.imageId, imageId))
      .limit(1);

    if (existingAnalysis.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          analysisId: existingAnalysis[0].id,
          status: 'completed',
          message: '图片已分析过',
        },
      });
    }

    // 4. 检查用户 credit 余额
    const userList = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    const userData = userList[0];

    if (!userData || userData.creditBalance < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: 'Credit 不足，请升级订阅',
          },
        },
        { status: 402 }
      );
    }

    // 5. 检查并发限制（AC-1: 并发控制机制）
    const tier = await getUserSubscriptionTier(userId);
    const concurrencyCheck = await checkUserConcurrencyLimit(userId, tier);

    // 6. 创建批量分析记录（用于跟踪任务状态）
    const [batchRecord] = await db
      .insert(batchAnalysisResults)
      .values({
        userId,
        mode: 'single',
        totalImages: 1,
        completedImages: 0,
        failedImages: 0,
        status: 'pending',
        creditUsed: 1,
        isQueued: !concurrencyCheck.canProcess,
        queuedAt: !concurrencyCheck.canProcess ? new Date() : null,
        queuePosition: concurrencyCheck.queuePosition,
        estimatedWaitTime: concurrencyCheck.estimatedWaitTime,
      })
      .returning();

    const batchId = batchRecord.id;

    // 7. 队列已满，返回 503（AC-5: 高并发场景处理）
    if (!concurrencyCheck.canProcess) {
      // 将任务加入等待队列
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

    // 8. 扣除 credit
    await db
      .update(user)
      .set({ creditBalance: userData.creditBalance - 1 })
      .where(eq(user.id, userId));

    // 9. 标记为活跃任务
    addActiveTask(userId);

    // 10. 异步执行分析（不等待完成）
    executeAnalysisAsync(batchId, imageId, image.filePath, userId).catch(async (error) => {
      console.error('Async analysis failed:', error);

      // 更新任务状态为失败
      try {
        await db
          .update(batchAnalysisResults)
          .set({
            status: 'failed',
            failedImages: 1,
            completedAt: new Date(),
          })
          .where(eq(batchAnalysisResults.id, batchId));

        // 退还 credit
        await db
          .update(user)
          .set({ creditBalance: userData.creditBalance })
          .where(eq(user.id, userId));
      } catch (updateError) {
        console.error('Failed to update task status:', updateError);
      }

      removeActiveTask(userId);
    });

    // 立即返回任务 ID 和状态
    return NextResponse.json({
      success: true,
      data: {
        analysisId: batchId,
        status: 'processing',
        message: '分析已开始',
      },
    });
  } catch (error) {
    console.error('Analysis API error:', error);
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

/**
 * 异步执行图片分析
 */
async function executeAnalysisAsync(
  batchId: number,
  imageId: string,
  filePath: string,
  userId: string
): Promise<void> {
  const db = getDb();

  try {
    // 更新状态为处理中
    await db
      .update(batchAnalysisResults)
      .set({ status: 'processing' })
      .where(eq(batchAnalysisResults.id, batchId));

    // 内容安全检查
    try {
      const complexityCheck = await validateImageComplexity(filePath);

      if (complexityCheck.complexity === 'high' && complexityCheck.confidence > 0.8) {
        throw new Error('Content safety check failed');
      }
    } catch (safetyError) {
      console.error('Content safety check error:', safetyError);
      // 如果安全检查失败，抛出错误
      throw new Error('图片内容安全检查未通过，无法分析');
    }

    // 执行风格分析
    const analysisData = await analyzeImageStyle(filePath);

    // 保存分析结果
    const [insertedResult] = await db
      .insert(analysisResults)
      .values({
        userId,
        imageId,
        analysisData: JSON.parse(JSON.stringify(analysisData)),
        confidenceScore: analysisData.overallConfidence,
      })
      .returning();

    // 更新批量分析记录状态
    await db
      .update(batchAnalysisResults)
      .set({
        status: 'completed',
        completedImages: 1,
        completedAt: new Date(),
      })
      .where(eq(batchAnalysisResults.id, batchId));

    // 标记任务完成
    removeActiveTask(userId);

    // 处理队列中的下一个任务
    await processQueue();

    console.log(`Analysis completed for batch ${batchId}, image ${imageId}`);
  } catch (error) {
    console.error('Analysis failed:', error);

    // 更新任务状态为失败
    await db
      .update(batchAnalysisResults)
      .set({
        status: 'failed',
        failedImages: 1,
        completedAt: new Date(),
      })
      .where(eq(batchAnalysisResults.id, batchId));

    // 退还 credit
    const userList = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    if (userList.length > 0) {
      await db
        .update(user)
        .set({ creditBalance: userList[0].creditBalance + 1 })
        .where(eq(user.id, userId));
    }

    removeActiveTask(userId);
    throw error;
  }
}
