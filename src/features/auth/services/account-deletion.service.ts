import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  accountDeletions,
  accounts,
  sessions,
  users,
  contentModerationLogs,
  images,
  analysisResults,
  batchAnalysisImages,
  batchAnalysisResults,
  creditTransactions,
} from '@/lib/db/schema';
import { batchDeleteFromR2 } from '@/lib/r2/batch-delete';

export interface DeleteAccountAuditContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface DeleteAccountOptions {
  /**
   * 是否删除 R2 存储中的文件
   * @default true
   */
  deleteR2Files?: boolean;
}

async function deleteIfTableExists(tx: any, tableName: 'generations' | 'templates' | 'analysis_results' | 'images', userId: string) {
  try {
    switch (tableName) {
      case 'generations':
        await tx.execute(sql`DELETE FROM generations WHERE user_id = ${userId}`);
        break;
      case 'templates':
        await tx.execute(sql`DELETE FROM templates WHERE user_id = ${userId}`);
        break;
      case 'analysis_results':
        await tx.execute(sql`DELETE FROM analysis_results WHERE user_id = ${userId}`);
        break;
      case 'images':
        await tx.execute(sql`DELETE FROM images WHERE user_id = ${userId}`);
        break;
      default:
        break;
    }
  } catch (error) {
    const code = (error as { code?: string } | undefined)?.code;
    if (code !== '42P01') {
      throw error;
    }
  }
}

/**
 * 删除用户账户及所有相关数据
 *
 * Story 4-1: 账户删除数据清除 (AC-7)
 * - 删除 R2 存储中的所有图片文件
 * - 删除数据库中的所有相关记录
 * - 使用事务保证一致性
 *
 * @param userId - 用户 ID
 * @param context - 审计上下文
 * @param options - 删除选项
 */
export async function deleteUserAccount(
  userId: string,
  context: DeleteAccountAuditContext = {},
  options: DeleteAccountOptions = {}
) {
  const { deleteR2Files = true } = options;

  return db.transaction(async (tx) => {
    console.log('[AccountDeletion] Starting account deletion for user:', userId);

    // 1. 获取用户的所有图片（用于删除 R2 存储）
    const userImages = await tx.query.images.findMany({
      where: eq(images.userId, userId),
      columns: {
        filePath: true,
      },
    });

    console.log('[AccountDeletion] Found images to delete:', userImages.length);

    // 2. 删除 R2 存储中的图片文件
    if (deleteR2Files && userImages.length > 0) {
      try {
        const r2Keys = userImages.map((img) => img.filePath);
        const result = await batchDeleteFromR2(r2Keys);
        console.log('[AccountDeletion] R2 deletion result:', result);
      } catch (error) {
        console.error('[AccountDeletion] R2 deletion error:', error);
        // 继续删除数据库记录，即使 R2 删除失败
      }
    }

    // 3. 删除内容审核日志（Story 4-1）
    try {
      await tx.delete(contentModerationLogs).where(eq(contentModerationLogs.userId, userId));
      console.log('[AccountDeletion] Deleted moderation logs');
    } catch (error) {
      const code = (error as { code?: string } | undefined)?.code;
      if (code !== '42P01') {
        console.error('[AccountDeletion] Error deleting moderation logs:', error);
        throw error;
      }
    }

    // 4. 删除批量分析图片关联
    try {
      // 首先获取用户的所有批量分析 ID
      const userBatchAnalyses = await tx.query.batchAnalysisResults.findMany({
        where: eq(batchAnalysisResults.userId, userId),
        columns: { id: true },
      });

      if (userBatchAnalyses.length > 0) {
        for (const batch of userBatchAnalyses) {
          await tx.delete(batchAnalysisImages).where(eq(batchAnalysisImages.batchId, batch.id));
        }
        console.log('[AccountDeletion] Deleted batch analysis images');
      }
    } catch (error) {
      const code = (error as { code?: string } | undefined)?.code;
      if (code !== '42P01') {
        console.error('[AccountDeletion] Error deleting batch analysis images:', error);
        throw error;
      }
    }

    // 5. 删除批量分析结果
    try {
      await tx.delete(batchAnalysisResults).where(eq(batchAnalysisResults.userId, userId));
      console.log('[AccountDeletion] Deleted batch analysis results');
    } catch (error) {
      const code = (error as { code?: string } | undefined)?.code;
      if (code !== '42P01') {
        console.error('[AccountDeletion] Error deleting batch analysis results:', error);
        throw error;
      }
    }

    // 6. 删除分析结果
    try {
      await tx.delete(analysisResults).where(eq(analysisResults.userId, userId));
      console.log('[AccountDeletion] Deleted analysis results');
    } catch (error) {
      const code = (error as { code?: string } | undefined)?.code;
      if (code !== '42P01') {
        console.error('[AccountDeletion] Error deleting analysis results:', error);
        throw error;
      }
    }

    // 7. 删除 Credit 交易历史
    try {
      await tx.delete(creditTransactions).where(eq(creditTransactions.userId, userId));
      console.log('[AccountDeletion] Deleted credit transactions');
    } catch (error) {
      const code = (error as { code?: string } | undefined)?.code;
      if (code !== '42P01') {
        console.error('[AccountDeletion] Error deleting credit transactions:', error);
        throw error;
      }
    }

    // 8. 删除相关 domain 表（向后兼容）
    await deleteIfTableExists(tx, 'generations', userId);
    await deleteIfTableExists(tx, 'templates', userId);
    await deleteIfTableExists(tx, 'analysis_results', userId); // 已经在上面删除，这里保留以兼容旧代码
    await deleteIfTableExists(tx, 'images', userId);

    // 9. 删除认证相关数据
    for (const op of [
      () => tx.delete(sessions).where(eq(sessions.userId, userId)),
      () => tx.delete(accounts).where(eq(accounts.userId, userId)),
      () => tx.delete(users).where(eq(users.id, userId)),
      () =>
        tx.insert(accountDeletions).values({
          userId,
          ipAddress: context.ipAddress ?? null,
          userAgent: context.userAgent ?? null,
        }),
    ]) {
      try {
        await op();
      } catch (error) {
        const code = (error as { code?: string } | undefined)?.code;
        if (code !== '42P01') {
          throw error;
        }
      }
    }

    console.log('[AccountDeletion] Account deletion completed for user:', userId);

    return { success: true };
  });
}
