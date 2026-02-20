/**
 * 奖励系统类型定义
 */

export enum RewardType {
  POINTS = 'points',
  CREDITS = 'credits',
  BADGE = 'badge',
  TEMPLATE = 'template',
}

export enum UserLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
}

export interface ShareReward {
  type: RewardType;
  amount: number;
  source: string;
  timestamp: Date;
  isFirstTime: boolean;
}

export interface UserRewards {
  totalPoints: number;
  credits: number;
  level: UserLevel;
  badges: string[];
  shareCount: number;
  lastShareDate?: Date;
  dailySharesRemaining: number;
}

export interface ShareRecord {
  imageUrl: string;
  platform: string;
  timestamp: Date;
  rewarded: boolean;
}

export interface RewardResult {
  success: boolean;
  reward?: ShareReward;
  reason?: string;
}
