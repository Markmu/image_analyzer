/**
 * GET /api/analytics/templates/[id]/generations
 * 获取基于特定模版生成的所有历史图片
 * Story 7-3: 模版使用分析和统计
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { templateGenerations, generations, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = parseInt(params.id);
    if (isNaN(templateId)) {
      return NextResponse.json({ success: false, error: 'Invalid template ID' }, { status: 400 });
    }

    // 验证模版所有权
    const [template] = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, templateId), eq(templates.userId, session.user.id)));

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    // 获取生成记录
    const generationRecords = await db
      .select({
        id: generations.id,
        imageUrl: generations.imageUrl,
        createdAt: generations.createdAt,
      })
      .from(templateGenerations)
      .innerJoin(generations, eq(templateGenerations.generationId, generations.id))
      .where(eq(templateGenerations.templateId, templateId))
      .orderBy(generations.createdAt);

    return NextResponse.json({
      success: true,
      data: {
        generations: generationRecords,
        template: {
          id: template.id,
          title: template.title,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching template generations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch template generations',
      },
      { status: 500 }
    );
  }
}
