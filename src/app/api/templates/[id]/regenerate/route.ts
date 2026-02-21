/**
 * Regenerate from Template API Route
 *
 * Epic 7 - Story 7.2: Template Library
 * POST /api/templates/[id]/regenerate - Regenerate image from template
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { regenerateFromTemplate } from '@/features/templates/lib/template-library-service';

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

    const result = await regenerateFromTemplate(session.user.id, templateId);

    return NextResponse.json({
      success: true,
      data: {
        predictionId: result.predictionId,
        message: 'Image generation started successfully',
      },
    });
  } catch (error) {
    console.error('Error regenerating from template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to regenerate from template',
      },
      { status: error instanceof Error && error.message === 'Template not found' ? 404 : 500 }
    );
  }
}
