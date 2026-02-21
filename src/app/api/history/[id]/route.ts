/**
 * 单个历史记录 API
 * GET /api/history/[id] - 获取历史记录详情
 * DELETE /api/history/[id] - 删除历史记录
 *
 * Epic 7: Story 7.1 - 分析历史记录功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  getHistoryDetail,
  deleteFromHistory,
} from '@/features/history';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/history/[id]
 * 获取历史记录详情
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view history details',
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

    // 3. 获取历史记录详情
    const record = await getHistoryDetail(session.user.id, historyId);

    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      data: record,
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

    console.error('Error fetching history detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch history detail',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history/[id]
 * 删除历史记录
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to delete history records',
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

    // 3. 删除历史记录
    const deleted = await deleteFromHistory(session.user.id, historyId);

    if (!deleted) {
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

    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        message: 'History record deleted successfully',
      },
    });
  } catch (error) {
    console.error('Error deleting history record:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete history record',
        },
      },
      { status: 500 }
    );
  }
}
