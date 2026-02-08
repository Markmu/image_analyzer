import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accountDeletions, accounts, sessions, users } from '@/lib/db/schema';

export interface DeleteAccountAuditContext {
  ipAddress?: string | null;
  userAgent?: string | null;
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

export async function deleteUserAccount(userId: string, context: DeleteAccountAuditContext = {}) {
  return db.transaction(async (tx) => {
    // Related domain tables may not exist in early project phases; guard with IF EXISTS.
    await deleteIfTableExists(tx, 'generations', userId);
    await deleteIfTableExists(tx, 'templates', userId);
    await deleteIfTableExists(tx, 'analysis_results', userId);
    await deleteIfTableExists(tx, 'images', userId);

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

    return { success: true };
  });
}
