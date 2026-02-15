/**
 * Analysis Retry Logic
 *
 * Epic 3 - Story 3-5: Confidence Scoring
 * Handles retry functionality for low confidence analyses
 */

import { getDb } from '@/lib/db';
import { analysisResults, user, confidenceLogs, batchAnalysisResults, images } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { analyzeImageWithModel } from '@/lib/replicate/vision';
import { recordModelUsage } from '@/lib/analysis/models';
import {
  extractConfidenceFromAnalysisData,
  generateConfidenceWarning,
  type ConfidenceScores,
} from './confidence';

/**
 * 重试防抖时间（毫秒）
 */
const RETRY_DEBOUNCE_MS = 3000; // 3秒内只能重试一次

/**
 * 重试分析结果
 */
export interface RetryAnalysisResult {
  newAnalysisId: number;
  isIdempotent: boolean;
  confidenceScores: ConfidenceScores;
  message: string;
}

/**
 * 检查是否在防抖时间内重复请求
 */
async function checkRecentRetry(originalAnalysisId: number): Promise<boolean> {
  const db = getDb();

  const recentRetry = await db
    .query.confidenceLogs.findFirst({
      where: and(
        eq(confidenceLogs.analysisId, originalAnalysisId),
        gte(confidenceLogs.createdAt, new Date(Date.now() - RETRY_DEBOUNCE_MS))
      ),
    });

  return !!recentRetry;
}

/**
 * 记录置信度日志
 */
async function logConfidence(
  analysisId: number,
  confidenceScores: ConfidenceScores,
  isLowConfidence: boolean,
  triggeredWarning: boolean,
  modelUsageStatId?: number
): Promise<void> {
  const db = getDb();

  await db.insert(confidenceLogs).values({
    analysisId,
    modelUsageStatId: modelUsageStatId || null,
    confidenceScores: JSON.parse(JSON.stringify(confidenceScores)),
    isLowConfidence,
    triggeredWarning,
  });
}

/**
 * 重新分析图片（不扣除额外 credit）
 */
export async function retryAnalysis(
  originalAnalysisId: number,
  userId: string
): Promise<RetryAnalysisResult> {
  const db = getDb();

  // 1. 检查防抖
  const isRecent = await checkRecentRetry(originalAnalysisId);
  if (isRecent) {
    // 返回现有结果，不创建新记录
    const original = await db
      .query.analysisResults.findFirst({
        where: eq(analysisResults.id, originalAnalysisId),
      });

    if (!original) {
      throw new Error('原始分析记录不存在');
    }

    const scores = original.confidenceScores as ConfidenceScores;
    return {
      newAnalysisId: originalAnalysisId,
      isIdempotent: true,
      confidenceScores: scores,
      message: '请求过快，返回现有分析结果',
    };
  }

  // 2. 获取原始分析记录
  const originalAnalysis = await db
    .query.analysisResults.findFirst({
      where: and(
        eq(analysisResults.id, originalAnalysisId),
        eq(analysisResults.userId, userId)
      ),
    });

  if (!originalAnalysis) {
    throw new Error('原始分析记录不存在或无权访问');
  }

  // 3. 获取图片信息
  const image = await db.query.images.findFirst({
    where: eq(images.id, originalAnalysis.imageId),
  });

  if (!image) {
    throw new Error('图片不存在');
  }

  // 4. 执行新的分析（使用相同模型）
  const modelId = originalAnalysis.modelId || 'qwen3-vl';
  const analysisData = await analyzeImageWithModel(image.filePath, modelId);

  // 5. 提取置信度
  const confidenceScores = extractConfidenceFromAnalysisData(analysisData);
  const warning = generateConfidenceWarning(confidenceScores);

  // 6. 保存新分析结果（不扣除 credit）
  const [newAnalysis] = await db
    .insert(analysisResults)
    .values({
      userId,
      imageId: originalAnalysis.imageId,
      analysisData: JSON.parse(JSON.stringify(analysisData)),
      confidenceScore: analysisData.overallConfidence,
      modelId,
      confidenceScores: JSON.parse(JSON.stringify(confidenceScores)),
      retryCount: (originalAnalysis.retryCount || 0) + 1,
    })
    .returning();

  // 7. 记录置信度日志
  await logConfidence(
    newAnalysis.id,
    confidenceScores,
    confidenceScores.overall < 70,
    warning !== null
  );

  // 8. 记录模型使用统计（重试不计入失败）
  await recordModelUsage(modelId, userId, true, analysisData.analysisDuration);

  return {
    newAnalysisId: newAnalysis.id,
    isIdempotent: false,
    confidenceScores,
    message: '重新分析完成，不扣除 credit',
  };
}

/**
 * 批量重试低置信度分析
 */
export async function batchRetryLowConfidence(
  analysisIds: number[],
  userId: string
): Promise<{ success: number; failed: number; results: RetryAnalysisResult[] }> {
  const results: RetryAnalysisResult[] = [];
  let success = 0;
  let failed = 0;

  for (const analysisId of analysisIds) {
    try {
      const result = await retryAnalysis(analysisId, userId);
      results.push(result);
      success++;
    } catch (error) {
      console.error(`重试分析 ${analysisId} 失败:`, error);
      failed++;
    }
  }

  return { success, failed, results };
}
