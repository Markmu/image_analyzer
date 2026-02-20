/**
 * 使用趋势类型定义
 * Story 7-3: 模版使用分析和统计
 */

/**
 * 使用趋势数据
 */
export interface UsageTrends {
  daily: Array<{
    date: string; // YYYY-MM-DD
    count: number;
  }>;
  weekly: Array<{
    week: string; // YYYY-Www
    count: number;
  }>;
  monthly: Array<{
    month: string; // YYYY-MM
    count: number;
  }>;
}

/**
 * 趋势查询参数
 */
export interface TrendsParams {
  timeRange?: '7d' | '30d' | '90d' | 'all' | { start: Date; end: Date };
  granularity?: 'daily' | 'weekly' | 'monthly';
}
