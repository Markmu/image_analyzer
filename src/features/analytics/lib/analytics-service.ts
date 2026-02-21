/**
 * 分析统计服务层
 * Story 7-3: 模版使用分析和统计
 *
 * 提供模版使用统计、趋势分析、性能分析等核心业务逻辑
 */

import { db } from '@/lib/db';
import {
  templates,
  templateTags,
  templateCategories,
  templateGenerations,
  generations,
  generationRequests,
} from '@/lib/db/schema';
import { and, gte, lte, count, desc, asc, eq, inArray, sql } from 'drizzle-orm';
import type {
  OverviewStats,
  OverviewStatsParams,
  TemplateUsageStats,
  TemplateUsageListParams,
  UsageTrends,
  TrendsParams,
  PerformanceMetrics,
} from '../types';

/**
 * 解析时间范围，返回开始和结束日期
 */
function parseTimeRange(timeRange: OverviewStatsParams['timeRange']): { start?: Date; end?: Date } {
  const now = new Date();
  const end = now;

  if (!timeRange || timeRange === 'all') {
    return {};
  }

  if (typeof timeRange === 'object') {
    return { start: timeRange.start, end: timeRange.end };
  }

  let start: Date;
  switch (timeRange) {
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {};
  }

  return { start, end };
}

/**
 * 获取总览统计数据
 */
export async function getOverviewStats(
  userId: string,
  params: OverviewStatsParams = {}
): Promise<OverviewStats> {
  const { start, end } = parseTimeRange(params.timeRange);

  // 构建时间条件
  const timeConditions = start && end
    ? [gte(templateGenerations.createdAt, start), lte(templateGenerations.createdAt, end)]
    : [];

  // 获取总模版数量
  const [totalTemplatesResult] = await db
    .select({ count: count() })
    .from(templates)
    .where(eq(templates.userId, userId));
  const totalTemplates = totalTemplatesResult?.count || 0;

  // 获取总生成数量
  const [totalGenerationsResult] = await db
    .select({ count: count() })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(
      and(
        eq(templates.userId, userId),
        ...timeConditions
      )
    );
  const totalGenerations = totalGenerationsResult?.count || 0;

  // 获取 Top 5 模版
  const topTemplatesData = await db
    .select({
      id: templates.id,
      title: templates.title,
      usageCount: templates.usageCount,
    })
    .from(templates)
    .where(eq(templates.userId, userId))
    .orderBy(desc(templates.usageCount))
    .limit(5);

  // 获取最近活动
  const now = new Date();
  const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last90DaysStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const [last7DaysResult] = await db
    .select({ count: count() })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(
      and(
        eq(templates.userId, userId),
        gte(templateGenerations.createdAt, last7DaysStart)
      )
    );

  const [last30DaysResult] = await db
    .select({ count: count() })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(
      and(
        eq(templates.userId, userId),
        gte(templateGenerations.createdAt, last30DaysStart)
      )
    );

  const [last90DaysResult] = await db
    .select({ count: count() })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(
      and(
        eq(templates.userId, userId),
        gte(templateGenerations.createdAt, last90DaysStart)
      )
    );

  return {
    totalTemplates,
    totalGenerations,
    topTemplates: topTemplatesData.map((t) => ({
      id: t.id,
      title: t.title,
      usageCount: t.usageCount,
      // templates 表没有 thumbnailUrl 字段，从 templateSnapshot 中获取
    })),
    recentActivity: {
      last7Days: last7DaysResult?.count || 0,
      last30Days: last30DaysResult?.count || 0,
      last90Days: last90DaysResult?.count || 0,
    },
  };
}

/**
 * 获取模版使用统计列表
 */
