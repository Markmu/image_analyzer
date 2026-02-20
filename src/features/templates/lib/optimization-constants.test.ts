/**
 * Optimization Constants Tests
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Tests for optimization constants and preference management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  OPTIMIZATION_MODES,
  OPTIMIZATION_TARGETS,
  OPTIMIZATION_INTENSITIES,
  OPTIMIZATION_LANGUAGES,
  OPTIMIZATION_PRESETS,
  DEFAULT_OPTIMIZATION_PREFERENCES,
  OPTIMIZATION_PREFERENCES_STORAGE_KEY,
  loadOptimizationPreferences,
  saveOptimizationPreferences,
  saveOptimizationMode,
  saveOptimizationTarget,
  saveOptimizationIntensity,
  saveOptimizationLanguage,
} from './optimization-constants';
import type { OptimizationPreferences } from './optimization-constants';

describe('optimization-constants', () => {
  describe('constants', () => {
    describe('OPTIMIZATION_MODES', () => {
      it('should have quick and deep modes', () => {
        expect(OPTIMIZATION_MODES).toHaveProperty('quick');
        expect(OPTIMIZATION_MODES).toHaveProperty('deep');
      });

      it('should have correct labels for quick mode', () => {
        expect(OPTIMIZATION_MODES.quick.label).toBe('快速优化');
        expect(OPTIMIZATION_MODES.quick.description).toBe('轻量级优化,改善语法和流畅度');
        expect(OPTIMIZATION_MODES.quick.credits).toBe(1);
      });

      it('should have correct labels for deep mode', () => {
        expect(OPTIMIZATION_MODES.deep.label).toBe('深度优化');
        expect(OPTIMIZATION_MODES.deep.description).toBe('增强描述质量,添加专业术语');
        expect(OPTIMIZATION_MODES.deep.credits).toBe(2);
      });
    });

    describe('OPTIMIZATION_TARGETS', () => {
      it('should have all required targets', () => {
        expect(OPTIMIZATION_TARGETS).toHaveProperty('detailed');
        expect(OPTIMIZATION_TARGETS).toHaveProperty('concise');
        expect(OPTIMIZATION_TARGETS).toHaveProperty('professional');
        expect(OPTIMIZATION_TARGETS).toHaveProperty('creative');
      });

      it('should have correct labels for detailed target', () => {
        expect(OPTIMIZATION_TARGETS.detailed.label).toBe('更详细');
        expect(OPTIMIZATION_TARGETS.detailed.description).toBe('增加细节描述,使提示词更丰富');
      });

      it('should have correct labels for concise target', () => {
        expect(OPTIMIZATION_TARGETS.concise.label).toBe('更简洁');
        expect(OPTIMIZATION_TARGETS.concise.description).toBe('精简表达,去除冗余内容');
      });

      it('should have correct labels for professional target', () => {
        expect(OPTIMIZATION_TARGETS.professional.label).toBe('更专业');
        expect(OPTIMIZATION_TARGETS.professional.description).toBe('使用专业术语,提升描述质量');
      });

      it('should have correct labels for creative target', () => {
        expect(OPTIMIZATION_TARGETS.creative.label).toBe('更有创意');
        expect(OPTIMIZATION_TARGETS.creative.description).toBe('添加创意元素,增强表现力');
      });
    });

    describe('OPTIMIZATION_INTENSITIES', () => {
      it('should have light, medium, and heavy intensities', () => {
        expect(OPTIMIZATION_INTENSITIES).toHaveProperty('light');
        expect(OPTIMIZATION_INTENSITIES).toHaveProperty('medium');
        expect(OPTIMIZATION_INTENSITIES).toHaveProperty('heavy');
      });

      it('should have correct labels for light intensity', () => {
        expect(OPTIMIZATION_INTENSITIES.light.label).toBe('轻度');
        expect(OPTIMIZATION_INTENSITIES.light.description).toBe('最小改动,保持原意');
      });

      it('should have correct labels for medium intensity', () => {
        expect(OPTIMIZATION_INTENSITIES.medium.label).toBe('中度');
        expect(OPTIMIZATION_INTENSITIES.medium.description).toBe('适度优化,平衡改动和原意');
      });

      it('should have correct labels for heavy intensity', () => {
        expect(OPTIMIZATION_INTENSITIES.heavy.label).toBe('重度');
        expect(OPTIMIZATION_INTENSITIES.heavy.description).toBe('大幅优化,显著提升质量');
      });
    });

    describe('OPTIMIZATION_LANGUAGES', () => {
      it('should have auto, zh, and en languages', () => {
        expect(OPTIMIZATION_LANGUAGES).toHaveProperty('auto');
        expect(OPTIMIZATION_LANGUAGES).toHaveProperty('zh');
        expect(OPTIMIZATION_LANGUAGES).toHaveProperty('en');
      });

      it('should have correct labels for auto language', () => {
        expect(OPTIMIZATION_LANGUAGES.auto.label).toBe('自动检测');
        expect(OPTIMIZATION_LANGUAGES.auto.description).toBe('根据输入内容自动识别语言');
      });

      it('should have correct labels for Chinese', () => {
        expect(OPTIMIZATION_LANGUAGES.zh.label).toBe('中文');
        expect(OPTIMIZATION_LANGUAGES.zh.description).toBe('输入和输出均为中文');
      });

      it('should have correct labels for English', () => {
        expect(OPTIMIZATION_LANGUAGES.en.label).toBe('English');
        expect(OPTIMIZATION_LANGUAGES.en.description).toBe('Input and output in English');
      });
    });

    describe('OPTIMIZATION_PRESETS', () => {
      it('should have quick and deep presets', () => {
        expect(OPTIMIZATION_PRESETS).toHaveProperty('quick');
        expect(OPTIMIZATION_PRESETS).toHaveProperty('deep');
      });

      it('should have correct quick preset configuration', () => {
        expect(OPTIMIZATION_PRESETS.quick.mode).toBe('quick');
        expect(OPTIMIZATION_PRESETS.quick.target).toBe('professional');
        expect(OPTIMIZATION_PRESETS.quick.intensity).toBe('light');
        expect(OPTIMIZATION_PRESETS.quick.creditsCost).toBe(1);
        expect(OPTIMIZATION_PRESETS.quick.systemPrompt).toHaveProperty('zh');
        expect(OPTIMIZATION_PRESETS.quick.systemPrompt).toHaveProperty('en');
      });

      it('should have correct deep preset configuration', () => {
        expect(OPTIMIZATION_PRESETS.deep.mode).toBe('deep');
        expect(OPTIMIZATION_PRESETS.deep.target).toBe('professional');
        expect(OPTIMIZATION_PRESETS.deep.intensity).toBe('medium');
        expect(OPTIMIZATION_PRESETS.deep.creditsCost).toBe(2);
        expect(OPTIMIZATION_PRESETS.deep.systemPrompt).toHaveProperty('zh');
        expect(OPTIMIZATION_PRESETS.deep.systemPrompt).toHaveProperty('en');
      });

      it('should have non-empty system prompts for both languages', () => {
        expect(OPTIMIZATION_PRESETS.quick.systemPrompt.zh.length).toBeGreaterThan(0);
        expect(OPTIMIZATION_PRESETS.quick.systemPrompt.en.length).toBeGreaterThan(0);
        expect(OPTIMIZATION_PRESETS.deep.systemPrompt.zh.length).toBeGreaterThan(0);
        expect(OPTIMIZATION_PRESETS.deep.systemPrompt.en.length).toBeGreaterThan(0);
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

    describe('OPTIMIZATION_PREFERENCES_STORAGE_KEY', () => {
      it('should be a valid storage key', () => {
        expect(OPTIMIZATION_PREFERENCES_STORAGE_KEY).toBe('template-optimization-preferences');
      });
    });
  });

  describe('localStorage functions', () => {
    let mockLocalStorage: Record<string, string>;

    beforeEach(() => {
      // Mock localStorage
      mockLocalStorage = {};
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockLocalStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        removeItem: (key: string) => {
          delete mockLocalStorage[key];
        },
        clear: () => {
          mockLocalStorage = {};
        },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe('loadOptimizationPreferences', () => {
      it('should return default preferences when localStorage is empty', () => {
        const result = loadOptimizationPreferences();

        expect(result).toEqual(DEFAULT_OPTIMIZATION_PREFERENCES);
      });

      it('should return saved preferences from localStorage', () => {
        const saved: OptimizationPreferences = {
          lastMode: 'deep',
          lastTarget: 'creative',
          lastIntensity: 'heavy',
          lastLanguage: 'zh',
        };
        localStorage.setItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY, JSON.stringify(saved));

        const result = loadOptimizationPreferences();

        expect(result).toEqual(saved);
      });

      it('should merge partial preferences with defaults', () => {
        const partial = { lastMode: 'deep' };
        localStorage.setItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY, JSON.stringify(partial));

        const result = loadOptimizationPreferences();

        expect(result.lastMode).toBe('deep');
        expect(result.lastTarget).toBe(DEFAULT_OPTIMIZATION_PREFERENCES.lastTarget);
        expect(result.lastIntensity).toBe(DEFAULT_OPTIMIZATION_PREFERENCES.lastIntensity);
        expect(result.lastLanguage).toBe(DEFAULT_OPTIMIZATION_PREFERENCES.lastLanguage);
      });

      it('should handle invalid JSON in localStorage', () => {
        localStorage.setItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY, 'invalid json');

        const result = loadOptimizationPreferences();

        expect(result).toEqual(DEFAULT_OPTIMIZATION_PREFERENCES);
      });

      it('should handle missing fields in saved preferences', () => {
        const incomplete = { lastMode: 'deep', lastTarget: 'creative' } as any;
        localStorage.setItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY, JSON.stringify(incomplete));

        const result = loadOptimizationPreferences();

        expect(result.lastMode).toBe('deep');
        expect(result.lastTarget).toBe('creative');
        expect(result.lastIntensity).toBeDefined();
        expect(result.lastLanguage).toBeDefined();
      });
    });

    describe('saveOptimizationPreferences', () => {
      it('should save preferences to localStorage', () => {
        const preferences: Partial<OptimizationPreferences> = {
          lastMode: 'deep',
          lastTarget: 'creative',
        };

        saveOptimizationPreferences(preferences);

        const stored = localStorage.getItem(OPTIMIZATION_PREFERENCES_STORAGE_KEY);
        expect(stored).toBeDefined();

        const parsed = JSON.parse(stored!);
        expect(parsed.lastMode).toBe('deep');
        expect(parsed.lastTarget).toBe('creative');
      });

      it('should merge with existing preferences', () => {
        // Save initial preferences
        saveOptimizationPreferences({ lastMode: 'deep' });

        // Update with partial preferences
        saveOptimizationPreferences({ lastTarget: 'creative' });

        const result = loadOptimizationPreferences();
        expect(result.lastMode).toBe('deep');
        expect(result.lastTarget).toBe('creative');
      });

      it('should not affect other localStorage keys', () => {
        localStorage.setItem('other-key', 'other-value');

        saveOptimizationPreferences({ lastMode: 'deep' });

        expect(localStorage.getItem('other-key')).toBe('other-value');
      });
    });

    describe('helper functions', () => {
      it('saveOptimizationMode should save mode preference', () => {
        saveOptimizationMode('deep');

        const result = loadOptimizationPreferences();
        expect(result.lastMode).toBe('deep');
      });

      it('saveOptimizationTarget should save target preference', () => {
        saveOptimizationTarget('creative');

        const result = loadOptimizationPreferences();
        expect(result.lastTarget).toBe('creative');
      });

      it('saveOptimizationIntensity should save intensity preference', () => {
        saveOptimizationIntensity('heavy');

        const result = loadOptimizationPreferences();
        expect(result.lastIntensity).toBe('heavy');
      });

      it('saveOptimizationLanguage should save language preference', () => {
        saveOptimizationLanguage('zh');

        const result = loadOptimizationPreferences();
        expect(result.lastLanguage).toBe('zh');
      });

      it('helper functions should preserve other preferences', () => {
        saveOptimizationMode('deep');
        saveOptimizationTarget('creative');
        saveOptimizationIntensity('heavy');

        const result = loadOptimizationPreferences();
        expect(result.lastMode).toBe('deep');
        expect(result.lastTarget).toBe('creative');
        expect(result.lastIntensity).toBe('heavy');
        expect(result.lastLanguage).toBe(DEFAULT_OPTIMIZATION_PREFERENCES.lastLanguage);
      });
    });
  });

  describe('integration', () => {
    it('should work with full preference workflow', () => {
      // Save preferences using helper functions
      saveOptimizationMode('deep');
      saveOptimizationTarget('detailed');
      saveOptimizationIntensity('light');
      saveOptimizationLanguage('en');

      // Load and verify
      const loaded = loadOptimizationPreferences();
      expect(loaded.lastMode).toBe('deep');
      expect(loaded.lastTarget).toBe('detailed');
      expect(loaded.lastIntensity).toBe('light');
      expect(loaded.lastLanguage).toBe('en');

      // Update using saveOptimizationPreferences
      saveOptimizationPreferences({ lastMode: 'quick' });

      const updated = loadOptimizationPreferences();
      expect(updated.lastMode).toBe('quick');
      expect(updated.lastTarget).toBe('detailed'); // Preserved
      expect(updated.lastIntensity).toBe('light'); // Preserved
      expect(updated.lastLanguage).toBe('en'); // Preserved
    });
  });
});
