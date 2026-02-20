/**
 * 模版使用统计类型定义
 * Story 7-3: 模版使用分析和统计
 */

/**
 * 模版使用统计数据
 */
export interface TemplateUsageStats {
  templateId: number;
  title: string | null;
  description: string | null;
  usageCount: number;
  lastUsedAt: Date | null;
  generationCount: number;
  successRate: number; // 0-100
  thumbnail?: string;
  tags: string[];
  categories: Array<{
    parent: string | null;
    child: string | null;
  }>;
}

/**
 * 模版使用列表查询参数
 */
export interface TemplateUsageListParams {
  page?: number;
  limit?: number;
  timeRange?: '7d' | '30d' | '90d' | 'all' | { start: Date; end: Date };
  sortBy?: 'usageCount' | 'lastUsedAt' | 'generationCount' | 'successRate';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 模版使用列表响应
 */
export interface TemplateUsageListResponse {
  templates: TemplateUsageStats[];
  total: number;
  page: number;
  limit: number;
}
