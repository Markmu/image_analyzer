/**
 * 奖励计算和发放系统
 */

import { ShareReward, RewardResult, UserLevel, ShareRecord } from '../types/rewards';
import { REWARD_CONFIGS, BADGES } from './reward-configs';

/**
 * 计算分享奖励
 */
export function calculateShareReward(
  platform: string,
  shareHistory: ShareRecord[]
): RewardResult {
  // 1. 检查该平台是否已分享过
  const platformShares = shareHistory.filter(s => s.platform === platform);
  const isFirstTime = platformShares.length === 0;

  // 2. 检查每日上限
  const today = new Date().toDateString();
  const todayShares = platformShares.filter(s =>
    new Date(s.timestamp).toDateString() === today
  );

  if (todayShares.length >= REWARD_CONFIGS.DAILY_SHARE_LIMIT) {
    return {
      success: false,
      reason: `今日分享次数已达上限(${REWARD_CONFIGS.DAILY_SHARE_LIMIT}次)`,
    };
  }

  // 3. 计算积分
  const points = isFirstTime
    ? REWARD_CONFIGS.FIRST_SHARE_POINTS
    : REWARD_CONFIGS.DAILY_SHARE_POINTS;

  const reward: ShareReward = {
    type: 'points',
    amount: points,
    source: platform,
    timestamp: new Date(),
    isFirstTime,
  };

  return { success: true, reward };
}

/**
 * 验证分享是否有效
 */
export function validateShare(
  imageUrl: string,
  platform: string,
  shareHistory: ShareRecord[]
): { valid: boolean; reason?: string } {
  // 1. 检查同一图片是否已分享到同一平台
  const duplicate = shareHistory.some(s =>
    s.imageUrl === imageUrl &&
    s.platform === platform &&
    s.rewarded
  );

  if (duplicate) {
    return { valid: false, reason: '同一图片只能奖励一次' };
  }

  // 2. 检查冷却时间(24小时)
  const lastShare = shareHistory
    .filter(s => s.platform === platform)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  if (lastShare) {
    const hoursSinceLastShare = (Date.now() - new Date(lastShare.timestamp).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastShare < REWARD_CONFIGS.SHARE_COOLDOWN_HOURS) {
      const remainingHours = Math.ceil(REWARD_CONFIGS.SHARE_COOLDOWN_HOURS - hoursSinceLastShare);
      return { valid: false, reason: `分享冷却中,还需 ${remainingHours} 小时` };
    }
  }

  return { valid: true };
}

/**
 * 计算用户等级
 */
export function calculateUserLevel(totalPoints: number): UserLevel {
  if (totalPoints >= REWARD_CONFIGS.LEVEL_THRESHOLDS[UserLevel.GOLD]) {
    return UserLevel.GOLD;
  }
  if (totalPoints >= REWARD_CONFIGS.LEVEL_THRESHOLDS[UserLevel.SILVER]) {
    return UserLevel.SILVER;
  }
  return UserLevel.BRONZE;
}

/**
 * 计算积分转换为 Credit
 */
export function pointsToCredits(points: number): number {
  return Math.floor(points * REWARD_CONFIGS.POINTS_TO_CREDITS_RATIO);
}

/**
 * 检查是否解锁徽章
 */
export function checkBadgeUnlocks(
  shareCount: number,
  currentBadges: string[]
): string[] {
  const newBadges: string[] = [];

  // 首次分享徽章
  if (shareCount >= 1 && !currentBadges.includes(BADGES.FIRST_SHARE)) {
    newBadges.push(BADGES.FIRST_SHARE);
  }

  // 分享达人徽章
  if (shareCount >= 10 && !currentBadges.includes(BADGES.SHARE_MASTER)) {
    newBadges.push(BADGES.SHARE_MASTER);
  }

  // 社交之星徽章
  if (shareCount >= 50 && !currentBadges.includes(BADGES.SOCIAL_STAR)) {
    newBadges.push(BADGES.SOCIAL_STAR);
  }

  return newBadges;
}

/**
 * 计算每日剩余分享次数
 */
export function calculateDailySharesRemaining(
  platform: string,
  shareHistory: ShareRecord[]
): number {
  const today = new Date().toDateString();
  const todayShares = shareHistory.filter(s =>
    s.platform === platform &&
    new Date(s.timestamp).toDateString() === today
  );

  return Math.max(0, REWARD_CONFIGS.DAILY_SHARE_LIMIT - todayShares.length);
}
