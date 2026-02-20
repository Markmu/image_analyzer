/**
 * 奖励状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRewards, ShareRecord } from '../types/rewards';

interface RewardsState extends UserRewards {
  shareHistory: ShareRecord[];
  addReward: (points: number, source: string) => void;
  addShareRecord: (record: ShareRecord) => void;
  getDailySharesRemaining: (platform: string) => number;
  resetDailyShares: () => void;
}

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      totalPoints: 0,
      credits: 0,
      level: 'bronze',
      badges: [],
      shareCount: 0,
      dailySharesRemaining: 2,
      shareHistory: [],

      // 添加奖励
      addReward: (points, source) => {
        const state = get();
        const newTotalPoints = state.totalPoints + points;
        const newCredits = state.credits + Math.floor(points * 0.1);

        set({
          totalPoints: newTotalPoints,
          credits: newCredits,
        });
      },

      // 添加分享记录
      addShareRecord: (record) => {
        const state = get();
        const newShareHistory = [...state.shareHistory, record];
        const newShareCount = state.shareCount + 1;

        set({
          shareHistory: newShareHistory,
          shareCount: newShareCount,
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

        return Math.max(0, 2 - todayShares.length);
      },

      // 重置每日分享次数
      resetDailyShares: () => {
        set({ dailySharesRemaining: 2 });
      },
    }),
    {
      name: 'rewards-storage',
    }
  )
);
