/**
 * 奖励系统单元测试
 */

import {
  calculateShareReward,
  validateShare,
  calculateUserLevel,
  pointsToCredits,
  checkBadgeUnlocks,
  calculateDailySharesRemaining,
} from '../lib/reward-calculator';
import { REWARD_CONFIGS, BADGES } from '../lib/reward-configs';
import { ShareRecord, UserLevel } from '../types/rewards';

describe('奖励计算器', () => {
  describe('calculateShareReward', () => {
    it('首次分享应获得 50 积分', () => {
      const result = calculateShareReward('twitter', []);
      expect(result.success).toBe(true);
      expect(result.reward?.amount).toBe(50);
      expect(result.reward?.isFirstTime).toBe(true);
    });

    it('非首次分享应获得 25 积分', () => {
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: new Date(),
          rewarded: true,
        },
      ];
      const result = calculateShareReward('twitter', shareHistory);
      expect(result.success).toBe(true);
      expect(result.reward?.amount).toBe(25);
      expect(result.reward?.isFirstTime).toBe(false);
    });

    it('不同平台首次分享应获得 50 积分', () => {
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: new Date(),
          rewarded: true,
        },
      ];
      const result = calculateShareReward('weibo', shareHistory);
      expect(result.success).toBe(true);
      expect(result.reward?.amount).toBe(50);
      expect(result.reward?.isFirstTime).toBe(true);
    });

    it('每日分享达到上限应返回失败', () => {
      const today = new Date();
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: today,
          rewarded: true,
        },
        {
          imageUrl: 'https://example.com/img2.png',
          platform: 'twitter',
          timestamp: today,
          rewarded: true,
        },
      ];
      const result = calculateShareReward('twitter', shareHistory);
      expect(result.success).toBe(false);
      expect(result.reason).toContain('今日分享次数已达上限');
    });
  });

  describe('validateShare', () => {
    it('同一图片同一平台重复分享应返回无效', () => {
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: new Date(),
          rewarded: true,
        },
      ];
      const result = validateShare('https://example.com/img1.png', 'twitter', shareHistory);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('同一图片只能奖励一次');
    });

    it('不同图片同一平台分享应返回有效', () => {
      // 使用 25 小时前的时间避免冷却时间检查
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: oldDate,
          rewarded: true,
        },
      ];
      const result = validateShare('https://example.com/img2.png', 'twitter', shareHistory);
      expect(result.valid).toBe(true);
    });

    it('同一图片不同平台分享应返回有效', () => {
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: new Date(),
          rewarded: true,
        },
      ];
      const result = validateShare('https://example.com/img1.png', 'weibo', shareHistory);
      expect(result.valid).toBe(true);
    });

    it('24小时内同一平台分享应返回冷却中', () => {
      const recentDate = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12小时前
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: recentDate,
          rewarded: true,
        },
      ];
      const result = validateShare('https://example.com/img2.png', 'twitter', shareHistory);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('分享冷却中');
    });
  });

  describe('calculateUserLevel', () => {
    it('0 积分应为 Bronze 等级', () => {
      expect(calculateUserLevel(0)).toBe(UserLevel.BRONZE);
    });

    it('499 积分应为 Bronze 等级', () => {
      expect(calculateUserLevel(499)).toBe(UserLevel.BRONZE);
    });

    it('500 积分应为 Silver 等级', () => {
      expect(calculateUserLevel(500)).toBe(UserLevel.SILVER);
    });

    it('1999 积分应为 Silver 等级', () => {
      expect(calculateUserLevel(1999)).toBe(UserLevel.SILVER);
    });

    it('2000 积分应为 Gold 等级', () => {
      expect(calculateUserLevel(2000)).toBe(UserLevel.GOLD);
    });
  });

  describe('pointsToCredits', () => {
    it('100 积分应转换为 10 Credit', () => {
      expect(pointsToCredits(100)).toBe(10);
    });

    it('25 积分应转换为 2 Credit', () => {
      expect(pointsToCredits(25)).toBe(2);
    });

    it('1 积分应转换为 0 Credit', () => {
      expect(pointsToCredits(1)).toBe(0);
    });
  });

  describe('checkBadgeUnlocks', () => {
    it('首次分享应解锁 FIRST_SHARE 徽章', () => {
      const newBadges = checkBadgeUnlocks(1, []);
      expect(newBadges).toContain(BADGES.FIRST_SHARE);
    });

    it('已有 FIRST_SHARE 徽章不应重复解锁', () => {
      const newBadges = checkBadgeUnlocks(1, [BADGES.FIRST_SHARE]);
      expect(newBadges).not.toContain(BADGES.FIRST_SHARE);
    });

    it('分享 10 次应解锁 SHARE_MASTER 徽章', () => {
      const newBadges = checkBadgeUnlocks(10, []);
      expect(newBadges).toContain(BADGES.SHARE_MASTER);
    });

    it('分享 50 次应解锁 SOCIAL_STAR 徽章', () => {
      const newBadges = checkBadgeUnlocks(50, []);
      expect(newBadges).toContain(BADGES.SOCIAL_STAR);
    });

    it('多个徽章条件满足应同时解锁', () => {
      const newBadges = checkBadgeUnlocks(50, []);
      expect(newBadges).toContain(BADGES.FIRST_SHARE);
      expect(newBadges).toContain(BADGES.SHARE_MASTER);
      expect(newBadges).toContain(BADGES.SOCIAL_STAR);
    });
  });

  describe('calculateDailySharesRemaining', () => {
    it('无分享记录时应返回每日上限', () => {
      const result = calculateDailySharesRemaining('twitter', []);
      expect(result).toBe(REWARD_CONFIGS.DAILY_SHARE_LIMIT);
    });

    it('分享 1 次应返回剩余次数', () => {
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: new Date(),
          rewarded: true,
        },
      ];
      const result = calculateDailySharesRemaining('twitter', shareHistory);
      expect(result).toBe(1);
    });

    it('分享达到上限应返回 0', () => {
      const today = new Date();
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: today,
          rewarded: true,
        },
        {
          imageUrl: 'https://example.com/img2.png',
          platform: 'twitter',
          timestamp: today,
          rewarded: true,
        },
      ];
      const result = calculateDailySharesRemaining('twitter', shareHistory);
      expect(result).toBe(0);
    });

    it('不同平台的每日分享次数应独立计算', () => {
      const today = new Date();
      const shareHistory: ShareRecord[] = [
        {
          imageUrl: 'https://example.com/img1.png',
          platform: 'twitter',
          timestamp: today,
          rewarded: true,
        },
        {
          imageUrl: 'https://example.com/img2.png',
          platform: 'twitter',
          timestamp: today,
          rewarded: true,
        },
      ];
      // twitter 达到上限
      const twitterResult = calculateDailySharesRemaining('twitter', shareHistory);
      expect(twitterResult).toBe(0);

      // weibo 未分享过
      const weiboResult = calculateDailySharesRemaining('weibo', shareHistory);
      expect(weiboResult).toBe(2);
    });
  });
});
