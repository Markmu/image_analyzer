/**
 * Image History API Route
 *
 * Epic 6 - Story 6-3: Image Save
 * GET /api/history/generations - Get user's image generation history
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getImageHistory } from '@/features/generation/lib/image-history-service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    if (
      sortBy !== 'createdAt' &&
      sortBy !== 'width' &&
      sortBy !== 'height'
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid sortBy parameter' },
        { status: 400 }
      );
    }

    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return NextResponse.json(
        { success: false, error: 'Invalid sortOrder parameter' },
        { status: 400 }
      );
    }

    const result = await getImageHistory(session.user.id, {
      page,
      limit,
      sortBy: sortBy as 'createdAt' | 'width' | 'height',
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching image history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch image history',
      },
      { status: 500 }
    );
  }
}
