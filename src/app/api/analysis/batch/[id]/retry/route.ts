/**
 * 批量分析重试 API
 *
 * POST /api/analysis/batch/[id]/retry
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { batchAnalysisResults, batchAnalysisImages } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * POST /api/analysis/batch/[id]/retry
 * 重试失败的分析
 *
 * Request body:
 * - failedImageIds: string[] - 失败图片 ID 数组
 *
 * Response:
 * - success: boolean
 * - data: { message }
 *
 * Errors:
 * - UNAUTHORIZED: 用户未登录
 * - BATCH_NOT_FOUND: 批量分析不存在
 * - FORBIDDEN: 无权访问
 * - INVALID_IMAGE_LIST: 无效的图片列表
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const batchId = parseInt(id, 10);

    if (isNaN(batchId)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_BATCH_ID', message: '无效的批量分析 ID' } },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || !Array.isArray(body.failedImageIds) || body.failedImageIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_IMAGE_LIST', message: '失败图片列表不能为空' } },
        { status: 400 }
      );
    }

    const failedImageIds: string[] = body.failedImageIds;
    const db = getDb();

    // 2. 验证批量分析存在且属于当前用户
    const [batch] = await db
      .select()
      .from(batchAnalysisResults)
      .where(and(eq(batchAnalysisResults.id, batchId), eq(batchAnalysisResults.userId, userId)))
      .limit(1);

    if (!batch) {
      return NextResponse.json(
        { success: false, error: { code: 'BATCH_NOT_FOUND', message: '批量分析不存在' } },
        { status: 404 }
      );
    }

    // 3. 验证图片确实在该批量分析中且状态为 failed
    const batchImages = await db
      .select()
      .from(batchAnalysisImages)
      .where(
        and(
          eq(batchAnalysisImages.batchId, batchId),
          inArray(batchAnalysisImages.imageId, failedImageIds)
        )
      );

    // 检查所有图片都是 failed 状态
    const validFailedImages = batchImages.filter((img) => img.status === 'failed');
    const invalidImages = failedImageIds.filter(
      (id) => !batchImages.some((img) => img.imageId === id)
    );

    if (invalidImages.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE_LIST',
            message: `以下图片不在批量分析中或状态不是失败: ${invalidImages.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // 4. 执行重试
    const { retryFailedAnalysis } = await import('@/lib/analysis/batch');

    await retryFailedAnalysis(batchId, failedImageIds, userId);

    return NextResponse.json({
      success: true,
      data: {
        message: '已重试失败的分析',
      },
    });
  } catch (error) {
    console.error('Batch retry API error:', error);

    if (error instanceof Error && error.message === 'Batch not found') {
      return NextResponse.json(
        { success: false, error: { code: 'BATCH_NOT_FOUND', message: '批量分析不存在' } },
        { status: 404 }
      );
    }

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
