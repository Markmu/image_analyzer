/**
 * Resolution Configuration
 *
 * Epic 6 - Story 6.1: Image Generation
 * Resolution configuration and utilities
 */

import type { ResolutionPreset, SubscriptionTier } from '../types/generation';
import { RESOLUTION_PRESETS } from './generation-presets';

/**
 * Get available resolutions for a subscription tier
 */
export function getResolutionsForTier(tier: SubscriptionTier): ResolutionPreset[] {
  return RESOLUTION_PRESETS[tier] || RESOLUTION_PRESETS.free;
}

/**
 * Check if a resolution is available for a subscription tier
 */
export function isResolutionAvailable(
  resolution: ResolutionPreset,
  userTier: SubscriptionTier
): boolean {
  const tierLevels: SubscriptionTier[] = ['free', 'lite', 'standard'];
  const userTierLevel = tierLevels.indexOf(userTier);
  const minTierLevel = resolution.minSubscriptionTier
    ? tierLevels.indexOf(resolution.minSubscriptionTier)
    : 0;

  return userTierLevel >= minTierLevel;
}

/**
 * Get the highest available resolution for a subscription tier
 */
export function getHighestResolution(tier: SubscriptionTier): ResolutionPreset {
  const resolutions = getResolutionsForTier(tier);
  return resolutions[resolutions.length - 1];
}

/**
 * Calculate total credit cost for generation
 */
export function calculateCreditCost(
  resolution: ResolutionPreset,
  quantity: number,
  creditMultiplier: number = 1
): number {
  return Math.round(resolution.creditCost * quantity * creditMultiplier);
}

/**
 * Format resolution for display
 */
export function formatResolution(resolution: ResolutionPreset): string {
  return `${resolution.width}x${resolution.height}`;
}

/**
 * Get upgrade message for resolution
 */
export function getUpgradeMessage(resolution: ResolutionPreset): string | null {
  if (!resolution.minSubscriptionTier || resolution.minSubscriptionTier === 'free') {
    return null;
  }

  const tierNames: Record<SubscriptionTier, string> = {
    free: 'Free',
    lite: 'Lite',
    standard: 'Standard',
  };

  return `升级到 ${tierNames[resolution.minSubscriptionTier]} 以使用此分辨率`;
}
