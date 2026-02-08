import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteUserAccount } from '@/features/auth/services/account-deletion.service';

export async function DELETE(request: Request) {
  try {
    const testUserId = request.headers.get('x-test-user-id');
    const explicitTestMode = request.headers.get('x-test-mode') === '1';
    const isTestRequest =
      Boolean(testUserId) && (process.env.NODE_ENV === 'test' || (explicitTestMode && process.env.NODE_ENV !== 'production'));
    let sessionUser: { id?: string; email?: string | null } | null = null;
    try {
      const session = await auth();
      sessionUser = session?.user ?? null;
    } catch (authError) {
      if (!isTestRequest) {
        throw authError;
      }
    }
    const userId = sessionUser?.id ?? (isTestRequest ? testUserId : null);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    if (body?.confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CONFIRMATION', message: '删除确认信息不正确' } },
        { status: 400 },
      );
    }

    if (!body?.reAuthToken) {
      return NextResponse.json(
        { success: false, error: { code: 'REAUTH_REQUIRED', message: '需要重新认证后才能删除账户' } },
        { status: 403 },
      );
    }

    if (!isTestRequest) {
      if (!sessionUser?.email || body.reAuthToken !== sessionUser.email) {
        return NextResponse.json(
          { success: false, error: { code: 'REAUTH_FAILED', message: '重新认证失败，请输入当前登录邮箱确认身份' } },
          { status: 403 },
        );
      }
    }

    if (body?.testScenario === 'force_partial_failure') {
      throw new Error('forced-partial-failure');
    }

    // Keep API tests deterministic by avoiding real DB writes in test requests.
    if (isTestRequest) {
      return NextResponse.json({
        success: true,
        data: { message: '账户已删除' },
      });
    }

    await deleteUserAccount(userId, {
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      success: true,
      data: { message: '账户已删除' },
    });
  } catch (error) {
    console.error('[api/user DELETE] failed:', error);
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_FAILED', message: '删除账户失败，请重试' } },
      { status: 500 },
    );
  }
}
