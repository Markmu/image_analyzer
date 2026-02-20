/**
 * React Query Hooks for Analytics
 * Story 7-3: 模版使用分析和统计
 */

import { useQuery } from '@tanstack/react-query';
import type {
  OverviewStats,
  OverviewStatsParams,
  TemplateUsageListResponse,
  TemplateUsageListParams,
  UsageTrends,
  TrendsParams,
  PerformanceMetrics,
} from '../types';

// 缓存时间配置
const CACHE_CONFIG = {
  overview: {
    staleTime: 5 * 60 * 1000, // 5 分钟
    gcTime: 10 * 60 * 1000, // 10 分钟
  },
  templates: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  trends: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  categories: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  tags: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  performance: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
};

/**
 * 获取总览统计数据
 */
export function useOverviewStats(params?: OverviewStatsParams) {
  return useQuery({
    queryKey: ['analytics', 'overview', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) {
        searchParams.set('timeRange', String(params.timeRange));
      }

      const response = await fetch(`/api/analytics/overview?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch overview stats');
      }

      const data = await response.json();
      return data.data as OverviewStats;
    },
    ...CACHE_CONFIG.overview,
  });
}

/**
 * 获取模版使用统计列表
 */
export function useTemplateUsageStats(params?: TemplateUsageListParams) {
  return useQuery({
    queryKey: ['analytics', 'templates', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.timeRange) searchParams.set('timeRange', String(params.timeRange));
      if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

      const response = await fetch(`/api/analytics/templates?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template usage stats');
      }

      const data = await response.json();
      return data.data as TemplateUsageListResponse;
    },
    ...CACHE_CONFIG.templates,
  });
}

/**
 * 获取使用趋势数据
 */
export function useUsageTrends(params?: TrendsParams) {
  return useQuery({
    queryKey: ['analytics', 'trends', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.timeRange) searchParams.set('timeRange', String(params.timeRange));
      if (params?.granularity) searchParams.set('granularity', params.granularity);

      const response = await fetch(`/api/analytics/trends?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage trends');
      }

      const data = await response.json();
      return data.data as UsageTrends;
    },
    ...CACHE_CONFIG.trends,
  });
}

/**
 * 获取分类统计数据
 */
export function useCategoryStats(timeRange?: OverviewStatsParams['timeRange']) {
  return useQuery({
    queryKey: ['analytics', 'categories', timeRange],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (timeRange) searchParams.set('timeRange', String(timeRange));

      const response = await fetch(`/api/analytics/categories?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category stats');
      }

      const data = await response.json();
      return data.data as Array<{ parent: string | null; child: string | null; count: number; percentage: number }>;
    },
    ...CACHE_CONFIG.categories,
  });
}

/**
 * 获取标签统计数据
 */
export function useTagStats(timeRange?: OverviewStatsParams['timeRange']) {
  return useQuery({
    queryKey: ['analytics', 'tags', timeRange],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (timeRange) searchParams.set('timeRange', String(timeRange));

      const response = await fetch(`/api/analytics/tags?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tag stats');
      }

      const data = await response.json();
      return data.data as Array<{ tag: string; count: number; percentage: number }>;
    },
    ...CACHE_CONFIG.tags,
  });
}

/**
 * 获取性能分析数据
 */
export function usePerformanceMetrics(timeRange?: OverviewStatsParams['timeRange']) {
  return useQuery({
    queryKey: ['analytics', 'performance', timeRange],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (timeRange) searchParams.set('timeRange', String(timeRange));

      const response = await fetch(`/api/analytics/performance?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      const data = await response.json();
      return data.data as PerformanceMetrics;
    },
    ...CACHE_CONFIG.performance,
  });
}
