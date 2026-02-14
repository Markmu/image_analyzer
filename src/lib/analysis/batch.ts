/**
 * 批量分析服务
 *
 * 支持串行和并行两种分析模式
 * AC-2: 串行/并行分析模式
 * AC-8: 错误处理和重试
 */

import { getDb } from '@/lib/db';
import {
  batchAnalysisResults,
  batchAnalysisImages,
  analysisResults,
  images,
  AnalysisData,
  contentModerationLogs,
  type StyleFeature,
} from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { analyzeImageStyle } from '@/lib/replicate/vision';
import { validateImageComplexity } from '@/lib/replicate/vision';

// 最大并发数
const MAX_CONCURRENT = 3;

/**
 * 批量分析选项
 */
export interface BatchAnalysisOptions {
  userId: string;
  imageIds: string[];
  mode: 'serial' | 'parallel';
  onProgress?: (progress: BatchProgress) => void;
}

/**
 * 批量分析进度
 */
export interface BatchProgress {
  currentIndex: number;
  total: number;
  completed: number;
  failed: number;
  currentImageId?: string;
}

/**
 * 批量分析结果
 */
export interface BatchAnalysisResult {
  batchId: number;
  status: 'pending' | 'processing' | 'completed' | 'partial' | 'failed';
  progress: BatchProgress;
  results: ImageAnalysisResult[];
  errors: AnalysisError[];
  commonFeatures?: ComprehensiveAnalysis;
}

/**
 * 单张图片分析结果
 */
export interface ImageAnalysisResult {
  imageId: string;
  status: 'completed' | 'failed' | 'skipped';
  analysisData?: AnalysisData;
  error?: string;
  confidenceScore?: number;
}

/**
 * 分析错误
 */
export interface AnalysisError {
  imageId: string;
  error: string;
  retryable: boolean;
}

/**
 * 综合分析结果（共同特征和独特特征）
 */
export interface ComprehensiveAnalysis {
  commonFeatures: {
    dimension: string;
    features: StyleFeature[];
    confidence: number;
  }[];
  uniqueFeatures: {
    dimension: string;
    features: { feature: StyleFeature; sourceImages: string[] }[];
  }[];
  overallConfidence: number;
}

/**
 * 创建批量分析记录
 */
export async function createBatchAnalysis(
  userId: string,
  imageIds: string[],
  mode: 'serial' | 'parallel'
): Promise<number> {
  const db = getDb();

  // 创建批量分析记录
  const [batch] = await db
    .insert(batchAnalysisResults)
    .values({
      userId,
      mode,
      totalImages: imageIds.length,
      status: 'pending',
    })
    .returning();

  // 创建图片关联记录
  const imageOrders = imageIds.map((imageId, index) => ({
    batchId: batch.id,
    imageId,
    imageOrder: index,
    status: 'pending' as const,
  }));

  await db.insert(batchAnalysisImages).values(imageOrders);

  return batch.id;
}

/**
 * 执行批量分析
 */
export async function executeBatchAnalysis(
  batchId: number,
  options: BatchAnalysisOptions
): Promise<BatchAnalysisResult> {
  const db = getDb();

  // 获取批量分析记录
  const [batch] = await db
    .select()
    .from(batchAnalysisResults)
    .where(eq(batchAnalysisResults.id, batchId))
    .limit(1);

  if (!batch) {
    throw new Error('Batch not found');
  }

  // 获取图片列表
  const batchImages = await db
    .select()
    .from(batchAnalysisImages)
    .where(eq(batchAnalysisImages.batchId, batchId))
    .orderBy(batchAnalysisImages.imageOrder);

  // 更新状态为 processing
  await db
    .update(batchAnalysisResults)
    .set({ status: 'processing' })
    .where(eq(batchAnalysisResults.id, batchId));

  // 根据模式执行分析
  const results =
    options.mode === 'serial'
      ? await analyzeSerial(batchImages, options)
      : await analyzeParallel(batchImages, options);

  // 更新批量分析状态
  const completedCount = results.filter((r) => r.status === 'completed').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;

  let finalStatus: 'completed' | 'partial' | 'failed';
  if (completedCount === batch.totalImages) {
    finalStatus = 'completed';
  } else if (completedCount > 0) {
    finalStatus = 'partial';
  } else {
    finalStatus = 'failed';
  }

  await db
    .update(batchAnalysisResults)
    .set({
      status: finalStatus,
      completedImages: completedCount,
      failedImages: failedCount,
      skippedImages: skippedCount,
      completedAt: new Date(),
    })
    .where(eq(batchAnalysisResults.id, batchId));

  // 提取共同特征
  const completedResults = results.filter(
    (r): r is ImageAnalysisResult & { analysisData: AnalysisData } =>
      r.status === 'completed' && r.analysisData !== undefined
  );

  let commonFeatures: ComprehensiveAnalysis | undefined;
  if (completedResults.length >= 2) {
    const analysisDataArray = completedResults.map((r) => r.analysisData as AnalysisData);
    const { extractCommonFeatures } = await import('./feature-extraction');
    commonFeatures = extractCommonFeatures(analysisDataArray);
  }

  return {
    batchId,
    status: finalStatus,
    progress: {
      currentIndex: batch.totalImages,
      total: batch.totalImages,
      completed: completedCount,
      failed: failedCount,
    },
    results,
    errors: results
      .filter((r) => r.status === 'failed')
      .map((r) => ({
        imageId: r.imageId,
        error: r.error || 'Unknown error',
        retryable: true,
      })),
    commonFeatures,
  };
}

