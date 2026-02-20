/**
 * 社交分享功能
 */

import { ShareOptions, ShareResult, SocialPlatform } from '../types/social-share';
import { ShareReward } from '../types/rewards';
import { SOCIAL_PLATFORMS, DEFAULT_SHARE_TEXT } from './platform-configs';
import { calculateShareReward, validateShare } from './reward-calculator';
import { useRewardsStore } from '../stores/rewards.store';
import { ShareRecord } from '../types/rewards';

/**
 * 分享结果(含奖励信息)
 */
export interface ShareResultWithReward extends ShareResult {
  reward?: ShareReward;
}

/**
 * 验证 URL 是否有效
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 生成分享链接
 */
function generateShareUrl(imageUrl: string): string {
  return `${window.location.origin}/share?img=${encodeURIComponent(imageUrl)}`;
}

/**
 * 复制文本到剪贴板
 */
async function copyToClipboard(text: string): Promise<ShareResult> {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch {
    return { success: false, error: '复制链接失败，请手动复制' };
  }
}

/**
 * 分享到指定平台(带奖励)
 */
export async function shareToSocialPlatform(
  options: ShareOptions,
  imageUrl?: string
): Promise<ShareResultWithReward> {
  try {
    const result: ShareResultWithReward = {
      success: false,
    };

    // 检查是否有效分享(如果有 imageUrl)
    if (imageUrl) {
      const rewardsStore = useRewardsStore.getState();

      // 检查是否需要重置每日分享次数
      rewardsStore.resetDailySharesIfNeeded();

      const validation = validateShare(imageUrl, options.platform, rewardsStore.shareHistory);

      if (!validation.valid) {
        return { success: false, error: validation.reason };
      }
    }

    switch (options.platform) {
      case SocialPlatform.TWITTER:
        result.success = shareToTwitter(options).success;
        break;
      case SocialPlatform.WEIBO:
        result.success = shareToWeibo(options).success;
        break;
      case SocialPlatform.WECHAT:
        const wechatResult = await shareToWeChat(options);
        result.success = wechatResult.success;
        result.url = wechatResult.url;
        break;
      case SocialPlatform.XIAOHONGSHU:
        const xhsResult = await shareToXiaohongshu(options);
        result.success = xhsResult.success;
        result.url = xhsResult.url;
        if (!xhsResult.success) {
          result.error = xhsResult.error;
        }
        break;
      case SocialPlatform.LINK:
        const linkResult = await copyLink(options);
        result.success = linkResult.success;
        result.url = linkResult.url;
        if (!linkResult.success) {
          result.error = linkResult.error;
        }
        break;
      default:
        return { success: false, error: '不支持的平台' };
    }

    // 计算和发放奖励
    if (result.success && imageUrl) {
      const rewardsStore = useRewardsStore.getState();
      const rewardResult = calculateShareReward(options.platform, rewardsStore.shareHistory);

      if (rewardResult.success && rewardResult.reward) {
        // 发放奖励
        rewardsStore.addReward(rewardResult.reward.amount, options.platform);

        // 添加分享记录
        const shareRecord: ShareRecord = {
          imageUrl,
          platform: options.platform,
          timestamp: new Date(),
          rewarded: true,
        };
        rewardsStore.addShareRecord(shareRecord);

        result.reward = rewardResult.reward;
      }
    }

    return result;
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
  // 验证 imageUrl
  if (!isValidUrl(options.imageUrl)) {
    return { success: false, error: '无效的图片链接' };
  }

  const params = new URLSearchParams({
    text: options.text || '',
    url: options.imageUrl,
  });

  if (options.hashtags?.length) {
    params.append('hashtags', options.hashtags.join(','));
  }

  if (options.via) {
    params.append('via', options.via);
  }

  const twitterUrl = `${SOCIAL_PLATFORMS[SocialPlatform.TWITTER].shareUrl}?${params.toString()}`;

  // 检查 popup 是否被阻止
  const popup = window.open(twitterUrl, '_blank', 'width=600,height=400');
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    return { success: false, error: '弹出窗口被阻止，请允许弹出窗口后重试' };
  }

  return { success: true };
}

/**
 * 分享到微博
 */
function shareToWeibo(options: ShareOptions): ShareResult {
  // 验证 imageUrl
  if (!isValidUrl(options.imageUrl)) {
    return { success: false, error: '无效的图片链接' };
  }

  const params = new URLSearchParams({
    title: options.text || '',
    url: window.location.href,
    pic: options.imageUrl,
  });

  const weiboUrl = `${SOCIAL_PLATFORMS[SocialPlatform.WEIBO].shareUrl}?${params.toString()}`;

  // 检查 popup 是否被阻止
  const popup = window.open(weiboUrl, '_blank', 'width=600,height=400');
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    return { success: false, error: '弹出窗口被阻止，请允许弹出窗口后重试' };
  }

  return { success: true };
}

/**
 * 分享到微信(复制链接，引导用户分享)
 * 移除二维码功能，改为复制链接方式
 */
async function shareToWeChat(options: ShareOptions): Promise<ShareResult> {
  // 验证 imageUrl
  if (!isValidUrl(options.imageUrl)) {
    return { success: false, error: '无效的图片链接' };
  }

  // 生成分享链接并复制
  const shareUrl = generateShareUrl(options.imageUrl);
  return copyToClipboard(`${options.text}\n${shareUrl}`);
}

/**
 * 分享到小红书(复制链接 + 引导)
 */
async function shareToXiaohongshu(options: ShareOptions): Promise<ShareResult> {
  const shareUrl = generateShareUrl(options.imageUrl);
  return copyToClipboard(shareUrl);
}

/**
 * 复制链接
 */
async function copyLink(options: ShareOptions): Promise<ShareResult> {
  const shareUrl = generateShareUrl(options.imageUrl);
  return copyToClipboard(shareUrl);
}

/**
 * 生成分享文案
 */
export function generateShareText(templateName?: string): string {
  if (templateName) {
    return `${DEFAULT_SHARE_TEXT} 使用了「${templateName}」模版`;
  }

  return DEFAULT_SHARE_TEXT;
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
