/**
 * GET /api/analytics/tags
 * 获取标签统计数据
 * Story 7-3: 模版使用分析和统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTagStats } from '@/features/analytics/lib/analytics-service';
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

    // 获取标签统计
    const stats = await getTagStats(session.user.id, timeRange);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching tag stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tag statistics',
      },
      { status: 500 }
    );
  }
}
