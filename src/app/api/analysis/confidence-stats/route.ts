import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { confidenceLogs, analysisResults, modelUsageStats } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

/**
 * GET /api/analysis/confidence-stats
 * 获取置信度统计信息（管理员功能）
 *
 * Query params:
 * - startDate: string (optional) - 开始日期 (ISO format)
 * - endDate: string (optional) - 结束日期 (ISO format)
 *
 * Response:
 * - success: boolean
 * - data: {
 *     totalAnalyses: number,
 *     averageConfidence: number,
 *     lowConfidenceRate: number,
 *     byModel: { [modelId: string]: { avgConfidence: number, lowRate: number } }
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    // TODO: 检查用户是否为管理员（Epic 8 - 订阅与支付）
    // 暂时允许所有登录用户访问

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = getDb();

    // 2. 构建查询条件
    let whereCondition = undefined;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      whereCondition = and(
        gte(confidenceLogs.createdAt, start),
        lte(confidenceLogs.createdAt, end)
      );
    }

    // 3. 获取总体统计
    const allLogs = await db
      .select()
      .from(confidenceLogs)
      .where(whereCondition);

    const totalAnalyses = allLogs.length;
    const lowConfidenceCount = allLogs.filter(log => log.isLowConfidence).length;
    const avgConfidence = totalAnalyses > 0
      ? allLogs.reduce((sum, log) => {
          const scores = log.confidenceScores as { overall: number };
          return sum + scores.overall;
        }, 0) / totalAnalyses
      : 0;

    // 4. 按模型分组统计（优化：批量查询）
    // 收集所有 analysisId
    const analysisIds = allLogs
      .map(log => log.analysisId)
      .filter((id): id is number => id !== null);

    // 批量查询所有分析结果
    const analyses = await db
      .query.analysisResults.findMany({
        where: (analysisResults, { inArray }) => inArray(analysisResults.id, analysisIds),
      });

    // 创建 analysisId -> modelId 的映射
    const analysisModelMap = new Map<number, string>();
    analyses.forEach(analysis => {
      if (analysis.id && analysis.modelId) {
        analysisModelMap.set(analysis.id, analysis.modelId);
      }
    });

    // 按模型分组统计
    const modelStats = new Map<string, { total: number; lowConfidence: number; sumConfidence: number }>();

    for (const log of allLogs) {
      if (log.analysisId) {
        const modelId = analysisModelMap.get(log.analysisId);
        if (modelId) {
          const current = modelStats.get(modelId) || { total: 0, lowConfidence: 0, sumConfidence: 0 };
          const scores = log.confidenceScores as { overall: number };

          modelStats.set(modelId, {
            total: current.total + 1,
            lowConfidence: current.lowConfidence + (log.isLowConfidence ? 1 : 0),
            sumConfidence: current.sumConfidence + scores.overall,
          });
        }
      }
    }

    // 5. 构建按模型的统计结果
    const byModel: Record<string, { avgConfidence: number; lowRate: number }> = {};
    modelStats.forEach((stats, modelId) => {
      byModel[modelId] = {
        avgConfidence: stats.total > 0 ? Math.round(stats.sumConfidence / stats.total) : 0,
        lowRate: stats.total > 0 ? Number((stats.lowConfidence / stats.total).toFixed(2)) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalAnalyses,
        averageConfidence: Math.round(avgConfidence),
        lowConfidenceRate: totalAnalyses > 0 ? Number((lowConfidenceCount / totalAnalyses).toFixed(2)) : 0,
        byModel,
      },
    });
  } catch (error) {
    console.error('Confidence stats API error:', error);
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
