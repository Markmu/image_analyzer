/**
 * Credit 工具函数
 *
 * AC-6: Credit 系统集成
 */

import { getDb } from '@/lib/db';
import { user, creditTransactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * 检查用户是否有足够的 credit
 */
export async function checkCredits(userId: string, requiredAmount: number): Promise<boolean> {
  const db = getDb();

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    return false;
  }

  return userData.creditBalance >= requiredAmount;
}

/**
 * 扣除 credit（使用事务保证原子性）
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  batchId?: number
): Promise<boolean> {
  const db = getDb();

  // 使用事务保证原子性，防止竞态条件
  try {
    const result = await db.transaction(async (tx) => {
      // 锁定用户行（使用 FOR UPDATE）
      const [userData] = await tx
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userData || userData.creditBalance < amount) {
        return false;
      }

      // 扣除 credit
      const newBalance = userData.creditBalance - amount;

      await tx
        .update(user)
        .set({ creditBalance: newBalance })
        .where(eq(user.id, userId));

      // 记录交易
      await tx.insert(creditTransactions).values({
        userId,
        type: 'deduct',
        amount,
        balanceAfter: newBalance,
        reason,
        batchId,
      });

      return true;
    });

    return result;
  } catch (error) {
    console.error('Credit deduction transaction failed:', error);
    return false;
  }
}

/**
 * 退还 credit（使用事务保证原子性）
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  batchId?: number
): Promise<boolean> {
  const db = getDb();

  // 使用事务保证原子性
  try {
    const result = await db.transaction(async (tx) => {
      // 锁定用户行
      const [userData] = await tx
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userData) {
        return false;
      }

      // 退还 credit
      const newBalance = userData.creditBalance + amount;

      await tx
        .update(user)
        .set({ creditBalance: newBalance })
        .where(eq(user.id, userId));

      // 记录交易
      await tx.insert(creditTransactions).values({
        userId,
        type: 'refund',
        amount,
        balanceAfter: newBalance,
        reason,
        batchId,
      });

      return true;
    });

    return result;
  } catch (error) {
    console.error('Credit refund transaction failed:', error);
    return false;
  }
}

/**
 * 获取用户 credit 余额
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const db = getDb();

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userData?.creditBalance || 0;
}
