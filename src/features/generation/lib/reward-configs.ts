/**
 * 奖励系统配置
 */

import { UserLevel } from '../types/rewards';

export const REWARD_CONFIGS = {
  FIRST_SHARE_POINTS: 50,
  DAILY_SHARE_POINTS: 25,
  DAILY_SHARE_LIMIT: 2,
  POINTS_TO_CREDITS_RATIO: 0.1,
  LEVEL_THRESHOLDS: {
    [UserLevel.BRONZE]: 0,
    [UserLevel.SILVER]: 500,
    [UserLevel.GOLD]: 2000,
  },
  SHARE_COOLDOWN_HOURS: 24,
} as const;

export const BADGES = {
  FIRST_SHARE: 'first-share',
  SHARE_MASTER: 'share-master', // 10 次分享
  SOCIAL_STAR: 'social-star', // 50 次分享
} as const;

export const BADGE_INFO = {
  [BADGES.FIRST_SHARE]: {
    name: '分享新星',
    description: '完成首次分享',
    icon: '⭐',
  },
  [BADGES.SHARE_MASTER]: {
    name: '分享达人',
    description: '累计分享 10 次',
    icon: '🏆',
  },
  [BADGES.SOCIAL_STAR]: {
    name: '社交之星',
    description: '累计分享 50 次',
    icon: '🌟',
  },
} as const;
