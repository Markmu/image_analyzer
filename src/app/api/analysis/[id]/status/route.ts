/**
 * 分析状态查询 API
 * GET /api/analysis/[id]/status
 *
 * 返回分析任务的当前状态和进度
 * 如果分析完成，返回完整的结果数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { analysisResults, batchAnalysisResults, images } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import type { AnalysisStage } from '@/lib/utils/time-estimation';

// 模拟的分析任务存储（实际应用中应该使用数据库或 Redis）
const analysisTasks = new Map<string, {
  status: AnalysisStage;
  progress: number;
  currentTerm?: string;
  queuePosition?: number | null;
  startTime: number;
  result?: any;
}>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params;

    if (!analysisId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '分析 ID 不能为空',
          },
        },
        { status: 400 }
      );
    }

    // 检查是否是数字 ID（真实数据库记录）
    const numericId = parseInt(analysisId, 10);
    if (!isNaN(numericId)) {
      const db = getDb();

      // 首先查询批量分析记录表（异步任务）
      const batchResults = await db
        .select()
        .from(batchAnalysisResults)
        .where(eq(batchAnalysisResults.id, numericId))
        .limit(1);

      if (batchResults.length > 0) {
        const batch = batchResults[0];

        // 如果是已完成的任务，尝试获取分析结果
        if (batch.status === 'completed' || batch.status === 'partial') {
          const analysisResultList = await db
            .select()
            .from(analysisResults)
            .orderBy(desc(analysisResults.createdAt))
            .limit(1);

          if (analysisResultList.length > 0) {
            const result = analysisResultList[0];
            return NextResponse.json({
              success: true,
              data: {
                id: batch.id,
                status: batch.status,
                progress: {
                  completed: batch.completedImages,
                  total: batch.totalImages,
                  failed: batch.failedImages,
                },
                result: result.analysisData,
                confidenceScore: result.confidenceScore,
                createdAt: batch.createdAt,
                completedAt: batch.completedAt,
                queuePosition: batch.queuePosition,
                estimatedWaitTime: batch.estimatedWaitTime,
                isQueued: batch.isQueued,
              },
            });
          }
        }

        // 返回任务状态
        return NextResponse.json({
          success: true,
          data: {
            id: batch.id,
            status: batch.status,
            progress: {
              completed: batch.completedImages,
              total: batch.totalImages,
              failed: batch.failedImages,
            },
            result: null,
            createdAt: batch.createdAt,
            completedAt: batch.completedAt,
            queuePosition: batch.queuePosition,
            estimatedWaitTime: batch.estimatedWaitTime,
            isQueued: batch.isQueued,
          },
        });
      }

      // 查询已完成的标准分析结果
      const results = await db
        .select()
        .from(analysisResults)
        .where(eq(analysisResults.id, numericId))
        .limit(1);

      if (results.length > 0) {
        const result = results[0];
        return NextResponse.json({
          success: true,
          data: {
            id: result.id,
            status: 'completed',
            progress: {
              completed: 1,
              total: 1,
              failed: 0,
            },
            result: result.analysisData,
            confidenceScore: result.confidenceScore,
            feedback: result.feedback,
            createdAt: result.createdAt,
          },
        });
      }
    }

    // 获取分析任务状态（用于进度跟踪）
    const task = analysisTasks.get(analysisId);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '分析任务不存在',
          },
        },
        { status: 404 }
      );
    }

    // 计算预计剩余时间
    const elapsed = Date.now() - task.startTime;
    const estimatedTime = Math.max(0, 60 - elapsed / 1000); // 假设总时长 60 秒

    return NextResponse.json({
      success: true,
      data: {
        analysisId,
        status: task.status,
        progress: task.progress,
        currentTerm: task.currentTerm,
        queuePosition: task.queuePosition,
        estimatedTime,
        result: task.result,
      },
    });
  } catch (error) {
    console.error('获取分析状态失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取分析状态失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 创建新的分析任务（用于测试）
 * 实际应用中应该由分析 API 调用创建
 */
export const createAnalysisTask = (
  analysisId: string,
  data: {
    status: AnalysisStage;
    progress: number;
    currentTerm?: string;
    queuePosition?: number | null;
  }
) => {
  analysisTasks.set(analysisId, {
    ...data,
    startTime: Date.now(),
  });
};

/**
 * 更新分析任务状态（用于测试）
 * 实际应用中应该由分析工作流更新
 */
export const updateAnalysisTask = (
  analysisId: string,
  data: Partial<{
    status: AnalysisStage;
    progress: number;
    currentTerm: string;
    queuePosition: number | null;
    result: any;
  }>
) => {
  const task = analysisTasks.get(analysisId);
  if (task) {
    analysisTasks.set(analysisId, { ...task, ...data });
  }
};

// 导出用于测试
export { analysisTasks };

