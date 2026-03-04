/**
 * 分析任务状态服务
 *
 * 负责聚合任务状态并执行权限校验
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 */

import { getDb } from '@/lib/db';
import { analysisResults, batchAnalysisResults, batchAnalysisImages } from '@/lib/db/schema';
import { eq, and, isNotNull, desc } from 'drizzle-orm';
import type {
  TaskStatus,
  CurrentStage,
  TaskProgress,
  TaskStatusView,
  QueueInfo,
  ErrorSummary,
} from '@/lib/analysis-ir/status-schema';
import {
  getRecoverableActions,
  mapToDisplayStatus,
} from '@/lib/analysis-ir/status-schema';
import type { Session } from 'next-auth';

/**
 * 服务层错误类型
 */
export class StatusServiceError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'StatusServiceError';
  }
}

/**
 * 数据库记录类型推断（使用 Drizzle 生成类型）
 */
interface BatchAnalysisResult {
  id: number;
  userId: number | string;
  mode: string;
  totalImages: number;
  completedImages: number;
  failedImages: number;
  skippedImages: number;
  status: string;
  creditUsed: number;
  queuePosition: number | null;
  estimatedWaitTime: number | null;
  isQueued: boolean | null;
  latestErrorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

interface AnalysisResult {
  id: number;
  userId: number | string;
  imageId: string;
  analysisData: unknown;
  confidenceScore: number;
  feedback: string | null;
  modelId: string | null;
  confidenceScores: unknown;
  retryCount: number | null;
  createdAt: Date;
}

/**
 * 将数据库状态映射到规范化任务状态
 */
function mapDbStatusToTaskStatus(dbStatus: string): TaskStatus {
  switch (dbStatus.toLowerCase()) {
    case 'pending':
    case 'queued':
      return 'queued';
    case 'processing':
    case 'running':
      return 'running';
    case 'partial':
    case 'partial_success':
      return 'partial';
    case 'failed':
    case 'error':
      return 'failed';
    case 'completed':
    case 'success':
    case 'done':
      return 'completed';
    case 'canceled':
    case 'cancelled':
      return 'canceled';
    default:
      return 'queued'; // 默认值
  }
}

/**
 * 计算进度百分比
 */
function calculateProgress(
  completed: number | null,
  total: number | null,
  currentStage: CurrentStage
): TaskProgress {
  if (completed !== null && total !== null && total > 0) {
    const percentage = Math.round((completed / total) * 100);
    return {
      percentage,
      completed_steps: completed,
      total_steps: total,
    };
  }

  // 如果没有具体步骤数，根据阶段返回默认进度
  const stageProgressMap: Record<Exclude<CurrentStage, null>, number> = {
    forensic_describer: 25,
    style_fingerprinter: 50,
    prompt_compiler: 75,
    qa_critic: 90,
  };

  return {
    percentage: currentStage ? stageProgressMap[currentStage] : 0,
  };
}

/**
 * 创建错误摘要
 */
function createErrorSummary(errorMessage: string | null, status: TaskStatus): ErrorSummary | undefined {
  if (status !== 'failed' && status !== 'partial') {
    return undefined;
  }

  if (!errorMessage) {
    return {
      message: status === 'failed' ? '任务执行失败' : '任务部分完成',
      code: status.toUpperCase(),
      retryable: status === 'partial',
    };
  }

  return {
    message: errorMessage,
    code: status.toUpperCase(),
    retryable: status === 'partial',
  };
}

/**
 * 创建排队信息
 */
function createQueueInfo(
  queuePosition: number | null,
  estimatedWaitTime: number | null,
  isQueued: boolean | null
): QueueInfo | undefined {
  if (!isQueued && queuePosition === null) {
    return undefined;
  }

  return {
    queue_position: queuePosition ?? 0,
    estimated_wait_time: estimatedWaitTime ?? undefined,
  };
}

/**
 * 查询批量分析任务状态
 */
async function getBatchTaskStatus(
  db: ReturnType<typeof getDb>,
  numericId: number,
  sessionUserId: string
): Promise<{ batch: BatchAnalysisResult; hasResult: boolean } | null> {
  const batchResults = await db
    .select()
    .from(batchAnalysisResults)
    .where(eq(batchAnalysisResults.id, numericId))
    .limit(1);

  if (batchResults.length === 0) {
    return null;
  }

  const batch = batchResults[0] as unknown as BatchAnalysisResult;

  // 权限校验：只能访问自己的任务
  // userId 是 varchar 类型，直接字符串比较
  if (batch.userId !== sessionUserId) {
    throw new StatusServiceError('FORBIDDEN', '无权访问此任务状态');
  }

  // 检查是否有关联的分析结果
  const batchImageList = await db
    .select()
    .from(batchAnalysisImages)
    .where(
      and(
        eq(batchAnalysisImages.batchId, batch.id),
        isNotNull(batchAnalysisImages.analysisResultId)
      )
    )
    .orderBy(desc(batchAnalysisImages.completedAt))
    .limit(1);

  const hasResult = batchImageList.length > 0 && batchImageList[0].analysisResultId !== null;

  return { batch, hasResult };
}

/**
 * 查询标准分析结果状态
 */
async function getStandardAnalysisStatus(
  db: ReturnType<typeof getDb>,
  numericId: number,
  sessionUserId: string
): Promise<AnalysisResult | null> {
  const results = await db
    .select()
    .from(analysisResults)
    .where(eq(analysisResults.id, numericId))
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const result = results[0] as unknown as AnalysisResult;

  // 权限校验：只能访问自己的任务
  // userId 是 varchar 类型，直接字符串比较
  if (result.userId !== sessionUserId) {
    throw new StatusServiceError('FORBIDDEN', '无权访问此任务状态');
  }

  return result;
}

/**
 * 构建批量任务状态视图
 *
 * 注意：批量任务当前不在数据库中存储具体执行阶段（current_stage）
 * TODO: 如果未来需要支持批量任务的阶段可见性，需要：
 * 1. 在 batch_analysis_results 表中添加 current_stage 或 stage_history 字段
 * 2. 在批量分析的各个阶段更新这个字段
 * 3. 在此处读取并返回阶段信息
 */
function buildBatchTaskStatusView(
  batch: BatchAnalysisResult,
  hasResult: boolean
): Omit<TaskStatusView, 'updated_at' | 'recoverable_actions'> {
  const status = mapDbStatusToTaskStatus(batch.status);
  const progress = calculateProgress(batch.completedImages, batch.totalImages, null);
  const queueInfo = createQueueInfo(batch.queuePosition, batch.estimatedWaitTime, batch.isQueued);
  const errorSummary = createErrorSummary(batch.latestErrorMessage, status);

  return {
    id: batch.id,
    status,
    current_stage: null, // 批量任务当前不暴露具体阶段（见上方 TODO）
    progress,
    error_summary: errorSummary,
    queue_info: queueInfo,
  };
}

/**
 * 构建标准分析任务状态视图
 */
function buildStandardAnalysisStatusView(
  result: AnalysisResult
): Omit<TaskStatusView, 'updated_at' | 'recoverable_actions'> {
  const progress: TaskProgress = {
    percentage: 100,
    completed_steps: 1,
    total_steps: 1,
  };

  return {
    id: result.id,
    status: 'completed',
    current_stage: null,
    progress,
  };
}

/**
 * 获取任务状态视图（核心入口）
 *
 * @param taskId - 任务 ID（可能是数字 ID 或字符串 public_id）
 * @param session - 用户会话
 * @returns 任务状态视图
 * @throws StatusServiceError
 */
export async function getTaskStatusView(
  taskId: string | number,
  session: Session | null
): Promise<TaskStatusView> {
  // 权限校验：必须已登录
  if (!session?.user?.id) {
    throw new StatusServiceError('UNAUTHORIZED', '需要登录才能查询任务状态');
  }

  // userId 是 varchar 类型，保持为字符串
  const sessionUserId = session.user.id;

  // 尝试解析为数字 ID
  const numericId = typeof taskId === 'number' ? taskId : parseInt(taskId as string, 10);
  const db = getDb();

  let statusView: Omit<TaskStatusView, 'updated_at' | 'recoverable_actions'>;

  if (!isNaN(numericId)) {
    // 首先检查批量分析任务
    const batchResult = await getBatchTaskStatus(db, numericId, sessionUserId);
    if (batchResult) {
      statusView = buildBatchTaskStatusView(batchResult.batch, batchResult.hasResult);
    } else {
      // 检查标准分析结果
      const standardResult = await getStandardAnalysisStatus(db, numericId, sessionUserId);
      if (standardResult) {
        statusView = buildStandardAnalysisStatusView(standardResult);
      } else {
        throw new StatusServiceError('NOT_FOUND', '任务不存在');
      }
    }
  } else {
    // 字符串 ID 暂不支持（待后续 public_id 迁移）
    throw new StatusServiceError('NOT_FOUND', '任务不存在');
  }

  // 补充动态字段
  const recoverableActions = getRecoverableActions(statusView.status);
  const updatedAt = new Date().toISOString();

  return {
    ...statusView,
    recoverable_actions: recoverableActions,
    updated_at: updatedAt,
  };
}
