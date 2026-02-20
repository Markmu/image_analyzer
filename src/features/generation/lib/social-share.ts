/**
 * 社交分享功能
 */

import { ShareOptions, ShareResult, SocialPlatform } from '../types/social-share';
import { SOCIAL_PLATFORMS } from './platform-configs';

/**
 * 分享到指定平台
 */
export async function shareToSocialPlatform(options: ShareOptions): Promise<ShareResult> {
  try {
    switch (options.platform) {
      case SocialPlatform.TWITTER:
        return shareToTwitter(options);
      case SocialPlatform.WEIBO:
        return shareToWeibo(options);
      case SocialPlatform.WECHAT:
        return shareToWeChat(options);
      case SocialPlatform.XIAOHONGSHU:
        return shareToXiaohongshu(options);
      case SocialPlatform.LINK:
        return copyLink(options);
      default:
        return { success: false, error: '不支持的平台' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '分享失败',
    };
  }
}

/**
 * 分享到 Twitter
 */
function shareToTwitter(options: ShareOptions): ShareResult {
  const text = encodeURIComponent(options.text || '');
  const url = encodeURIComponent(options.imageUrl);
  const hashtags = options.hashtags?.join(',') || '';
  const via = options.via || '';

  const params = new URLSearchParams({
    text: options.text || '',
    url: options.imageUrl,
  });

  if (hashtags) {
    params.append('hashtags', hashtags);
  }

  if (via) {
    params.append('via', via);
  }

  const twitterUrl = `${SOCIAL_PLATFORMS[Twitter].shareUrl}?${params.toString()}`;

  window.open(twitterUrl, '_blank', 'width=600,height=400');

  return { success: true };
}

/**
 * 分享到微博
 */
function shareToWeibo(options: ShareOptions): ShareResult {
  const params = new URLSearchParams({
    title: options.text || '',
    url: window.location.href,
    pic: options.imageUrl,
  });

  const weiboUrl = `${SOCIAL_PLATFORMS[SocialPlatform.WEIBO].shareUrl}?${params.toString()}`;

  window.open(weiboUrl, '_blank', 'width=600,height=400');

  return { success: true };
}

/**
 * 分享到微信(生成分享链接)
 */
async function shareToWeChat(options: ShareOptions): Promise<ShareResult> {
  // 生成分享链接
  const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(options.imageUrl)}`;

  return { success: true, url: shareUrl };
}

/**
 * 分享到小红书(复制链接 + 引导)
 */
async function shareToXiaohongshu(options: ShareOptions): Promise<ShareResult> {
  const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(options.imageUrl)}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    return { success: true, url: shareUrl };
  } catch (error) {
    return { success: false, error: '复制链接失败' };
  }
}

/**
 * 复制链接
 */
async function copyLink(options: ShareOptions): Promise<ShareResult> {
  const shareUrl = `${window.location.origin}/share?img=${encodeURIComponent(options.imageUrl)}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    return { success: true, url: shareUrl };
  } catch (error) {
    return { success: false, error: '复制链接失败' };
  }
}

/**
 * 生成分享文案
 */
export function generateShareText(templateName?: string): string {
  const baseText = '我用 AI 生成了这张图片,太酷了!';

  if (templateName) {
    return `${baseText} 使用了「${templateName}」模版`;
  }

  return baseText;
}

/**
 * 检测 Web Share API 支持
 */
export function supportsWebShareAPI(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * 使用原生分享 API(移动端)
 */
export async function nativeShare(options: ShareOptions): Promise<ShareResult> {
  if (!supportsWebShareAPI()) {
    return { success: false, error: '不支持原生分享' };
  }

  try {
    await navigator.share({
      title: options.title || 'AI 生成的图片',
      text: options.text,
      url: options.imageUrl,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '分享失败',
    };
  }
}
