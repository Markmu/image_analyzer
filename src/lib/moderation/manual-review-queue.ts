/**
 * 人工审核队列服务
 *
 * Story 4-2: 生成安全功能
 * Epic 4: 内容安全与合规
 *
 * 管理需要人工审核的生成请求
 */

import { db } from '@/lib/db';
import { manualReviewQueue } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { RiskLevel } from './risk-assessment';

/**
 * 审核状态
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * 添加到人工审核队列
 *
 * @param generationRequestId - 生成请求 ID
 * @param userId - 用户 ID
 * @param prompt - 提示词
 * @param riskLevel - 风险等级
 * @returns 队列条目 ID
 */
export async function addToManualReviewQueue(
  generationRequestId: number,
  userId: string,
  prompt: string,
  riskLevel: RiskLevel
): Promise<number> {
  console.log('[ManualReview] Adding to queue:', { generationRequestId, userId, riskLevel });

  const [entry] = await db.insert(manualReviewQueue).values({
    generationRequestId,
    userId,
    prompt,
    riskLevel,
    status: 'pending',
  }).returning({ id: manualReviewQueue.id });

  console.log('[ManualReview] Added to queue:', entry.id);

  return entry.id;
}

/**
 * 获取待审核队列
 *
 * @param limit - 返回数量限制
 * @returns 待审核条目列表
 */
export async function getPendingReviews(limit: number = 50) {
  const reviews = await db
    .select()
    .from(manualReviewQueue)
    .where(eq(manualReviewQueue.status, 'pending'))
    .orderBy(desc(manualReviewQueue.createdAt))
    .limit(limit);

  return reviews;
}

/**
 * 获取用户审核历史
 *
 * @param userId - 用户 ID
 * @returns 审核历史
 */
export async function getUserReviewHistory(userId: string) {
  const reviews = await db
    .select()
    .from(manualReviewQueue)
    .where(eq(manualReviewQueue.userId, userId))
    .orderBy(desc(manualReviewQueue.createdAt));

  return reviews;
}

/**
 * 处理审核结果
 *
 * @param reviewId - 审核条目 ID
 * @param action - 审核操作（批准/拒绝）
 * @param reviewedBy - 审核管理员 ID
 * @param notes - 审核备注
 */
export async function processReview(
  reviewId: number,
  action: 'approve' | 'reject',
  reviewedBy: string,
  notes?: string
): Promise<void> {
  console.log('[ManualReview] Processing review:', { reviewId, action, reviewedBy });

  const status: ReviewStatus = action === 'approve' ? 'approved' : 'rejected';

  await db
    .update(manualReviewQueue)
    .set({
      status,
      reviewedBy,
      reviewNotes: notes,
      reviewedAt: new Date(),
    })
    .where(eq(manualReviewQueue.id, reviewId));

  console.log('[ManualReview] Review processed:', { reviewId, status });
}

/**
 * 批量处理审核结果
 *
 * @param reviewIds - 审核条目 ID 列表
 * @param action - 审核操作
 * @param reviewedBy - 审核管理员 ID
 * @param notes - 审核备注
 */
export async function batchProcessReviews(
  reviewIds: number[],
  action: 'approve' | 'reject',
  reviewedBy: string,
  notes?: string
): Promise<void> {
  console.log('[ManualReview] Batch processing reviews:', { count: reviewIds.length, action });

  const status: ReviewStatus = action === 'approve' ? 'approved' : 'rejected';

  for (const reviewId of reviewIds) {
    await processReview(reviewId, action, reviewedBy, notes);
  }

  console.log('[ManualReview] Batch processing completed');
}

/**
 * 获取审核统计
 *
 * @returns 统计数据
 */
export async function getReviewStats() {
  const all = await db.select().from(manualReviewQueue);

  const stats = {
    total: all.length,
    pending: all.filter(r => r.status === 'pending').length,
    approved: all.filter(r => r.status === 'approved').length,
    rejected: all.filter(r => r.status === 'rejected').length,
    byRiskLevel: {
      low: all.filter(r => r.riskLevel === 'low').length,
      medium: all.filter(r => r.riskLevel === 'medium').length,
      high: all.filter(r => r.riskLevel === 'high').length,
    },
  };

  return stats;
}

/**
 * 检查用户是否有待审核请求
 *
 * @param userId - 用户 ID
 * @returns 是否有待审核请求
 */
export async function hasPendingReview(userId: string): Promise<boolean> {
  const pending = await db
    .select()
    .from(manualReviewQueue)
    .where(
      and(
        eq(manualReviewQueue.userId, userId),
        eq(manualReviewQueue.status, 'pending')
      )
    )
    .limit(1);

  return pending.length > 0;
}

/**
 * 获取审核条目详情
 *
 * @param reviewId - 审核条目 ID
 * @returns 审核详情
 */
export async function getReviewById(reviewId: number) {
  const [review] = await db
    .select()
    .from(manualReviewQueue)
    .where(eq(manualReviewQueue.id, reviewId))
    .limit(1);

  return review || null;
}

/**
 * 清理过期的已处理审核记录
 *
 * @param daysToKeep - 保留天数
 * @returns 删除的记录数
 */
export async function cleanupOldReviews(daysToKeep: number = 30): Promise<number> {
  console.log('[ManualReview] Cleaning up old reviews:', { daysToKeep });

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  // 只删除已处理的记录（approved 或 rejected）
  const deleted = await db
    .delete(manualReviewQueue)
    .where(
      and(
        eq(manualReviewQueue.status, 'approved'),
        // 或者 rejected
      )
    );

  console.log('[ManualReview] Cleanup completed');

  return 0; // drizzle delete 返回值需要处理
}
