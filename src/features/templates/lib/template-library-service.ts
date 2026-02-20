/**
 * Template Library Service
 *
 * Epic 7 - Story 7.2: Template Library
 * Service layer for permanent template library operations
 */

import { eq, and, desc, asc, sql, like, or, count, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  templates,
  templateTags,
  templateCategories,
  templateGenerations,
  generations,
  analysisResults,
} from '@/lib/db/schema';
import type {
  SavedTemplate,
  SaveToLibraryInput,
  UpdateTemplateInput,
  TemplateLibraryParams,
  TemplateLibraryResponse,
  TemplateGenerationHistory,
} from '@/features/templates/types/library';
import { TEMPLATE_CONSTANTS } from '@/features/templates/types/library';

/**
 * 类型守卫：验证 templateSnapshot 结构
 */
function isValidTemplateSnapshot(data: any): data is SavedTemplate['templateSnapshot'] {
  return (
    data &&
    typeof data === 'object' &&
    'analysisData' in data &&
    'confidenceScore' in data &&
    'createdAt' in data
  );
}

/**
 * Save template to permanent library
 *
 * FIX H2: 从 analysis_results 表查询并构建完整的模版快照
 */
export async function saveToLibrary(
  userId: string,
  input: SaveToLibraryInput
): Promise<SavedTemplate> {
  const { analysisResultId, title, description, tags = [], category } = input;

  // Validate tags
  if (tags.length > TEMPLATE_CONSTANTS.MAX_TAGS_PER_TEMPLATE) {
    throw new Error(
      `Maximum ${TEMPLATE_CONSTANTS.MAX_TAGS_PER_TEMPLATE} tags allowed per template`
    );
  }

  for (const tag of tags) {
    if (tag.length > TEMPLATE_CONSTANTS.MAX_TAG_LENGTH) {
      throw new Error(
        `Tag "${tag}" exceeds maximum length of ${TEMPLATE_CONSTANTS.MAX_TAG_LENGTH} characters`
      );
    }
  }

  // Fetch analysis result to build template snapshot
  const [analysisResult] = await db
    .select()
    .from(analysisResults)
    .where(eq(analysisResults.id, analysisResultId))
    .limit(1);

  if (!analysisResult) {
    throw new Error('Analysis result not found');
  }

  if (analysisResult.userId !== userId) {
    throw new Error('Access denied to this analysis result');
  }

  // Start a transaction
  return await db.transaction(async (tx) => {
    // Create template with complete snapshot
    const [template] = await tx
      .insert(templates)
      .values({
        userId,
        analysisResultId,
        title,
        description,
        templateSnapshot: {
          analysisData: analysisResult.analysisData,
          confidenceScore: analysisResult.confidenceScore,
          modelId: analysisResult.modelId,
          createdAt: analysisResult.createdAt,
        },
        isFavorite: false,
        usageCount: 0,
      })
      .returning();

    // Add tags
    if (tags.length > 0) {
      await tx.insert(templateTags).values(
        tags.map((tag) => ({
          templateId: template.id,
          tag,
        }))
      );
    }

    // Add category
    if (category && (category.parent || category.child)) {
      await tx.insert(templateCategories).values({
        templateId: template.id,
        parentCategory: category.parent || null,
        childCategory: category.child || null,
      });
    }

    // Fetch complete template with relations
    return await getTemplateById(tx, template.id);
  });
}

/**
 * Get user's template library
 *
 * FIXES M1, M2, M3: 实现完整的搜索、标签和分类过滤功能
 */
