/**
 * 历史记录类型定义
 * Epic 7: Story 7.1 - 分析历史记录功能
 */

// ============================================================================
// 模版快照类型
// ============================================================================

/**
 * 模版快照 - 存储在历史记录中的模版数据
 * 用于在原始分析结果被删除后仍能显示模版内容
 */
export interface TemplateSnapshot {
  variableFormat: string;
  jsonFormat: {
    subject: string;
    style: string;
    composition: string;
    colors: string;
    lighting: string;
    additional: string;
  };
}

// ============================================================================
// 历史记录类型
// ============================================================================

/**
 * 分析历史记录
 */
export interface AnalysisHistory {
  id: number;
  userId: string;
  analysisResultId: number;
  templateSnapshot: TemplateSnapshot;
  status: 'success' | 'failed';
  createdAt: Date;
}

/**
 * 历史记录列表项（包含关联信息）
 */
export interface HistoryRecord extends AnalysisHistory {
  // 关联的分析结果信息
  analysisResult?: {
    imageUrl: string;
    analysisData: unknown;
    confidenceScore: number;
  };
}

// ============================================================================
// 请求和响应类型
// ============================================================================

/**
 * 历史记录列表查询参数
 */
export interface HistoryListParams {
  page?: number;
  limit?: number;
  status?: 'success' | 'failed' | 'all';
  sortBy?: 'createdAt' | 'confidenceScore';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 历史记录列表响应
 */
export interface HistoryListResponse {
  records: HistoryRecord[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * 重新使用模版响应
 */
export interface ReuseHistoryResponse {
  template: TemplateSnapshot;
  analysisResultId: number;
  message: string;
}

// ============================================================================
// 常量
// ============================================================================

/**
 * 最大历史记录数量（FIFO 清理阈值）
 */
export const MAX_HISTORY_RECORDS = 10;

/**
 * 默认分页大小
 */
export const DEFAULT_HISTORY_PAGE_SIZE = 10;
