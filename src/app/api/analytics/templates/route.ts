/**
 * GET /api/analytics/templates
 * 获取模版使用统计列表
 * Story 7-3: 模版使用分析和统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTemplateUsageStats } from '@/features/analytics/lib/analytics-service';
import type { TemplateUsageListParams } from '@/features/analytics/types';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const timeRange = searchParams.get('timeRange') as TemplateUsageListParams['timeRange'] || undefined;
    const sortBy = searchParams.get('sortBy') as TemplateUsageListParams['sortBy'] || undefined;
    const sortOrder = searchParams.get('sortOrder') as TemplateUsageListParams['sortOrder'] || undefined;

    // 获取统计数据
    const stats = await getTemplateUsageStats(session.user.id, {
      page,
      limit,
      timeRange,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching template usage stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch template usage statistics',
      },
      { status: 500 }
    );
  }
}
