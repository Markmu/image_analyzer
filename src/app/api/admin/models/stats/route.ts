import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { modelUsageStats } from '@/lib/db/schema';
import { sql, eq, and, gte, lte } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { modelRegistry } from '@/lib/analysis/models';

/**
 * GET /api/admin/models/stats
 * 获取模型使用统计
 *
 * Query params:
 * - startDate: optional, ISO date string
 * - endDate: optional, ISO date string
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     stats: ModelStats[]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证管理员身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    // TODO: 检查管理员权限

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const db = getDb();

    // 构建查询条件
    let whereCondition = undefined;
    if (startDate || endDate) {
      const conditions = [];
      if (startDate) {
        conditions.push(gte(modelUsageStats.createdAt, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(modelUsageStats.createdAt, new Date(endDate)));
      }
      if (conditions.length > 0) {
        whereCondition = and(...conditions);
      }
    }

    // 按模型 ID 分组统计
    const statsQuery = db
      .select({
        modelId: modelUsageStats.modelId,
        totalCalls: sql<number>`${modelUsageStats.successCount} + ${modelUsageStats.failureCount}`.as('total_calls'),
        successCount: sql<number>`sum(${modelUsageStats.successCount})`.as('success_count'),
        failureCount: sql<number>`sum(${modelUsageStats.failureCount})`.as('failure_count'),
        totalDuration: sql<number>`sum(${modelUsageStats.totalDuration})`.as('total_duration'),
      })
      .from(modelUsageStats)
      .groupBy(modelUsageStats.modelId);

    const rawStats = whereCondition
      ? await db.select().from(modelUsageStats).where(whereCondition)
      : await db.select().from(modelUsageStats).execute();

    // 按模型分组计算统计
    const modelStatsMap = new Map<string, {
      modelId: string;
      successCount: number;
      failureCount: number;
      totalDuration: number;
    }>();

    for (const stat of rawStats) {
      const existing = modelStatsMap.get(stat.modelId) || {
        modelId: stat.modelId,
        successCount: 0,
        failureCount: 0,
        totalDuration: 0,
      };
      existing.successCount += stat.successCount;
      existing.failureCount += stat.failureCount;
      existing.totalDuration += stat.totalDuration;
      modelStatsMap.set(stat.modelId, existing);
    }

    // 转换为响应格式
    const stats = Array.from(modelStatsMap.values()).map((s) => {
      const totalCalls = s.successCount + s.failureCount;
      const successRate = totalCalls > 0 ? s.successCount / totalCalls : 0;
      const avgDuration = s.successCount > 0 ? s.totalDuration / s.successCount : 0;

      return {
        modelId: s.modelId,
        totalCalls,
        successCount: s.successCount,
        failureCount: s.failureCount,
        successRate: Math.round(successRate * 100) / 100,
        avgDuration: Math.round(avgDuration * 10) / 10,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error) {
    console.error('Admin models stats GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
