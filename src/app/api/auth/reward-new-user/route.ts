import { NextRequest, NextResponse } from 'next/server';
import { checkAndRewardNewUser } from '@/features/auth/services';
import { auth } from '@/lib/auth';

/**
 * API Endpoint: POST /api/auth/reward-new-user
 *
 * Epic 1 - Story 1.2: 用户注册与 Credit 奖励
 *
 * Check and reward a new user with 30 credits
 * Protected: Requires valid session
 */

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated (NextAuth v5 uses auth())
    const session = await auth();
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

    // Security: Only allow users to reward themselves (prevents credit farming)
    if (userId !== session.user.id) {
      return NextResponse.json(
        { code: 'FORBIDDEN', message: 'Can only reward your own account' },
        { status: 403 }
      );
    }

    const result = await checkAndRewardNewUser(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] reward-new-user error:', error);

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
