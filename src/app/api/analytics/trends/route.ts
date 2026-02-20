/**
 * GET /api/analytics/trends
 * 获取使用趋势数据
 * Story 7-3: 模版使用分析和统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUsageTrends } from '@/features/analytics/lib/analytics-service';
import type { TrendsParams } from '@/features/analytics/types';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') as TrendsParams['timeRange'] || undefined;
    const granularity = searchParams.get('granularity') as TrendsParams['granularity'] || undefined;

    // 获取趋势数据
    const trends = await getUsageTrends(session.user.id, {
      timeRange,
      granularity,
    });

    return NextResponse.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Error fetching usage trends:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch usage trends',
      },
      { status: 500 }
    );
  }
}