/**
 * 串行分析模式
 */
async function analyzeSerial(
  batchImages: typeof batchAnalysisImages.$inferSelect[],
  options: BatchAnalysisOptions
): Promise<ImageAnalysisResult[]> {
  const results: ImageAnalysisResult[] = [];

  for (let i = 0; i < batchImages.length; i++) {
    const batchImage = batchImages[i];

    // 报告进度
    options.onProgress?.({
      currentIndex: i + 1,
      total: batchImages.length,
      completed: results.filter((r) => r.status === 'completed').length,
      failed: results.filter((r) => r.status === 'failed').length,
      currentImageId: batchImage.imageId,
    });

    const result = await analyzeSingleImage(batchImage.batchId, batchImage.imageId, options.userId);
    results.push(result);
  }

  return results;
}

/**
 * 并行分析模式（最大并发 3）
 */
async function analyzeParallel(
  batchImages: typeof batchAnalysisImages.$inferSelect[],
  options: BatchAnalysisOptions
): Promise<ImageAnalysisResult[]> {
  const results: ImageAnalysisResult[] = [];
  let currentIndex = 0;

  // 分批处理，每批最多 MAX_CONCURRENT 个
  while (currentIndex < batchImages.length) {
    const batch = batchImages.slice(currentIndex, currentIndex + MAX_CONCURRENT);

    const batchPromises = batch.map(async (batchImage) => {
      // 报告进度
      options.onProgress?.({
        currentIndex: currentIndex + 1,
        total: batchImages.length,
        completed: results.filter((r) => r.status === 'completed').length,
        failed: results.filter((r) => r.status === 'failed').length,
        currentImageId: batchImage.imageId,
      });

      return analyzeSingleImage(batchImage.batchId, batchImage.imageId, options.userId);
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    currentIndex += batch.length;
  }

  return results;
}

/**
 * 分析单张图片
 */
async function analyzeSingleImage(
  batchId: number,
  imageId: string,
  userId: string
): Promise<ImageAnalysisResult> {
  const db = getDb();

  try {
    // 更新状态为 processing
    await db
      .update(batchAnalysisImages)
      .set({ status: 'processing' })
      .where(
        and(
          eq(batchAnalysisImages.batchId, batchId),
          eq(batchAnalysisImages.imageId, imageId)
        )
      );

    // 获取图片信息
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, imageId))
      .limit(1);

    if (!image) {
      throw new Error('Image not found');
    }

    // 内容安全检查
    try {
      const complexityCheck = await validateImageComplexity(image.filePath);

      if (complexityCheck.complexity === 'high' && complexityCheck.confidence > 0.8) {
        // 内容安全检查不通过，跳过分析
        await db
          .update(batchAnalysisImages)
          .set({
            status: 'skipped',
            errorMessage: 'Content safety check failed',
            completedAt: new Date(),
          })
          .where(
            and(
              eq(batchAnalysisImages.batchId, batchId),
              eq(batchAnalysisImages.imageId, imageId)
            )
          );

        // 记录审核日志
        await db.insert(contentModerationLogs).values({
          userId,
          imageId,
          action: 'rejected',
          reason: 'inappropriate_content',
          confidence: complexityCheck.confidence,
          batchId,
        });

        return {
          imageId,
          status: 'skipped',
          error: 'Content safety check failed',
        };
      }
    } catch (error) {
      console.error('Content safety check error:', error);
      // 如果安全检查失败，允许继续
    }

    // 执行风格分析
    const analysisData = await analyzeImageStyle(image.filePath);

    // 保存分析结果
    const [analysisResult] = await db
      .insert(analysisResults)
      .values({
        userId,
        imageId,
        analysisData: JSON.parse(JSON.stringify(analysisData)),
        confidenceScore: analysisData.overallConfidence,
      })
      .returning();

    // 更新图片状态
    await db
      .update(batchAnalysisImages)
      .set({
        status: 'completed',
        analysisResultId: analysisResult.id,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(batchAnalysisImages.batchId, batchId),
          eq(batchAnalysisImages.imageId, imageId)
        )
      );

    return {
      imageId,
      status: 'completed',
      analysisData,
      confidenceScore: analysisData.overallConfidence,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';

    // 更新状态为 failed
    await db
      .update(batchAnalysisImages)
      .set({
        status: 'failed',
        errorMessage,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(batchAnalysisImages.batchId, batchId),
          eq(batchAnalysisImages.imageId, imageId)
        )
      );

    return {
      imageId,
      status: 'failed',
      error: errorMessage,
    };
  }
}

/**
 * 获取批量分析状态
 */
export async function getBatchAnalysisStatus(
  batchId: number,
  userId: string
): Promise<BatchAnalysisResult> {
  const db = getDb();

  // 获取批量分析记录
  const [batch] = await db
    .select()
    .from(batchAnalysisResults)
    .where(and(eq(batchAnalysisResults.id, batchId), eq(batchAnalysisResults.userId, userId)))
    .limit(1);

  if (!batch) {
    throw new Error('Batch not found');
  }

  // 获取图片分析结果
  const batchImages = await db
    .select()
    .from(batchAnalysisImages)
    .where(eq(batchAnalysisImages.batchId, batchId))
    .orderBy(batchAnalysisImages.imageOrder);

  // 收集所有已完成的 analysisResultId，使用 IN 查询批量获取
  const completedImageIds = batchImages
    .filter((img) => img.status === 'completed' && img.analysisResultId)
    .map((img) => img.analysisResultId as number);

  let analysisResultsMap: Map<number, typeof analysisResults.$inferSelect> = new Map();

  if (completedImageIds.length > 0) {
    const analysisResultsList = await db
      .select()
      .from(analysisResults)
      .where(inArray(analysisResults.id, completedImageIds));

    for (const result of analysisResultsList) {
      analysisResultsMap.set(result.id, result);
    }
  }

  // 构建结果列表
  const results: ImageAnalysisResult[] = [];
  const errors: AnalysisError[] = [];

  for (const batchImage of batchImages) {
    if (batchImage.status === 'completed' && batchImage.analysisResultId) {
      const analysisResult = analysisResultsMap.get(batchImage.analysisResultId);

      if (analysisResult) {
        results.push({
          imageId: batchImage.imageId,
          status: 'completed',
          analysisData: analysisResult.analysisData as AnalysisData,
          confidenceScore: analysisResult.confidenceScore,
        });
      }
    } else if (batchImage.status === 'failed') {
      results.push({
        imageId: batchImage.imageId,
        status: 'failed',
        error: batchImage.errorMessage || 'Unknown error',
      });
      errors.push({
        imageId: batchImage.imageId,
        error: batchImage.errorMessage || 'Unknown error',
        retryable: true,
      });
    } else if (batchImage.status === 'skipped') {
      results.push({
        imageId: batchImage.imageId,
        status: 'skipped',
        error: batchImage.errorMessage || 'Content safety check failed',
      });
    }
  }

  // 提取共同特征
  let commonFeatures: ComprehensiveAnalysis | undefined;
  const completedResults = results.filter(
    (r): r is ImageAnalysisResult & { analysisData: AnalysisData } =>
      r.status === 'completed' && r.analysisData !== undefined
  );

  if (completedResults.length >= 2) {
    const { extractCommonFeatures } = await import('./feature-extraction');
    const analysisDataArray = completedResults.map((r) => r.analysisData as AnalysisData);
    commonFeatures = extractCommonFeatures(analysisDataArray);
  }

  return {
    batchId: batch.id,
    status: batch.status as BatchAnalysisResult['status'],
    progress: {
      currentIndex: batch.completedImages + batch.failedImages + batch.skippedImages,
      total: batch.totalImages,
      completed: batch.completedImages,
      failed: batch.failedImages,
    },
    results,
    errors,
    commonFeatures,
  };
}

/**
 * 重试失败的分析
 */
export async function retryFailedAnalysis(
  batchId: number,
  failedImageIds: string[],
  userId: string
): Promise<void> {
  const db = getDb();

  // 获取批量分析记录
  const [batch] = await db
    .select()
    .from(batchAnalysisResults)
    .where(and(eq(batchAnalysisResults.id, batchId), eq(batchAnalysisResults.userId, userId)))
    .limit(1);

  if (!batch) {
    throw new Error('Batch not found');
  }

  // 批量更新失败图片状态为 pending
  await db
    .update(batchAnalysisImages)
    .set({ status: 'pending', errorMessage: null })
    .where(
      and(
        eq(batchAnalysisImages.batchId, batchId),
        inArray(batchAnalysisImages.imageId, failedImageIds)
      )
    );

  // 重新执行分析
  await executeBatchAnalysis(batchId, {
    userId,
    imageIds: failedImageIds,
    mode: batch.mode as 'serial' | 'parallel',
  });
}
