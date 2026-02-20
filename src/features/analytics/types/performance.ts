/**
 * 性能分析类型定义
 * Story 7-3: 模版使用分析和统计
 */

/**
 * 模版性能数据
 */
export interface TemplatePerformance {
  templateId: number;
  title: string | null;
  totalGenerations: number;
  successfulGenerations: number;
  successRate: number; // 0-100
  averageGenerationTime?: number; // 秒（如果数据可用）
  lastUsedAt: Date | null;
}

/**
 * 性能指标数据
 */
export interface PerformanceMetrics {
  topPerformers: TemplatePerformance[];
  lowPerformers: TemplatePerformance[];
  averageSuccessRate: number;
  totalGenerations: number;
  successfulGenerations: number;
}
