/**
 * 管理员审核队列 API
 *
 * Story 4-2: 生成安全功能
 * Epic 4: 内容安全与合规
 *
 * GET: 获取待审核队列
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPendingReviews, getReviewStats } from '@/lib/moderation/manual-review-queue';

/**
 * GET /api/admin/moderation-queue
 *
 * 获取待审核队列
 */
export async function GET(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    // TODO: 验证管理员权限
    // 目前简单通过，实际需要检查 session.user.role === 'admin'

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const statsOnly = searchParams.get('stats') === 'true';

    // 只返回统计信息
    if (statsOnly) {
      const stats = await getReviewStats();
      return NextResponse.json({
        success: true,
        data: { stats },
      });
    }

    // 获取待审核列表
    const pending = await getPendingReviews(limit);

    return NextResponse.json({
      success: true,
      data: {
        pending: pending.map(review => ({
          id: review.id,
          generationRequestId: review.generationRequestId,
          userId: review.userId,
          prompt: review.prompt,
          riskLevel: review.riskLevel,
          status: review.status,
          createdAt: review.createdAt,
        })),
        total: pending.length,
      },
    });
  } catch (error) {
    console.error('[API] Get moderation queue error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取审核队列失败',
        },
      },
      { status: 500 }
    );
  }
}
