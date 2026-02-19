/**
 * Optimization Constants Tests
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Unit tests for optimization constants and preferences
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  OPTIMIZATION_MODES,
  OPTIMIZATION_TARGETS,
  OPTIMIZATION_INTENSITIES,
  OPTIMIZATION_LANGUAGES,
  DEFAULT_OPTIMIZATION_PREFERENCES,
  OPTIMIZATION_PREFERENCES_STORAGE_KEY,
  loadOptimizationPreferences,
  saveOptimizationPreferences,
} from '@/features/templates/lib/optimization-constants';

describe('Optimization Constants', () => {
  describe('OPTIMIZATION_MODES', () => {
    it('should have quick and deep modes', () => {
      expect(OPTIMIZATION_MODES).toHaveProperty('quick');
      expect(OPTIMIZATION_MODES).toHaveProperty('deep');
    });

    it('should have correct credit costs', () => {
      expect(OPTIMIZATION_MODES.quick.credits).toBe(1);
      expect(OPTIMIZATION_MODES.deep.credits).toBe(2);
    });

    it('should have labels in Chinese', () => {
      expect(OPTIMIZATION_MODES.quick.label).toBe('快速优化');
      expect(OPTIMIZATION_MODES.deep.label).toBe('深度优化');
    });
  });

  describe('OPTIMIZATION_TARGETS', () => {
    it('should have all required targets', () => {
      expect(OPTIMIZATION_TARGETS).toHaveProperty('detailed');
      expect(OPTIMIZATION_TARGETS).toHaveProperty('concise');
      expect(OPTIMIZATION_TARGETS).toHaveProperty('professional');
      expect(OPTIMIZATION_TARGETS).toHaveProperty('creative');
    });

    it('should have labels in Chinese', () => {
      expect(OPTIMIZATION_TARGETS.detailed.label).toBe('更详细');
      expect(OPTIMIZATION_TARGETS.concise.label).toBe('更简洁');
      expect(OPTIMIZATION_TARGETS.professional.label).toBe('更专业');
      expect(OPTIMIZATION_TARGETS.creative.label).toBe('更有创意');
    });
  });

  describe('OPTIMIZATION_INTENSITIES', () => {
    it('should have all required intensities', () => {
      expect(OPTIMIZATION_INTENSITIES).toHaveProperty('light');
      expect(OPTIMIZATION_INTENSITIES).toHaveProperty('medium');
      expect(OPTIMIZATION_INTENSITIES).toHaveProperty('heavy');
    });

    it('should have labels in Chinese', () => {
      expect(OPTIMIZATION_INTENSITIES.light.label).toBe('轻度');
      expect(OPTIMIZATION_INTENSITIES.medium.label).toBe('中度');
      expect(OPTIMIZATION_INTENSITIES.heavy.label).toBe('重度');
    });
  });

  describe('OPTIMIZATION_LANGUAGES', () => {
    it('should have auto, zh, and en options', () => {
      expect(OPTIMIZATION_LANGUAGES).toHaveProperty('auto');
      expect(OPTIMIZATION_LANGUAGES).toHaveProperty('zh');
      expect(OPTIMIZATION_LANGUAGES).toHaveProperty('en');
    });

    it('should have correct labels', () => {
      expect(OPTIMIZATION_LANGUAGES.auto.label).toBe('自动检测');
      expect(OPTIMIZATION_LANGUAGES.zh.label).toBe('中文');
      expect(OPTIMIZATION_LANGUAGES.en.label).toBe('English');
    });
  });

  describe('DEFAULT_OPTIMIZATION_PREFERENCES', () => {
    it('should have default values', () => {
      expect(DEFAULT_OPTIMIZATION_PREFERENCES.lastMode).toBe('quick');
      expect(DEFAULT_OPTIMIZATION_PREFERENCES.lastTarget).toBe('professional');
      expect(DEFAULT_OPTIMIZATION_PREFERENCES.lastIntensity).toBe('medium');
      expect(DEFAULT_OPTIMIZATION_PREFERENCES.lastLanguage).toBe('auto');
    });
  });
});

describe('Optimization Preferences (localStorage)', () => {
  // Note: localStorage tests require browser environment or jsdom mock
  // These tests are skipped in Node.js environment

  beforeEach(() => {
    // Clear localStorage before each test (only works in browser/jsdom)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  });

  afterEach(() => {
    // Clean up after each test (only works in browser/jsdom)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  });

  describe('loadOptimizationPreferences', () => {
    it('should return default preferences when localStorage is empty', () => {
      const prefs = loadOptimizationPreferences();
      expect(prefs).toEqual(DEFAULT_OPTIMIZATION_PREFERENCES);
    });

    it('should handle corrupted localStorage data', () => {
      if (typeof window === 'undefined' || !window.localStorage) {
        // Skip in Node.js environment
        return;
      }

      localStorage.setItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY, 'invalid json');

      const prefs = loadOptimizationPreferences();
      expect(prefs).toEqual(DEFAULT_OPTIMIZATION_PREFERENCES);
    });

    it('should merge partial preferences with defaults', () => {
      if (typeof window === 'undefined' || !window.localStorage) {
        // Skip in Node.js environment
        return;
      }

      const partialPrefs = {
        lastMode: 'deep',
      };

      localStorage.setItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY, JSON.stringify(partialPrefs));

      const prefs = loadOptimizationPreferences();
      expect(prefs.lastMode).toBe('deep');
      expect(prefs.lastTarget).toBe(DEFAULT_OPTIMIZATION_PREFERENCES.lastTarget);
      expect(prefs.lastIntensity).toBe(DEFAULT_OPTIMIZATION_PREFERENCES.lastIntensity);
      expect(prefs.lastLanguage).toBe(DEFAULT_OPTIMIZATION_PREFERENCES.lastLanguage);
    });
  });

  describe('saveOptimizationPreferences', () => {
    it('should save preferences to localStorage', () => {
      if (typeof window === 'undefined' || !window.localStorage) {
        // Skip in Node.js environment
        return;
      }

      const prefsToSave = {
        lastMode: 'deep' as const,
      };

      saveOptimizationPreferences(prefsToSave);

      const stored = localStorage.getItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY);
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.lastMode).toBe('deep');
    });

    it('should handle save errors gracefully', () => {
      if (typeof window === 'undefined' || !window.localStorage) {
        // Skip in Node.js environment
        return;
      }

      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };

      // Should not throw error
      expect(() => {
        saveOptimizationPreferences({ lastMode: 'deep' as const });
      }).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });
});
