/**
 * Share Handler
 *
 * Epic 6 - Story 6.1: Image Generation
 * Handle social media sharing functionality
 */

import type { ShareResult, SharePlatform } from '../types';
import { SHARE_REWARDS } from './generation-presets';

/**
 * Share image to social media platform
 */
export async function shareImage(params: {
  platform: SharePlatform;
  imageUrl: string;
  templateId?: string;
  generationId?: string;
  isFirstTime?: boolean;
}): Promise<ShareResult> {
  const { platform, imageUrl, templateId, generationId, isFirstTime = false } = params;

  try {
    // Generate share URL
    const shareUrl = generateShareUrl(platform, imageUrl, templateId, generationId);

    // Open share dialog
    const opened = openShareDialog(platform, shareUrl, imageUrl);

    if (!opened) {
      return {
        success: false,
        error: 'Failed to open share dialog',
      };
    }

    // Calculate credits earned
    const creditsEarned = isFirstTime ? SHARE_REWARDS.FIRST_TIME_SHARE : SHARE_REWARDS.SUBSEQUENT_SHARE;

    return {
      success: true,
      shareUrl,
      creditsEarned,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate share URL for platform
 */
function generateShareUrl(
  platform: SharePlatform,
  imageUrl: string,
  templateId?: string,
  generationId?: string
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const sharePath = `/share?image=${encodeURIComponent(imageUrl)}`;

  const params = new URLSearchParams();
  if (templateId) params.append('template', templateId);
  if (generationId) params.append('generation', generationId);

  const queryString = params.toString();
  const fullUrl = queryString
    ? `${baseUrl}${sharePath}&${queryString}`
    : `${baseUrl}${sharePath}`;

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent('Check out this AI-generated image!')}`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;

    default:
      return fullUrl;
  }
}

/**
 * Open share dialog for platform
 */
function openShareDialog(
  platform: SharePlatform,
  shareUrl: string,
  imageUrl: string
): boolean {
  try {
    // For Twitter, open the share intent URL
    if (platform === 'twitter') {
      window.open(shareUrl, '_blank', 'width=550,height=420');
      return true;
    }

    // For other platforms, use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'AI Generated Image',
        text: 'Check out this AI-generated image!',
        url: imageUrl,
      });
      return true;
    }

    // Fallback to opening share URL in new tab
    window.open(shareUrl, '_blank');
    return true;
  } catch (error) {
    console.error('[ShareHandler] Failed to open share dialog:', error);
    return false;
  }
}

/**
 * Download image to local device
 */
export function downloadImage(imageUrl: string, filename?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create temporary link element
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename || `generated-image-${Date.now()}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download multiple images as ZIP (placeholder)
 */
export async function downloadImagesAsZip(imageUrls: string[], zipFilename?: string): Promise<void> {
  // Placeholder implementation
  // In production, you would use JSZip to package images
  for (let i = 0; i < imageUrls.length; i++) {
    await downloadImage(imageUrls[i], `generated-image-${i + 1}.png`);
  }
}
