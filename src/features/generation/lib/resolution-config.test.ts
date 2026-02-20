/**
 * Resolution Config Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getResolutionsForTier,
  isResolutionAvailable,
  getHighestResolution,
  calculateCreditCost,
  formatResolution,
  getUpgradeMessage,
} from './resolution-config';
import type { ResolutionPreset, SubscriptionTier } from '../types';

describe('Resolution Config', () => {
  const mockResolution: ResolutionPreset = {
    name: '标准 (512x512)',
    width: 512,
    height: 512,
    creditCost: 2,
  };

  const mockPremiumResolution: ResolutionPreset = {
    name: '超清 (1536x1536)',
    width: 1536,
    height: 1536,
    creditCost: 6,
    minSubscriptionTier: 'standard',
  };

  describe('getResolutionsForTier', () => {
    it('should return free tier resolutions', () => {
      const resolutions = getResolutionsForTier('free');

      expect(resolutions).toHaveLength(2);
      expect(resolutions[0].width).toBe(512);
      expect(resolutions[1].width).toBe(768);
    });

    it('should return lite tier resolutions', () => {
      const resolutions = getResolutionsForTier('lite');

      expect(resolutions).toHaveLength(2);
      expect(resolutions[0].width).toBe(768);
      expect(resolutions[1].width).toBe(1024);
    });

    it('should return standard tier resolutions', () => {
      const resolutions = getResolutionsForTier('standard');

      expect(resolutions).toHaveLength(2);
      expect(resolutions[0].width).toBe(1024);
      expect(resolutions[1].width).toBe(1536);
    });
  });

  describe('isResolutionAvailable', () => {
    it('should return true for free tier using free resolution', () => {
      expect(isResolutionAvailable(mockResolution, 'free')).toBe(true);
    });

    it('should return false for free tier using premium resolution', () => {
      expect(isResolutionAvailable(mockPremiumResolution, 'free')).toBe(false);
    });

    it('should return true for standard tier using premium resolution', () => {
      expect(isResolutionAvailable(mockPremiumResolution, 'standard')).toBe(true);
    });

    it('should handle resolutions without min tier requirement', () => {
      const noTierResolution: ResolutionPreset = {
        name: 'Custom',
        width: 800,
        height: 600,
        creditCost: 3,
      };

      expect(isResolutionAvailable(noTierResolution, 'free')).toBe(true);
    });
  });

  describe('getHighestResolution', () => {
    it('should return highest resolution for free tier', () => {
      const highest = getHighestResolution('free');

      expect(highest.width).toBe(768);
      expect(highest.height).toBe(768);
    });

    it('should return highest resolution for standard tier', () => {
      const highest = getHighestResolution('standard');

      expect(highest.width).toBe(1536);
      expect(highest.height).toBe(1536);
    });
  });

  describe('calculateCreditCost', () => {
    it('should calculate cost for single image', () => {
      const cost = calculateCreditCost(mockResolution, 1);

      expect(cost).toBe(2);
    });

    it('should calculate cost for multiple images', () => {
      const cost = calculateCreditCost(mockResolution, 4);

      expect(cost).toBe(8);
    });

    it('should apply credit multiplier', () => {
      const cost = calculateCreditCost(mockResolution, 2, 1.5);

      expect(cost).toBe(6); // 2 * 2 * 1.5
    });
  });

  describe('formatResolution', () => {
    it('should format resolution correctly', () => {
      const formatted = formatResolution(mockResolution);

      expect(formatted).toBe('512x512');
    });

    it('should handle different resolutions', () => {
      const hdResolution: ResolutionPreset = {
        ...mockResolution,
        width: 1920,
        height: 1080,
      };

      const formatted = formatResolution(hdResolution);
      expect(formatted).toBe('1920x1080');
    });
  });

  describe('getUpgradeMessage', () => {
    it('should return null for free tier resolutions', () => {
      const message = getUpgradeMessage(mockResolution);

      expect(message).toBeNull();
    });

    it('should return upgrade message for premium resolutions', () => {
      const message = getUpgradeMessage(mockPremiumResolution);

      expect(message).toContain('升级');
      expect(message).toContain('Standard');
    });

    it('should handle lite tier requirement', () => {
      const liteResolution: ResolutionPreset = {
        ...mockResolution,
        minSubscriptionTier: 'lite',
      };

      const message = getUpgradeMessage(liteResolution);
      expect(message).toContain('Lite');
    });
  });
});
