/**
 * Template Library API Routes
 *
 * Epic 7 - Story 7.2: Template Library
 * API endpoints for template library management
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  saveToLibrary,
  getTemplateLibrary,
} from '@/features/templates/lib/template-library-service';
import type {
  SaveToLibraryInput,
  TemplateLibraryParams,
} from '@/features/templates/types/library';

/**
 * GET /api/templates - Get user's template library
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const params: TemplateLibraryParams = {
      page: searchParams.get('page')
        ? parseInt(searchParams.get('page')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      categories: searchParams.get('categories')?.split(',').filter(Boolean).map(cat => {
        const parts = cat.split('/');
        return {
          parent: parts[0] || undefined,
          child: parts[1] || undefined,
        };
      }) || undefined,
      isFavorite: searchParams.get('isFavorite') === 'true' ? true :
                  searchParams.get('isFavorite') === 'false' ? false :
                  undefined,
      sortBy: (searchParams.get('sortBy') as any) || undefined,
      sortOrder: (searchParams.get('sortOrder') as any) || undefined,
    };

    const result = await getTemplateLibrary(session.user.id, params);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching template library:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch template library',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates - Save template to library
 *
 * FIX M5: 添加完整的输入验证
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SaveToLibraryInput = await request.json();

    // Validate required fields
    if (!body.analysisResultId) {
      return NextResponse.json(
        { success: false, error: 'analysisResultId is required' },
        { status: 400 }
      );
    }

    // Validate title
    if (body.title !== undefined) {
      if (typeof body.title !== 'string') {
        return NextResponse.json(
          { success: false, error: 'title must be a string' },
          { status: 400 }
        );
      }
      if (body.title.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'title cannot be empty' },
          { status: 400 }
        );
      }
      if (body.title.length > 200) {
        return NextResponse.json(
          { success: false, error: 'title cannot exceed 200 characters' },
          { status: 400 }
        );
      }
    }

    // Validate description
    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return NextResponse.json(
          { success: false, error: 'description must be a string' },
          { status: 400 }
        );
      }
      if (body.description.length > 1000) {
        return NextResponse.json(
          { success: false, error: 'description cannot exceed 1000 characters' },
          { status: 400 }
        );
      }
    }

    // Validate tags
    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json(
          { success: false, error: 'tags must be an array' },
          { status: 400 }
        );
      }
      if (body.tags.length > 10) {
        return NextResponse.json(
          { success: false, error: 'maximum 10 tags allowed' },
          { status: 400 }
        );
      }
      for (const tag of body.tags) {
        if (typeof tag !== 'string') {
          return NextResponse.json(
            { success: false, error: 'each tag must be a string' },
            { status: 400 }
          );
        }
        if (tag.length > 20) {
          return NextResponse.json(
            { success: false, error: `tag "${tag}" exceeds maximum length of 20 characters` },
            { status: 400 }
          );
        }
      }
    }

    // Validate category
    if (body.category !== undefined) {
      if (typeof body.category !== 'object' || body.category === null) {
        return NextResponse.json(
          { success: false, error: 'category must be an object with parent and child properties' },
          { status: 400 }
        );
      }
      if (body.category.parent !== undefined && typeof body.category.parent !== 'string') {
        return NextResponse.json(
          { success: false, error: 'category.parent must be a string' },
          { status: 400 }
        );
      }
      if (body.category.child !== undefined && typeof body.category.child !== 'string') {
        return NextResponse.json(
          { success: false, error: 'category.child must be a string' },
          { status: 400 }
        );
      }
    }

    const template = await saveToLibrary(session.user.id, body);

    return NextResponse.json({
      success: true,
      data: {
        template,
        message: 'Template saved to library successfully',
      },
    });
  } catch (error) {
    console.error('Error saving template to library:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save template to library',
      },
      { status: 500 }
    );
  }
}
