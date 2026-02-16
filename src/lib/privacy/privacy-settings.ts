/**
 * 隐私设置服务
 *
 * Story 4-3: 隐私合规功能
 * Epic 4: 内容安全与合规
 *
 * 管理用户的隐私设置和数据共享偏好
 */

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 隐私设置类型
 */
export interface PrivacySettings {
  dataSharingEnabled: boolean;
  doNotSellEnabled: boolean;
  privacySettingsUpdatedAt: Date | null;
}

/**
 * 数据收集清单
 */
export interface DataCollectionItem {
  category: string;
  description: string;
  purpose: string;
  retention: string;
}

/**
 * 获取用户隐私设置
 *
 * @param userId - 用户 ID
 * @returns 隐私设置
 */
export async function getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
  const [userData] = await db
    .select({
      dataSharingEnabled: user.dataSharingEnabled,
      doNotSellEnabled: user.doNotSellEnabled,
      privacySettingsUpdatedAt: user.privacySettingsUpdatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    return null;
  }

  return {
    dataSharingEnabled: userData.dataSharingEnabled,
    doNotSellEnabled: userData.doNotSellEnabled,
    privacySettingsUpdatedAt: userData.privacySettingsUpdatedAt,
  };
}

/**
 * 更新用户隐私设置
 *
 * @param userId - 用户 ID
 * @param settings - 新的隐私设置
 * @returns 更新后的设置
 */
export async function updatePrivacySettings(
  userId: string,
  settings: Partial<Pick<PrivacySettings, 'dataSharingEnabled' | 'doNotSellEnabled'>>
): Promise<PrivacySettings> {
  const updateData: Record<string, unknown> = {
    privacySettingsUpdatedAt: new Date(),
  };

  if (settings.dataSharingEnabled !== undefined) {
    updateData.dataSharingEnabled = settings.dataSharingEnabled;
  }

  if (settings.doNotSellEnabled !== undefined) {
    updateData.doNotSellEnabled = settings.doNotSellEnabled;
  }

  await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId));

  // 返回更新后的设置
  const updated = await getPrivacySettings(userId);
  if (!updated) {
    throw new Error('Failed to retrieve updated privacy settings');
  }

  return updated;
}

/**
 * 数据收集清单
 */
export const DATA_COLLECTION_ITEMS: DataCollectionItem[] = [
  {
    category: '账户信息',
    description: '姓名、邮箱、头像',
    purpose: '账户识别和身份验证',
    retention: '账户存续期间',
  },
  {
    category: '使用数据',
    description: '功能使用、点击行为、偏好设置',
    purpose: '服务改进和用户体验优化',
    retention: '24 个月',
  },
  {
    category: '生成内容',
    description: '上传的图片、分析结果、模板使用',
    purpose: '提供图片分析和生成服务',
    retention: '根据订阅等级（30/60/90 天）',
  },
  {
    category: '设备信息',
    description: '浏览器类型、操作系统、设备信息',
    purpose: '技术支持和兼容性优化',
    retention: '12 个月',
  },
  {
    category: '日志数据',
    description: '访问时间、IP地址、使用时长',
    purpose: '安全监控和故障排查',
    retention: '6 个月',
  },
];

/**
 * 获取数据收集清单
 *
 * @returns 数据收集项目列表
 */
export function getDataCollection清单(): DataCollectionItem[] {
  return DATA_COLLECTION_ITEMS;
}

/**
 * 检查用户是否启用了数据分享
 *
 * @param userId - 用户 ID
 * @returns 是否启用
 */
export async function isDataSharingEnabled(userId: string): Promise<boolean> {
  const settings = await getPrivacySettings(userId);
  return settings?.dataSharingEnabled ?? true; // 默认启用
}

/**
 * 检查用户是否启用了"Do Not Sell"
 *
 * @param userId - 用户 ID
 * @returns 是否启用
 */
export async function isDoNotSellEnabled(userId: string): Promise<boolean> {
  const settings = await getPrivacySettings(userId);
  return settings?.doNotSellEnabled ?? false;
}
