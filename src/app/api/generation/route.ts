/**
 * 图片生成 API
 *
 * 使用 Replicate Webhook 异步生成图片
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { generateImageAsync } from '@/lib/replicate/async';

/**
 * POST /api/generation
 * 发起图片生成请求（异步模式）
 *
 * Request body:
 * - prompt: string - 生成图片的描述
 * - negativePrompt?: string - 负面提示
 * - width?: number - 图片宽度
 * - height?: number - 图片高度
 * - numOutputs?: number - 生成数量
 * - creditCost?: number - 消耗积分（默认 5）
 *
 * Response:
 * - success: boolean
 * - data: { predictionId: string, status: string, message: string }
 *
 * Errors:
 * - UNAUTHORIZED: 用户未登录
 * - INVALID_PROMPT: 提示无效
 * - INSUFFICIENT_CREDITS: Credit 不足
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => null);

    // 2. 验证提示词
    if (!body || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PROMPT', message: '请提供有效的图片描述' } },
        { status: 400 }
      );
    }

    const prompt = body.prompt.trim();
    const negativePrompt = typeof body.negativePrompt === 'string' ? body.negativePrompt : undefined;
    const width = typeof body.width === 'number' ? body.width : 1024;
    const height = typeof body.height === 'number' ? body.height : 1024;
    const numOutputs = typeof body.numOutputs === 'number' ? Math.min(body.numOutputs, 4) : 1;
    const creditCost = typeof body.creditCost === 'number' ? body.creditCost : 5;

    const db = getDb();

    // 3. 检查用户 credit 余额
    const userList = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    const userData = userList[0];

    if (!userData || userData.creditBalance < creditCost) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: `Credit 不足，需要 ${creditCost} 个积分`,
          },
        },
        { status: 402 }
      );
    }

    // 4. 调用异步生成
    try {
      const result = await generateImageAsync({
        userId,
        prompt,
        modelId: process.env.REPLICATE_IMAGE_MODEL_ID || 'default-image-model',
        negativePrompt,
        width,
        height,
        numOutputs,
        creditCost,
      });

      return NextResponse.json({
        success: true,
        data: {
          predictionId: result.predictionId,
          status: 'pending',
          message: '图片生成任务已创建，请通过 predictionId 查询结果',
          creditCost,
        },
      });
    } catch (error) {
      console.error('Image generation failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: error instanceof Error ? error.message : '图片生成创建失败',
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Generation API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
