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
  images,
} from '@/lib/db/schema';
import { generateImageAsync } from '@/lib/replicate/async';
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

function resolveImageUrl(filePath: string | null | undefined): string | undefined {
  if (!filePath) return undefined;

  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  if (publicDomain) {
    return `https://${publicDomain}/${filePath}`;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME;
  if (accountId && bucketName) {
    return `https://${accountId}.r2.dev/${bucketName}/${filePath}`;
  }

  return filePath;
}

function normalizeTemplateSnapshot(
  snapshot: unknown,
  fallbackCreatedAt: Date
): SavedTemplate['templateSnapshot'] {
  return isValidTemplateSnapshot(snapshot)
    ? snapshot
    : {
        analysisData: {},
        confidenceScore: 0,
        createdAt: fallbackCreatedAt,
      };
}

function withPreviewImage(
  snapshot: SavedTemplate['templateSnapshot'],
  previewImageUrl?: string
): SavedTemplate['templateSnapshot'] {
  if (!previewImageUrl) {
    return snapshot;
  }

  const analysisData =
    snapshot.analysisData && typeof snapshot.analysisData === 'object' && !Array.isArray(snapshot.analysisData)
      ? (snapshot.analysisData as Record<string, unknown>)
      : {};

  return {
    ...snapshot,
    analysisData: {
      ...analysisData,
      imageUrl: previewImageUrl,
    },
  };
}

async function getUploadedImageUrlByAnalysisResultId(
  tx: typeof db,
  analysisResultId: number
): Promise<string | undefined> {
  const [record] = await tx
    .select({
      filePath: images.filePath,
    })
    .from(analysisResults)
    .innerJoin(images, eq(analysisResults.imageId, images.id))
    .where(eq(analysisResults.id, analysisResultId))
    .limit(1);

  return resolveImageUrl(record?.filePath);
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
 * FIXES M1, M2, M3, H3: 实现完整的搜索、标签和分类过滤功能
 * FIX H3: 将过滤逻辑从内存移到数据库查询中，确保先过滤再分页
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

  // 验证 page 参数
  const validatedPage = Math.max(1, page);
  const offset = (validatedPage - 1) * limit;

  // Build base conditions
  const conditions = [eq(templates.userId, userId)];

  // Favorite filter
  if (isFavorite !== undefined) {
    conditions.push(eq(templates.isFavorite, isFavorite));
  }

  // Search filter - FIX M1: 搜索标题和描述
  if (search) {
    conditions.push(
      or(
        like(templates.title, `%${search}%`),
        like(templates.description, `%${search}%`)
      )!
    );
  }

  // Build query with joins for tags and categories
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
    .from(templates);

  // FIX M3: 标签过滤 - 使用子查询确保在数据库层面过滤
  if (tags && tags.length > 0) {
    // 获取包含指定标签的模版 ID
    const templatesWithTags = await db
      .selectDistinct({ templateId: templateTags.templateId })
      .from(templateTags)
      .where(inArray(templateTags.tag, tags));

    if (templatesWithTags.length === 0) {
      // 没有匹配的模版，直接返回空结果
      return {
        templates: [],
        total: 0,
        page: validatedPage,
        limit,
      };
    }

    const templateIds = templatesWithTags.map((t) => t.templateId);
    conditions.push(inArray(templates.id, templateIds));
  }

  // FIX M2: 分类过滤 - 使用子查询确保在数据库层面过滤
  if (categories && categories.length > 0) {
    const categoryConditions = [];

    for (const cat of categories) {
      if (typeof cat === 'string') {
        const parts = cat.split('/');
        const parent = parts[0];
        const child = parts[1];

        if (child) {
          categoryConditions.push(
            and(
              eq(templateCategories.parentCategory, parent),
              eq(templateCategories.childCategory, child)
            )
          );
        } else {
          categoryConditions.push(eq(templateCategories.parentCategory, parent));
        }
      } else if (cat.parent || cat.child) {
        if (cat.parent && cat.child) {
          categoryConditions.push(
            and(
              eq(templateCategories.parentCategory, cat.parent),
              eq(templateCategories.childCategory, cat.child)
            )
          );
        } else if (cat.parent) {
          categoryConditions.push(eq(templateCategories.parentCategory, cat.parent));
        } else if (cat.child) {
          categoryConditions.push(eq(templateCategories.childCategory, cat.child));
        }
      }
    }

    if (categoryConditions.length > 0) {
      // 获取匹配分类的模版 ID
      const templatesWithCategories = await db
        .selectDistinct({ templateId: templateCategories.templateId })
        .from(templateCategories)
        .where(or(...categoryConditions)!);

      if (templatesWithCategories.length === 0) {
        // 没有匹配的模版，直接返回空结果
        return {
          templates: [],
          total: 0,
          page: validatedPage,
          limit,
        };
      }

      const templateIds = templatesWithCategories.map((t) => t.templateId);
      conditions.push(inArray(templates.id, templateIds));
    }
  }

  // Apply all conditions
  query = query.where(and(...conditions));

  // Add sorting
  const orderByColumn =
    sortBy === 'createdAt'
      ? templates.createdAt
      : sortBy === 'usageCount'
      ? templates.usageCount
      : templates.title;
  query = query.orderBy(sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn));

  // Get total count BEFORE pagination (for accurate total)
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(templates)
    .where(and(...conditions));

  // Get paginated results AFTER filtering
  const result = await query.limit(limit).offset(offset);

  // Fetch tags and categories for each template (仅用于展示，不影响过滤)
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

      const previewImageUrl = await getUploadedImageUrlByAnalysisResultId(db, template.analysisResultId);
      const normalizedSnapshot = normalizeTemplateSnapshot(template.templateSnapshot, template.createdAt);

      return {
        ...template,
        templateSnapshot: withPreviewImage(normalizedSnapshot, previewImageUrl),
        tags: tagList.map((t) => t.tag),
        categories: categoryList.map((c) => ({
          parent: c.parent,
          child: c.child,
        })),
      };
    })
  );

  return {
    templates: templatesWithRelations,
    total,
    page: validatedPage,
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
 * FIX H4 (Task #8): 集成真实的图片生成服务
 *
 * 修复说明:
 * - 调用 generateImageAsync 真实生成图片
 * - 传递 templateId 到生成服务
 * - Webhook 回调会自动调用 linkGenerationToTemplate 和 incrementUsageCount
 *
 * @param userId - User ID
 * @param templateId - Template ID
 * @returns Generation result with prediction ID
 */
export async function regenerateFromTemplate(
  userId: string,
  templateId: number
): Promise<{ generationId: number; predictionId: string }> {
  const template = await getTemplateDetail(userId, templateId);

  // 从模版快照中提取生成参数
  const templateSnapshot = template.templateSnapshot;
  const analysisData = templateSnapshot.analysisData as Record<string, unknown> | null;

  // 构建生成提示词
  // 优先使用 description，如果不存在则从 analysisData 提取
  let prompt = template.description || '';
  if (analysisData && typeof analysisData === 'object') {
    // 尝试从分析结果中提取风格描述
    const styleDescription = (
      analysisData.artisticStyle?.description ||
      analysisData.styleDescription ||
      analysisData.description ||
      ''
    );

    if (styleDescription && typeof styleDescription === 'string') {
      prompt = styleDescription;
    }
  }

  // 如果没有有效的提示词，使用模版标题
  if (!prompt || prompt.trim().length === 0) {
    prompt = template.title;
  }

  // 调用异步图片生成服务，传递 templateId
  const result = await generateImageAsync({
    userId,
    prompt: prompt.trim(),
    modelId: templateSnapshot.modelId || process.env.REPLICATE_IMAGE_MODEL_ID || 'default-image-model',
    width: 1024,
    height: 1024,
    numOutputs: 1,
    creditCost: 5,
    templateId, // 传递 templateId，用于 webhook 回调时更新统计
  });

  console.log(`Regeneration started for template ${templateId}, prediction ${result.predictionId}`);

  // 注意：generationId 会在 webhook 回调时创建
  // 当前返回 predictionId 供前端跟踪状态
  return {
    generationId: 0, // 占位符，真实 ID 在 webhook 回调后创建
    predictionId: result.predictionId,
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

  const previewImageUrl = await getUploadedImageUrlByAnalysisResultId(tx, template.analysisResultId);
  const normalizedSnapshot = normalizeTemplateSnapshot(template.templateSnapshot, template.createdAt);

  return {
    ...template,
    templateSnapshot: withPreviewImage(normalizedSnapshot, previewImageUrl),
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