export async function getTemplateUsageStats(
  userId: string,
  params: TemplateUsageListParams = {}
): Promise<{ templates: TemplateUsageStats[]; total: number; page: number; limit: number }> {
  const { page = 1, limit = 10, sortBy = 'usageCount', sortOrder = 'desc' } = params;
  const offset = (page - 1) * limit;

  // 批量获取最后使用时间（从 templateGenerations 表）
  // 子查询：获取每个模版的最后生成时间
  const lastUsedTimes = await db
    .select({
      templateId: templateGenerations.templateId,
      lastUsedAt: sql<string>`MAX(${templateGenerations.createdAt})`.as('lastUsedAt'),
    })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(eq(templates.userId, userId))
    .groupBy(templateGenerations.templateId);

  // 构建 lastUsedAt 的 Map
  const lastUsedAtMap = new Map<number, Date>();
  lastUsedTimes.forEach((item) => {
    lastUsedAtMap.set(item.templateId, new Date(item.lastUsedAt));
  });

  // 获取模版列表并根据 sortBy 选择排序策略
  let templatesData;

  if (sortBy === 'lastUsedAt') {
    // 按最后使用时间排序 - 使用子查询结果
    const templateIdsWithLastUsed = lastUsedTimes
      .sort((a, b) => {
        const dateA = lastUsedAtMap.get(a.templateId) || new Date(0);
        const dateB = lastUsedAtMap.get(b.templateId) || new Date(0);
        return sortOrder === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      })
      .slice(offset, offset + limit)
      .map((item) => item.templateId);

    templatesData = await db
      .select({
        id: templates.id,
        title: templates.title,
        description: templates.description,
        usageCount: templates.usageCount,
        createdAt: templates.createdAt,
      })
      .from(templates)
      .where(
        and(
          eq(templates.userId, userId),
          inArray(templates.id, templateIdsWithLastUsed)
        )
      );

    // 按 lastUsedAt 时间在内存中排序
    templatesData.sort((a, b) => {
      const timeA = lastUsedAtMap.get(a.id) || new Date(0);
      const timeB = lastUsedAtMap.get(b.id) || new Date(0);
      return sortOrder === 'asc'
        ? timeA.getTime() - timeB.getTime()
        : timeB.getTime() - timeA.getTime();
    });
  } else if (sortBy === 'generationCount' || sortBy === 'successRate') {
    // 对于 generationCount 和 successRate，需要先获取统计数据再排序
    // 这里我们先获取所有模版，然后在内存中排序（因为需要计算）
    const allTemplates = await db
      .select({
        id: templates.id,
        title: templates.title,
        description: templates.description,
        usageCount: templates.usageCount,
        createdAt: templates.createdAt,
      })
      .from(templates)
      .where(eq(templates.userId, userId));

    // 获取生成统计
    const templateIds = allTemplates.map((t) => t.id);

    const allGenerationCounts = await db
      .select({
        templateId: templateGenerations.templateId,
        count: count(),
      })
      .from(templateGenerations)
      .where(inArray(templateGenerations.templateId, templateIds))
      .groupBy(templateGenerations.templateId);

    const allSuccessfulCounts = await db
      .select({
        templateId: templateGenerations.templateId,
        count: count(),
      })
      .from(templateGenerations)
      .innerJoin(generations, eq(templateGenerations.generationId, generations.id))
      .innerJoin(generationRequests, eq(generations.generationRequestId, generationRequests.id))
      .where(
        and(
          inArray(templateGenerations.templateId, templateIds),
          eq(generationRequests.status, 'completed')
        )
      )
      .groupBy(templateGenerations.templateId);

    const generationCountsMap = new Map<number, number>();
    allGenerationCounts.forEach((gc) => {
      generationCountsMap.set(gc.templateId, gc.count);
    });

    const successfulCountsMap = new Map<number, number>();
    allSuccessfulCounts.forEach((sc) => {
      successfulCountsMap.set(sc.templateId, sc.count);
    });

    // 在内存中排序
    allTemplates.sort((a, b) => {
      const generationCountA = generationCountsMap.get(a.id) || 0;
      const generationCountB = generationCountsMap.get(b.id) || 0;

      if (sortBy === 'generationCount') {
        return sortOrder === 'asc'
          ? generationCountA - generationCountB
          : generationCountB - generationCountA;
      } else { // successRate
        const successRateA = generationCountA > 0
          ? Math.round(((successfulCountsMap.get(a.id) || 0) / generationCountA) * 100)
          : 0;
        const successRateB = generationCountB > 0
          ? Math.round(((successfulCountsMap.get(b.id) || 0) / generationCountB) * 100)
          : 0;

        return sortOrder === 'asc'
          ? successRateA - successRateB
          : successRateB - successRateA;
      }
    });

    // 应用分页
    templatesData = allTemplates.slice(offset, offset + limit);
  } else {
    // 默认按 usageCount 排序
    const orderDirection = sortOrder === 'asc' ? asc : desc;

    templatesData = await db
      .select({
        id: templates.id,
        title: templates.title,
        description: templates.description,
        usageCount: templates.usageCount,
        createdAt: templates.createdAt,
      })
      .from(templates)
      .where(eq(templates.userId, userId))
      .orderBy(orderDirection(templates.usageCount))
      .limit(limit)
      .offset(offset);
  }

  // 获取总数
  const [totalResult] = await db
    .select({ count: count() })
    .from(templates)
    .where(eq(templates.userId, userId));
  const total = totalResult?.count || 0;

  // 批量获取所有模版的标签和分类（避免 N+1 查询）
  const templateIds = templatesData.map((t) => t.id);

  // 批量获取标签
  const allTags = await db
    .select({
      templateId: templateTags.templateId,
      tag: templateTags.tag,
    })
    .from(templateTags)
    .where(inArray(templateTags.templateId, templateIds));

  // 批量获取分类
  const allCategories = await db
    .select({
      templateId: templateCategories.templateId,
      parent: templateCategories.parentCategory,
      child: templateCategories.childCategory,
    })
    .from(templateCategories)
    .where(inArray(templateCategories.templateId, templateIds));

  // 批量获取生成数量和成功率（如果之前没有获取过）
  let allGenerationCounts;
  let allSuccessfulCounts;

  if (sortBy === 'generationCount' || sortBy === 'successRate') {
    // 已经在上面获取过了，需要重新获取以用于 Map 构建
    allGenerationCounts = await db
      .select({
        templateId: templateGenerations.templateId,
        count: count(),
      })
      .from(templateGenerations)
      .where(inArray(templateGenerations.templateId, templateIds))
      .groupBy(templateGenerations.templateId);

    allSuccessfulCounts = await db
      .select({
        templateId: templateGenerations.templateId,
        count: count(),
      })
      .from(templateGenerations)
      .innerJoin(generations, eq(templateGenerations.generationId, generations.id))
      .innerJoin(generationRequests, eq(generations.generationRequestId, generationRequests.id))
      .where(
        and(
          inArray(templateGenerations.templateId, templateIds),
          eq(generationRequests.status, 'completed')
        )
      )
      .groupBy(templateGenerations.templateId);
  } else {
    allGenerationCounts = await db
      .select({
        templateId: templateGenerations.templateId,
        count: count(),
      })
      .from(templateGenerations)
      .where(inArray(templateGenerations.templateId, templateIds))
      .groupBy(templateGenerations.templateId);

    allSuccessfulCounts = await db
      .select({
        templateId: templateGenerations.templateId,
        count: count(),
      })
      .from(templateGenerations)
      .innerJoin(generations, eq(templateGenerations.generationId, generations.id))
      .innerJoin(generationRequests, eq(generations.generationRequestId, generationRequests.id))
      .where(
        and(
          inArray(templateGenerations.templateId, templateIds),
          eq(generationRequests.status, 'completed')
        )
      )
      .groupBy(templateGenerations.templateId);
  }

  // 构建 Map 以便快速查找
  const tagsMap = new Map<number, string[]>();
  allTags.forEach((tag) => {
    const tags = tagsMap.get(tag.templateId) || [];
    tags.push(tag.tag);
    tagsMap.set(tag.templateId, tags);
  });

  const categoriesMap = new Map<number, Array<{ parent: string | null; child: string | null }>>();
  allCategories.forEach((cat) => {
    const categories = categoriesMap.get(cat.templateId) || [];
    categories.push({ parent: cat.parent, child: cat.child });
    categoriesMap.set(cat.templateId, categories);
  });

  const generationCountsMap = new Map<number, number>();
  allGenerationCounts.forEach((gc) => {
    generationCountsMap.set(gc.templateId, gc.count);
  });

  const successfulCountsMap = new Map<number, number>();
  allSuccessfulCounts.forEach((sc) => {
    successfulCountsMap.set(sc.templateId, sc.count);
  });

  // 组装结果（避免在循环中执行数据库查询）
  const templatesWithStats: TemplateUsageStats[] = templatesData.map((template) => {
    const generationCount = generationCountsMap.get(template.id) || 0;
    const successfulCount = successfulCountsMap.get(template.id) || 0;

    // 计算真实的成功率
    const successRate = generationCount > 0
      ? Math.round((successfulCount / generationCount) * 100)
      : 0;

    return {
      templateId: template.id,
      title: template.title,
      description: template.description,
      usageCount: template.usageCount,
      lastUsedAt: lastUsedAtMap.get(template.id) || null, // ✅ 修复：使用真实的最后使用时间
      generationCount,
      successRate,
      thumbnail: undefined, // templates 表没有 thumbnailUrl 字段
      tags: tagsMap.get(template.id) || [],
      categories: categoriesMap.get(template.id) || [],
    };
  });

  return {
    templates: templatesWithStats,
    total,
    page,
    limit,
  };
}

