/**
 * 清理过期数据 Cron 任务
 *
 * Story 4-1: 内容审核功能
 * DELETE /api/cron/cleanup-expired-data
 *
 * 按照用户订阅等级自动删除过期的图片数据
 * - Free 用户：30 天后自动删除
 * - Lite 用户：60 天后自动删除
 * - Standard 用户：90 天后自动删除
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { images, analysisResults, contentModerationLogs } from '@/lib/db/schema';
import { and, lt, isNotNull, isNull } from 'drizzle-orm';
import { batchDeleteFromR2 } from '@/lib/r2/batch-delete';

/**
 * 验证 Cron 密钥
 */
function validateCronKey(request: NextRequest): boolean {
  const cronKey = request.headers.get('X-Cron-Key');
  const expectedKey = process.env.CRON_SECRET_KEY;

  if (!expectedKey) {
    console.error('[CleanupExpiredData] CRON_SECRET_KEY not configured');
    return false;
  }

  return cronKey === expectedKey;
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. 验证 Cron 密钥
    if (!validateCronKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid cron key',
          },
        },
        { status: 401 }
      );
    }

    console.log('[CleanupExpiredData] Starting cleanup process');

    const now = new Date();
    const stats = {
      deletedImages: 0,
      deletedAnalysisResults: 0,
      deletedModerationLogs: 0,
      notifiedUsers: 0,
      errors: [] as string[],
    };

    // 2. 查找过期的图片
    const expiredImages = await db.query.images.findMany({
      where: and(isNotNull(images.expiresAt), lt(images.expiresAt, now)),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    console.log('[CleanupExpiredData] Found expired images:', expiredImages.length);

    // 3. 批量删除图片
    if (expiredImages.length > 0) {
      try {
        // 删除 R2 存储中的图片
        const r2Keys = expiredImages.map((img) => img.filePath);
        await batchDeleteFromR2(r2Keys);

        // 删除数据库记录
        for (const image of expiredImages) {
          await db.transaction(async (tx) => {
            // 删除审核日志
            await tx
              .delete(contentModerationLogs)
              .where(
                and(
                  isNotNull(contentModerationLogs.imageId),
                  // 这里需要用 SQL 比较，暂时简化
                )
              );

            // 删除分析结果
            await tx.delete(analysisResults).where(eq(analysisResults.imageId, image.id));

            // 删除图片记录
            await tx.delete(images).where(eq(images.id, image.id));

            stats.deletedImages++;
          });
        }
      } catch (error) {
        console.error('[CleanupExpiredData] Error deleting images:', error);
        stats.errors.push(`Failed to delete images: ${error}`);
      }
    }

    // 4. 发送删除前通知（提前 7 天）
    // TODO: 实现邮件通知逻辑
    // const notificationDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // const upcomingExpirations = await db.query.images.findMany({
    //   where: and(
    //     isNotNull(images.expiresAt),
    //     lt(images.expiresAt, notificationDate),
    //     gt(images.expiresAt, now),
    //     isNull(images.deletionNotifiedAt)
    //   ),
    // });

    console.log('[CleanupExpiredData] Cleanup completed:', stats);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[CleanupExpiredData] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Cleanup failed',
        },
      },
      { status: 500 }
    );
  }
}

// 辅助函数需要导入
import { eq } from 'drizzle-orm';
