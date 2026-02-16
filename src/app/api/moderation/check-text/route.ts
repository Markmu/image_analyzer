/**
 * 文本内容审核 API
 *
 * Story 4-1: 内容审核功能
 * POST /api/moderation/check-text
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { moderateText, getTextModerationSuggestion } from '@/lib/moderation/text-moderation';
import { logModeration } from '@/lib/moderation/log-moderation';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '请提供有效的文本内容' } },
        { status: 400 }
      );
    }

    // 执行文本审核
    const result = await moderateText(text);

    // 记录审核日志
    await logModeration({
      userId: session.user.id,
      contentType: 'text',
      result,
    });

    // 构建响应
    const response: any = {
      isApproved: result.isApproved,
      confidence: result.confidence,
    };

    if (!result.isApproved) {
      response.reason = result.reason;
      response.suggestion = getTextModerationSuggestion(result);
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('[CheckText] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '审核服务错误',
        },
      },
      { status: 500 }
    );
  }
}
