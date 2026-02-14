/**
 * 批量分析服务单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock 依赖模块
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockDb),
}));

vi.mock('@/lib/replicate/vision', () => ({
  analyzeImageStyle: vi.fn(),
  validateImageComplexity: vi.fn(() => Promise.resolve({ complexity: 'low', confidence: 0.3 })),
}));

// Mock update 函数
const mockUpdateFn = vi.fn(() => ({
  set: vi.fn(() => ({
    where: vi.fn(() => Promise.resolve()),
  })),
}));

// Mock 数据库
const mockDb = {
  transaction: vi.fn((callback) => {
    // 模拟事务返回一个执行函数，该函数接收 tx 对象
    const mockTx = {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => {
            // 返回一个同时具有 forUpdate 和 limit 方法的对象
            const result = {
              limit: vi.fn(() => Promise.resolve([{ creditBalance: 10 }])),
              forUpdate: vi.fn(() => Promise.resolve([{ creditBalance: 10 }])),
            };
            // 让 limit 返回的对象也具有 forUpdate 方法
            result.limit = vi.fn(() => ({
              forUpdate: vi.fn(() => Promise.resolve([{ creditBalance: 10 }])),
            }));
            return result;
          }),
        })),
      })),
      update: mockUpdateFn, // 使用共享的 mockUpdateFn
      insert: vi.fn(() => ({
        values: vi.fn(() => Promise.resolve()),
        returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    };
    return callback(mockTx);
  }),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve([])),
        orderBy: vi.fn(() => Promise.resolve([])),
      })),
    })),
  })),
  update: mockUpdateFn, // 使用共享的 mockUpdateFn
};

describe('批量分析服务', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractCommonFeatures', () => {
    it('应该从多个分析结果中提取共同特征', async () => {
      const { extractCommonFeatures } = await import('@/lib/analysis/feature-extraction');

      const mockResults = [
        {
          dimensions: {
            lighting: {
              name: 'lighting',
              features: [
                { name: 'light_type', value: 'natural', confidence: 0.9 },
                { name: 'mood', value: 'warm', confidence: 0.85 },
              ],
              confidence: 0.87,
            },
            composition: {
              name: 'composition',
              features: [{ name: 'style', value: 'rule_of_thirds', confidence: 0.8 }],
              confidence: 0.8,
            },
            color: {
              name: 'color',
              features: [{ name: 'palette', value: 'warm', confidence: 0.88 }],
              confidence: 0.88,
            },
            artisticStyle: {
              name: 'artisticStyle',
              features: [{ name: 'style', value: 'realistic', confidence: 0.92 }],
              confidence: 0.92,
            },
          },
          overallConfidence: 0.87,
          modelUsed: 'llava-13b',
          analysisDuration: 5000,
        },
        {
          dimensions: {
            lighting: {
              name: 'lighting',
              features: [
                { name: 'light_type', value: 'natural', confidence: 0.88 },
                { name: 'mood', value: 'warm', confidence: 0.82 },
              ],
              confidence: 0.85,
            },
            composition: {
              name: 'composition',
              features: [{ name: 'style', value: 'rule_of_thirds', confidence: 0.78 }],
              confidence: 0.78,
            },
            color: {
              name: 'color',
              features: [{ name: 'palette', value: 'warm', confidence: 0.85 }],
              confidence: 0.85,
            },
            artisticStyle: {
              name: 'artisticStyle',
              features: [{ name: 'style', value: 'realistic', confidence: 0.9 }],
              confidence: 0.9,
            },
          },
          overallConfidence: 0.85,
          modelUsed: 'llava-13b',
          analysisDuration: 4800,
        },
      ];

      const result = extractCommonFeatures(mockResults);

      // 验证返回结果
      expect(result).toBeDefined();
      expect(result.overallConfidence).toBeCloseTo(0.86, 1);

      // 应该有共同特征
      expect(result.commonFeatures.length).toBeGreaterThan(0);
    });

    it('应该处理单张图片的分析结果', async () => {
      const { extractCommonFeatures } = await import('@/lib/analysis/feature-extraction');

      const mockResults = [
        {
          dimensions: {
            lighting: {
              name: 'lighting',
              features: [{ name: 'light_type', value: 'natural', confidence: 0.9 }],
              confidence: 0.9,
            },
            composition: {
              name: 'composition',
              features: [{ name: 'style', value: 'rule_of_thirds', confidence: 0.8 }],
              confidence: 0.8,
            },
            color: {
              name: 'color',
              features: [{ name: 'palette', value: 'warm', confidence: 0.88 }],
              confidence: 0.88,
            },
            artisticStyle: {
              name: 'artisticStyle',
              features: [{ name: 'style', value: 'realistic', confidence: 0.92 }],
              confidence: 0.92,
            },
          },
          overallConfidence: 0.87,
          modelUsed: 'llava-13b',
          analysisDuration: 5000,
        },
      ];

      const result = extractCommonFeatures(mockResults);

      expect(result).toBeDefined();
      expect(result.overallConfidence).toBe(0.87);
    });

    it('应该处理空数组', async () => {
      const { extractCommonFeatures } = await import('@/lib/analysis/feature-extraction');

      const result = extractCommonFeatures([]);

      expect(result).toBeDefined();
      expect(result.commonFeatures).toEqual([]);
      expect(result.uniqueFeatures).toEqual([]);
      expect(result.overallConfidence).toBe(0);
    });
  });

  describe('getFeatureHighlightStyle', () => {
    it('应该返回共同特征的样式', async () => {
      const { getFeatureHighlightStyle } = await import('@/lib/analysis/feature-extraction');

      const style = getFeatureHighlightStyle(true, false);

      expect(style.borderColor).toBe('rgb(34, 197, 94)');
      expect(style.backgroundColor).toBe('rgba(34, 197, 94, 0.1)');
    });

    it('应该返回独特特征的样式', async () => {
      const { getFeatureHighlightStyle } = await import('@/lib/analysis/feature-extraction');

      const style = getFeatureHighlightStyle(false, true);

      expect(style.borderColor).toBe('rgb(59, 130, 246)');
      expect(style.backgroundColor).toBe('rgba(59, 130, 246, 0.1)');
    });

    it('应该返回默认样式', async () => {
      const { getFeatureHighlightStyle } = await import('@/lib/analysis/feature-extraction');

      const style = getFeatureHighlightStyle(false, false);

      expect(style.borderColor).toBe('rgb(229, 231, 235)');
      expect(style.backgroundColor).toBe('transparent');
    });
  });

  describe('generateComprehensiveDescription', () => {
    it('应该生成综合描述', async () => {
      const { generateComprehensiveDescription } = await import('@/lib/analysis/feature-extraction');

      const analysis = {
        commonFeatures: [
          {
            dimension: 'lighting',
            features: [{ name: 'light_type', value: 'natural', confidence: 0.9 }],
            confidence: 0.9,
          },
        ],
        uniqueFeatures: [
          {
            dimension: 'color',
            features: [
              { feature: { name: 'palette', value: 'vibrant', confidence: 0.8 }, sourceImages: ['image-1'] },
            ],
          },
        ],
        overallConfidence: 0.85,
      };

      const description = generateComprehensiveDescription(analysis);

      expect(description).toContain('共同特征');
      expect(description).toContain('独特特征');
      expect(description).toContain('85');
    });
  });
});

describe('Credit 工具函数', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该检查 credit 余额是否足够', async () => {
    const { checkCredits } = await import('@/lib/credit');

    // Mock db select
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ creditBalance: 10 }])),
        })),
      })),
    });

    const result = await checkCredits('user-1', 5);
    expect(result).toBe(true);
  });

  it('应该返回 false 当 credit 不足时', async () => {
    const { checkCredits } = await import('@/lib/credit');

    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ creditBalance: 3 }])),
        })),
      })),
    });

    const result = await checkCredits('user-1', 5);
    expect(result).toBe(false);
  });

  it('应该正确扣除 credit', async () => {
    const { deductCredits } = await import('@/lib/credit');

    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ creditBalance: 10 }])),
        })),
      })),
    });

    mockDb.update.mockReturnValue({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    });

    const result = await deductCredits('user-1', 3, 'test deduction');

    expect(result).toBe(true);
    expect(mockDb.update).toHaveBeenCalled();
  });
});
