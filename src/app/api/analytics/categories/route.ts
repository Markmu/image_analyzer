/**
 * GET /api/analytics/categories
 * 获取分类统计数据
 * Story 7-3: 模版使用分析和统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCategoryStats } from '@/features/analytics/lib/analytics-service';
import type { OverviewStatsParams } from '@/features/analytics/types';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') as OverviewStatsParams['timeRange'] || undefined;

    // 获取分类统计
    const stats = await getCategoryStats(session.user.id, timeRange);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category statistics',
      },
      { status: 500 }
    );
  }
}
