/**
 * 队列状态 API 端点
 *
 * Story 3-3: 分析进度与队列管理
 * AC-2: 等待队列透明化
 *
 * GET /api/analysis/queue/status
 * 返回当前队列长度、用户位置、等待时间等
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getQueueStatus, getUserSubscriptionTier, getMaxConcurrent } from '@/lib/analysis/queue';

/**
 * GET /api/analysis/queue/status
 *
 * Response:
 * - success: boolean
 * - data: { queueLength, userPosition, estimatedWaitTime, currentProcessing, maxConcurrent }
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();
    const userId = session?.user?.id;

    // 获取队列状态
    const status = getQueueStatus(userId);

    // 如果用户已登录，获取用户的并发限制
    let maxConcurrent = 10; // 默认值
    if (userId) {
      const tier = await getUserSubscriptionTier(userId);
      maxConcurrent = getMaxConcurrent(tier);
    }

    return NextResponse.json({
      success: true,
      data: {
        queueLength: status.queueLength,
        userPosition: status.userPosition,
        estimatedWaitTime: status.estimatedWaitTime,
        currentProcessing: status.currentProcessing,
        maxConcurrent,
      },
    });
  } catch (error) {
    console.error('Queue status API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取队列状态失败',
        },
      },
      { status: 500 }
    );
  }
}
