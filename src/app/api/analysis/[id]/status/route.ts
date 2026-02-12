/**
 * 分析状态查询 API
 * GET /api/analysis/[id]/status
 *
 * 返回分析任务的当前状态和进度
 */

import { NextRequest, NextResponse } from 'next/server';
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

    // 获取分析任务状态
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