/**
 * 获取使用趋势数据
 */
export async function getUsageTrends(
  userId: string,
  params: TrendsParams = {}
): Promise<UsageTrends> {
  const { timeRange = '30d', granularity = 'daily' } = params;
  const { start, end } = parseTimeRange(timeRange);

  const now = end || new Date();
  const startDate = start || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 获取所有生成记录
  const allGenerations = await db
    .select({
      createdAt: templateGenerations.createdAt,
    })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(
      and(
        eq(templates.userId, userId),
        gte(templateGenerations.createdAt, startDate),
        lte(templateGenerations.createdAt, now)
      )
    );

  // 按粒度聚合数据
  const daily = new Map<string, number>();
  const weekly = new Map<string, number>();
  const monthly = new Map<string, number>();

  allGenerations.forEach((gen) => {
    const date = new Date(gen.createdAt!);

    // 按天聚合
    const dayKey = date.toISOString().split('T')[0];
    daily.set(dayKey, (daily.get(dayKey) || 0) + 1);

    // 按周聚合
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = `${weekStart.getFullYear()}-W${String(getWeekNumber(date)).padStart(2, '0')}`;
    weekly.set(weekKey, (weekly.get(weekKey) || 0) + 1);

    // 按月聚合
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthly.set(monthKey, (monthly.get(monthKey) || 0) + 1);
  });

  return {
    daily: Array.from(daily.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    weekly: Array.from(weekly.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week)),
    monthly: Array.from(monthly.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  };
}

/**
 * 获取周数
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * 获取分类统计数据
 */
export async function getCategoryStats(
  userId: string,
  timeRange?: OverviewStatsParams['timeRange']
): Promise<Array<{ parent: string | null; child: string | null; count: number; percentage: number }>> {
  const { start, end } = parseTimeRange(timeRange);
  const timeConditions = start && end
    ? [gte(templateGenerations.createdAt, start), lte(templateGenerations.createdAt, end)]
    : [];

  // 获取所有使用过的模版
  const usedTemplates = await db
    .select({ templateId: templateGenerations.templateId })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(
      and(
        eq(templates.userId, userId),
        ...timeConditions
      )
    );

  const templateIds = [...new Set(usedTemplates.map((t) => t.templateId))];

  if (templateIds.length === 0) {
    return [];
  }

  // 获取这些模版的分类（使用 inArray 替代原始 SQL）
  const categoriesData = await db
    .select({
      parent: templateCategories.parentCategory,
      child: templateCategories.childCategory,
    })
    .from(templateCategories)
    .where(inArray(templateCategories.templateId, templateIds));

  // 统计分类使用次数
  const categoryCount = new Map<string, number>();
  categoriesData.forEach((cat) => {
    const key = `${cat.parent || 'null'}:${cat.child || 'null'}`;
    categoryCount.set(key, (categoryCount.get(key) || 0) + 1);
  });

  const total = Array.from(categoryCount.values()).reduce((sum, count) => sum + count, 0);

  return Array.from(categoryCount.entries()).map(([key, count]) => {
    const [parent, child] = key.split(':');
    return {
      parent: parent === 'null' ? null : parent,
      child: child === 'null' ? null : child,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

/**
 * 获取标签统计数据
 */
export async function getTagStats(
  userId: string,
  timeRange?: OverviewStatsParams['timeRange']
): Promise<Array<{ tag: string; count: number; percentage: number }>> {
  const { start, end } = parseTimeRange(timeRange);
  const timeConditions = start && end
    ? [gte(templateGenerations.createdAt, start), lte(templateGenerations.createdAt, end)]
    : [];

  // 获取所有使用过的模版
  const usedTemplates = await db
    .select({ templateId: templateGenerations.templateId })
    .from(templateGenerations)
    .innerJoin(templates, eq(templateGenerations.templateId, templates.id))
    .where(
      and(
        eq(templates.userId, userId),
        ...timeConditions
      )
    );

  const templateIds = [...new Set(usedTemplates.map((t) => t.templateId))];

  if (templateIds.length === 0) {
    return [];
  }

  // 获取这些模版的标签（使用 inArray 替代原始 SQL）
  const tagsData = await db
    .select({ tag: templateTags.tag })
    .from(templateTags)
    .where(inArray(templateTags.templateId, templateIds));

  // 统计标签使用次数
  const tagCount = new Map<string, number>();
  tagsData.forEach((tag) => {
    tagCount.set(tag.tag, (tagCount.get(tag.tag) || 0) + 1);
  });

  const total = Array.from(tagCount.values()).reduce((sum, count) => sum + count, 0);

  return Array.from(tagCount.entries())
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 获取性能分析数据
 */
export async function getPerformanceMetrics(
  userId: string,
  timeRange?: OverviewStatsParams['timeRange']
): Promise<PerformanceMetrics> {
  const { start, end } = parseTimeRange(timeRange);

  // 获取所有模版
  const allTemplates = await db
    .select({
      id: templates.id,
      title: templates.title,
      usageCount: templates.usageCount,
      createdAt: templates.createdAt,
    })
    .from(templates)
    .where(eq(templates.userId, userId));

  const templateIds = allTemplates.map((t) => t.id);

  if (templateIds.length === 0) {
    return {
      topPerformers: [],
      lowPerformers: [],
      averageSuccessRate: 0,
      totalGenerations: 0,
      successfulGenerations: 0,
    };
  }

  // 批量获取所有模版的生成记录及其状态
  const allGenerationRecords = await db
    .select({
      templateId: templateGenerations.templateId,
      generationId: templateGenerations.generationId,
      status: generationRequests.status,
      createdAt: generations.createdAt,
    })
    .from(templateGenerations)
    .innerJoin(generations, eq(templateGenerations.generationId, generations.id))
    .innerJoin(generationRequests, eq(generations.generationRequestId, generationRequests.id))
    .where(inArray(templateGenerations.templateId, templateIds));

  // 按 templateId 分组统计成功和失败数量
  const generationStatsMap = new Map<number, { total: number; successful: number; lastUsedAt: Date | null }>();

  // 首先获取每个模版的最后使用时间
  const lastUsedTimesMap = new Map<number, Date>();
  allGenerationRecords.forEach((record) => {
    const existing = lastUsedTimesMap.get(record.templateId);
    const recordTime = record.createdAt || new Date();
    if (!existing || recordTime > existing) {
      lastUsedTimesMap.set(record.templateId, recordTime);
    }
  });

  allGenerationRecords.forEach((record) => {
    const stats = generationStatsMap.get(record.templateId) || { total: 0, successful: 0, lastUsedAt: null };
    stats.total += 1;
    // status 为 'completed' 表示成功，其他状态（pending, failed）表示失败或进行中
    if (record.status === 'completed') {
      stats.successful += 1;
    }
    stats.lastUsedAt = lastUsedTimesMap.get(record.templateId) || null;
    generationStatsMap.set(record.templateId, stats);
  });

  // 为每个模版计算性能指标（避免 N+1 查询）
  const performanceData = allTemplates.map((template) => {
    const stats = generationStatsMap.get(template.id) || { total: 0, successful: 0, lastUsedAt: null };
    const totalGenerations = stats.total;
    const successfulGenerations = stats.successful;
    const successRate = totalGenerations > 0 ? Math.round((successfulGenerations / totalGenerations) * 100) : 0;

    return {
      templateId: template.id,
      title: template.title,
      totalGenerations,
      successfulGenerations,
      successRate,
      lastUsedAt: stats.lastUsedAt || null, // ✅ 修复：使用真实的最后使用时间
    };
  });

  // 计算总体指标
  const totalGenerations = performanceData.reduce((sum, p) => sum + p.totalGenerations, 0);
  const successfulGenerations = performanceData.reduce((sum, p) => sum + p.successfulGenerations, 0);
  const averageSuccessRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0;

  // 排序获取 Top 和 Low performers
  const sortedBySuccessRate = [...performanceData].sort((a, b) => b.successRate - a.successRate);
  const topPerformers = sortedBySuccessRate.slice(0, 5);
  const lowPerformers = sortedBySuccessRate.slice(-5).reverse();

  return {
    topPerformers,
    lowPerformers,
    averageSuccessRate: Math.round(averageSuccessRate),
    totalGenerations,
    successfulGenerations,
  };
}
