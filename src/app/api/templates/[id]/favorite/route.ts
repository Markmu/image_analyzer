/**
 * Toggle Favorite API Route
 *
 * Epic 7 - Story 7.2: Template Library
 * POST /api/templates/[id]/favorite - Toggle template favorite status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleFavorite } from '@/features/templates/lib/template-library-service';

export async function POST(
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
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const template = await toggleFavorite(session.user.id, templateId);

    return NextResponse.json({
      success: true,
      data: {
        template,
        isFavorite: template.isFavorite,
      },
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
      },
      { status: error instanceof Error && error.message === 'Template not found' ? 404 : 500 }
    );
  }
}
