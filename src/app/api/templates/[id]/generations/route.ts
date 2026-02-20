/**
 * Template Generations API Route
 *
 * Epic 7 - Story 7.2: Template Library
 * GET /api/templates/[id]/generations - Get template generation history
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTemplateGenerations } from '@/features/templates/lib/template-library-service';

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
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const generations = await getTemplateGenerations(session.user.id, templateId);

    return NextResponse.json({
      success: true,
      data: {
        generations,
        total: generations.length,
      },
    });
  } catch (error) {
    console.error('Error fetching template generations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch template generations',
      },
      { status: error instanceof Error && error.message === 'Template not found' ? 404 : 500 }
    );
  }
}
