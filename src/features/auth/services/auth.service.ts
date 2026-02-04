/**
 * Authentication Service
 *
 * Epic 1 - Story 1.2: 用户注册与 Credit 奖励
 *
 * Provides new user detection and credit reward functionality.
 */

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export interface NewUserCheckResult {
  isNewUser: boolean;
  user: {
    id: string;
    email: string;
    creditBalance: number;
  };
}

export interface CreditRewardResult {
  success: boolean;
  userId: string;
  previousBalance: number;
  newBalance: number;
  creditedAmount: number;
  showWelcome?: boolean;
  welcomeMessage?: string;
}

/**
 * Check if a user is a new user (first time login)
 *
 * New user detection logic:
 * - createdAt === updatedAt (created and never updated)
 * - creditBalance === 0 (never been rewarded)
 *
 * @param userId - The user ID to check
 * @returns Promise<NewUserCheckResult>
 */
export async function checkNewUser(userId: string): Promise<NewUserCheckResult> {
  try {
    // Query user record from database
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        email: true,
        creditBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userRecord) {
      throw new Error('User not found');
    }

    // Check if new user: createdAt === updatedAt AND creditBalance === 0
    const isNewUser =
      userRecord.createdAt.getTime() === userRecord.updatedAt.getTime() &&
      userRecord.creditBalance === 0;

    return {
      isNewUser,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        creditBalance: userRecord.creditBalance,
      },
    };
  } catch (error) {
    console.error('[AuthService] checkNewUser error:', error);
    throw error;
  }
}

/**
 * Reward a new user with 30 credits
 *
 * Uses database transaction to ensure atomicity.
 * Uses optimistic locking (WHERE credit_balance = 0) to prevent concurrent grants.
 *
 * @param userId - The user ID to reward
 * @param amount - The amount of credits to grant (default: 30)
 * @returns Promise<CreditRewardResult>
 */
export async function rewardUserWithCredits(
  userId: string,
  amount: number = 30,
): Promise<CreditRewardResult> {
  try {
    // Use transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // Get current user state
      const currentUser = await tx.query.user.findFirst({
        where: eq(user.id, userId),
        columns: {
          id: true,
          creditBalance: true,
        },
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      const previousBalance = currentUser.creditBalance;

      // Optimistic locking: Only update if credit_balance is still 0
      // This prevents concurrent grants
      const updated = await tx
        .update(user)
        .set({
          creditBalance: amount,
          updatedAt: new Date(),
        })
        .where(and(eq(user.id, userId), eq(user.creditBalance, 0)))
        .returning();

      // Check if update occurred (optimistic lock check)
      if (updated.length === 0) {
        // Update didn't happen - credit_balance was not 0
        // Return current state without changes
        return {
          success: true,
          userId,
          previousBalance,
          newBalance: previousBalance,
          creditedAmount: 0,
        };
      }

      // Credit was granted successfully
      return {
        success: true,
        userId,
        previousBalance,
        newBalance: amount,
        creditedAmount: amount - previousBalance,
      };
    });

    return result;
  } catch (error) {
    console.error('[AuthService] rewardUserWithCredits error:', error);
    throw error;
  }
}

/**
 * Check and reward new user (combined operation)
 *
 * This is the main function called during OAuth callback.
 * It checks if user is new and rewards them if so.
 *
 * @param userId - The user ID to check and potentially reward
 * @returns Promise<CreditRewardResult>
 */
export async function checkAndRewardNewUser(
  userId: string,
): Promise<CreditRewardResult & { showWelcome: boolean; welcomeMessage?: string }> {
  try {
    // Check if user is new and get their current balance
    const { isNewUser, user } = await checkNewUser(userId);

    if (!isNewUser) {
      // Existing user - no reward, no welcome message
      // Return actual balance instead of hardcoded 0
      return {
        success: true,
        userId,
        previousBalance: user.creditBalance,
        newBalance: user.creditBalance,
        creditedAmount: 0,
        showWelcome: false,
      };
    }

    // New user - grant credits
    const rewardResult = await rewardUserWithCredits(userId, 30);

    // Add welcome message for new users who received credits
    if (rewardResult.creditedAmount > 0) {
      return {
        ...rewardResult,
        showWelcome: true,
        welcomeMessage: '欢迎！您已获得 30 次 free credit',
      };
    }

    // Race condition: Another request already rewarded the user
    return {
      ...rewardResult,
      showWelcome: false,
    };
  } catch (error) {
    console.error('[AuthService] checkAndRewardNewUser error:', error);
    throw error;
  }
}
