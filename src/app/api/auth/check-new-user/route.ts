import { NextRequest, NextResponse } from 'next/server';
import { checkNewUser } from '@/features/auth/services';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

/**
 * API Endpoint: POST /api/auth/check-new-user
 *
 * Epic 1 - Story 1.2: 用户注册与 Credit 奖励
 *
 * Check if a user is a new user (first time login)
 * Protected: Requires valid session
 */

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { code: 'MISSING_USER_ID', message: 'userId is required' },
        { status: 400 }
      );
    }

    // Security: Only allow users to check their own status
    if (userId !== session.user.id) {
      return NextResponse.json(
        { code: 'FORBIDDEN', message: 'Can only check your own user status' },
        { status: 403 }
      );
    }

    const result = await checkNewUser(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] check-new-user error:', error);

    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { code: 'USER_NOT_FOUND', message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