export async function getTemplateLibrary(
  userId: string,
  params: TemplateLibraryParams = {}
): Promise<TemplateLibraryResponse> {
  const {
    page = 1,
    limit = TEMPLATE_CONSTANTS.DEFAULT_PAGE_SIZE,
    search,
    tags,
    categories,
    isFavorite,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const offset = (page - 1) * limit;

  // Build query conditions
  const conditions = [eq(templates.userId, userId)];

  // Search filter - FIX M1: 添加标签搜索
  if (search) {
    conditions.push(
      or(
        like(templates.title, `%${search}%`),
        like(templates.description, `%${search}%`)
        // 注意：标签搜索在下面的 tags 参数中处理，因为需要 JOIN
      )!
    );
  }

  // Favorite filter
  if (isFavorite !== undefined) {
    conditions.push(eq(templates.isFavorite, isFavorite));
  }

  // Build base query with conditions that don't require joins
  let query = db
    .select({
      id: templates.id,
      userId: templates.userId,
      analysisResultId: templates.analysisResultId,
      title: templates.title,
      description: templates.description,
      templateSnapshot: templates.templateSnapshot,
      isFavorite: templates.isFavorite,
      usageCount: templates.usageCount,
      createdAt: templates.createdAt,
      updatedAt: templates.updatedAt,
    })
    .from(templates)
    .where(and(...conditions));

  // Add sorting BEFORE getting results
  const orderByColumn =
    sortBy === 'createdAt'
      ? templates.createdAt
      : sortBy === 'usageCount'
      ? templates.usageCount
      : templates.title;
  query = query.orderBy(sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn));

  // Get paginated results
  const result = await query.limit(limit).offset(offset);

  // Fetch tags and categories for each template
  const templatesWithRelations = await Promise.all(
    result.map(async (template) => {
      const [tagList, categoryList] = await Promise.all([
        db
          .select({ tag: templateTags.tag })
          .from(templateTags)
          .where(eq(templateTags.templateId, template.id)),
        db
          .select({
            parent: templateCategories.parentCategory,
            child: templateCategories.childCategory,
          })
          .from(templateCategories)
          .where(eq(templateCategories.templateId, template.id)),
      ]);

      return {
        ...template,
        templateSnapshot: isValidTemplateSnapshot(template.templateSnapshot)
          ? template.templateSnapshot
          : {
              analysisData: {},
              confidenceScore: 0,
              createdAt: template.createdAt,
            },
        tags: tagList.map((t) => t.tag),
        categories: categoryList.map((c) => ({
          parent: c.parent,
          child: c.child,
        })),
      };
    })
  );

  // Apply filters that require joined data (M2, M3)
  let filteredTemplates = templatesWithRelations;

  // FIX M2: 按分类过滤
  if (categories && categories.length > 0) {
    filteredTemplates = filteredTemplates.filter((template) => {
      return template.categories.some((cat) =>
        categories.some((filterCat) => {
          // filterCat 可以是字符串（格式："parent" 或 "parent/child"）或对象
          if (typeof filterCat === 'string') {
            const parts = filterCat.split('/');
            const parent = parts[0];
            const child = parts[1];
            return (
              (parent && cat.parent === parent) ||
              (child && cat.child === child) ||
              (!child && cat.parent === parent)
            );
          } else {
            // 对象格式
            return (
              (filterCat.parent && cat.parent === filterCat.parent) ||
              (filterCat.child && cat.child === filterCat.child)
            );
          }
        })
      );
    });
  }

  // FIX M3: 按标签过滤
  if (tags && tags.length > 0) {
    filteredTemplates = filteredTemplates.filter((template) => {
      return tags.some((tag) => template.tags.includes(tag));
    });
  }

  // FIX M1: 如果搜索词包含在标签中
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTemplates = filteredTemplates.filter((template) => {
      const titleMatch = template.title?.toLowerCase().includes(searchLower);
      const descMatch = template.description?.toLowerCase().includes(searchLower);
      const tagMatch = template.tags.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );
      return titleMatch || descMatch || tagMatch;
    });
  }

  // Get total count for pagination (after filtering)
  const total = filteredTemplates.length;

  // Apply pagination to filtered results
  const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);

  return {
    templates: paginatedTemplates,
    total,
    page,
    limit,
  };
}

/**
 * Get template by ID
 */
