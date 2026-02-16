/**
 * 数据保留配置
 *
 * Story 4-1: 内容审核功能
 * Epic 4: 内容安全与合规
 */

/**
 * 不同订阅等级的数据保留期限（天数）
 */
export const RETENTION_PERIODS = {
  free: 30, // Free 用户：30 天
  lite: 60, // Lite 用户：60 天
  standard: 90, // Standard 用户：90 天
} as const;

/**
 * 数据保留配置
 */
export const RETENTION_CONFIG = {
  // 不同订阅等级的保留期限
  periods: RETENTION_PERIODS,

  // 提前多少天发送删除通知
  notificationDaysBefore: 7,

  // Cron 任务执行时间（每天凌晨 2 点）
  cronSchedule: '0 2 * * *',
} as const;

export type SubscriptionTier = keyof typeof RETENTION_PERIODS;

/**
 * 根据订阅等级获取数据过期时间
 *
 * @param tier - 订阅等级
 * @returns 过期时间
 */
export function getExpirationDate(tier: SubscriptionTier = 'free'): Date {
  const days = RETENTION_CONFIG.periods[tier] || RETENTION_CONFIG.periods.free;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

/**
 * 计算数据保留剩余天数
 *
 * @param expiresAt - 过期时间
 * @returns 剩余天数（负数表示已过期）
 */
export function getDaysUntilExpiration(expiresAt: Date): number {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 检查是否需要发送删除通知
 *
 * @param expiresAt - 过期时间
 * @param lastNotifiedAt - 上次通知时间
 * @returns 是否需要发送通知
 */
export function shouldSendDeletionNotification(
  expiresAt: Date,
  lastNotifiedAt?: Date | null
): boolean {
  const daysUntil = getDaysUntilExpiration(expiresAt);

  // 如果还有 7 天或更少，且未发送过通知
  if (daysUntil <= RETENTION_CONFIG.notificationDaysBefore && daysUntil > 0) {
    // 如果从未发送过通知
    if (!lastNotifiedAt) {
      return true;
    }

    // 如果上次通知是 7 天前（避免重复通知）
    const daysSinceNotification = Math.ceil(
      (Date.now() - new Date(lastNotifiedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceNotification >= 7;
  }

  return false;
}
