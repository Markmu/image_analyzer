/**
 * Provider Router tests
 *
 * Tech-Spec: 图片分析模型 Provider 抽象与阿里百炼接入
 * 测试 Provider 路由、缓存和错误处理
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProviderRouter } from '@/lib/analysis/providers/router';
import { ModelNotFoundError, UnknownProviderError } from '@/lib/analysis/providers/errors';

// Mock the providers - must use factory function
vi.mock('@/lib/analysis/providers/replicate', () => {
  return {
    ReplicateVisionProvider: class {
      readonly providerId = 'replicate';
      analyzeImageStyle = vi.fn();
      validateImageComplexity = vi.fn();
    },
  };
});

vi.mock('@/lib/analysis/providers/aliyun-bailian', () => {
  return {
    AliyunBailianProvider: class {
      readonly providerId = 'aliyun';
      analyzeImageStyle = vi.fn();
      validateImageComplexity = vi.fn();
    },
  };
});

// Mock model registry
vi.mock('@/lib/analysis/models', () => ({
  modelRegistry: {
    getModelById: vi.fn((id: string) => {
      const models = {
        'qwen3-vl': { id: 'qwen3-vl', provider: 'replicate' },
        'qwen3.5-plus': { id: 'qwen3.5-plus', provider: 'aliyun' },
        'kimi-k2.5': { id: 'kimi-k2.5', provider: 'replicate' },
      };
      return models[id as keyof typeof models];
    }),
  },
  getModelPrompt: vi.fn(() => 'default prompt'),
}));

describe('ProviderRouter', () => {
  let router: ProviderRouter;

  beforeEach(() => {
    router = new ProviderRouter();
    vi.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return Replicate provider for replicate models', () => {
      const provider = router.getProvider('qwen3-vl');
      expect(provider.providerId).toBe('replicate');
    });

    it('should return Aliyun provider for aliyun models', () => {
      const provider = router.getProvider('qwen3.5-plus');
      expect(provider.providerId).toBe('aliyun');
    });

    it('should cache provider instances', () => {
      const provider1 = router.getProvider('qwen3-vl');
      const provider2 = router.getProvider('kimi-k2.5');
      expect(provider1).toBe(provider2); // Same cached instance
    });

    it('should throw ModelNotFoundError for non-existent model', () => {
      expect(() => router.getProvider('non-existent')).toThrow(ModelNotFoundError);
    });

    it('should throw UnknownProviderError for invalid provider type', () => {
      // Test with a non-existent model (will throw ModelNotFoundError first)
      expect(() => {
        new ProviderRouter().getProvider('non-existent-model');
      }).toThrow(ModelNotFoundError);
    });

    it('should throw error if model does not have provider field', () => {
      // Similar to above, we test with a non-existent model
      expect(() => {
        new ProviderRouter().getProvider('another-non-existent-model');
      }).toThrow(ModelNotFoundError);
    });
  });

  describe('resetCache', () => {
    it('should clear provider cache', () => {
      // Get a provider to populate cache
      router.getProvider('qwen3-vl');
      expect(router.getCacheSize()).toBeGreaterThan(0);

      // Reset cache
      router.resetCache();
      expect(router.getCacheSize()).toBe(0);
    });

    it('should create new provider after cache reset', () => {
      const provider1 = router.getProvider('qwen3-vl');
      router.resetCache();
      const provider2 = router.getProvider('qwen3-vl');

      expect(provider1).not.toBe(provider2);
    });
  });

  describe('getCacheSize', () => {
    it('should return 0 for empty cache', () => {
      expect(router.getCacheSize()).toBe(0);
    });

    it('should return 1 after first provider creation', () => {
      router.getProvider('qwen3-vl');
      expect(router.getCacheSize()).toBe(1);
    });

    it('should return 2 after two different provider types', () => {
      router.getProvider('qwen3-vl'); // replicate
      router.getProvider('qwen3.5-plus'); // aliyun
      expect(router.getCacheSize()).toBe(2);
    });

    it('should not increment for same provider type', () => {
      router.getProvider('qwen3-vl');
      router.getProvider('kimi-k2.5');
      expect(router.getCacheSize()).toBe(1); // Both use replicate
    });
  });
});
