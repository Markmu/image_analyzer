/**
 * 管理员审核操作 API
 *
 * Story 4-2: 生成安全功能
 * Epic 4: 内容安全与合规
 *
 * POST: 处理审核结果（批准/拒绝）
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processReview } from '@/lib/moderation/manual-review-queue';

/**
 * POST /api/admin/moderation-queue/[id]/review
 *
 * 处理审核结果
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    // const isAdmin = session.user.role === 'admin';
    // if (!isAdmin) { ... }

    const { id } = await params;
    const reviewId = parseInt(id, 10);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ID', message: '无效的审核 ID' } },
        { status: 400 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { action, notes } = body;

    // 验证操作类型
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ACTION', message: '无效的操作类型' } },
        { status: 400 }
      );
    }

    // 处理审核
    await processReview(reviewId, action, session.user.id, notes);

    return NextResponse.json({
      success: true,
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: session.user.id,
        reviewedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API] Process review error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '处理审核失败',
        },
      },
      { status: 500 }
    );
  }
}
