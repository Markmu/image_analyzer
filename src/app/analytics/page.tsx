/**
 * 分析仪表板主页面
 * Story 7-3: 模版使用分析和统计
 */

'use client';

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  useOverviewStats,
  useTemplateUsageStats,
  useUsageTrends,
  useCategoryStats,
  useTagStats,
  usePerformanceMetrics,
} from '@/features/analytics/hooks/useAnalytics';
import { OverviewStatsCards } from '@/features/analytics/components/OverviewStatsCards';
import { TimeRangeFilter, type TimeRangeOption } from '@/features/analytics/components/TimeRangeFilter';
import { UsageTrendsChart } from '@/features/analytics/components/UsageTrendsChart';
import { TemplateUsageList } from '@/features/analytics/components/TemplateUsageList';
import { CategoryStatsChart } from '@/features/analytics/components/CategoryStatsChart';
import { TagStats } from '@/features/analytics/components/TagStats';
import { PerformanceMetricsDisplay } from '@/features/analytics/components/PerformanceMetricsDisplay';

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');

  // 获取数据
  const { data: overviewStats, isLoading: overviewLoading, error: overviewError } = useOverviewStats({
    timeRange,
  });

  const { data: templateStats, isLoading: templatesLoading } = useTemplateUsageStats({
    page: 1,
    limit: 5,
    timeRange,
    sortBy: 'usageCount',
    sortOrder: 'desc',
  });

  const { data: trendsData } = useUsageTrends({
    timeRange,
    granularity: 'daily',
  });

  const { data: categoryStats } = useCategoryStats(timeRange);

  const { data: tagStats } = useTagStats(timeRange);

  const { data: performanceMetrics } = usePerformanceMetrics(timeRange);

  const isLoading = overviewLoading || templatesLoading;

  if (overviewError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="ia-glass-card rounded-lg p-8 text-center">
          <p className="text-red-500">加载统计数据失败，请稍后重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold">分析仪表板</h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          查看您的模版使用统计和趋势分析
        </p>
      </div>

      {/* 时间范围过滤器 */}
      <div className="mb-6">
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : overviewStats ? (
        <div className="space-y-6">
          {/* 总览统计卡片 */}
          <OverviewStatsCards stats={overviewStats} />

          {/* 使用趋势图表 */}
          {trendsData && <UsageTrendsChart trends={trendsData} />}

          {/* 模版使用统计列表 */}
          {templateStats && <TemplateUsageList templates={templateStats.templates} />}

          {/* 分类和标签统计 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categoryStats && <CategoryStatsChart data={categoryStats} />}
            {tagStats && <TagStats data={tagStats} />}
          </div>

          {/* 性能指标 */}
          {performanceMetrics && <PerformanceMetricsDisplay metrics={performanceMetrics} />}
        </div>
      ) : (
        <div className="ia-glass-card rounded-lg p-8 text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">暂无统计数据</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            开始使用模版后，这里将显示详细的分析数据
          </p>
        </div>
      )}
    </div>
  );
}
