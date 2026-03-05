/**
 * Objective Description Stage Service
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * 职责：
 * - 编排 Forensic Describer 阶段执行
 * - 处理重试逻辑（最多1次重试）
 * - 将阶段输出持久化到 analysis_stage_snapshots
 * - 更新任务状态
 * - 处理阶段失败和重试逻辑
 */

import { getDb } from '@/lib/db';
import { analysisTasks, analysisStageSnapshots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  runForensicDescriberStage,
  shouldRetry,
  type ForensicDescriberResult,
} from '@/lib/analysis-ir/stages/objective-description';
import type { ObjectiveDescription } from '@/lib/analysis-ir/schemas/objective-description';

/**
 * 服务层错误类型
 */
export class ObjectiveDescriptionServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ObjectiveDescriptionServiceError';
  }
}

/**
 * 服务层输入参数
 */
export interface RunObjectiveDescriptionStageParams {
  /** 任务 ID */
  taskId: string;
  /** 图片 ID */
  imageId: string;
  /** 图片 URL */
  imageUrl: string;
  /** 可选的自定义提示词 */
  customPrompt?: string;
}

/**
 * 服务层成功响应
 */
export interface ObjectiveDescriptionServiceSuccess {
  success: true;
  data: ObjectiveDescription;
  snapshotId: string;
  attemptNo: number;
}

/**
 * 服务层错误响应
 */
export interface ObjectiveDescriptionServiceError {
  success: false;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

/**
 * 服务层响应
 */
export type ObjectiveDescriptionServiceResponse =
  | ObjectiveDescriptionServiceSuccess
  | ObjectiveDescriptionServiceError;

/**
 * 错误代码枚举
 */
export const SERVICE_ERROR_CODES = {
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE_FORMAT: 'INVALID_RESPONSE_FORMAT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * 执行 Objective Description 阶段（服务层入口）
 *
 * @param params - 服务层参数
 * @returns 服务层响应
 *
 * @example
 * ```typescript
 * const result = await runObjectiveDescriptionStage({
 *   taskId: 'task-123',
 *   imageId: 'image-456',
 *   imageUrl: 'https://example.com/image.jpg',
 * });
 *
 * if (result.success) {
 *   console.log('Objective description:', result.data);
 *   console.log('Snapshot ID:', result.snapshotId);
 * } else {
 *   console.error('Error:', result.error.message);
 * }
 * ```
 */
export async function runObjectiveDescriptionStage(
  params: RunObjectiveDescriptionStageParams
): Promise<ObjectiveDescriptionServiceResponse> {
  const { taskId, imageId, imageUrl, customPrompt } = params;
  const db = getDb();

  try {
    // 1. 验证任务存在
    const taskExists = await verifyTaskExists(db, taskId);
    if (!taskExists) {
      throw new ObjectiveDescriptionServiceError(
        SERVICE_ERROR_CODES.TASK_NOT_FOUND,
        `Task ${taskId} not found`,
        false
      );
    }

    // 2. 执行阶段（带重试逻辑）
    let stageResult: ForensicDescriberResult;
    let attemptNo = 1;

    // 第一次尝试
    stageResult = await runForensicDescriberStage(
      {
        image_url: imageUrl,
        task_id: taskId,
        custom_prompt: customPrompt,
      },
      attemptNo
    );

    // 如果失败且可重试，执行重试
    if (!stageResult.success && shouldRetry(stageResult)) {
      attemptNo = 2;
      stageResult = await runForensicDescriberStage(
        {
          image_url: imageUrl,
          task_id: taskId,
          custom_prompt: customPrompt,
        },
        attemptNo
      );
    }

    // 3. 处理阶段结果
    if (!stageResult.success) {
      // 阶段执行失败，写入失败快照并更新任务状态
      await persistFailedStage(db, taskId, stageResult, attemptNo);
      throw new ObjectiveDescriptionServiceError(
        stageResult.error.code,
        stageResult.error.message,
        stageResult.error.retryable
      );
    }

    // 4. 持久化成功的阶段快照
    const snapshotId = await persistSuccessfulStage(
      db,
      taskId,
      stageResult.data,
      stageResult.metadata,
      attemptNo
    );

    // 5. 更新任务状态
    await updateTaskStatus(db, taskId, 'forensic_describer');

    // 6. 返回成功响应
    return {
      success: true,
      data: stageResult.data,
      snapshotId,
      attemptNo,
    };
  } catch (error) {
    // 处理服务层错误
    if (error instanceof ObjectiveDescriptionServiceError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
      } as ObjectiveDescriptionServiceError;
    }

    // 处理未知错误
    return {
      success: false,
      error: {
        code: SERVICE_ERROR_CODES.UNKNOWN_ERROR,
        message: error instanceof Error ? error.message : String(error),
        retryable: false,
      },
    } as ObjectiveDescriptionServiceError;
  }
}

/**
 * 验证任务存在
 */
async function verifyTaskExists(
  db: ReturnType<typeof getDb>,
  taskId: string
): Promise<boolean> {
  const tasks = await db
    .select()
    .from(analysisTasks)
    .where(eq(analysisTasks.id, taskId))
    .limit(1);

  return tasks.length > 0;
}

/**
 * 持久化成功的阶段快照
 */
async function persistSuccessfulStage(
  db: ReturnType<typeof getDb>,
  taskId: string,
  data: ObjectiveDescription,
  metadata: { model_used: string; provider: string; duration_ms: number },
  attemptNo: number
): Promise<string> {
  const snapshotId = crypto.randomUUID();

  await db.insert(analysisStageSnapshots).values({
    id: snapshotId,
    taskId: taskId,
    stageName: 'forensic_describer',
    attemptNo: attemptNo,
    stageStatus: 'completed',
    provider: metadata.provider,
    modelId: metadata.model_used,
    schemaVersion: '1.0.0',
    inputPayload: null,
    outputPayload: JSON.stringify(data),
    errorPayload: null,
    metricsPayload: JSON.stringify({
      duration_ms: metadata.duration_ms,
      overall_confidence: data.overall_confidence,
      uncertainty_count: data.uncertainty_fields.length,
    }),
    startedAt: new Date(Date.now() - metadata.duration_ms),
    completedAt: new Date(),
    createdAt: new Date(),
  });

  return snapshotId;
}

/**
 * 持久化失败的阶段快照
 */
async function persistFailedStage(
  db: ReturnType<typeof getDb>,
  taskId: string,
  stageResult: Exclude<ForensicDescriberResult, { success: true }>,
  attemptNo: number
): Promise<void> {
  const snapshotId = crypto.randomUUID();

  await db.insert(analysisStageSnapshots).values({
    id: snapshotId,
    taskId: taskId,
    stageName: 'forensic_describer',
    attemptNo: attemptNo,
    stageStatus: 'failed',
    provider: 'replicate',
    modelId: null,
    schemaVersion: '1.0.0',
    inputPayload: null,
    outputPayload: null,
    errorPayload: JSON.stringify({
      code: stageResult.error.code,
      message: stageResult.error.message,
      attempt_no: stageResult.error.attempt_no,
    }),
    metricsPayload: JSON.stringify({
      error_code: stageResult.error.code,
    }),
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
  });
}

/**
 * 更新任务状态
 */
async function updateTaskStatus(
  db: ReturnType<typeof getDb>,
  taskId: string,
  currentStage: 'forensic_describer' | 'style_fingerprinter' | 'prompt_compiler' | 'qa_critic'
): Promise<void> {
  await db
    .update(analysisTasks)
    .set({
      currentStage: currentStage,
      updatedAt: new Date(),
    })
    .where(eq(analysisTasks.id, taskId));
}
