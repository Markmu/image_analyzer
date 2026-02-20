/**
 * 总览统计类型定义
 * Story 7-3: 模版使用分析和统计
 */

/**
 * 总览统计数据
 */
export interface OverviewStats {
  totalTemplates: number;
  totalGenerations: number;
  topTemplates: Array<{
    id: number;
    title: string | null;
    usageCount: number;
    thumbnail?: string;
  }>;
  recentActivity: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
  };
}

/**
 * 时间范围参数
 */
export type TimeRange = '7d' | '30d' | '90d' | 'all' | { start: Date; end: Date };

/**
 * 总览统计查询参数
 */
export interface OverviewStatsParams {
  timeRange?: TimeRange;
}
