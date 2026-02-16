/**
 * 审核日志记录服务
 *
 * Story 4-1: 内容审核功能
 * Epic 4: 内容安全与合规
 */

import { db } from '@/lib/db';
import { contentModerationLogs } from '@/lib/db/schema';
import type { ModerationResult } from './types';

/**
 * 记录审核日志
 */
export async function logModeration(params: {
  userId: string;
  imageId?: string;
  contentType: 'image' | 'text';
  result: ModerationResult;
  batchId?: number;
}): Promise<number> {
  const { userId, imageId, contentType, result, batchId } = params;

  const [log] = await db
    .insert(contentModerationLogs)
    .values({
      userId,
      imageId: imageId || null,
      contentType,
      moderationResult: result,
      action: result.action,
      reason: result.reason || null,
      batchId: batchId || null,
      createdAt: new Date(),
    })
    .returning({ id: contentModerationLogs.id });

  console.log('[ModerationLog] Created log:', {
    id: log.id,
    userId,
    imageId,
    action: result.action,
  });

  return log.id;
}

/**
 * 获取用户审核历史
 */
export async function getUserModerationHistory(
  userId: string,
  limit: number = 50
) {
  const logs = await db.query.contentModerationLogs.findMany({
    where: (logs, { eq }) => eq(logs.userId, userId),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
  });

  return logs;
}

/**
 * 获取图片审核记录
 */
export async function getImageModerationLog(imageId: string) {
  const log = await db.query.contentModerationLogs.findFirst({
    where: (logs, { eq }) => eq(logs.imageId, imageId),
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
  });

  return log;
}
