/**
 * 社交分享平台配置
 */

import { SocialPlatform, PlatformConfig } from '../types/social-share';

export const SOCIAL_PLATFORMS: Record<SocialPlatform, PlatformConfig> = {
  [SocialPlatform.TWITTER]: {
    id: SocialPlatform.TWITTER,
    name: 'Twitter',
    icon: 'twitter',
    color: '#1DA1F2',
    shareUrl: 'https://twitter.com/intent/tweet',
    supportsImage: true,
  },
  [SocialPlatform.WECHAT]: {
    id: SocialPlatform.WECHAT,
    name: '微信',
    icon: 'message-circle',
    color: '#07C160',
    shareUrl: '',
    supportsImage: false, // 使用二维码
  },
  [SocialPlatform.WEIBO]: {
    id: SocialPlatform.WEIBO,
    name: '微博',
    icon: 'radio',
    color: '#E6162D',
    shareUrl: 'https://service.weibo.com/share/share.php',
    supportsImage: true,
  },
  [SocialPlatform.XIAOHONGSHU]: {
    id: SocialPlatform.XIAOHONGSHU,
    name: '小红书',
    icon: 'book-open',
    color: '#FF2442',
    shareUrl: '',
    supportsImage: false, // 复制链接
  },
  [SocialPlatform.LINK]: {
    id: SocialPlatform.LINK,
    name: '复制链接',
    icon: 'link',
    color: '#6B7280',
    shareUrl: '',
    supportsImage: true,
  },
};

export const DEFAULT_HASHTAGS = ['#AI图片生成', '#AI艺术', '#创意设计'];
export const DEFAULT_SHARE_TEXT = '我用 AI 生成了这张图片,太酷了!';
