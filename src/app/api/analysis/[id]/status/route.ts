/**
 * 分析状态查询 API
 * GET /api/analysis/[id]/status
 *
 * 返回分析任务的轻量状态视图（不包含完整结果）
 * 完整结果应通过 GET /api/analysis/[id] 获取
 *
 * 参考: Story 1.2 - 轮询任务状态并展示可恢复进度反馈
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTaskStatusView, StatusServiceError } from '@/lib/analysis-tasks/status-service';
import type { TaskStatusErrorResponse } from '@/lib/analysis-ir/status-schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    if (!taskId) {
      const errorResponse: TaskStatusErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '任务 ID 不能为空',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 验证用户身份
    const session = await auth();

    // 获取任务状态视图（包含权限校验）
    const statusView = await getTaskStatusView(taskId, session);

    return NextResponse.json({
      success: true,
      data: statusView,
    });
  } catch (error) {
    console.error('获取分析状态失败:', error);

    // 处理服务层特定错误
    if (error instanceof StatusServiceError) {
      const errorResponse: TaskStatusErrorResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };

      // 根据错误代码返回适当的 HTTP 状态码
      const httpStatus = {
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
      }[error.code] || 500;

      return NextResponse.json(errorResponse, { status: httpStatus });
    }

    // 通用错误处理
    const errorResponse: TaskStatusErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '获取分析状态失败',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
