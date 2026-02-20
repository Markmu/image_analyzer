/**
 * Template Detail API Routes
 *
 * Epic 7 - Story 7.2: Template Library
 * API endpoints for individual template operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getTemplateDetail,
  updateTemplate,
  deleteTemplate,
} from '@/features/templates/lib/template-library-service';
import type { UpdateTemplateInput } from '@/features/templates/types/library';

/**
 * GET /api/templates/[id] - Get template detail
 */
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

    const template = await getTemplateDetail(session.user.id, templateId);

    return NextResponse.json({
      success: true,
      data: { template },
    });
  } catch (error) {
    console.error('Error fetching template detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch template detail',
      },
      { status: error instanceof Error && error.message === 'Template not found' ? 404 : 500 }
    );
  }
}

/**
 * PATCH /api/templates/[id] - Update template
 */
export async function PATCH(
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

    const body: UpdateTemplateInput = await request.json();

    const template = await updateTemplate(session.user.id, templateId, body);

    return NextResponse.json({
      success: true,
      data: { template },
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template',
      },
      { status: error instanceof Error && error.message === 'Template not found' ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id] - Delete template
 */
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
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    await deleteTemplate(session.user.id, templateId);

    return NextResponse.json({
      success: true,
      data: { message: 'Template deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template',
      },
      { status: error instanceof Error && error.message === 'Template not found' ? 404 : 500 }
    );
  }
}
