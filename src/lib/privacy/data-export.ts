/**
 * 数据导出服务
 *
 * Story 4-3: 隐私合规功能
 * Epic 4: 内容安全与合规
 *
 * 导出用户的所有个人数据（GDPR/CCPA 合规）
 */

import { db } from '@/lib/db';
import { user, images, contentModerationLogs, creditTransactions, batchAnalysisResults } from '@/lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

/**
 * 导出数据类型
 */
export interface ExportData {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    subscriptionTier: string;
  };
  images: Array<{
    id: string;
    url: string;
    status: string;
    createdAt: string;
    expiresAt: string | null;
  }>;
  moderationLogs: Array<{
    id: number;
    contentType: string;
    action: string;
    reason: string | null;
    createdAt: string;
  }>;
  creditTransactions: Array<{
    id: number;
    type: string;
    amount: number;
    balanceAfter: number;
    reason: string;
    createdAt: string;
  }>;
  batchUploads: Array<{
    id: number;
    filename: string;
    status: string;
    createdAt: string;
  }>;
  exportMetadata: {
    exportedAt: string;
    version: string;
    dataCategories: string[];
  };
}

/**
 * 收集用户所有数据
 *
 * @param userId - 用户 ID
 * @returns 完整的用户数据
 */
export async function collectUserData(userId: string): Promise<ExportData> {
  console.log('[DataExport] Collecting user data:', userId);

  // 1. 获取用户基本信息
  const [userData] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      subscriptionTier: user.subscriptionTier,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw new Error('User not found');
  }

  // 2. 获取用户上传的图片
  const userImages = await db
    .select({
      id: images.id,
      url: images.filePath,
      status: images.uploadStatus,
      createdAt: images.createdAt,
      expiresAt: images.expiresAt,
    })
    .from(images)
    .where(eq(images.userId, userId));

  // 3. 获取内容审核日志
  const moderationLogs = await db
    .select({
      id: contentModerationLogs.id,
      contentType: contentModerationLogs.contentType,
      action: contentModerationLogs.action,
      reason: contentModerationLogs.reason,
      createdAt: contentModerationLogs.createdAt,
    })
    .from(contentModerationLogs)
    .where(eq(contentModerationLogs.userId, userId));

  // 4. 获取 Credit 交易记录
  const transactions = await db
    .select({
      id: creditTransactions.id,
      type: creditTransactions.type,
      amount: creditTransactions.amount,
      balanceAfter: creditTransactions.balanceAfter,
      reason: creditTransactions.reason,
      createdAt: creditTransactions.createdAt,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));

  // 5. 获取批量分析记录
  const uploads = await db
    .select({
      id: batchAnalysisResults.id,
      filename: batchAnalysisResults.mode,
      status: batchAnalysisResults.status,
      createdAt: batchAnalysisResults.createdAt,
    })
    .from(batchAnalysisResults)
    .where(eq(batchAnalysisResults.userId, userId));

  console.log('[DataExport] Data collected:', {
    images: userImages.length,
    logs: moderationLogs.length,
    transactions: transactions.length,
    uploads: uploads.length,
  });

  return {
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      createdAt: userData.createdAt.toISOString(),
      subscriptionTier: userData.subscriptionTier,
    },
    images: userImages.map(img => ({
      id: img.id,
      url: img.url,
      status: img.status,
      createdAt: img.createdAt.toISOString(),
      expiresAt: img.expiresAt?.toISOString() || null,
    })),
    moderationLogs: moderationLogs.map(log => ({
      id: log.id,
      contentType: log.contentType,
      action: log.action,
      reason: log.reason,
      createdAt: log.createdAt.toISOString(),
    })),
    creditTransactions: transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      reason: tx.reason,
      createdAt: tx.createdAt.toISOString(),
    })),
    batchUploads: uploads.map(upload => ({
      id: upload.id,
      filename: upload.filename,
      status: upload.status,
      createdAt: upload.createdAt.toISOString(),
    })),
    exportMetadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      dataCategories: [
        'user',
        'images',
        'moderationLogs',
        'creditTransactions',
        'batchUploads',
      ],
    },
  };
}

/**
 * 生成 JSON 导出文件
 *
 * @param userId - 用户 ID
 * @returns JSON 字符串
 */
export async function exportUserDataAsJson(userId: string): Promise<string> {
  const data = await collectUserData(userId);
  return JSON.stringify(data, null, 2);
}

/**
 * 估算导出数据大小（KB）
 *
 * @param userId - 用户 ID
 * @returns 估算大小
 */
export async function estimateExportSize(userId: string): Promise<number> {
  const data = await collectUserData(userId);
  const json = JSON.stringify(data);
  return Math.ceil(json.length / 1024);
}
