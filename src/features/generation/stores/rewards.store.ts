/**
 * 奖励状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRewards, ShareRecord, UserLevel } from '../types/rewards';
import { REWARD_CONFIGS } from '../lib/reward-configs';
import { calculateUserLevel, checkBadgeUnlocks, pointsToCredits } from '../lib/reward-calculator';

interface RewardsState extends UserRewards {
  shareHistory: ShareRecord[];
  addReward: (points: number, source: string) => void;
  addShareRecord: (record: ShareRecord) => void;
  getDailySharesRemaining: (platform: string) => number;
  resetDailySharesIfNeeded: () => void;
}

// 检查是否需要重置每日分享次数
function shouldResetDailyShares(lastShareDate?: Date): boolean {
  if (!lastShareDate) return false;
  const today = new Date().toDateString();
  const lastShare = new Date(lastShareDate).toDateString();
  return today !== lastShare;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      totalPoints: 0,
      credits: 0,
      level: UserLevel.BRONZE,
      badges: [],
      shareCount: 0,
      dailySharesRemaining: REWARD_CONFIGS.DAILY_SHARE_LIMIT,
      shareHistory: [],

      // 添加奖励
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      addReward: (points, _source) => {
        if (typeof points !== 'number' || points <= 0) {
          console.warn('Invalid points value:', points);
          return;
        }

        const state = get();
        const newTotalPoints = state.totalPoints + points;
        const newCredits = state.credits + pointsToCredits(points);

        // 计算新等级
        const newLevel = calculateUserLevel(newTotalPoints);

        // 检查徽章解锁
        const newBadges = checkBadgeUnlocks(state.shareCount, state.badges);

        set({
          totalPoints: newTotalPoints,
          credits: newCredits,
          level: newLevel,
          badges: newBadges.length > 0 ? [...state.badges, ...newBadges] : state.badges,
        });
      },

      // 添加分享记录
      addShareRecord: (record) => {
        const state = get();
        const newShareHistory = [...state.shareHistory, record];
        const newShareCount = state.shareCount + 1;

        // 计算新的每日剩余分享次数
        const today = new Date().toDateString();
        const todayShares = newShareHistory.filter(s =>
          s.platform === record.platform &&
          new Date(s.timestamp).toDateString() === today
        );
        const newDailySharesRemaining = Math.max(
          0,
          REWARD_CONFIGS.DAILY_SHARE_LIMIT - todayShares.length
        );

        set({
          shareHistory: newShareHistory,
          shareCount: newShareCount,
          dailySharesRemaining: newDailySharesRemaining,
          lastShareDate: new Date(),
        });
      },

      // 获取每日剩余分享次数
      getDailySharesRemaining: (platform) => {
        const state = get();
        const today = new Date().toDateString();
        const todayShares = state.shareHistory.filter(s =>
          s.platform === platform &&
          new Date(s.timestamp).toDateString() === today
        );

        return Math.max(0, REWARD_CONFIGS.DAILY_SHARE_LIMIT - todayShares.length);
      },

      // 如果需要则重置每日分享次数
      resetDailySharesIfNeeded: () => {
        const state = get();
        if (shouldResetDailyShares(state.lastShareDate)) {
          set({
            dailySharesRemaining: REWARD_CONFIGS.DAILY_SHARE_LIMIT,
          });
        }
      },
    }),
    {
      name: 'rewards-storage',
      partialize: (state) => ({
        totalPoints: state.totalPoints,
        credits: state.credits,
        level: state.level,
        badges: state.badges,
        shareCount: state.shareCount,
        shareHistory: state.shareHistory,
        lastShareDate: state.lastShareDate,
      }),
    }
  )
);
