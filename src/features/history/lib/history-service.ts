/**
 * 历史记录服务层
 * Epic 7: Story 7.1 - 分析历史记录功能
 *
 * 提供历史记录的 CRUD 操作和 FIFO 自动清理逻辑
 */

import { db } from '@/lib/db';
import {
  analysisHistory,
  analysisResults,
  images,
} from '@/lib/db/schema';
import { eq, desc, and, asc, inArray } from 'drizzle-orm';
import type {
  AnalysisHistory,
  HistoryListParams,
  HistoryListResponse,
  HistoryRecord,
  ReuseHistoryResponse,
  TemplateSnapshot,
} from '../types';
import { MAX_HISTORY_RECORDS } from '../types';

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 从分析结果中提取模版快照
 */
function extractTemplateSnapshot(analysisData: unknown): TemplateSnapshot {
  // TODO: 根据实际的分析数据结构提取模版
  // 这里是一个临时实现，需要根据实际的数据结构来调整
  const data = analysisData as {
    dimensions?: unknown;
    template?: {
      variableFormat?: string;
      jsonFormat?: Record<string, string>;
    };
  };

  return {
    variableFormat: data.template?.variableFormat || '',
    jsonFormat: {
      subject: data.template?.jsonFormat?.subject || '',
      style: data.template?.jsonFormat?.style || '',
      composition: data.template?.jsonFormat?.composition || '',
      colors: data.template?.jsonFormat?.colors || '',
      lighting: data.template?.jsonFormat?.lighting || '',
      additional: data.template?.jsonFormat?.additional || '',
    },
  };
}

// ============================================================================
// 核心服务函数
// ============================================================================

/**
 * 保存分析记录到历史并执行 FIFO 清理
 *
 * @param userId - 用户 ID
 * @param analysisResultId - 分析结果 ID
 * @param status - 分析状态
 * @returns 保存的历史记录
 */
export async function saveToHistory(
  userId: string,
  analysisResultId: number,
  status: 'success' | 'failed' = 'success'
): Promise<AnalysisHistory> {
  // 1. 获取分析结果数据以提取模版
  const results = await db
    .select({
      id: analysisResults.id,
      analysisData: analysisResults.analysisData,
      imageUrl: images.filePath, // 使用图片路径作为 URL
    })
    .from(analysisResults)
    .innerJoin(images, eq(analysisResults.imageId, images.id))
    .where(eq(analysisResults.id, analysisResultId))
    .limit(1);

  if (results.length === 0) {
    throw new Error('Analysis result not found');
  }

  const result = results[0];
  const templateSnapshot = extractTemplateSnapshot(result.analysisData);

  // 2. 保存新记录到历史
  const [newRecord] = await db
    .insert(analysisHistory)
    .values({
      userId,
      analysisResultId,
      templateSnapshot,
      status,
    })
    .returning();

  // 3. 执行 FIFO 清理 - 保留最近 MAX_HISTORY_RECORDS 条记录
  await cleanOldHistory(userId);

  return newRecord;
}

/**
 * FIFO 自动清理逻辑
 * 保留最近的 MAX_HISTORY_RECORDS 条记录，删除最旧的记录
 *
 * @param userId - 用户 ID
 */
export async function cleanOldHistory(userId: string): Promise<void> {
  // 获取用户的所有历史记录，按创建时间倒序排列
  const allRecords = await db
    .select()
    .from(analysisHistory)
    .where(eq(analysisHistory.userId, userId))
    .orderBy(desc(analysisHistory.createdAt));

  // 如果记录数量超过限制，删除最旧的记录
  if (allRecords.length > MAX_HISTORY_RECORDS) {
    const recordsToDelete = allRecords.slice(MAX_HISTORY_RECORDS);
    const idsToDelete = recordsToDelete.map((r) => r.id);

    await db
      .delete(analysisHistory)
      .where(inArray(analysisHistory.id, idsToDelete));
  }
}

/**
 * 获取用户的历史记录列表
 *
 * @param userId - 用户 ID
 * @param params - 查询参数
 * @returns 历史记录列表
 */
