/**
 * Image History Detail API Route
 *
 * Epic 6 - Story 6-3: Image Save
 * GET /api/history/generations/[id] - Get single image history record
 * DELETE /api/history/generations/[id] - Delete image from history
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getImageHistoryDetail,
  deleteImageFromHistory,
} from '@/features/generation/lib/image-history-service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const generationId = parseInt(id, 10);

    if (isNaN(generationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid generation ID' },
        { status: 400 }
      );
    }

    const record = await getImageHistoryDetail(session.user.id, generationId);

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching image history detail:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch image history detail',
      },
      { status: error instanceof Error && error.message === 'Image history record not found' ? 404 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const generationId = parseInt(id, 10);

    if (isNaN(generationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid generation ID' },
        { status: 400 }
      );
    }

    await deleteImageFromHistory(session.user.id, generationId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted from history',
    });
  } catch (error) {
    console.error('Error deleting image from history:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete image from history',
      },
      { status: error instanceof Error && error.message === 'Image history record not found' ? 404 : 500 }
    );
  }
}
