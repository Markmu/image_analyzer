/**
 * 获取服务条款状态 API
 *
 * Story 4-1: 内容审核功能
 * GET /api/user/terms-status
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const CURRENT_TERMS_VERSION = '1.0';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未授权' } },
        { status: 401 }
      );
    }

    // 获取用户信息
    const userInfo = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        agreedToTermsAt: true,
        termsVersion: true,
      },
    });

    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: '用户不存在' } },
        { status: 404 }
      );
    }

    const hasAgreed = !!userInfo.agreedToTermsAt;
    const requiresAgreement =
      !hasAgreed || userInfo.termsVersion !== CURRENT_TERMS_VERSION;

    return NextResponse.json({
      success: true,
      data: {
        hasAgreed,
        currentVersion: CURRENT_TERMS_VERSION,
        agreedVersion: userInfo.termsVersion,
        requiresAgreement,
        agreedAt: userInfo.agreedToTermsAt,
      },
    });
  } catch (error) {
    console.error('[TermsStatus] Error:', error);
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
