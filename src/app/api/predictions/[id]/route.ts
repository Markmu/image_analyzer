/**
 * 预测状态查询 API
 *
 * 用户查询异步任务的当前状态和结果
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPredictionByPredictionId } from '@/lib/replicate/webhook';

/**
 * GET 获取预测状态
 *
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 预测状态和结果
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户身份
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: predictionId } = await params;

    // 获取预测记录
    const prediction = await getPredictionByPredictionId(predictionId);

    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }

    // 验证用户身份（从 prediction 记录获取 userId 匹配）
    if (prediction.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 返回当前状态和结果
    return NextResponse.json({
      id: prediction.id,
      predictionId: prediction.predictionId,
      taskType: prediction.taskType,
      modelId: prediction.modelId,
      status: prediction.status,
      input: prediction.input,
      output: prediction.output,
      errorMessage: prediction.errorMessage,
      createdAt: prediction.createdAt,
      completedAt: prediction.completedAt,
    });
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
