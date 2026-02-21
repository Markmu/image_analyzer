/**
 * 历史记录列表 API
 * GET /api/history
 *
 * Epic 7: Story 7.1 - 分析历史记录功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  getHistoryList,
  type HistoryListParams,
} from '@/features/history';

// 查询参数验证 schema
const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  status: z.enum(['success', 'failed', 'all']).optional().default('all'),
  sortBy: z.enum(['createdAt', 'confidenceScore']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view history',
          },
        },
        { status: 401 }
      );
    }

    // 2. 解析和验证查询参数
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);
    const validatedParams = querySchema.parse(queryParams);

    const params: HistoryListParams = {
      page: validatedParams.page,
      limit: validatedParams.limit,
      status: validatedParams.status,
      sortBy: validatedParams.sortBy,
      sortOrder: validatedParams.sortOrder,
    };

    // 3. 获取历史记录列表
    const result = await getHistoryList(session.user.id, params);

    // 4. 返回成功响应
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 处理验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // 处理其他错误
    console.error('Error fetching history list:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch history list',
        },
      },
      { status: 500 }
    );
  }
}
