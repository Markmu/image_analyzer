/**
 * 批量分析状态查询 API
 *
 * GET /api/analysis/batch/[id]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBatchAnalysisStatus } from '@/lib/analysis/batch';

/**
 * GET /api/analysis/batch/[id]/status
 * 查询批量分析状态
 *
 * Response:
 * - success: boolean
 * - data: { batchId, status, progress, results, errors }
 *
 * Errors:
 * - UNAUTHORIZED: 用户未登录
 * - BATCH_NOT_FOUND: 批量分析不存在
 * - FORBIDDEN: 无权访问
 */
export async function GET(
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

    // 2. 获取批量分析状态
    const status = await getBatchAnalysisStatus(batchId, userId);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Batch status API error:', error);

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