export async function getHistoryList(
  userId: string,
  params: HistoryListParams = {}
): Promise<HistoryListResponse> {
  const {
    page = 1,
    limit = MAX_HISTORY_RECORDS,
    status = 'all',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * limit;

  // 构建查询条件
  const whereConditions =
    status === 'all'
      ? undefined
      : eq(analysisHistory.status, status as 'success' | 'failed');

  // 获取总数
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analysisHistory)
    .where(whereConditions ? and(whereConditions, eq(analysisHistory.userId, userId)) : eq(analysisHistory.userId, userId));

  // 获取记录
  const records = await db
    .select({
      id: analysisHistory.id,
      userId: analysisHistory.userId,
      analysisResultId: analysisHistory.analysisResultId,
      templateSnapshot: analysisHistory.templateSnapshot,
      status: analysisHistory.status,
      createdAt: analysisHistory.createdAt,
      imageUrl: images.filePath,
    })
    .from(analysisHistory)
    .leftJoin(analysisResults, eq(analysisHistory.analysisResultId, analysisResults.id))
    .leftJoin(images, eq(analysisResults.imageId, images.id))
    .where(whereConditions ? and(whereConditions, eq(analysisHistory.userId, userId)) : eq(analysisHistory.userId, userId))
    .orderBy(sortOrder === 'desc' ? desc(analysisHistory[sortBy]) : asc(analysisHistory[sortBy]))
    .limit(limit)
    .offset(offset);

  return {
    records: records.map((r) => ({
      ...r,
      analysisResult: r.imageUrl ? { imageUrl: r.imageUrl, analysisData: null } : undefined,
    })) as HistoryRecord[],
    total: count,
    page,
    limit,
    hasMore: offset + limit < count,
  };
}

/**
 * 获取单条历史记录详情
 *
 * @param userId - 用户 ID
 * @param historyId - 历史记录 ID
 * @returns 历史记录详情
 * @throws Error 如果记录不存在或无权访问
 */
export async function getHistoryDetail(
  userId: string,
  historyId: number
): Promise<HistoryRecord> {
  const records = await db
    .select({
      id: analysisHistory.id,
      userId: analysisHistory.userId,
      analysisResultId: analysisHistory.analysisResultId,
      templateSnapshot: analysisHistory.templateSnapshot,
      status: analysisHistory.status,
      createdAt: analysisHistory.createdAt,
      imageUrl: images.filePath,
      analysisData: analysisResults.analysisData,
      confidenceScore: analysisResults.confidenceScore,
    })
    .from(analysisHistory)
    .innerJoin(analysisResults, eq(analysisHistory.analysisResultId, analysisResults.id))
    .innerJoin(images, eq(analysisResults.imageId, images.id))
    .where(and(eq(analysisHistory.id, historyId), eq(analysisHistory.userId, userId)))
    .limit(1);

  if (records.length === 0) {
    throw new Error('History record not found');
  }

  const record = records[0];

  return {
    ...record,
    analysisResult: {
      imageUrl: record.imageUrl,
      analysisData: record.analysisData,
    },
  };
}

/**
 * 基于历史记录重新使用模版
 *
 * @param userId - 用户 ID
 * @param historyId - 历史记录 ID
 * @returns 模版快照和分析结果 ID
 * @throws Error 如果记录不存在或无权访问
 */
export async function reuseFromHistory(
  userId: string,
  historyId: number
): Promise<ReuseHistoryResponse> {
  const record = await db
    .select()
    .from(analysisHistory)
    .where(and(eq(analysisHistory.id, historyId), eq(analysisHistory.userId, userId)))
    .limit(1);

  if (record.length === 0) {
    throw new Error('History record not found');
  }

  return {
    template: record[0].templateSnapshot,
    analysisResultId: record[0].analysisResultId,
    message: 'Template loaded successfully. You can now use it for a new analysis.',
  };
}

/**
 * 删除历史记录
 *
 * @param userId - 用户 ID
 * @param historyId - 历史记录 ID
 * @returns 是否删除成功
 * @throws Error 如果记录不存在或无权访问
 */
export async function deleteFromHistory(
  userId: string,
  historyId: number
): Promise<boolean> {
  const result = await db
    .delete(analysisHistory)
    .where(and(eq(analysisHistory.id, historyId), eq(analysisHistory.userId, userId)))
    .returning();

  return result.length > 0;
}

// ============================================================================
// SQL 模板字符串导入（用于 count 查询）
// ============================================================================

import { sql } from 'drizzle-orm';
