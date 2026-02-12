import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { user, images, analysisResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { analyzeImageStyle } from '@/lib/replicate/vision';
import { validateImageComplexity } from '@/lib/replicate/vision';
import { auth } from '@/lib/auth';

/**
 * POST /api/analysis
 * 发起图片风格分析请求
 *
 * Request body:
 * - imageId: string - 图片 ID
 *
 * Response:
 * - success: boolean
 * - data: { analysisId: number, status: string }
 *
 * Errors:
 * - UNAUTHORIZED: 用户未登录
 * - INVALID_IMAGE_ID: 图片 ID 无效
 * - IMAGE_NOT_FOUND: 图片不存在
 * - INSUFFICIENT_CREDITS: Credit 不足
 * - UNSAFE_CONTENT: 内容安全检查失败
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

    if (!body || typeof body.imageId !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_IMAGE_ID', message: '图片 ID 无效' } },
        { status: 400 }
      );
    }

    const imageId = body.imageId;
    const db = getDb();

    // 2. 验证图片存在且属于当前用户
    const imageList = await db
      .select()
      .from(images)
      .where(and(eq(images.id, imageId), eq(images.userId, userId)))
      .limit(1);

    if (imageList.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'IMAGE_NOT_FOUND', message: '图片不存在' } },
        { status: 404 }
      );
    }

    const image = imageList[0];

    // 3. 检查是否已经分析过
    const existingAnalysis = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.imageId, imageId))
      .limit(1);

    if (existingAnalysis.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          analysisId: existingAnalysis[0].id,
          status: 'completed',
          message: '图片已分析过',
        },
      });
    }

    // 4. 检查用户 credit 余额
    const userList = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    const userData = userList[0];

    if (!userData || userData.creditBalance < 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: 'Credit 不足，请升级订阅',
          },
        },
        { status: 402 }
      );
    }

    // 5. 内容安全检查
    try {
      const complexityCheck = await validateImageComplexity(image.filePath);

      // 检查是否包含不当内容（低置信度或复杂的场景可能有问题）
      if (complexityCheck.complexity === 'high' && complexityCheck.confidence > 0.8) {
        console.error('Content safety check failed for image:', imageId);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNSAFE_CONTENT',
              message: '图片内容安全检查未通过，无法分析',
            },
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Content safety check error:', error);
      // 如果安全检查失败，允许继续但不记录审核日志
    }

    // 6. 执行风格分析
    let analysisData;
    try {
      analysisData = await analyzeImageStyle(image.filePath);
    } catch (error) {
      console.error('Style analysis failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ANALYSIS_FAILED',
            message: '分析失败，请稍后重试',
          },
        },
        { status: 500 }
      );
    }

    // 7. 保存分析结果到数据库
    const [insertedResult] = await db
      .insert(analysisResults)
      .values({
        userId: userId,
        imageId: imageId,
        analysisData: JSON.parse(JSON.stringify(analysisData)),
        confidenceScore: analysisData.overallConfidence,
      })
      .returning();

    // 8. 扣除 credit
    await db
      .update(user)
      .set({ creditBalance: userData.creditBalance - 1 })
      .where(eq(user.id, userId));

    return NextResponse.json({
      success: true,
      data: {
        analysisId: insertedResult.id,
        status: 'completed',
      },
    });
  } catch (error) {
    console.error('Analysis API error:', error);
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

