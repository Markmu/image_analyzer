/**
 * 同意服务条款 API
 *
 * Story 4-1: 内容审核功能
 * POST /api/user/agree-terms
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const CURRENT_TERMS_VERSION = '1.0';

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
    const version = body.version || CURRENT_TERMS_VERSION;

    // 更新用户同意时间
    const [updatedUser] = await db
      .update(user)
      .set({
        agreedToTermsAt: new Date(),
        termsVersion: version,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning();

    console.log('[AgreeTerms] User agreed to terms:', {
      userId: session.user.id,
      version,
      agreedAt: updatedUser.agreedToTermsAt,
    });

    return NextResponse.json({
      success: true,
      data: {
        agreedAt: updatedUser.agreedToTermsAt,
        version: updatedUser.termsVersion,
      },
    });
  } catch (error) {
    console.error('[AgreeTerms] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器错误',
        },
      },
      { status: 500 }
    );
  }
}
