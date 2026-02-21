/**
 * 重新使用历史模版 API
 * POST /api/history/[id]/reuse
 *
 * Epic 7: Story 7.1 - 分析历史记录功能
 *
 * 允许用户基于历史记录中的模版创建新的分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  reuseFromHistory,
} from '@/features/history';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/history/[id]/reuse
 * 基于历史记录重新使用模版
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to reuse templates',
          },
        },
        { status: 401 }
      );
    }

    // 2. 解析和验证历史记录 ID
    const params = await context.params;
    const historyId = parseInt(params.id, 10);
    if (isNaN(historyId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid history ID',
          },
        },
        { status: 400 }
      );
    }

    // 3. 重新使用模版
    const result = await reuseFromHistory(session.user.id, historyId);

    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 处理错误
    if (error instanceof Error && error.message === 'History record not found') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'History record not found',
          },
        },
        { status: 404 }
      );
    }

    console.error('Error reusing history template:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reuse template',
        },
      },
      { status: 500 }
    );
  }
}
