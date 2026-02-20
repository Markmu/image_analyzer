/**
 * 社交分享相关类型定义
 */

export enum SocialPlatform {
  TWITTER = 'twitter',
  WECHAT = 'wechat',
  WEIBO = 'weibo',
  XIAOHONGSHU = 'xiaohongshu',
  LINK = 'link',
}

export interface ShareOptions {
  platform: SocialPlatform;
  imageUrl: string;
  title?: string;
  text?: string;
  hashtags?: string[];
  via?: string;
}

export interface ShareResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  icon: string;
  color: string;
  shareUrl: string;
  supportsImage: boolean;
}
