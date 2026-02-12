/**
 * 用户反馈 API
 * POST /api/analysis/[id]/feedback
 *
 * 收集用户对分析结果的反馈
 *
 * Request body:
 * - feedback: 'accurate' | 'inaccurate'
 *
 * Response:
 * - success: boolean
 * - data: { message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { analysisResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const VALID_FEEDBACK = new Set(['accurate', 'inaccurate']);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;

    if (!analysisId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '分析 ID 不能为空',
          },
        },
        { status: 400 }
      );
    }

    // 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const numericId = parseInt(analysisId, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ID',
            message: '无效的分析 ID',
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.feedback !== 'string' || !VALID_FEEDBACK.has(body.feedback)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FEEDBACK',
            message: '反馈值必须是 accurate 或 inaccurate',
          },
        },
        { status: 400 }
      );
    }

    const feedback = body.feedback as 'accurate' | 'inaccurate';
    const db = getDb();

    // 检查分析结果是否存在
    const results = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.id, numericId))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '分析结果不存在',
          },
        },
        { status: 404 }
      );
    }

    const result = results[0];

    // 验证用户权限
    if (result.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '无权修改此分析结果',
          },
        },
        { status: 403 }
      );
    }

    // 更新反馈
    await db
      .update(analysisResults)
      .set({ feedback })
      .where(eq(analysisResults.id, numericId));

    return NextResponse.json({
      success: true,
      data: {
        message: '感谢您的反馈！',
      },
    });
  } catch (error) {
    console.error('提交反馈失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '提交反馈失败',
        },
      },
      { status: 500 }
    );
  }
}
