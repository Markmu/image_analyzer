import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { retryAnalysis } from '@/lib/analysis/retry';

/**
 * POST /api/analysis/retry
 * 重新分析图片（不扣除额外 credit）
 *
 * Request body:
 * - analysisId: number - 原始分析 ID
 *
 * Response:
 * - success: boolean
 * - data: { newAnalysisId: number, isIdempotent: boolean, message: string, confidenceScores: ConfidenceScores }
 *
 * Errors:
 * - UNAUTHORIZED: 用户未登录
 * - INVALID_ANALYSIS_ID: 分析 ID 无效
 * - ANALYSIS_NOT_FOUND: 分析记录不存在
 * - RATE_LIMIT: 请求过快（3秒内只能重试一次）
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

    if (!body || typeof body.analysisId !== 'number') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ANALYSIS_ID', message: '分析 ID 无效' } },
        { status: 400 }
      );
    }

    const analysisId = body.analysisId;

    // 2. 执行重试分析
    const result = await retryAnalysis(analysisId, userId);

    return NextResponse.json({
      success: true,
      data: {
        newAnalysisId: result.newAnalysisId,
        isIdempotent: result.isIdempotent,
        message: result.message,
        confidenceScores: result.confidenceScores,
      },
    });
  } catch (error) {
    console.error('Retry analysis API error:', error);

    const errorMessage = error instanceof Error ? error.message : '服务器内部错误';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