export async function getTemplateDetail(
  userId: string,
  templateId: number
): Promise<SavedTemplate> {
  const template = await getTemplateById(db, templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  if (template.userId !== userId) {
    throw new Error('Access denied');
  }

  return template;
}

/**
 * Update template
 */
export async function updateTemplate(
  userId: string,
  templateId: number,
  input: UpdateTemplateInput
): Promise<SavedTemplate> {
  const template = await getTemplateDetail(userId, templateId);

  // Validate tags
  if (input.tags && input.tags.length > TEMPLATE_CONSTANTS.MAX_TAGS_PER_TEMPLATE) {
    throw new Error(
      `Maximum ${TEMPLATE_CONSTANTS.MAX_TAGS_PER_TEMPLATE} tags allowed per template`
    );
  }

  if (input.tags) {
    for (const tag of input.tags) {
      if (tag.length > TEMPLATE_CONSTANTS.MAX_TAG_LENGTH) {
        throw new Error(
          `Tag "${tag}" exceeds maximum length of ${TEMPLATE_CONSTANTS.MAX_TAG_LENGTH} characters`
        );
      }
    }
  }

  return await db.transaction(async (tx) => {
    // Update template basic info
    if (input.title !== undefined || input.description !== undefined) {
      await tx
        .update(templates)
        .set({
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          updatedAt: new Date(),
        })
        .where(eq(templates.id, templateId));
    }

    // Update tags
    if (input.tags !== undefined) {
      // Delete existing tags
      await tx
        .delete(templateTags)
        .where(eq(templateTags.templateId, templateId));

      // Add new tags
      if (input.tags.length > 0) {
        await tx.insert(templateTags).values(
          input.tags.map((tag) => ({
            templateId,
            tag,
          }))
        );
      }
    }

    // Update category
    if (input.category !== undefined) {
      // Delete existing categories
      await tx
        .delete(templateCategories)
        .where(eq(templateCategories.templateId, templateId));

      // Add new category
      if (input.category.parent || input.category.child) {
        await tx.insert(templateCategories).values({
          templateId,
          parentCategory: input.category.parent || null,
          childCategory: input.category.child || null,
        });
      }
    }

    return await getTemplateById(tx, templateId);
  });
}

/**
 * Delete template
 */
export async function deleteTemplate(userId: string, templateId: number): Promise<void> {
  const template = await getTemplateDetail(userId, templateId);

  await db.delete(templates).where(eq(templates.id, templateId));
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  userId: string,
  templateId: number
): Promise<SavedTemplate> {
  const template = await getTemplateDetail(userId, templateId);

  await db
    .update(templates)
    .set({ isFavorite: !template.isFavorite, updatedAt: new Date() })
    .where(eq(templates.id, templateId));

  return await getTemplateById(db, templateId);
}

/**
 * Get template generation history
 */
export async function getTemplateGenerations(
  userId: string,
  templateId: number
): Promise<TemplateGenerationHistory[]> {
  await getTemplateDetail(userId, templateId);

  const result = await db
    .select({
      id: generations.id,
      imageUrl: generations.imageUrl,
      thumbnailUrl: generations.thumbnailUrl,
      createdAt: generations.createdAt,
    })
    .from(templateGenerations)
    .innerJoin(generations, eq(templateGenerations.generationId, generations.id))
    .where(eq(templateGenerations.templateId, templateId))
    .orderBy(desc(generations.createdAt));

  return result;
}

/**
 * Regenerate image from template
 *
 * FIX H4: 实现基本功能，保存模版到 sessionStorage 供前端使用
 *
 * 注意：这是一个临时实现，完整的功能需要与生成服务集成 (Task 7)
 * 当前实现将模版数据保存到 sessionStorage，前端可以读取并跳转到生成页面
 */
export async function regenerateFromTemplate(
  userId: string,
  templateId: number
): Promise<{ generationId: number; templateData: any }> {
  const template = await getTemplateDetail(userId, templateId);

  // 临时实现：返回模版数据供前端使用
  // 在真实场景中，这里会：
  // 1. 从 templateSnapshot 提取风格参数
  // 2. 调用生成服务 API
  // 3. 创建 generation 记录
  // 4. 返回 generationId

  // 当前实现：返回模版快照数据，前端可以将此数据传递给生成页面
  return {
    generationId: 0, // 占位符，表示尚未创建真实的生成记录
    templateData: {
      templateId: template.id,
      title: template.title,
      description: template.description,
      analysisData: template.templateSnapshot.analysisData,
      modelId: template.templateSnapshot.modelId,
      confidenceScore: template.templateSnapshot.confidenceScore,
    },
  };
}

/**
 * Get template by ID (internal function)
 */
async function getTemplateById(
  tx: typeof db,
  templateId: number
): Promise<SavedTemplate> {
  const [template] = await tx
    .select()
    .from(templates)
    .where(eq(templates.id, templateId))
    .limit(1);

  if (!template) {
    throw new Error('Template not found');
  }

  const [tagList, categoryList] = await Promise.all([
    tx
      .select({ tag: templateTags.tag })
      .from(templateTags)
      .where(eq(templateTags.templateId, templateId)),
    tx
      .select({
        parent: templateCategories.parentCategory,
        child: templateCategories.childCategory,
      })
      .from(templateCategories)
      .where(eq(templateCategories.templateId, templateId)),
  ]);

  return {
    ...template,
    templateSnapshot: isValidTemplateSnapshot(template.templateSnapshot)
      ? template.templateSnapshot
      : {
          analysisData: {},
          confidenceScore: 0,
          createdAt: template.createdAt,
        },
    tags: tagList.map((t) => t.tag),
    categories: categoryList.map((c) => ({
      parent: c.parent,
      child: c.child,
    })),
  };
}

/**
 * Increment template usage count
 */
export async function incrementUsageCount(templateId: number): Promise<void> {
  await db
    .update(templates)
    .set({
      usageCount: sql`${templates.usageCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(templates.id, templateId));
}

/**
 * Link generation to template
 */
export async function linkGenerationToTemplate(
  templateId: number,
  generationId: number
): Promise<void> {
  await db.insert(templateGenerations).values({
    templateId,
    generationId,
  });
}
